/**
 * GET /api/players?leagueId=123
 * Fetches all players from a specific league
 */
import { db } from '../../db'
import { players } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    let allPlayers

    if (leagueId) {
      // Get players for specific league
      allPlayers = await db
        .select()
        .from(players)
        .where(eq(players.leagueId, leagueId))
    } else {
      // Get all players (for admin or migration purposes)
      allPlayers = await db.select().from(players)
    }

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
