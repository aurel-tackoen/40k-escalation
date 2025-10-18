/**
 * GET /api/armies?leagueId=123
 * Fetches army lists for a specific league
 * Requires league membership
 */
import { db } from '../../db'
import { armies } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueMembership } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // ✅ Require league membership to view armies
    await requireLeagueMembership(event, leagueId)

    // Get armies for specific league
    const allArmies = await db
      .select()
      .from(armies)
      .where(eq(armies.leagueId, leagueId))

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
