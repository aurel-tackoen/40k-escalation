/**
 * GET /api/admin/leagues
 * Fetches all leagues with creator info, game system, member counts, and phases
 * Requires admin role
 */
import { db } from '../../../db'
import { leagues, users, gameSystems, leagueMemberships, phases } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Require admin role
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
        currentPhase: leagues.currentPhase,
        createdBy: leagues.createdBy,
        creatorName: users.name,
        creatorEmail: users.email,
        isPrivate: leagues.isPrivate,
        shareToken: leagues.shareToken,
        maxPlayers: leagues.maxPlayers,
        status: leagues.status,
        createdAt: leagues.createdAt
      })
      .from(leagues)
      .leftJoin(users, eq(leagues.createdBy, users.id))
      .leftJoin(gameSystems, eq(leagues.gameSystemId, gameSystems.id))
      .orderBy(leagues.createdAt)

    // Add member count and phases to each league
    const leaguesWithDetails = await Promise.all(
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

        // Get phases for this league
        const leaguePhases = await db
          .select()
          .from(phases)
          .where(eq(phases.leagueId, league.id))
          .orderBy(phases.number)

        return {
          ...league,
          memberCount: members.length,
          phases: leaguePhases
        }
      })
    )

    return {
      success: true,
      data: leaguesWithDetails,
      count: leaguesWithDetails.length
    }
  } catch (error) {
    console.error('Error fetching leagues:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leagues'
    })
  }
})
