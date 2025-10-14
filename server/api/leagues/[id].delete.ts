import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues, leagueMemberships } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    const leagueId = parseInt(id)
    const body = await readBody(event)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID'
      })
    }

    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User ID required'
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

    // Check if user is owner
    const membershipResult = await db
      .select()
      .from(leagueMemberships)
      .where(eq(leagueMemberships.leagueId, leagueId))
      .where(eq(leagueMemberships.userId, userId))
      .limit(1)

    if (!membershipResult.length) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not a member of this league'
      })
    }

    const membership = membershipResult[0]
    if (membership.role !== 'owner') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only league owner can delete the league'
      })
    }

    // Delete league (CASCADE will handle players, armies, matches, rounds, memberships)
    await db
      .delete(leagues)
      .where(eq(leagues.id, leagueId))

    return {
      success: true,
      message: 'League deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting league:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete league'
    })
  }
})
