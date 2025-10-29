import { db } from '../../../db'
import { pairings } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueRole } from '../../utils/auth'

/**
 * DELETE /api/pairings/:id
 * Delete a pairing (only if match not yet recorded)
 * Auth: Owner/Organizer only
 */
export default defineEventHandler(async (event) => {
  try {
    const pairingId = parseInt(getRouterParam(event, 'id') || '0')

    if (!pairingId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pairing ID is required'
      })
    }

    // Fetch pairing to get leagueId and check if match recorded
    const [pairing] = await db
      .select()
      .from(pairings)
      .where(eq(pairings.id, pairingId))
      .limit(1)

    if (!pairing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pairing not found'
      })
    }

    // Require organizer role
    await requireLeagueRole(event, pairing.leagueId, ['owner', 'organizer'])

    // Check if match already recorded
    if (pairing.matchId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete pairing with recorded match. Delete the match first.'
      })
    }

    // Delete pairing
    await db
      .delete(pairings)
      .where(eq(pairings.id, pairingId))

    return {
      success: true,
      message: 'Pairing deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting pairing:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete pairing'
    })
  }
})
