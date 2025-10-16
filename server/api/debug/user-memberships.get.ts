import { defineEventHandler, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagueMemberships, leagues } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const cookies = parseCookies(event)
    const sessionCookie = cookies.auth_session

    if (!sessionCookie) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
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

    const userId = sessionData.userId
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No user ID in session'
      })
    }

    // Initialize database connection
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Get all user memberships with league details
    const memberships = await db
      .select({
        membershipId: leagueMemberships.id,
        leagueId: leagueMemberships.leagueId,
        role: leagueMemberships.role,
        status: leagueMemberships.status,
        joinedAt: leagueMemberships.joinedAt,
        leagueName: leagues.name,
        shareToken: leagues.shareToken,
        inviteCode: leagues.inviteCode
      })
      .from(leagueMemberships)
      .leftJoin(leagues, eq(leagueMemberships.leagueId, leagues.id))
      .where(eq(leagueMemberships.userId, userId))

    return {
      success: true,
      data: {
        userId,
        sessionEmail: sessionData.email,
        sessionName: sessionData.name,
        memberships
      }
    }
  } catch (error) {
    console.error('Debug user memberships error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user memberships'
    })
  }
})
