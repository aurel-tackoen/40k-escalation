import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, and } from 'drizzle-orm'
import { leagueMemberships } from '../../../../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const { id, userId: targetUserId } = getRouterParams(event)
    const leagueId = parseInt(id)
    const targetUserId_int = parseInt(targetUserId)
    const body = await readBody(event)

    if (!leagueId || isNaN(leagueId) || !targetUserId_int || isNaN(targetUserId_int)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID or user ID'
      })
    }

    const { requestingUserId, newRole } = body

    if (!requestingUserId || !newRole) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Requesting user ID and new role are required'
      })
    }

    if (!['owner', 'organizer', 'player'].includes(newRole)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid role. Must be owner, organizer, or player'
      })
    }

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Check if requesting user is owner
    const requestingMembershipResult = await db
      .select()
      .from(leagueMemberships)
      .where(and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, requestingUserId)
      ))
      .limit(1)

    if (!requestingMembershipResult.length) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not a member of this league'
      })
    }

    if (requestingMembershipResult[0].role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only league owner can change member roles'
      })
    }

    // Prevent owner from demoting themselves
    if (requestingUserId === targetUserId_int && newRole !== 'owner') {
      throw createError({
        statusCode: 400,
        statusMessage: 'League owner cannot demote themselves. Transfer ownership first.'
      })
    }

    // Update role
    const updatedMembership = await db
      .update(leagueMemberships)
      .set({ role: newRole })
      .where(and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, targetUserId_int)
      ))
      .returning()

    if (!updatedMembership.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Member not found'
      })
    }

    return {
      success: true,
      data: updatedMembership[0],
      message: 'Member role updated successfully'
    }
  } catch (error) {
    console.error('Error updating member role:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update member role'
    })
  }
})
