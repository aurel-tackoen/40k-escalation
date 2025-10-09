/**
 * DELETE /api/players?id=<playerId>
 * Deletes a player from the database
 */
import { db } from '../../db'
import { players } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const playerId = parseInt(query.id as string)
    
    if (!playerId || isNaN(playerId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid player ID is required'
      })
    }
    
    // Delete the player
    const deleted = await db.delete(players)
      .where(eq(players.id, playerId))
      .returning()
    
    if (deleted.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Player not found'
      })
    }
    
    return {
      success: true,
      data: deleted[0]
    }
  } catch (error) {
    console.error('Error deleting player:', error)
    
    if (error instanceof Error && error.message.includes('foreign key')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete player with associated matches or armies'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete player',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
