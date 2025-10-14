import { db } from '../../../db'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * PUT /api/users/me
 * Update current user's profile
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
