/**
 * DELETE /api/matches?id=<id>
 * Deletes a match from the database
 * Requires: user to be league organizer/owner OR a participant in the match
 */
import { db } from '../../db'
import { matches, players } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueMembership } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const matchId = parseInt(query.id as string)

    if (!matchId || isNaN(matchId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid match ID is required'
      })
    }

    // Fetch the match to verify it exists
    const [match] = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1)

    if (!match) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }

    if (!match.leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match is not associated with a league'
      })
    }

    // ✅ Get authenticated user and check league membership
    const { user, membership } = await requireLeagueMembership(event, match.leagueId)

    // Check if user can delete: organizer/owner OR participant in the match
    const isOrganizer = membership.role === 'owner' || membership.role === 'organizer'

    // Get player IDs for this user
    const [player1] = await db.select()
      .from(players)
      .where(eq(players.id, match.player1Id))
      .limit(1)

    const [player2] = await db.select()
      .from(players)
      .where(eq(players.id, match.player2Id))
      .limit(1)

    const isParticipant = (player1?.userId === user.id) || (player2?.userId === user.id)

    if (!isOrganizer && !isParticipant) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete matches you participated in'
      })
    }

    // Reverse player stats before deleting
    if (player1) {
      const updates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: player1.totalPoints - (match.player1Points || 0)
      }

      if (match.winnerId === match.player1Id) {
        updates.wins = Math.max(0, player1.wins - 1)
      } else if (match.winnerId === match.player2Id) {
        updates.losses = Math.max(0, player1.losses - 1)
      } else if (match.winnerId === null) {
        updates.draws = Math.max(0, player1.draws - 1)
      }

      await db.update(players).set(updates).where(eq(players.id, match.player1Id))
    }

    if (player2) {
      const updates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: player2.totalPoints - (match.player2Points || 0)
      }

      if (match.winnerId === match.player2Id) {
        updates.wins = Math.max(0, player2.wins - 1)
      } else if (match.winnerId === match.player1Id) {
        updates.losses = Math.max(0, player2.losses - 1)
      } else if (match.winnerId === null) {
        updates.draws = Math.max(0, player2.draws - 1)
      }

      await db.update(players).set(updates).where(eq(players.id, match.player2Id))
    }

    // Delete the match
    const deleted = await db.delete(matches)
      .where(eq(matches.id, matchId))
      .returning()

    return {
      success: true,
      data: deleted[0],
      message: 'Match deleted successfully'
    }
  } catch (error: unknown) {
    console.error('Error deleting match:', error)

    // Re-throw if it's already a createError response
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete match',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
