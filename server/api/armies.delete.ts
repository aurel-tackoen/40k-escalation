/**
 * DELETE /api/armies?playerId=<playerId>&round=<round>
 * Deletes an army list from the database (requires authentication and ownership)
 */
import { db } from '../../db'
import { armies } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth, ownsResource } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    await requireAuth(event)

    const query = getQuery(event)
    const playerId = parseInt(query.playerId as string)
    const round = parseInt(query.round as string)

    if (!playerId || isNaN(playerId) || !round || isNaN(round)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid player ID and round are required'
      })
    }

    // Check ownership - users can only delete their own armies (unless admin)
    const canDelete = await ownsResource(event, playerId)
    if (!canDelete) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own armies'
      })
    }

    // Delete the army
    const deleted = await db.delete(armies)
      .where(
        and(
          eq(armies.playerId, playerId),
          eq(armies.round, round)
        )
      )
      .returning()

    if (deleted.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Army not found'
      })
    }

    return {
      success: true,
      data: deleted[0]
    }
  } catch (error) {
    console.error('Error deleting army:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete army',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
