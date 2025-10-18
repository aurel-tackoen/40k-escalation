import { db } from '../../../../db'
import { leagueMemberships, leagues } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

/**
 * POST /api/leagues/:id/leave
 * Leave a league (sets membership status to inactive)
 */
export default defineEventHandler(async (event) => {
  try {
    // ✅ Require authentication
    const user = await requireAuth(event)

    const leagueId = parseInt(getRouterParam(event, 'id') || '')

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: leagueId'
      })
    }

    // Get membership
    const [membership] = await db
      .select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, user.id) // ✅ Use authenticated user ID
        )
      )
      .limit(1)

    if (!membership) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Membership not found'
      })
    }

    // Check if user is the owner
    if (membership.role === 'owner') {
      // Check if there are other members
      const otherMembers = await db
        .select()
        .from(leagueMemberships)
        .where(
          and(
            eq(leagueMemberships.leagueId, leagueId),
            eq(leagueMemberships.status, 'active')
          )
        )

      if (otherMembers.length > 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot leave league as owner. Transfer ownership or delete the league first.'
        })
      }

      // If owner is the only member, archive the league
      await db
        .update(leagues)
        .set({ status: 'archived' })
        .where(eq(leagues.id, leagueId))
    }

    // Set membership to inactive
    await db
      .update(leagueMemberships)
      .set({ status: 'inactive' })
      .where(eq(leagueMemberships.id, membership.id))

    return {
      success: true,
      message: 'Successfully left league'
    }
  } catch (error) {
    console.error('Error leaving league:', error)
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to leave league'
    })
  }
})
