/**
 * GET /api/admin/matches
 * Fetches match statistics for admin dashboard
 * Requires admin role
 */
import { db } from '../../../db'
import { matches } from '../../../db/schema'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  try {
    // Get total match count
    const totalMatches = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matches)

    // Get matches by match type
    const byMatchType = await db
      .select({
        matchType: matches.matchType,
        count: sql<number>`count(*)::int`
      })
      .from(matches)
      .groupBy(matches.matchType)

    // Get matches by game system (if gameSystemId is set)
    const byGameSystem = await db
      .select({
        gameSystemId: matches.gameSystemId,
        count: sql<number>`count(*)::int`
      })
      .from(matches)
      .where(sql`${matches.gameSystemId} IS NOT NULL`)
      .groupBy(matches.gameSystemId)

    // Get recent matches count (last 30 days)
    const recentMatches = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matches)
      .where(sql`${matches.datePlayed} >= CURRENT_DATE - INTERVAL '30 days'`)

    return {
      success: true,
      data: {
        total: totalMatches[0]?.count || 0,
        recent30Days: recentMatches[0]?.count || 0,
        byMatchType: byMatchType.map(row => ({
          matchType: row.matchType,
          count: row.count
        })),
        byGameSystem: byGameSystem.map(row => ({
          gameSystemId: row.gameSystemId,
          count: row.count
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching match stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch match statistics'
    })
  }
})
