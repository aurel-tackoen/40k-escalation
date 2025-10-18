/**
 * DELETE /api/players?id=<playerId>
 * Soft deletes a player by setting their membership status to 'inactive'
 * Preserves all historical data (matches, armies)
 * Requires: user to be league owner/organizer OR the player themselves
 */
import { db } from '../../db'
import { players, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require authentication
    const user = await requireAuth(event)

    const query = getQuery(event)
    const playerId = parseInt(query.id as string)

    if (!playerId || isNaN(playerId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid player ID is required'
      })
    }

    // Get the player to be removed
    const [playerToRemove] = await db.select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!playerToRemove) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Player not found'
      })
    }

    // Check authorization: user must be league owner/organizer OR the player themselves
    const [membership] = await db.select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, playerToRemove.leagueId),
          eq(leagueMemberships.userId, user.id)
        )
      )
      .limit(1)

    const isLeagueOwner = membership?.role === 'owner'
    const isSelf = playerToRemove.userId === user.id

    // League owner cannot remove themselves (must transfer ownership first)
    if (isLeagueOwner && isSelf) {
      throw createError({
        statusCode: 403,
        statusMessage: 'League owner cannot leave. Please transfer ownership first.'
      })
    }

    if (!isLeagueOwner && !isSelf) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - You can only remove yourself or must be league owner'
      })
    }

    // SOFT DELETE: Update membership status instead of deleting
    const [updatedMembership] = await db
      .update(leagueMemberships)
      .set({
        status: 'inactive',
        leftAt: new Date()
      })
      .where(
        and(
          eq(leagueMemberships.userId, playerToRemove.userId),
          eq(leagueMemberships.leagueId, playerToRemove.leagueId)
        )
      )
      .returning()

    if (!updatedMembership) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Membership not found'
      })
    }

    return {
      success: true,
      data: playerToRemove,
      message: isSelf ? 'Successfully left league' : 'Player removed from league'
    }
  } catch (error) {
    console.error('Error removing player:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove player',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
