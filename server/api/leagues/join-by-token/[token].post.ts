import { defineEventHandler, getRouterParam, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, and, count } from 'drizzle-orm'
import { leagues, leagueMemberships } from '../../../../db/schema'
import { isValidShareToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  // Check authentication
  const cookies = parseCookies(event)
  const sessionCookie = cookies.auth_session

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required to join league'
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

  // Check if session is expired
  if (sessionData.expires_at && Date.now() > sessionData.expires_at) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired'
    })
  }

  // Get user ID from session (set during Auth0 callback)
  const userId = sessionData.userId
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid user session - no user ID'
    })
  }

  if (!isValidShareToken(token)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid share token'
    })
  }

  try {
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

    // Find league by share token (for private leagues, share token is required)
    // TypeScript: token is guaranteed to be valid string here due to validation above
    const league = await db.select()
      .from(leagues)
      .where(eq(leagues.shareToken, token!))
      .limit(1)

    if (!league[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    // Check if user has ANY membership (active or inactive)
    const existingMember = await db.select()
      .from(leagueMemberships)
      .where(and(
        eq(leagueMemberships.leagueId, league[0].id),
        eq(leagueMemberships.userId, userId)
      ))
      .limit(1)

    console.log('Debug join-by-token:', {
      token,
      userId,
      leagueId: league[0].id,
      leagueName: league[0].name,
      existingMemberCount: existingMember.length,
      existingMember: existingMember[0] ? {
        id: existingMember[0].id,
        status: existingMember[0].status,
        role: existingMember[0].role
      } : null
    })

    if (existingMember[0]) {
      // If membership is active, user is already a member
      if (existingMember[0].status === 'active') {
        return {
          success: true,
          data: league[0],
          message: 'You are already a member of this league'
        }
      }

      // If membership is inactive, REACTIVATE it
      if (existingMember[0].status === 'inactive') {
        await db.update(leagueMemberships)
          .set({
            status: 'active',
            leftAt: null
          })
          .where(eq(leagueMemberships.id, existingMember[0].id))

        return {
          success: true,
          data: league[0],
          message: 'Successfully rejoined the league!',
          reactivated: true,
          existingPlayerId: existingMember[0].playerId // Return existing player ID if any
        }
      }
    }

    // Check if league has reached max players
    if (league[0].maxPlayers) {
      const currentMemberCount = await db.select({ count: count() })
        .from(leagueMemberships)
        .where(eq(leagueMemberships.leagueId, league[0].id))

      if (currentMemberCount[0].count >= league[0].maxPlayers) {
        throw createError({
          statusCode: 403,
          statusMessage: 'League is full'
        })
      }
    }

    // Add user to league as member (player will be created separately via modal)
    await db.insert(leagueMemberships).values({
      leagueId: league[0].id,
      userId: userId,
      role: 'player',
      joinedAt: new Date(),
      status: 'active'
    })

    return {
      success: true,
      data: league[0],
      message: 'Successfully joined the league!'
    }
  } catch (error) {
    console.error('Error joining league by token:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to join league'
    })
  }
})
