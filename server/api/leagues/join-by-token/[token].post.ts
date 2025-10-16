import { defineEventHandler, getRouterParam, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, and, count } from 'drizzle-orm'
import { leagues, leagueMemberships, players } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  // TODO: Add authentication when Auth0 is implemented
  // const user = await requireAuth(event)
  // For now, use a mock user ID for testing
  const mockUserId = 1

  if (!token || token.length !== 32) {
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

    // Find league by share token
    const league = await db.select()
      .from(leagues)
      .where(and(
        eq(leagues.shareToken, token),
        eq(leagues.allowDirectJoin, true)
      ))
      .limit(1)

    if (!league[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found or joining disabled'
      })
    }

    // Check if user is already a member
    const existingMember = await db.select()
      .from(leagueMemberships)
      .where(and(
        eq(leagueMemberships.leagueId, league[0].id),
        eq(leagueMemberships.userId, mockUserId)
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
      userId: mockUserId,
      role: 'player',
      joinedAt: new Date(),
      status: 'active'
    })

    // Create a player record for this user in this league
    // TODO: Get user name when auth is implemented
    await db.insert(players).values({
      leagueId: league[0].id,
      userId: mockUserId,
      name: 'Test Player', // TODO: Use real user name
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
