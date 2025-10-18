/**
 * GET /api/admin/users
 * Fetches all users with their players and league memberships
 * Requires admin role
 */
import { db } from '../../../db'
import { users, players, leagueMemberships, leagues } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
      })
      .from(users)
      .orderBy(users.createdAt)

    // Fetch players and league memberships for each user
    const usersWithRelations = await Promise.all(
      allUsers.map(async (user) => {
        // Get all players for this user with league game system
        const userPlayers = await db
          .select({
            id: players.id,
            name: players.name,
            faction: players.faction,
            armyName: players.armyName,
            leagueId: players.leagueId,
            leagueName: leagues.name,
            gameSystemId: leagues.gameSystemId,
            wins: players.wins,
            losses: players.losses,
            draws: players.draws
          })
          .from(players)
          .leftJoin(leagues, eq(players.leagueId, leagues.id))
          .where(eq(players.userId, user.id))

        // Get all league memberships for this user with league names
        const userMemberships = await db
          .select({
            id: leagueMemberships.id,
            leagueId: leagueMemberships.leagueId,
            leagueName: leagues.name,
            role: leagueMemberships.role,
            status: leagueMemberships.status,
            joinedAt: leagueMemberships.joinedAt
          })
          .from(leagueMemberships)
          .leftJoin(leagues, eq(leagueMemberships.leagueId, leagues.id))
          .where(eq(leagueMemberships.userId, user.id))

        return {
          ...user,
          players: userPlayers,
          memberships: userMemberships
        }
      })
    )

    return {
      success: true,
      data: usersWithRelations,
      count: usersWithRelations.length
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
