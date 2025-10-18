import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, and } from 'drizzle-orm'
import { leagueMemberships } from '../../../../../../db/schema'
import { requireLeagueRole } from '../../../../../utils/auth'

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

    // ✅ Require owner role - returns user and membership
    const { user } = await requireLeagueRole(event, leagueId, ['owner'])

    const { newRole } = body

    if (!newRole) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New role is required'
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

    // Prevent owner from demoting themselves
    if (user.id === targetUserId_int && newRole !== 'owner') {
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
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update member role'
    })
  }
})
