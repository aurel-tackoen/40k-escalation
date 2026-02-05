/**
 * PUT /api/admin/phases/:id
 * Update a phase (admin override)
 * Requires admin role
 */
import { db } from '../../../../db'
import { phases } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Require admin role
  await requireAdmin(event)

  const id = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phase ID is required'
    })
  }

  try {
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}

    if (body.number !== undefined) updateData.number = body.number
    if (body.name !== undefined) updateData.name = body.name
    if (body.pointLimit !== undefined) updateData.pointLimit = body.pointLimit
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate

    // Check if phase exists
    const existingPhase = await db
      .select()
      .from(phases)
      .where(eq(phases.id, id))
      .limit(1)

    if (!existingPhase || existingPhase.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Phase not found'
      })
    }

    // Update phase
    await db
      .update(phases)
      .set(updateData)
      .where(eq(phases.id, id))

    // Fetch updated phase
    const updatedPhase = await db
      .select()
      .from(phases)
      .where(eq(phases.id, id))
      .limit(1)

    return {
      success: true,
      data: updatedPhase[0],
      message: 'Phase updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating phase:', error)

    // Re-throw our custom errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update phase'
    })
  }
})
