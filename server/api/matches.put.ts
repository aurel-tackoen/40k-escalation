/**
 * PUT /api/matches
 * Updates an existing match
 * Requires: user to be league organizer/owner OR a participant in the match
 */
import { db } from '../../db'
import { matches, players } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueMembership } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const matchId = body.id

    if (!matchId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match ID is required'
      })
    }

    // Fetch the existing match
    const [existingMatch] = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1)

    if (!existingMatch) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Match not found'
      })
    }

    if (!existingMatch.leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Match is not associated with a league'
      })
    }

    // ✅ Get authenticated user and check league membership
    const { user, membership } = await requireLeagueMembership(event, existingMatch.leagueId)

    // Check if user can edit: organizer/owner OR participant in the match
    const isOrganizer = membership.role === 'owner' || membership.role === 'organizer'

    // Get player IDs for this user
    const [player1] = await db.select()
      .from(players)
      .where(eq(players.id, existingMatch.player1Id))
      .limit(1)

    const [player2] = await db.select()
      .from(players)
      .where(eq(players.id, existingMatch.player2Id))
      .limit(1)

    const isParticipant = (player1?.userId === user.id) || (player2?.userId === user.id)

    if (!isOrganizer && !isParticipant) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only edit matches you participated in'
      })
    }

    // Validate required fields based on match type
    const matchType = body.matchType || existingMatch.matchType || 'victory_points'

    if (matchType === 'percentage') {
      if (!body.player1ArmyValue || !body.player2ArmyValue) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Army values required for percentage-based matches'
        })
      }
    }

    if (matchType === 'scenario') {
      if (!body.scenarioObjective) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Scenario objective required for scenario-based matches'
        })
      }
    }

    // Get the new winner ID (use body if provided, otherwise recalculate from points)
    const newWinnerId = body.winnerId !== undefined ? body.winnerId : (
      body.player1Points !== undefined && body.player2Points !== undefined
        ? (body.player1Points > body.player2Points ? existingMatch.player1Id
          : body.player2Points > body.player1Points ? existingMatch.player2Id
            : null)
        : existingMatch.winnerId
    )

    const newPlayer1Points = body.player1Points !== undefined ? body.player1Points : existingMatch.player1Points
    const newPlayer2Points = body.player2Points !== undefined ? body.player2Points : existingMatch.player2Points

    // Step 1: Reverse old stats
    if (player1) {
      const reverseUpdates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: player1.totalPoints - (existingMatch.player1Points || 0)
      }

      if (existingMatch.winnerId === existingMatch.player1Id) {
        reverseUpdates.wins = Math.max(0, player1.wins - 1)
      } else if (existingMatch.winnerId === existingMatch.player2Id) {
        reverseUpdates.losses = Math.max(0, player1.losses - 1)
      } else if (existingMatch.winnerId === null) {
        reverseUpdates.draws = Math.max(0, player1.draws - 1)
      }

      await db.update(players).set(reverseUpdates).where(eq(players.id, existingMatch.player1Id))
    }

    if (player2) {
      const reverseUpdates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: player2.totalPoints - (existingMatch.player2Points || 0)
      }

      if (existingMatch.winnerId === existingMatch.player2Id) {
        reverseUpdates.wins = Math.max(0, player2.wins - 1)
      } else if (existingMatch.winnerId === existingMatch.player1Id) {
        reverseUpdates.losses = Math.max(0, player2.losses - 1)
      } else if (existingMatch.winnerId === null) {
        reverseUpdates.draws = Math.max(0, player2.draws - 1)
      }

      await db.update(players).set(reverseUpdates).where(eq(players.id, existingMatch.player2Id))
    }

    // Step 2: Update the match
    const [updatedMatch] = await db.update(matches)
      .set({
        // Match type and game system
        matchType: body.matchType || existingMatch.matchType,
        gameSystemId: body.gameSystemId || existingMatch.gameSystemId,

        // Victory Points (40k, AoS, HH)
        player1Points: newPlayer1Points,
        player2Points: newPlayer2Points,

        // Percentage/Casualties (ToW)
        player1ArmyValue: body.player1ArmyValue || existingMatch.player1ArmyValue,
        player2ArmyValue: body.player2ArmyValue || existingMatch.player2ArmyValue,
        player1CasualtiesValue: body.player1CasualtiesValue !== undefined ? body.player1CasualtiesValue : existingMatch.player1CasualtiesValue,
        player2CasualtiesValue: body.player2CasualtiesValue !== undefined ? body.player2CasualtiesValue : existingMatch.player2CasualtiesValue,
        marginOfVictory: body.marginOfVictory !== undefined ? body.marginOfVictory : existingMatch.marginOfVictory,

        // Scenario (MESBG)
        scenarioObjective: body.scenarioObjective || existingMatch.scenarioObjective,
        player1ObjectiveCompleted: body.player1ObjectiveCompleted !== undefined ? body.player1ObjectiveCompleted : existingMatch.player1ObjectiveCompleted,
        player2ObjectiveCompleted: body.player2ObjectiveCompleted !== undefined ? body.player2ObjectiveCompleted : existingMatch.player2ObjectiveCompleted,

        // Common fields
        winnerId: newWinnerId,
        mission: body.mission || existingMatch.mission,
        datePlayed: body.datePlayed || existingMatch.datePlayed,
        notes: body.notes !== undefined ? body.notes : existingMatch.notes,

        // Future extensibility
        additionalData: body.additionalData || existingMatch.additionalData
      })
      .where(eq(matches.id, matchId))
      .returning()

    // Step 3: Apply new stats (re-fetch players to get updated values)
    const [updatedPlayer1] = await db.select().from(players).where(eq(players.id, existingMatch.player1Id))
    const [updatedPlayer2] = await db.select().from(players).where(eq(players.id, existingMatch.player2Id))

    if (updatedPlayer1) {
      const applyUpdates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: updatedPlayer1.totalPoints + newPlayer1Points
      }

      if (newWinnerId === existingMatch.player1Id) {
        applyUpdates.wins = updatedPlayer1.wins + 1
      } else if (newWinnerId === existingMatch.player2Id) {
        applyUpdates.losses = updatedPlayer1.losses + 1
      } else if (newWinnerId === null) {
        applyUpdates.draws = updatedPlayer1.draws + 1
      }

      await db.update(players).set(applyUpdates).where(eq(players.id, existingMatch.player1Id))
    }

    if (updatedPlayer2) {
      const applyUpdates: {
        totalPoints: number;
        wins?: number;
        losses?: number;
        draws?: number;
      } = {
        totalPoints: updatedPlayer2.totalPoints + newPlayer2Points
      }

      if (newWinnerId === existingMatch.player2Id) {
        applyUpdates.wins = updatedPlayer2.wins + 1
      } else if (newWinnerId === existingMatch.player1Id) {
        applyUpdates.losses = updatedPlayer2.losses + 1
      } else if (newWinnerId === null) {
        applyUpdates.draws = updatedPlayer2.draws + 1
      }

      await db.update(players).set(applyUpdates).where(eq(players.id, existingMatch.player2Id))
    }

    return {
      success: true,
      data: updatedMatch,
      message: 'Match updated successfully'
    }
  } catch (error: unknown) {
    console.error('Error updating match:', error)

    // Re-throw if it's already a createError response
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update match',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
