/**
 * POST /api/armies
 * Creates or updates an army list (requires authentication)
 */
import { db } from '../../db'
import { armies } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth, ownsResource } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    await requireAuth(event)

    const body = await readBody(event)    // Validate required fields
    if (!body.playerId || !body.round || !body.name || !body.units) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Player ID, round, name, and units are required'
      })
    }

    // Check ownership - users can only create armies for themselves (unless admin)
    const canModify = await ownsResource(event, body.playerId)
    if (!canModify) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only manage your own armies'
      })
    }

    // Check if army already exists for this player and round
    const existing = await db.select()
      .from(armies)
      .where(and(
        eq(armies.playerId, body.playerId),
        eq(armies.round, body.round)
      ))

    const unitsJson = JSON.stringify(body.units)
    const today = new Date().toISOString().split('T')[0]

    if (existing.length > 0) {
      // Update existing army
      const [updated] = await db.update(armies)
        .set({
          name: body.name,
          totalPoints: body.totalPoints,
          units: unitsJson,
          isValid: body.isValid !== undefined ? body.isValid : true,
          lastModified: today
        })
        .where(eq(armies.id, existing[0].id))
        .returning()

      return {
        success: true,
        data: {
          ...updated,
          units: JSON.parse(updated.units)
        }
      }
    } else {
      // Create new army
      const [newArmy] = await db.insert(armies).values({
        playerId: body.playerId,
        round: body.round,
        name: body.name,
        totalPoints: body.totalPoints,
        units: unitsJson,
        isValid: body.isValid !== undefined ? body.isValid : true,
        lastModified: today
      }).returning()

      return {
        success: true,
        data: {
          ...newArmy,
          units: JSON.parse(newArmy.units)
        }
      }
    }
  } catch (error) {
    console.error('Error saving army:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save army'
    })
  }
})
