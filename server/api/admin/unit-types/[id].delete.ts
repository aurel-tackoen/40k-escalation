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

    // Delete unit type
    const [deleted] = await db
      .delete(unitTypes)
      .where(eq(unitTypes.id, id))
      .returning()

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unit type not found'
      })
    }

    return {
      success: true,
      data: deleted,
      message: 'Unit type deleted successfully'
    }
  }
  catch (error) {
    console.error('Error deleting unit type:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete unit type'
    })
  }
})
