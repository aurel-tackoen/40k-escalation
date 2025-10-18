import { db } from '../../../../db'
import { factions } from '../../../../db/schema'
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
        statusMessage: 'Invalid faction ID'
      })
    }

    // Delete faction
    const [deleted] = await db
      .delete(factions)
      .where(eq(factions.id, id))
      .returning()

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Faction not found'
      })
    }

    return {
      success: true,
      data: deleted,
      message: 'Faction deleted successfully'
    }
  }
  catch (error) {
    console.error('Error deleting faction:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete faction'
    })
  }
})
