import { db } from '../../db'
import { missions } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const gameSystemId = query.gameSystemId ? parseInt(query.gameSystemId as string) : null

    let missionQuery = db
      .select()
      .from(missions)
      .where(eq(missions.isActive, true))

    // Filter by game system if provided
    if (gameSystemId) {
      missionQuery = missionQuery.where(
        and(
          eq(missions.isActive, true),
          eq(missions.gameSystemId, gameSystemId)
        )
      )
    }

    const missionsList = await missionQuery.orderBy(missions.name)

    return {
      success: true,
      data: missionsList,
      count: missionsList.length,
      gameSystemId
    }
  } catch (error) {
    console.error('Error fetching missions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch missions'
    })
  }
})
