import { db } from '../../../../db'
import { leagues, leagueMemberships, players } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

/**
 * POST /api/leagues/:id/join
 * Join a league with player creation in one step
 *
 * Body:
 * {
 *   playerName: string (required - display name for this league)
 *   faction: string (required - player's faction)
 *   armyName: string (required - persistent army name for this league)
 *   password?: string (required for password-protected leagues)
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    // ✅ Require authentication
    const user = await requireAuth(event)

    const leagueId = parseInt(getRouterParam(event, 'id') || '')
    const body = await readBody(event)

    if (!leagueId || !body.playerName || !body.faction || !body.armyName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: playerName, faction, armyName'
      })
    }

    // Get league
    const [league] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, leagueId))
      .limit(1)

    if (!league) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    // Check if league is active
    if (league.status !== 'active') {
      throw createError({
        statusCode: 400,
        statusMessage: 'League is not accepting new members'
      })
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, user.id) // ✅ Use authenticated user ID
        )
      )
      .limit(1)

    if (existingMembership.length > 0) {
      if (existingMembership[0].status === 'active') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Already a member of this league'
        })
      } else {
        // Reactivate membership if it was inactive
        // Update player if they exist, otherwise create new one
        let playerId = existingMembership[0].playerId

        if (playerId) {
          // Update existing player
          await db
            .update(players)
            .set({
              name: body.playerName,
              faction: body.faction
            })
            .where(eq(players.id, playerId))
        } else {
          // Create new player if they don't have one
          const [newPlayer] = await db.insert(players).values({
            leagueId,
            userId: body.userId,
            name: body.playerName,
            faction: body.faction,
            wins: 0,
            losses: 0,
            draws: 0,
            totalPoints: 0
          }).returning()
          playerId = newPlayer.id
        }

        // Update membership
        await db
          .update(leagueMemberships)
          .set({
            status: 'active',
            playerId,
            armyName: body.armyName
          })
          .where(eq(leagueMemberships.id, existingMembership[0].id))

        return {
          success: true,
          message: 'Membership reactivated and player profile updated',
          data: { membership: existingMembership[0] }
        }
      }
    }

    // Check max players limit
    if (league.maxPlayers) {
      const memberCount = await db
        .select()
        .from(leagueMemberships)
        .where(
          and(
            eq(leagueMemberships.leagueId, leagueId),
            eq(leagueMemberships.status, 'active')
          )
        )

      if (memberCount.length >= league.maxPlayers) {
        throw createError({
          statusCode: 400,
          statusMessage: 'League is full'
        })
      }
    }

    // Create player and membership in a transaction-like flow
    // 1. Create player entity
    const [newPlayer] = await db.insert(players).values({
      leagueId,
      userId: user.id, // ✅ Use authenticated user ID
      name: body.playerName,
      faction: body.faction,
      wins: 0,
      losses: 0,
      draws: 0,
      totalPoints: 0
    }).returning()

    // 2. Create membership and link to player
    const [newMembership] = await db.insert(leagueMemberships).values({
      leagueId,
      userId: user.id, // ✅ Use authenticated user ID
      playerId: newPlayer.id, // Link to newly created player
      role: 'player',
      armyName: body.armyName, // Save persistent army name
      status: 'active'
    }).returning()

    return {
      success: true,
      message: 'Successfully joined league and created player profile',
      data: {
        membership: newMembership,
        player: newPlayer
      }
    }
  } catch (error) {
    console.error('Error joining league:', error)
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to join league'
    })
  }
})
