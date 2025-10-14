import { db } from '../../../db'
import { leagues, leagueMemberships } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'

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
        .where(eq(leagueMemberships.userId, userId))
      userLeagueIds = userLeagues.map(l => l.leagueId)
    }

    // Fetch all public leagues with member count
    const publicLeagues = await db
      .select({
        id: leagues.id,
        name: leagues.name,
        description: leagues.description,
        startDate: leagues.startDate,
        endDate: leagues.endDate,
        currentRound: leagues.currentRound,
        status: leagues.status,
        maxPlayers: leagues.maxPlayers,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${leagueMemberships} 
          WHERE ${leagueMemberships.leagueId} = ${leagues.id}
        )`
      })
      .from(leagues)
      .where(eq(leagues.isPublic, true))
      .orderBy(leagues.createdAt)

    // Add isJoined flag to each league
    const leaguesWithJoinedStatus = publicLeagues.map(league => ({
      ...league,
      isJoined: userLeagueIds.includes(league.id)
    }))

    return {
      success: true,
      data: leaguesWithJoinedStatus,
      count: leaguesWithJoinedStatus.length
    }
  } catch (error) {
    console.error('Error fetching public leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch public leagues'
    })
  }
})
