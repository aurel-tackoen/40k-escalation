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

    const body = await readBody(event)
    const { gameSystemId, name, category } = body

    // Validation
    if (!name || !gameSystemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and gameSystemId are required'
      })
    }

    // Update faction
    const [updated] = await db
      .update(factions)
      .set({
        gameSystemId: parseInt(gameSystemId),
        name,
        category: category || ''
      })
      .where(eq(factions.id, id))
      .returning()

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Faction not found'
      })
    }

    return {
      success: true,
      data: updated,
      message: 'Faction updated successfully'
    }
  }
  catch (error) {
    console.error('Error updating faction:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update faction'
    })
  }
})
