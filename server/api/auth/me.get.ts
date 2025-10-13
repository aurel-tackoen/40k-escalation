import { getCurrentUser } from '../../utils/auth'

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event)

    if (!user) {
      return {
        success: false,
        data: null,
        message: 'Not authenticated'
      }
    }

    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error in /api/auth/me:', error)

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to get user info'
    })
  }
})
