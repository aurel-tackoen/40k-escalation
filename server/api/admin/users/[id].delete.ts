/**
 * DELETE /api/admin/users/[id]
 * Deletes a user and all associated data (cascades to players, armies, etc.)
 * Requires admin role
 */
import { db } from '../../../../db'
import { users } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  const userId = parseInt(event.context.params?.id || '0')

  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'))

      if (adminCount.length <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete the last admin user'
        })
      }
    }

    // Delete user (cascade will handle related records)
    await db
      .delete(users)
      .where(eq(users.id, userId))

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error: unknown) {
    console.error('Error deleting user:', error)

    // Re-throw our custom errors
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete user'
    })
  }
})
