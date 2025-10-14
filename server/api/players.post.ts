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

    // Basic validation
    if (!body.name || !body.email || !body.leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and leagueId are required'
      })
    }

    // Insert player with stats
    const newPlayer = await db.insert(players).values({
      leagueId: body.leagueId,
      userId: body.userId || null,
      name: body.name,
      email: body.email,
      faction: body.faction || null,
      wins: body.wins || 0,
      losses: body.losses || 0,
      draws: body.draws || 0,
      totalPoints: body.totalPoints || 0
    }).returning()

    // If userId is provided, update the league membership with the player ID
    if (body.userId) {
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
