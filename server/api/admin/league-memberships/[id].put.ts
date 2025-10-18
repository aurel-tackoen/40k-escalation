/**
 * PUT /api/admin/league-memberships/[id]
 * Updates a league membership's role and status
 * Requires admin role
 */
import { db } from '../../../../db'
import { leagueMemberships } from '../../../../db/schema'
import { requireAdmin } from '../../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  const membershipId = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  // Validate input
  if (!body.role || !body.status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role and status are required'
    })
  }

  // Validate role
  const validRoles = ['player', 'organizer', 'owner']
  if (!validRoles.includes(body.role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role. Must be one of: player, organizer, owner'
    })
  }

  // Validate status
  const validStatuses = ['active', 'inactive', 'banned', 'invited']
  if (!validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status. Must be one of: active, inactive, banned, invited'
    })
  }

  try {
    const [updatedMembership] = await db
      .update(leagueMemberships)
      .set({
        role: body.role,
        status: body.status
      })
      .where(eq(leagueMemberships.id, membershipId))
      .returning()

    if (!updatedMembership) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Membership not found'
      })
    }

    return {
      success: true,
      data: updatedMembership
    }
  } catch (error) {
    console.error('Error updating membership:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update membership'
    })
  }
})
