import { db } from '../../db'
import { paintingProgress } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const playerId = query.playerId ? parseInt(query.playerId as string) : null
    const round = query.round ? parseInt(query.round as string) : null
    const unitName = query.unitName as string

    if (!playerId || !round || !unitName) {
      return {
        success: false,
        error: 'Missing required parameters: playerId, round, unitName'
      }
    }

    await db
      .delete(paintingProgress)
      .where(
        and(
          eq(paintingProgress.playerId, playerId),
          eq(paintingProgress.round, round),
          eq(paintingProgress.unitName, unitName)
        )
      )

    return {
      success: true,
      message: 'Painting progress deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting painting progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete painting progress'
    }
  }
})
