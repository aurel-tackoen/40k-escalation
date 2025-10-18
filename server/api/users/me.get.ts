import { db } from '../../../db'
import { users, players, leagues } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/users/me
 * Get current user's profile with linked players
 */
export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const cookies = parseCookies(event)
    const sessionCookie = cookies.auth_session

    if (!sessionCookie) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    // Decode session
    let sessionData
    try {
      const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8')
      sessionData = JSON.parse(decoded)
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session'
      })
    }

    const auth0Id = sessionData.sub

    // Find user in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Get all players linked to this user with their leagues (armyName now from players table)
    const linkedPlayers = await db
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
        leagueName: leagues.name
      })
      .from(players)
      .leftJoin(leagues, eq(players.leagueId, leagues.id))
      .where(eq(players.userId, user.id))

    return {
      success: true,
      data: {
        user,
        players: linkedPlayers
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error('Get user profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user profile'
    })
  }
})
