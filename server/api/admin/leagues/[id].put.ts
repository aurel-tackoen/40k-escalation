/**
 * PUT /api/admin/leagues/:id
 * Update a league (admin override)
 * Requires admin role
 */
import { db } from '../../../../db'
import { leagues } from '../../../../db/schema'
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
      statusMessage: 'League ID is required'
    })
  }

  try {
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.rules !== undefined) updateData.rules = body.rules
    if (body.gameSystemId !== undefined) updateData.gameSystemId = body.gameSystemId
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.currentRound !== undefined) updateData.currentRound = body.currentRound
    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate
    if (body.allowDirectJoin !== undefined) updateData.allowDirectJoin = body.allowDirectJoin
    if (body.maxPlayers !== undefined) updateData.maxPlayers = body.maxPlayers
    if (body.status !== undefined) {
      // Validate status
      const validStatuses = ['draft', 'active', 'completed', 'archived']
      if (!validStatuses.includes(body.status)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid status. Must be: draft, active, completed, or archived'
        })
      }
      updateData.status = body.status
    }

    // Check if league exists
    const existingLeague = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, id))
      .limit(1)

    if (!existingLeague || existingLeague.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    // Update league
    await db
      .update(leagues)
      .set(updateData)
      .where(eq(leagues.id, id))

    // Fetch updated league
    const updatedLeague = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, id))
      .limit(1)

    return {
      success: true,
      data: updatedLeague[0],
      message: 'League updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating league:', error)

    // Re-throw our custom errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update league'
    })
  }
})
