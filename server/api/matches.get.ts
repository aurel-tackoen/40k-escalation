/**
 * GET /api/matches?leagueId=123
 * Fetches matches for a specific league
 */
import { db } from '../../db'
import { matches } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    let allMatches

    if (leagueId) {
      // Get matches for specific league
      allMatches = await db
        .select()
        .from(matches)
        .where(eq(matches.leagueId, leagueId))
    } else {
      // Get all matches (for admin or migration purposes)
      allMatches = await db.select().from(matches)
    }

    return {
      success: true,
      data: allMatches,
      count: allMatches.length
    }
  } catch (error) {
    console.error('Error fetching matches:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch matches'
    })
  }
})
