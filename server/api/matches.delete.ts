/**
 * DELETE /api/matches?id=<id>
 * Deletes a match from the database
 * TODO: Add proper authentication once Auth0 middleware is set up
 */
import { db } from '../../db'
import { matches } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const matchId = parseInt(query.id as string)

    if (!matchId || isNaN(matchId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid match ID is required'
      })
    }

    // Fetch the match to verify it exists
    const [match] = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1)

    if (!match) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }

    // TODO: Add permission checks once Auth0 is integrated
    // For now, allow deletion (permission checks are done on the frontend)

    // Delete the match
    const deleted = await db.delete(matches)
      .where(eq(matches.id, matchId))
      .returning()

    return {
      success: true,
      data: deleted[0],
      message: 'Match deleted successfully'
    }
  } catch (error: unknown) {
    console.error('Error deleting match:', error)

    // Re-throw if it's already a createError response
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete match',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
