import { db } from '~/db'
import { leagues, leagueMemberships } from '~/db/schema'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

/**
 * POST /api/leagues/:id/join
 * Join a league with password verification
 *
 * Body:
 * {
 *   userId: number
 *   password?: string (required for password-protected leagues)
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(getRouterParam(event, 'id') || '')
    const body = await readBody(event)

    if (!leagueId || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: leagueId, userId'
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
          eq(leagueMemberships.userId, body.userId)
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
        await db
          .update(leagueMemberships)
          .set({ status: 'active' })
          .where(eq(leagueMemberships.id, existingMembership[0].id))

        return {
          success: true,
          message: 'Membership reactivated',
          data: { membership: existingMembership[0] }
        }
      }
    }

    // Verify password if league is password-protected
    if (league.joinPassword) {
      if (!body.password) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password required to join this league'
        })
      }

      const passwordMatch = await bcrypt.compare(body.password, league.joinPassword)
      if (!passwordMatch) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Incorrect password'
        })
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

    // Create membership
    const [newMembership] = await db.insert(leagueMemberships).values({
      leagueId,
      userId: body.userId,
      playerId: null, // Will be set when user creates their player
      role: 'player',
      status: 'active'
    }).returning()

    return {
      success: true,
      message: 'Successfully joined league',
      data: { membership: newMembership }
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
