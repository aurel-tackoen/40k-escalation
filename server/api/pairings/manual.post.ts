import { db } from '../../../db'
import { pairings } from '../../../db/schema'
import { requireLeagueRole } from '../../utils/auth'

/**
 * POST /api/pairings/manual
 * Create a manual pairing (including BYE)
 * Auth: Owner/Organizer only
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leagueId, phase, player1Id, player2Id, isBye, dueDate } = body

    if (!leagueId || !phase || !player1Id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: leagueId, phase, player1Id'
      })
    }

    // Require organizer role
    await requireLeagueRole(event, leagueId, ['owner', 'organizer'])

    // Create pairing object
    const newPairing = {
      leagueId,
      phase,
      player1Id,
      player2Id: player2Id || null,
      isBye: isBye ?? !player2Id, // If no player2Id, it's a BYE
      status: player2Id ? 'pending' : 'completed', // BYE auto-completes
      dueDate: dueDate || null,
      matchId: null
    }

    // Insert pairing
    const [insertedPairing] = await db
      .insert(pairings)
      .values(newPairing)
      .returning()

    return {
      success: true,
      data: insertedPairing,
      message: `Manual pairing created${insertedPairing.isBye ? ' (BYE)' : ''}`
    }
  } catch (error) {
    console.error('Error creating manual pairing:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create manual pairing'
    })
  }
})
