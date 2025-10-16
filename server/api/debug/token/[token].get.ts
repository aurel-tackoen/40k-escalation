import { defineEventHandler, getRouterParam, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token required'
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
      .where(eq(leagues.shareToken, token))
      .limit(1)

    return {
      success: true,
      data: {
        token,
        tokenLength: token.length,
        league: league[0] || null,
        found: !!league[0]
      }
    }
  } catch (error) {
    console.error('Debug token error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to debug token'
    })
  }
})
