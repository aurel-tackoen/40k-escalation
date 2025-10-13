/**
 * POST /api/matches
 * Creates a new match and updates player stats (requires authentication)
 * Organizers and admins can record any match, players can only record their own matches
 */
import { db } from '../../db'
import { matches, players } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth, isOrganizer, ownsResource } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    await requireAuth(event)

    const body = await readBody(event)    // Validate required fields
    if (!body.player1Id || !body.player2Id || body.round === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Player IDs and round are required'
      })
    }

    // Check authorization
    // Organizers and admins can record any match
    // Regular players can only record matches they're involved in
    const isOrganizerOrAdmin = await isOrganizer(event)
    const isPlayer1 = await ownsResource(event, body.player1Id)
    const isPlayer2 = await ownsResource(event, body.player2Id)

    if (!isOrganizerOrAdmin && !isPlayer1 && !isPlayer2) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only record matches you are involved in'
      })
    }

    // Insert match
    const [newMatch] = await db.insert(matches).values({
      leagueId: body.leagueId || null,
      round: body.round,
      player1Id: body.player1Id,
      player2Id: body.player2Id,
      player1Points: body.player1Points || 0,
      player2Points: body.player2Points || 0,
      winnerId: body.winnerId || null,
      mission: body.mission || null,
      datePlayed: body.datePlayed || null,
      notes: body.notes || null
    }).returning()

    // Update player stats
    const [player1] = await db.select().from(players).where(eq(players.id, body.player1Id))
    const [player2] = await db.select().from(players).where(eq(players.id, body.player2Id))

    if (player1) {
      const updates: Record<string, number> = {
        totalPoints: player1.totalPoints + (body.player1Points || 0)
      }

      if (body.winnerId === body.player1Id) {
        updates.wins = player1.wins + 1
      } else if (body.winnerId === body.player2Id) {
        updates.losses = player1.losses + 1
      } else if (body.winnerId === null) {
        updates.draws = player1.draws + 1
      }

      await db.update(players).set(updates).where(eq(players.id, body.player1Id))
    }

    if (player2) {
      const updates: Record<string, number> = {
        totalPoints: player2.totalPoints + (body.player2Points || 0)
      }

      if (body.winnerId === body.player2Id) {
        updates.wins = player2.wins + 1
      } else if (body.winnerId === body.player1Id) {
        updates.losses = player2.losses + 1
      } else if (body.winnerId === null) {
        updates.draws = player2.draws + 1
      }

      await db.update(players).set(updates).where(eq(players.id, body.player2Id))
    }

    return {
      success: true,
      data: newMatch
    }
  } catch (error) {
    console.error('Error creating match:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create match'
    })
  }
})
