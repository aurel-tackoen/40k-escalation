/**
 * GET /api/leagues
 * Fetches all leagues with their phases
 */
import { db } from '../../db'
import { leagues, phases } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const allLeagues = await db.select().from(leagues)

    // Fetch phases for each league
    const leaguesWithPhases = await Promise.all(
      allLeagues.map(async (league) => {
        const leaguePhases = await db.select()
          .from(phases)
          .where(eq(phases.leagueId, league.id))

        return {
          ...league,
          phases: leaguePhases
        }
      })
    )

    return {
      success: true,
      data: leaguesWithPhases
    }
  } catch (error) {
    console.error('Error fetching leagues:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leagues'
    })
  }
})
