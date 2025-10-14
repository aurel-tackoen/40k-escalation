/**
 * POST /api/players
 * Creates a new player in a specific league
 * Also updates the league membership with the player ID
 */
import { db } from '../../db'
import { players, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Basic validation - userId is now required for Auth0 integration
    if (!body.name || !body.leagueId || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, leagueId, and userId are required'
      })
    }

    // Insert player with stats
    const newPlayer = await db.insert(players).values({
      leagueId: body.leagueId,
      userId: body.userId,
      name: body.name,
      faction: body.faction || null,
      wins: body.wins || 0,
      losses: body.losses || 0,
      draws: body.draws || 0,
      totalPoints: body.totalPoints || 0
    }).returning()

    // Update the league membership with the player ID
    const [membership] = await db
      .select()
      .from(leagueMemberships)
      .where(
        and(
          eq(leagueMemberships.leagueId, body.leagueId),
          eq(leagueMemberships.userId, body.userId)
        )
      )
      .limit(1)

    if (membership) {
      await db
        .update(leagueMemberships)
        .set({ playerId: newPlayer[0].id })
        .where(eq(leagueMemberships.id, membership.id))
    }

    return {
      success: true,
      data: newPlayer[0]
    }
  } catch (error) {
    console.error('Error creating player:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create player',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
