import { defineEventHandler, getRouterParam, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues } from '../../../../db/schema'
import { isValidShareToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

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

    // Find league by share token (no auth required for info)
    // TypeScript: token is guaranteed to be valid string here due to validation above
    const league = await db.select({
      id: leagues.id,
      name: leagues.name,
      description: leagues.description,
      format: leagues.format,
      gameSystemId: leagues.gameSystemId,
      currentPhase: leagues.currentPhase,
      startDate: leagues.startDate,
      isPrivate: leagues.isPrivate,
      maxPlayers: leagues.maxPlayers
    })
      .from(leagues)
      .where(eq(leagues.shareToken, token!))
      .limit(1)

    if (!league[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    return {
      success: true,
      data: league[0],
      message: 'League information retrieved successfully'
    }
  } catch (error) {
    console.error('Error fetching league info by token:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch league information'
    })
  }
})
