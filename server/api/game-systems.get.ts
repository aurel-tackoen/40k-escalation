import { db } from '../../db'
import { gameSystems } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const systems = await db
      .select()
      .from(gameSystems)
      .where(eq(gameSystems.isActive, true))
      .orderBy(gameSystems.name)

    return {
      success: true,
      data: systems,
      count: systems.length
    }
  } catch (error) {
    console.error('Error fetching game systems:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch game systems'
    })
  }
})
