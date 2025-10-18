/**
 * PUT /api/admin/users/[id]
 * Updates a user's name and role
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
  const body = await readBody(event)

  // Validate input
  if (!body.name || !body.role) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and role are required'
    })
  }

  // Validate role
  const validRoles = ['player', 'organizer', 'admin']
  if (!validRoles.includes(body.role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role. Must be one of: player, organizer, admin'
    })
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        name: body.name,
        role: body.role
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      data: updatedUser
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user'
    })
  }
})
