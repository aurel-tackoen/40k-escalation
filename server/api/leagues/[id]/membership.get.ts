import { db } from '../../../../db'
import { leagueMemberships, players } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * GET /api/leagues/:id/membership?userId=123
 * Get user's membership for a specific league (active or inactive)
 * Used to pre-fill join form for returning users
 */
export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(getRouterParam(event, 'id') || '')
    const query = getQuery(event)
    const userId = parseInt(query.userId as string || '')

    if (!leagueId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: leagueId, userId'
      })
    }

    // Get membership (any status)
    const [membership] = await db
      .select({
        id: leagueMemberships.id,
        leagueId: leagueMemberships.leagueId,
        userId: leagueMemberships.userId,
        playerId: leagueMemberships.playerId,
        role: leagueMemberships.role,
        joinedAt: leagueMemberships.joinedAt,
        status: leagueMemberships.status
      })
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, userId)
        )
      )
      .limit(1)

    if (!membership) {
      // No membership found - user never joined this league
      return {
        success: true,
        data: null
      }
    }

    // If membership has a player, fetch player data (includes armyName)
    let player = null
    let armyName = null
    if (membership.playerId) {
      const [playerData] = await db
        .select()
        .from(players)
        .where(eq(players.id, membership.playerId))
        .limit(1)

      player = playerData
      armyName = playerData?.armyName || null // ✅ Get armyName from players table
    }

    return {
      success: true,
      data: {
        ...membership,
        armyName, // ✅ Include armyName from player record
        player
      }
    }
  } catch (error) {
    console.error('Error fetching membership:', error)
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch membership'
    })
  }
})
