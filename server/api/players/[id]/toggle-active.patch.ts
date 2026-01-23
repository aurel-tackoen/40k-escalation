import { db } from '../../../../db'
import { players } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueRole } from '../../../utils/auth'

/**
 * PATCH /api/players/:id/toggle-active
 * Toggle player active status
 * Auth: Owner/Organizer only
 */
export default defineEventHandler(async (event) => {
  try {
    const playerId = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)
    const { isActive, currentStage } = body

    if (!playerId || typeof isActive !== 'boolean' || !currentStage) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: playerId, isActive, currentStage'
      })
    }

    // Fetch player to get leagueId
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

    // Require organizer role
    await requireLeagueRole(event, player.leagueId, ['owner', 'organizer'])

    // Update player status
    const updateData: {
      isActive: boolean
      joinedStage?: number
      leftStage?: number | null
    } = {
      isActive
    }

    if (isActive) {
      // Reactivating player
      updateData.joinedStage = currentStage
      updateData.leftStage = null
    } else {
      // Deactivating player
      updateData.leftStage = currentStage
    }

    const [updatedPlayer] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, playerId))
      .returning()

    return {
      success: true,
      data: updatedPlayer,
      message: isActive ? 'Player activated' : 'Player deactivated'
    }
  } catch (error) {
    console.error('Error toggling player status:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to toggle player status'
    })
  }
})
