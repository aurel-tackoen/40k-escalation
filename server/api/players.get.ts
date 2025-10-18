/**
 * GET /api/players?leagueId=123
 * Fetches all players from a specific league (includes armyName from players table)
 * Requires league membership to access player data
 */
import { db } from '../../db'
import { players, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireLeagueMembership } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // ✅ Require league membership to view players
    await requireLeagueMembership(event, leagueId)

    // Get players for specific league with membership status (armyName now in players table)
    const playersWithMembership = await db
      .select({
        id: players.id,
        leagueId: players.leagueId,
        userId: players.userId,
        name: players.name,
        faction: players.faction,
        armyName: players.armyName, // ✅ Now from players table
        wins: players.wins,
        losses: players.losses,
        draws: players.draws,
        totalPoints: players.totalPoints,
        createdAt: players.createdAt,
        membershipStatus: leagueMemberships.status,
        leftAt: leagueMemberships.leftAt
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

    return {
      success: true,
      data: playersWithMembership,
      count: playersWithMembership.length
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
