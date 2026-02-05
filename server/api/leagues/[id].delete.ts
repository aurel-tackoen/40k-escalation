import { defineEventHandler, getRouterParams, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues, phases, matches } from '../../../db/schema'
import { requireLeagueRole } from '../../utils/auth'

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

    // Require owner role only
    await requireLeagueRole(event, leagueId, ['owner'])

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Manual cascade delete for tables without CASCADE constraint
    // Delete phases (no CASCADE on phases.leagueId)
    await db
      .delete(phases)
      .where(eq(phases.leagueId, leagueId))

    // Delete matches (no CASCADE on matches.leagueId)
    await db
      .delete(matches)
      .where(eq(matches.leagueId, leagueId))

    // Delete league (CASCADE will handle players, armies, memberships)
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
