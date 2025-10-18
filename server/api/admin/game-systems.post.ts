import { db } from '../../../db'
import { gameSystems } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require admin role
    await requireAdmin(event)

    const body = await readBody(event)
    const { name, shortName, description, matchType, matchConfig } = body

    // Validation
    if (!name || !shortName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and shortName are required'
      })
    }

    // Insert new game system
    const [newSystem] = await db.insert(gameSystems).values({
      name,
      shortName,
      description: description || '',
      matchType: matchType || 'victory_points',
      matchConfig: typeof matchConfig === 'string' ? matchConfig : JSON.stringify(matchConfig || {}),
      isActive: true
    }).returning()

    return {
      success: true,
      data: newSystem,
      message: 'Game system created successfully'
    }
  }
  catch (error) {
    console.error('Error creating game system:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create game system'
    })
  }
})
