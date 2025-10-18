import { db } from '../../../../db'
import { unitTypes } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require admin role
    await requireAdmin(event)

    const id = parseInt(event.context.params?.id || '0')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid unit type ID'
      })
    }

    const body = await readBody(event)
    const { gameSystemId, name, category, displayOrder } = body

    // Validation
    if (!name || !gameSystemId || displayOrder === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, gameSystemId, and displayOrder are required'
      })
    }

    // Update unit type
    const [updated] = await db
      .update(unitTypes)
      .set({
        gameSystemId: parseInt(gameSystemId),
        name,
        category: category || '',
        displayOrder: parseInt(displayOrder)
      })
      .where(eq(unitTypes.id, id))
      .returning()

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unit type not found'
      })
    }

    return {
      success: true,
      data: updated,
      message: 'Unit type updated successfully'
    }
  }
  catch (error) {
    console.error('Error updating unit type:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update unit type'
    })
  }
})
