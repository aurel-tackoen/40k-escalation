import { db } from '../../../db'
import { leagues, leagueMemberships } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * GET /api/leagues/public
 * Fetch all public leagues with member counts
 * Optionally marks leagues the user is already in using ?userId=X
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId ? parseInt(query.userId as string) : null

    // Get league IDs the user is a member of
    let userLeagueIds: number[] = []
    if (userId) {
      const userLeagues = await db
        .select({ leagueId: leagueMemberships.leagueId })
        .from(leagueMemberships)
        .where(
          and(
            eq(leagueMemberships.userId, userId),
            eq(leagueMemberships.status, 'active')
          )
        )
      userLeagueIds = userLeagues.map(l => l.leagueId)
    }

    // Fetch all public leagues
    const publicLeagues = await db
      .select()
      .from(leagues)
      .where(eq(leagues.isPrivate, false))
      .orderBy(leagues.createdAt)

    // Add member count and isJoined flag to each league
    const leaguesWithDetails = await Promise.all(
      publicLeagues.map(async (league) => {
        // Get active member count
        const members = await db
          .select()
          .from(leagueMemberships)
          .where(
            and(
              eq(leagueMemberships.leagueId, league.id),
              eq(leagueMemberships.status, 'active')
            )
          )

        return {
          ...league,
          memberCount: members.length,
          isJoined: userLeagueIds.includes(league.id)
        }
      })
    )

    return {
      success: true,
      data: leaguesWithDetails,
      count: leaguesWithDetails.length
    }
  } catch (error) {
    console.error('Error fetching public leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch public leagues'
    })
  }
})
