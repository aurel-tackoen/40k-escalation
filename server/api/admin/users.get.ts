/**
 * GET /api/admin/users
 * Fetches all users for admin statistics
 * Requires admin role
 */
import { db } from '../../../db'
import { users } from '../../../db/schema'
import { requireAdmin } from '../../utils/auth'

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

    return {
      success: true,
      data: allUsers,
      count: allUsers.length
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
