/**
 * GET /api/armies?leagueId=123
 * Fetches army lists for a specific league
 */
import { db } from '../../db'
import { armies } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    let allArmies

    if (leagueId) {
      // Get armies for specific league
      allArmies = await db
        .select()
        .from(armies)
        .where(eq(armies.leagueId, leagueId))
    } else {
      // Get all armies (for admin or migration purposes)
      allArmies = await db.select().from(armies)
    }

    // Parse units JSON for each army
    const armiesWithParsedUnits = allArmies.map(army => ({
      ...army,
      units: JSON.parse(army.units)
    }))

    return {
      success: true,
      data: armiesWithParsedUnits,
      count: armiesWithParsedUnits.length
    }
  } catch (error) {
    console.error('Error fetching armies:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch armies'
    })
  }
})
