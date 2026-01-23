/**
 * PUT /api/admin/stages/:id
 * Update a stage (admin override)
 * Requires admin role
 */
import { db } from '../../../../db'
import { stages } from '../../../../db/schema'
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
      statusMessage: 'Stage ID is required'
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

    // Check if stage exists
    const existingStage = await db
      .select()
      .from(stages)
      .where(eq(stages.id, id))
      .limit(1)

    if (!existingStage || existingStage.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stage not found'
      })
    }

    // Update stage
    await db
      .update(stages)
      .set(updateData)
      .where(eq(stages.id, id))

    // Fetch updated stage
    const updatedStage = await db
      .select()
      .from(stages)
      .where(eq(stages.id, id))
      .limit(1)

    return {
      success: true,
      data: updatedStage[0],
      message: 'Stage updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating stage:', error)

    // Re-throw our custom errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update stage'
    })
  }
})
