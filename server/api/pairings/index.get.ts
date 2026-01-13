import { db } from '../../../db'
import { pairings, players } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireLeagueMembership } from '../../utils/auth'

/**
 * GET /api/pairings?leagueId=X&round=Y
 * Fetch pairings for a league (optionally filtered by round)
 * Auth: Requires league membership
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null
    const round = query.round ? parseInt(query.round as string) : null

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // Require league membership
    await requireLeagueMembership(event, leagueId)

    // Build where conditions
    const conditions = [eq(pairings.leagueId, leagueId)]
    if (round !== null) {
      conditions.push(eq(pairings.round, round))
    }

    // Fetch pairings with player names
    const pairingsList = await db
      .select({
        id: pairings.id,
        leagueId: pairings.leagueId,
        round: pairings.round,
        player1Id: pairings.player1Id,
        player2Id: pairings.player2Id,
        matchId: pairings.matchId,
        status: pairings.status,
        isBye: pairings.isBye,
        dueDate: pairings.dueDate,
        createdAt: pairings.createdAt,
        player1Name: players.name,
      })
      .from(pairings)
      .leftJoin(players, eq(pairings.player1Id, players.id))
      .where(and(...conditions))

    // Fetch player2 names separately (since it can be null for BYE)
    const enrichedPairings = await Promise.all(
      pairingsList.map(async (pairing) => {
        // Determine status dynamically: if matchId exists, it's completed
        const actualStatus = pairing.matchId ? 'completed' : (pairing.isBye ? 'completed' : 'pending')

        if (pairing.player2Id) {
          const player2 = await db
            .select({ name: players.name })
            .from(players)
            .where(eq(players.id, pairing.player2Id))
            .limit(1)

          return {
            ...pairing,
            status: actualStatus, // Override with calculated status
            player2Name: player2[0]?.name || null
          }
        }
        return {
          ...pairing,
          status: actualStatus, // Override with calculated status
          player2Name: null
        }
      })
    )

    return {
      success: true,
      data: enrichedPairings,
      count: enrichedPairings.length
    }
  } catch (error) {
    console.error('Error fetching pairings:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch pairings'
    })
  }
})
