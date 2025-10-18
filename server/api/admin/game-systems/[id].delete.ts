import { db } from '../../../../db'
import { gameSystems } from '../../../../db/schema'
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
        statusMessage: 'Invalid game system ID'
      })
    }

    // Delete game system (cascade will handle related records)
    const [deleted] = await db
      .delete(gameSystems)
      .where(eq(gameSystems.id, id))
      .returning()

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Game system not found'
      })
    }

    return {
      success: true,
      data: deleted,
      message: 'Game system deleted successfully'
    }
  }
  catch (error) {
    console.error('Error deleting game system:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete game system'
    })
  }
})
