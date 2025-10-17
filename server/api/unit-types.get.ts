import { db } from '../../db'
import { unitTypes } from '../../db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const gameSystemId = query.gameSystemId ? parseInt(query.gameSystemId as string) : null

    // Build where conditions
    const conditions = [eq(unitTypes.isActive, true)]

    if (gameSystemId) {
      conditions.push(eq(unitTypes.gameSystemId, gameSystemId))
    }

    const unitTypesList = await db
      .select()
      .from(unitTypes)
      .where(and(...conditions))
      .orderBy(asc(unitTypes.displayOrder))

    return {
      success: true,
      data: unitTypesList,
      count: unitTypesList.length,
      gameSystemId: gameSystemId
    }
  } catch (error) {
    console.error('Error fetching unit types:', error)
    return {
      success: false,
      error: 'Failed to fetch unit types',
      data: []
    }
  }
})
