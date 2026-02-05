import { defineEventHandler, getRouterParams, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues, phases, leagueMemberships } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    const leagueId = parseInt(id)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID'
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

    // Fetch league
    const leagueResult = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, leagueId))
      .limit(1)

    if (!leagueResult.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    const league = leagueResult[0]

    // Fetch phases for this league
    const leaguePhases = await db
      .select()
      .from(phases)
      .where(eq(phases.leagueId, leagueId))
      .orderBy(phases.number)

    // Count members
    const membersResult = await db
      .select()
      .from(leagueMemberships)
      .where(eq(leagueMemberships.leagueId, leagueId))

    const memberCount = membersResult.length

    return {
      success: true,
      data: {
        ...league,
        phases: leaguePhases,
        memberCount
      }
    }
  } catch (error) {
    console.error('Error fetching league:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch league'
    })
  }
})
