/**
 * POST /api/players
 * Creates a new player in the database
 */
import { db } from '../../db'
import { players } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Basic validation
    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      })
    }

    // Insert player with stats
    const newPlayer = await db.insert(players).values({
      name: body.name,
      email: body.email,
      faction: body.faction || null,
      wins: body.wins || 0,
      losses: body.losses || 0,
      draws: body.draws || 0,
      totalPoints: body.totalPoints || 0
    }).returning()

    return {
      success: true,
      data: newPlayer[0]
    }
  } catch (error) {
    console.error('Error creating player:', error)

    // Check for duplicate email
    if (error instanceof Error && error.message.includes('unique')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Player with this email already exists'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create player',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
