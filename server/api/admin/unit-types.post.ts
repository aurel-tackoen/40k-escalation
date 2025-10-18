import { db } from '../../../db'
import { unitTypes } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require admin role
    await requireAdmin(event)

    const body = await readBody(event)
    const { gameSystemId, name, category, displayOrder } = body

    // Validation
    if (!name || !gameSystemId || displayOrder === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, gameSystemId, and displayOrder are required'
      })
    }

    // Insert new unit type
    const [newUnitType] = await db.insert(unitTypes).values({
      gameSystemId: parseInt(gameSystemId),
      name,
      category: category || '',
      displayOrder: parseInt(displayOrder),
      isActive: true
    }).returning()

    return {
      success: true,
      data: newUnitType,
      message: 'Unit type created successfully'
    }
  }
  catch (error) {
    console.error('Error creating unit type:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create unit type'
    })
  }
})
