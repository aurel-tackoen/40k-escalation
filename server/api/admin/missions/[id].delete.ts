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

    // Delete mission
    const [deleted] = await db
      .delete(missions)
      .where(eq(missions.id, id))
      .returning()

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mission not found'
      })
    }

    return {
      success: true,
      data: deleted,
      message: 'Mission deleted successfully'
    }
  }
  catch (error) {
    console.error('Error deleting mission:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete mission'
    })
  }
})
