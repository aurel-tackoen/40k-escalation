/**
 * GET /api/matches?leagueId=123
 * Fetches matches for a specific league
 * Requires league membership
 */
import { db } from '../../db'
import { matches } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueMembership } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = query.leagueId ? parseInt(query.leagueId as string) : null

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // ✅ Require league membership to view matches
    await requireLeagueMembership(event, leagueId)

    // Get matches for specific league
    const allMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.leagueId, leagueId))

    return {
      success: true,
      data: allMatches,
      count: allMatches.length
    }
  } catch (error) {
    console.error('Error fetching matches:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch matches'
    })
  }
})
