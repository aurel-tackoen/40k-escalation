import { db } from '../../../db'
import { leagues, leagueMemberships, rounds } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * GET /api/leagues/my?userId=123
 * Get all leagues the user is a member of
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = parseInt(query.userId as string || '')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId parameter is required'
      })
    }

    // Get user's memberships
    const memberships = await db
      .select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.userId, userId),
          eq(leagueMemberships.status, 'active')
        )
      )

    if (memberships.length === 0) {
      return {
        success: true,
        data: [],
        count: 0
      }
    }

    // Get leagues with rounds
    const userLeagues = []

    for (const membership of memberships) {
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, membership.leagueId))
        .limit(1)

      if (league) {
        const leagueRounds = await db
          .select()
          .from(rounds)
          .where(eq(rounds.leagueId, league.id))

        // Get member count for this league (only active members)
        const memberCountResult = await db
          .select()
          .from(leagueMemberships)
          .where(
            and(
              eq(leagueMemberships.leagueId, league.id),
              eq(leagueMemberships.status, 'active')
            )
          )
        const memberCount = memberCountResult.length

        userLeagues.push({
          id: league.id,
          name: league.name,
          description: league.description,
          startDate: league.startDate,
          endDate: league.endDate,
          currentRound: league.currentRound,
          gameSystemId: league.gameSystemId,  // Add game system ID
          isPublic: league.isPublic,
          maxPlayers: league.maxPlayers,
          status: league.status,
          memberCount,
          rounds: leagueRounds,
          role: membership.role,
          joinedAt: membership.joinedAt
        })
      }
    }

    return {
      success: true,
      data: userLeagues,
      count: userLeagues.length
    }
  } catch (error) {
    console.error('Error fetching user leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leagues'
    })
  }
})
