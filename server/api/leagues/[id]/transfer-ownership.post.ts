/**
 * POST /api/leagues/:id/transfer-ownership
 * Transfer league ownership to another user
 */
import { db } from '../../../../db'
import { leagueMemberships, users } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(event.context.params?.id as string)
    const body = await readBody(event)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid league ID is required'
      })
    }

    if (!body.newOwnerUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New owner user ID is required'
      })
    }

    // Get session from cookie
    const cookies = parseCookies(event)
    const sessionCookie = cookies.auth_session

    if (!sessionCookie) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
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

    // Find current user in database
    const [currentUser] = await db.select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if current user is the league owner
    const [currentUserMembership] = await db.select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, currentUser.id)
        )
      )
      .limit(1)

    if (currentUserMembership?.role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only the league owner can transfer ownership'
      })
    }

    // Find the new owner's membership
    const [newOwnerMembership] = await db.select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, leagueId),
          eq(leagueMemberships.userId, body.newOwnerUserId)
        )
      )
      .limit(1)

    if (!newOwnerMembership) {
      throw createError({
        statusCode: 404,
        statusMessage: 'New owner not found in this league'
      })
    }

    if (newOwnerMembership.status !== 'active') {
      throw createError({
        statusCode: 400,
        statusMessage: 'New owner must be an active member of the league'
      })
    }

    // Perform the transfer: update both memberships
    // 1. Change current owner to member
    await db.update(leagueMemberships)
      .set({ role: 'member' })
      .where(eq(leagueMemberships.id, currentUserMembership.id))

    // 2. Change new owner to owner
    await db.update(leagueMemberships)
      .set({ role: 'owner' })
      .where(eq(leagueMemberships.id, newOwnerMembership.id))

    return {
      success: true,
      message: 'Ownership transferred successfully'
    }
  } catch (error) {
    console.error('Error transferring ownership:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to transfer ownership',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
