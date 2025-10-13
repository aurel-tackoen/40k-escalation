/**
 * GET /api/armies
 * Fetches all army lists
 */
import { db } from '../../db'
import { armies } from '../../db/schema'

export default defineEventHandler(async () => {
  try {
    const allArmies = await db.select().from(armies)

    // Parse units JSON for each army
    const armiesWithParsedUnits = allArmies.map(army => ({
      ...army,
      units: JSON.parse(army.units)
    }))

    return {
      success: true,
      data: armiesWithParsedUnits
    }
  } catch (error) {
    console.error('Error fetching armies:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch armies'
    })
  }
})
