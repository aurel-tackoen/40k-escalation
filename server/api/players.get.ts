/**
 * GET /api/players?leagueId=123
 * Fetches all players from a specific league (includes armyName from league_memberships)
 */
import { db } from '../../db'
import { players, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    let allPlayers

    if (leagueId) {
      // Get players for specific league with armyName from league_memberships
      const playersWithArmyNames = await db
        .select({
          id: players.id,
          leagueId: players.leagueId,
          userId: players.userId,
          name: players.name,
          faction: players.faction,
          wins: players.wins,
          losses: players.losses,
          draws: players.draws,
          totalPoints: players.totalPoints,
          createdAt: players.createdAt,
          armyName: leagueMemberships.armyName
        })
        .from(players)
        .leftJoin(
          leagueMemberships,
          and(
            eq(players.userId, leagueMemberships.userId),
            eq(players.leagueId, leagueMemberships.leagueId)
          )
        )
        .where(eq(players.leagueId, leagueId))

      allPlayers = playersWithArmyNames
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
