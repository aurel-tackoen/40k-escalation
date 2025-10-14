import { db } from '../../../db'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/auth/user
 * Get the currently authenticated user from session cookie
 */
export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const cookies = parseCookies(event)
    const sessionCookie = cookies.auth_session

    if (!sessionCookie) {
      return {
        success: true,
        data: null,
        message: 'Not authenticated'
      }
    }

    // Decode session (simple base64 for now)
    let sessionData
    try {
      const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8')
      sessionData = JSON.parse(decoded)
    } catch {
      return {
        success: true,
        data: null,
        message: 'Invalid session'
      }
    }

    // Check if session is expired
    if (sessionData.expires_at && Date.now() > sessionData.expires_at) {
      return {
        success: true,
        data: null,
        message: 'Session expired'
      }
    }

    // Find or create user in database
    const auth0Id = sessionData.sub
    const email = sessionData.email
    const name = sessionData.name || email.split('@')[0]
    const picture = sessionData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`

    // Check if user exists
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    if (!user) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          auth0Id,
          email,
          name,
          picture,
          lastLoginAt: new Date()
        })
        .returning()

      user = newUser
    } else {
      // Update last login
      const [updatedUser] = await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id))
        .returning()

      user = updatedUser
    }

    return {
      success: true,
      data: user,
      message: 'User authenticated'
    }
  } catch (error) {
    console.error('Auth user error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get authenticated user'
    })
  }
})
