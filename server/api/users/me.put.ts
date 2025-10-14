import { db } from '../../../db'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * PUT /api/users/me
 * Update current user's profile
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
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Get update data from request body
    const body = await readBody(event)
    const { name, picture } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      })
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        name: name.trim(),
        picture: picture || existingUser.picture
      })
      .where(eq(users.id, existingUser.id))
      .returning()

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error('Update user profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user profile'
    })
  }
})
