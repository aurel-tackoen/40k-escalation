import { db } from '../../db'
import { paintingProgress } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const playerId = query.playerId ? parseInt(query.playerId as string) : null
    const round = query.round ? parseInt(query.round as string) : null

    let progressData

    if (playerId && round) {
      // Get progress for specific player and round
      progressData = await db
        .select()
        .from(paintingProgress)
        .where(
          and(
            eq(paintingProgress.playerId, playerId),
            eq(paintingProgress.round, round)
          )
        )
    } else if (playerId) {
      // Get all progress for a player
      progressData = await db
        .select()
        .from(paintingProgress)
        .where(eq(paintingProgress.playerId, playerId))
    } else {
      // Get all painting progress
      progressData = await db.select().from(paintingProgress)
    }

    return {
      success: true,
      data: progressData
    }
  } catch (error) {
    console.error('Error fetching painting progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch painting progress'
    }
  }
})
