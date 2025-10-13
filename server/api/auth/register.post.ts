import { db } from '../../../db'
import { players } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

/**
 * POST /api/auth/register
 * Create player profile for authenticated Netlify Identity user
 */
export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await requireAuth(event)

    // Check if player already exists
    const existingPlayers = await db
      .select()
      .from(players)
      .where(eq(players.netlifyId, user.netlifyId))

    if (existingPlayers.length > 0) {
      return {
        success: true,
        data: existingPlayers[0],
        message: 'Player already exists'
      }
    }

    // Get registration data from request body
    const body = await readBody(event)
    const { name, faction } = body

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Player name is required'
      })
    }

    // Create new player
    const newPlayer = await db
      .insert(players)
      .values({
        netlifyId: user.netlifyId,
        name,
        email: user.email,
        faction: faction || null,
        role: user.role || 'player',
        wins: 0,
        losses: 0,
        draws: 0,
        totalPoints: 0,
        lastLogin: new Date()
      })
      .returning()

    return {
      success: true,
      data: newPlayer[0],
      message: 'Player profile created successfully'
    }
  } catch (error) {
    console.error('Error in /api/auth/register:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to create player profile'
    })
  }
})
