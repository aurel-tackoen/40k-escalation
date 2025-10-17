import { db } from '../../../../db'
import { leagueMemberships } from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * PUT /api/users/me/army-name
 * Update user's army name for a specific league
 *
 * Body:
 * {
 *   userId: number
 *   leagueId: number
 *   armyName: string
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.userId || !body.leagueId || !body.armyName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, leagueId, armyName'
      })
    }

    // Update army name in league membership
    const [updated] = await db
      .update(leagueMemberships)
      .set({
        armyName: body.armyName.trim()
      })
      .where(
        and(
          eq(leagueMemberships.leagueId, body.leagueId),
          eq(leagueMemberships.userId, body.userId)
        )
      )
      .returning()

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League membership not found'
      })
    }

    return {
      success: true,
      message: 'Army name updated successfully',
      data: updated
    }
  } catch (error) {
    console.error('Error updating army name:', error)
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update army name'
    })
  }
})
