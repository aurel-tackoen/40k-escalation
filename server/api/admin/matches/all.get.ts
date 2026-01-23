/**
 * GET /api/admin/matches/all
 * Fetches all matches with player names, league info, and game system
 * Requires admin role
 */
import { db } from '../../../../db'
import { matches, players, leagues, gameSystems } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  try {
    // Fetch all matches with player and league info
    const allMatches = await db
      .select({
        id: matches.id,
        leagueId: matches.leagueId,
        leagueName: leagues.name,
        stage: matches.stage,
        player1Id: matches.player1Id,
        player2Id: matches.player2Id,
        matchType: matches.matchType,
        gameSystemId: matches.gameSystemId,
        gameSystemName: gameSystems.name,
        player1Points: matches.player1Points,
        player2Points: matches.player2Points,
        player1ArmyValue: matches.player1ArmyValue,
        player2ArmyValue: matches.player2ArmyValue,
        player1CasualtiesValue: matches.player1CasualtiesValue,
        player2CasualtiesValue: matches.player2CasualtiesValue,
        marginOfVictory: matches.marginOfVictory,
        scenarioObjective: matches.scenarioObjective,
        player1ObjectiveCompleted: matches.player1ObjectiveCompleted,
        player2ObjectiveCompleted: matches.player2ObjectiveCompleted,
        winnerId: matches.winnerId,
        mission: matches.mission,
        datePlayed: matches.datePlayed,
        notes: matches.notes,
        createdAt: matches.createdAt
      })
      .from(matches)
      .leftJoin(leagues, eq(matches.leagueId, leagues.id))
      .leftJoin(gameSystems, eq(matches.gameSystemId, gameSystems.id))
      .orderBy(matches.datePlayed)

    // Fetch player names for each match
    const matchesWithPlayers = await Promise.all(
      allMatches.map(async (match) => {
        const player1 = await db
          .select({ name: players.name })
          .from(players)
          .where(eq(players.id, match.player1Id))
          .limit(1)

        const player2 = await db
          .select({ name: players.name })
          .from(players)
          .where(eq(players.id, match.player2Id))
          .limit(1)

        const winner = match.winnerId
          ? await db
            .select({ name: players.name })
            .from(players)
            .where(eq(players.id, match.winnerId))
            .limit(1)
          : null

        return {
          ...match,
          player1Name: player1[0]?.name || 'Unknown',
          player2Name: player2[0]?.name || 'Unknown',
          winnerName: winner?.[0]?.name || null
        }
      })
    )

    return {
      success: true,
      data: matchesWithPlayers,
      count: matchesWithPlayers.length
    }
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch matches'
    })
  }
})
