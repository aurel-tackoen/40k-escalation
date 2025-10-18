/**
 * PUT /api/admin/rounds/:id
 * Update a round (admin override)
 * Requires admin role
 */
import { db } from '../../../../db'
import { rounds } from '../../../../db/schema'
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
      statusMessage: 'Round ID is required'
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

    // Check if round exists
    const existingRound = await db
      .select()
      .from(rounds)
      .where(eq(rounds.id, id))
      .limit(1)

    if (!existingRound || existingRound.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Round not found'
      })
    }

    // Update round
    await db
      .update(rounds)
      .set(updateData)
      .where(eq(rounds.id, id))

    // Fetch updated round
    const updatedRound = await db
      .select()
      .from(rounds)
      .where(eq(rounds.id, id))
      .limit(1)

    return {
      success: true,
      data: updatedRound[0],
      message: 'Round updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating round:', error)

    // Re-throw our custom errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update round'
    })
  }
})
