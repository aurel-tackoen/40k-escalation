import { defineEventHandler } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { leagues } from '../../../db/schema'
import { isNotNull } from 'drizzle-orm'

export default defineEventHandler(async (_event) => {
  try {
    // Initialize database connection
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      return {
        success: false,
        message: 'Database configuration error'
      }
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Get all leagues with invite codes
    const leaguesWithCodes = await db.select({
      id: leagues.id,
      name: leagues.name,
      inviteCode: leagues.inviteCode,
      isPrivate: leagues.isPrivate,
      status: leagues.status
    })
      .from(leagues)
      .where(isNotNull(leagues.inviteCode))

    return {
      success: true,
      data: leaguesWithCodes,
      count: leaguesWithCodes.length,
      message: 'Leagues with invite codes'
    }
  } catch (error) {
    console.error('Error fetching invite codes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to fetch invite codes',
      error: errorMessage
    }
  }
})
