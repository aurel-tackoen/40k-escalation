import { db } from '../../../db'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/auth/user
 * Get the currently authenticated user from session
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from Netlify Identity context
    const context = event.context
    const netlifyUser = context.clientContext?.user

    if (!netlifyUser) {
      return {
        success: true,
        data: null,
        message: 'Not authenticated'
      }
    }

    // Find or create user in database
    const auth0Id = netlifyUser.sub
    const email = netlifyUser.email
    const name = netlifyUser.user_metadata?.full_name || netlifyUser.email.split('@')[0]
    const picture = netlifyUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`

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
