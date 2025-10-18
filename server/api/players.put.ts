import { defineEventHandler, readBody, createError } from 'h3'
import { db } from '../../db'
import { players } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * PUT /api/players
 * Update an existing player
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, name, faction, armyName } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Player ID is required'
      })
    }

    if (!name || !faction) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and faction are required'
      })
    }

    // Build update object
    const updateData: { name: string; faction: string; armyName?: string } = {
      name,
      faction
    }

    // Only include armyName if provided
    if (armyName !== undefined) {
      updateData.armyName = armyName
    }

    // Update player
    const [updatedPlayer] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning()

    if (!updatedPlayer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Player not found'
      })
    }

    return {
      success: true,
      data: updatedPlayer
    }
  } catch (err) {
    console.error('Error updating player:', err)
    const error = err as { statusCode?: number }
    if (error.statusCode) {
      throw err
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update player'
    })
  }
})
