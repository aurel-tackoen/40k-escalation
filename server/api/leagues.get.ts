/**
 * GET /api/leagues
 * Fetches all leagues with their rounds
 */
import { db } from '../../db'
import { leagues, rounds } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const allLeagues = await db.select().from(leagues)

    // Fetch rounds for each league
    const leaguesWithRounds = await Promise.all(
      allLeagues.map(async (league) => {
        const leagueRounds = await db.select()
          .from(rounds)
          .where(eq(rounds.leagueId, league.id))

        return {
          ...league,
          rounds: leagueRounds
        }
      })
    )

    return {
      success: true,
      data: leaguesWithRounds
    }
  } catch (error) {
    console.error('Error fetching leagues:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leagues'
    })
  }
})
