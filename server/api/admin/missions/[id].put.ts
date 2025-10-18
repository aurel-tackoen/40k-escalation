import { db } from '../../../../db'
import { missions } from '../../../../db/schema'
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
        statusMessage: 'Invalid mission ID'
      })
    }

    const body = await readBody(event)
    const { gameSystemId, name, category } = body

    // Validation
    if (!name || !gameSystemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and gameSystemId are required'
      })
    }

    // Update mission
    const [updated] = await db
      .update(missions)
      .set({
        gameSystemId: parseInt(gameSystemId),
        name,
        category: category || ''
      })
      .where(eq(missions.id, id))
      .returning()

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mission not found'
      })
    }

    return {
      success: true,
      data: updated,
      message: 'Mission updated successfully'
    }
  }
  catch (error) {
    console.error('Error updating mission:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update mission'
    })
  }
})
