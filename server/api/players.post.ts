/**
 * POST /api/players
 * Creates a new player in a specific league OR reactivates an inactive membership
 * Also updates the league membership with the player ID
 */
import { db } from '../../db'
import { players, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Basic validation - userId is now required for Auth0 integration
    if (!body.name || !body.leagueId || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, leagueId, and userId are required'
      })
    }

    // Check if player already exists in this league (including inactive)
    const [existingPlayer] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.leagueId, body.leagueId),
          eq(players.userId, body.userId)
        )
      )
      .limit(1)

    // Check membership status
    const [membership] = await db
      .select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, body.leagueId),
          eq(leagueMemberships.userId, body.userId)
        )
      )
      .limit(1)

    // If player exists and membership is inactive, REACTIVATE
    if (existingPlayer && membership?.status === 'inactive') {
      // Reactivate membership
      await db
        .update(leagueMemberships)
        .set({
          status: 'active',
          leftAt: null
        })
        .where(eq(leagueMemberships.id, membership.id))

      // Update player info (name, faction, armyName might have changed)
      const updateData: { name: string; faction: string | null; armyName?: string } = {
        name: body.name,
        faction: body.faction || null
      }

      if (body.armyName !== undefined) {
        updateData.armyName = body.armyName
      }

      const [updatedPlayer] = await db
        .update(players)
        .set(updateData)
        .where(eq(players.id, existingPlayer.id))
        .returning()

      return {
        success: true,
        data: updatedPlayer,
        message: 'Successfully rejoined league'
      }
    }

    // If player already exists and is active, return error
    if (existingPlayer && membership?.status === 'active') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Player already exists in this league'
      })
    }

    // NEW PLAYER: Insert player with stats
    const playerData: {
      leagueId: number
      userId: number
      name: string
      faction: string | null
      armyName?: string
      wins: number
      losses: number
      draws: number
      totalPoints: number
    } = {
      leagueId: body.leagueId,
      userId: body.userId,
      name: body.name,
      faction: body.faction || null,
      wins: body.wins || 0,
      losses: body.losses || 0,
      draws: body.draws || 0,
      totalPoints: body.totalPoints || 0
    }

    if (body.armyName !== undefined) {
      playerData.armyName = body.armyName
    }

    const newPlayer = await db.insert(players).values(playerData).returning()

    // Update or create the league membership
    if (membership) {
      await db
        .update(leagueMemberships)
        .set({
          playerId: newPlayer[0].id,
          status: 'active'
        })
        .where(eq(leagueMemberships.id, membership.id))
    }

    return {
      success: true,
      data: newPlayer[0],
      message: 'Player added successfully'
    }
  } catch (error) {
    console.error('Error creating player:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create player',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
