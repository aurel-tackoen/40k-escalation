import { db } from '../../../db'
import { users, players } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/users/me
 * Get current user's profile with linked players
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from Netlify Identity context
    const context = event.context
    const netlifyUser = context.clientContext?.user

    if (!netlifyUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const auth0Id = netlifyUser.sub

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

    // Get all players linked to this user
    const linkedPlayers = await db
      .select()
      .from(players)
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
