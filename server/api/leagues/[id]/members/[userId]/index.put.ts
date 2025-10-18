import { db } from '../../../../../../db'
import { leagueMemberships } from '../../../../../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * PUT /api/leagues/:id/members/:userId
 * Update league membership (player ID link)
 *
 * Body:
 * {
 *   playerId?: number (optional - link to player entity)
 * }
 *
 * Note: armyName is now stored in players table, not memberships
 */
export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(getRouterParam(event, 'id') || '')
    const userId = parseInt(getRouterParam(event, 'userId') || '')
    const body = await readBody(event)

    if (!leagueId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: leagueId, userId'
      })
    }

    // Build update object with only provided fields
    const updates: Record<string, number | string | null> = {}
    if (body.playerId !== undefined) {
      updates.playerId = body.playerId
    }

    if (Object.keys(updates).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }

    // Update membership
    const [updatedMembership] = await db
      .update(leagueMemberships)
      .set(updates)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, userId)
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
      message: 'Membership updated successfully',
      data: updatedMembership
    }
  } catch (error) {
    console.error('Error updating membership:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update membership'
    })
  }
})
