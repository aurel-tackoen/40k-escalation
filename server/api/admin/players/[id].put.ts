/**
 * PUT /api/admin/players/[id]
 * Updates a player's name, faction, and army name
 * Requires admin role
 */
import { db } from '../../../../db'
import { players } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  const playerId = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  // Validate input
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Player name is required'
    })
  }

  try {
    const [updatedPlayer] = await db
      .update(players)
      .set({
        name: body.name,
        faction: body.faction || null,
        armyName: body.armyName || null
      })
      .where(eq(players.id, playerId))
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
  } catch (error) {
    console.error('Error updating player:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update player'
    })
  }
})
