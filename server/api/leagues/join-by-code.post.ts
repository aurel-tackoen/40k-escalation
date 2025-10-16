import { defineEventHandler, createError, readBody } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, and, count } from 'drizzle-orm'
import { leagues, leagueMemberships, players } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const { inviteCode } = await readBody(event)

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

  if (!inviteCode || inviteCode.length !== 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid invite code format'
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

    // Find league by invite code
    const league = await db.select()
      .from(leagues)
      .where(and(
        eq(leagues.inviteCode, inviteCode.toUpperCase()),
        eq(leagues.isPrivate, true)
      ))
      .limit(1)

    if (!league[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid invite code'
      })
    }

    // Check if user is already an active member
    const existingMember = await db.select()
      .from(leagueMemberships)
      .where(and(
        eq(leagueMemberships.leagueId, league[0].id),
        eq(leagueMemberships.userId, userId),
        eq(leagueMemberships.status, 'active')
      ))
      .limit(1)

    if (existingMember[0]) {
      // User already member, just return league info
      return {
        success: true,
        data: league[0],
        message: 'You are already a member of this league'
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

    // Add user to league as player
    await db.insert(leagueMemberships).values({
      leagueId: league[0].id,
      userId: userId,
      role: 'player',
      joinedAt: new Date(),
      status: 'active'
    })

    // Create a player record for this user in this league
    await db.insert(players).values({
      leagueId: league[0].id,
      userId: userId,
      name: sessionData.name || sessionData.email?.split('@')[0] || 'Player',
      wins: 0,
      losses: 0,
      draws: 0,
      totalPoints: 0
    })

    return {
      success: true,
      data: league[0],
      message: 'Successfully joined the league!'
    }
  } catch (error) {
    console.error('Error joining league by invite code:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to join league'
    })
  }
})
