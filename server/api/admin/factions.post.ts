import { db } from '../../../db'
import { factions } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require admin role
    await requireAdmin(event)

    const body = await readBody(event)
    const { gameSystemId, name, category } = body

    // Validation
    if (!name || !gameSystemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and gameSystemId are required'
      })
    }

    // Insert new faction
    const [newFaction] = await db.insert(factions).values({
      gameSystemId: parseInt(gameSystemId),
      name,
      category: category || '',
      isActive: true
    }).returning()

    return {
      success: true,
      data: newFaction,
      message: 'Faction created successfully'
    }
  }
  catch (error) {
    console.error('Error creating faction:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create faction'
    })
  }
})
