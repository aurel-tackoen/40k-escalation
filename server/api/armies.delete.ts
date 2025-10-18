/**
 * DELETE /api/armies?leagueId=<leagueId>&playerId=<playerId>&round=<round>
 * Deletes an army list from the database
 * Requires: user to be the army owner OR league organizer/owner
 */
import { db } from '../../db'
import { armies, players } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth, requireLeagueRole } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require authentication
    const user = await requireAuth(event)

    const query = getQuery(event)
    const leagueId = parseInt(query.leagueId as string)
    const playerId = parseInt(query.playerId as string)
    const round = parseInt(query.round as string)

    if (!leagueId || isNaN(leagueId) || !playerId || isNaN(playerId) || !round || isNaN(round)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid league ID, player ID and round are required'
      })
    }

    // Get the player to check ownership
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!player) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Player not found'
      })
    }

    // Check authorization: user must own the player OR be league organizer/owner
    const isOwnArmy = player.userId === user.id
    if (!isOwnArmy) {
      // If not own army, must be organizer or owner
      await requireLeagueRole(event, leagueId, ['owner', 'organizer'])
    }

    // Delete the army
    const deleted = await db.delete(armies)
      .where(
        and(
          eq(armies.leagueId, leagueId),
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
