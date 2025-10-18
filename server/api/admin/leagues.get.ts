/**
 * GET /api/admin/leagues
 * Fetches all leagues with creator info, game system, and member counts
 * Requires admin role
 */
import { db } from '../../../db'
import { leagues, users, gameSystems, leagueMemberships } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  try {
    // Fetch all leagues with creator and game system info
    const allLeagues = await db
      .select({
        id: leagues.id,
        name: leagues.name,
        description: leagues.description,
        rules: leagues.rules,
        gameSystemId: leagues.gameSystemId,
        gameSystemName: gameSystems.name,
        startDate: leagues.startDate,
        endDate: leagues.endDate,
        currentRound: leagues.currentRound,
        createdBy: leagues.createdBy,
        creatorName: users.name,
        creatorEmail: users.email,
        isPrivate: leagues.isPrivate,
        shareToken: leagues.shareToken,
        allowDirectJoin: leagues.allowDirectJoin,
        maxPlayers: leagues.maxPlayers,
        status: leagues.status,
        createdAt: leagues.createdAt
      })
      .from(leagues)
      .leftJoin(users, eq(leagues.createdBy, users.id))
      .leftJoin(gameSystems, eq(leagues.gameSystemId, gameSystems.id))
      .orderBy(leagues.createdAt)

    // Add member count to each league
    const leaguesWithMemberCount = await Promise.all(
      allLeagues.map(async (league) => {
        // Get active member count
        const members = await db
          .select()
          .from(leagueMemberships)
          .where(
            and(
              eq(leagueMemberships.leagueId, league.id),
              eq(leagueMemberships.status, 'active')
            )
          )

        return {
          ...league,
          memberCount: members.length
        }
      })
    )

    return {
      success: true,
      data: leaguesWithMemberCount,
      count: leaguesWithMemberCount.length
    }
  } catch (error) {
    console.error('Error fetching leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leagues'
    })
  }
})
