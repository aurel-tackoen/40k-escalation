import { db } from '../../db'
import { paintingProgress } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { playerId, round, unitName, totalModels, paintedModels, points } = body

    // Validate required fields
    if (!playerId || !round || !unitName || totalModels === undefined || paintedModels === undefined || points === undefined) {
      return {
        success: false,
        error: 'Missing required fields: playerId, round, unitName, totalModels, paintedModels, points'
      }
    }

    // Validate painted models doesn't exceed total models
    if (paintedModels > totalModels) {
      return {
        success: false,
        error: 'Painted models cannot exceed total models'
      }
    }

    // Check if entry already exists
    const existing = await db
      .select()
      .from(paintingProgress)
      .where(
        and(
          eq(paintingProgress.playerId, playerId),
          eq(paintingProgress.round, round),
          eq(paintingProgress.unitName, unitName)
        )
      )

    let result

    if (existing.length > 0) {
      // Update existing entry
      result = await db
        .update(paintingProgress)
        .set({
          totalModels,
          paintedModels,
          points,
          lastUpdated: new Date()
        })
        .where(eq(paintingProgress.id, existing[0].id))
        .returning()
    } else {
      // Insert new entry
      result = await db
        .insert(paintingProgress)
        .values({
          playerId,
          round,
          unitName,
          totalModels,
          paintedModels,
          points
        })
        .returning()
    }

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    console.error('Error saving painting progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save painting progress'
    }
  }
})
