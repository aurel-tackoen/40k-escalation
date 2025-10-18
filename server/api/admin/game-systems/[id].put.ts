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

    const body = await readBody(event)
    const { name, shortName, description, matchType, matchConfig } = body

    // Validation
    if (!name || !shortName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and shortName are required'
      })
    }

    // Update game system
    const [updated] = await db
      .update(gameSystems)
      .set({
        name,
        shortName,
        description: description || '',
        matchType: matchType || 'victory_points',
        matchConfig: typeof matchConfig === 'string' ? matchConfig : JSON.stringify(matchConfig || {})
      })
      .where(eq(gameSystems.id, id))
      .returning()

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Game system not found'
      })
    }

    return {
      success: true,
      data: updated,
      message: 'Game system updated successfully'
    }
  }
  catch (error) {
    console.error('Error updating game system:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update game system'
    })
  }
})
