import { db } from '../../../db'
import { leagues, leagueMemberships } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * GET /api/leagues/public
 * Fetch all public leagues with member counts
 */
export default defineEventHandler(async () => {
  try {
    // Fetch public leagues with member count
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

    return {
      success: true,
      data: publicLeagues,
      count: publicLeagues.length
    }
  } catch (error) {
    console.error('Error fetching public leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch public leagues'
    })
  }
})
