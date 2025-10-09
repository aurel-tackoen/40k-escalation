/**
 * GET /api/players
 * Fetches all players from the database
 */
import { db } from '../../db'
import { players } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const allPlayers = await db.select().from(players)
    
    return {
      success: true,
      data: allPlayers,
      count: allPlayers.length
    }
  } catch (error) {
    console.error('Error fetching players:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch players',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
