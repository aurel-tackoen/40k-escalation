import { requireAuth, updateLastLogin } from '../../utils/auth'

/**
 * POST /api/auth/login
 * Update last login timestamp for authenticated user
 */
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await requireAuth(event)

    // Update last login timestamp
    if (user.netlifyId) {
      await updateLastLogin(user.netlifyId)
    }

    return {
      success: true,
      data: user,
      message: 'Login timestamp updated'
    }
  } catch (error) {
    console.error('Error in /api/auth/login:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to update login'
    })
  }
})
