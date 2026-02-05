/**
 * PUT /api/admin/matches/:id
 * Update a match (admin override)
 * Requires admin role
 */
import { db } from '../../../../db'
import { matches } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  const id = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Match ID is required'
    })
  }

  try {
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}

    if (body.phase !== undefined) updateData.phase = body.phase
    if (body.player1Points !== undefined) updateData.player1Points = body.player1Points
    if (body.player2Points !== undefined) updateData.player2Points = body.player2Points
    if (body.winnerId !== undefined) updateData.winnerId = body.winnerId
    if (body.mission !== undefined) updateData.mission = body.mission
    if (body.datePlayed !== undefined) updateData.datePlayed = body.datePlayed
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.matchType !== undefined) updateData.matchType = body.matchType

    // The Old World fields
    if (body.player1ArmyValue !== undefined) updateData.player1ArmyValue = body.player1ArmyValue
    if (body.player2ArmyValue !== undefined) updateData.player2ArmyValue = body.player2ArmyValue
    if (body.player1CasualtiesValue !== undefined) updateData.player1CasualtiesValue = body.player1CasualtiesValue
    if (body.player2CasualtiesValue !== undefined) updateData.player2CasualtiesValue = body.player2CasualtiesValue
    if (body.marginOfVictory !== undefined) updateData.marginOfVictory = body.marginOfVictory

    // MESBG fields
    if (body.scenarioObjective !== undefined) updateData.scenarioObjective = body.scenarioObjective
    if (body.player1ObjectiveCompleted !== undefined) updateData.player1ObjectiveCompleted = body.player1ObjectiveCompleted
    if (body.player2ObjectiveCompleted !== undefined) updateData.player2ObjectiveCompleted = body.player2ObjectiveCompleted

    // Check if match exists
    const existingMatch = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id))
      .limit(1)

    if (!existingMatch || existingMatch.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }

    // Update match
    await db
      .update(matches)
      .set(updateData)
      .where(eq(matches.id, id))

    // Fetch updated match
    const updatedMatch = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id))
      .limit(1)

    return {
      success: true,
      data: updatedMatch[0],
      message: 'Match updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating match:', error)

    // Re-throw our custom errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update match'
    })
  }
})
