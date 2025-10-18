/**
 * DELETE /api/matches?id=<id>
 * Deletes a match from the database
 * Requires: user to be league organizer/owner
 */
import { db } from '../../db'
import { matches } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueRole } from '../utils/auth'

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

    if (!match.leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match is not associated with a league'
      })
    }

    // ✅ Require league organizer or owner role to delete matches
    await requireLeagueRole(event, match.leagueId, ['owner', 'organizer'])

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
