/**
 * PUT /api/leagues?id=<leagueId>
 * Updates an existing league and its rounds
 */
import { db } from '../../db'
import { leagues, rounds } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const leagueId = parseInt(query.id as string)
    const body = await readBody(event)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid league ID is required'
      })
    }

    // Prepare update data
    const updateData: Record<string, string | number | null | undefined> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.currentRound !== undefined) updateData.currentRound = body.currentRound

    // Update league
    const updated = await db.update(leagues)
      .set(updateData)
      .where(eq(leagues.id, leagueId))
      .returning()

    if (updated.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    // Handle rounds updates if provided
    if (body.rounds && Array.isArray(body.rounds)) {
      // Get existing rounds for this league
      const existingRounds = await db.select()
        .from(rounds)
        .where(eq(rounds.leagueId, leagueId))

      const existingRoundIds = new Set(existingRounds.map(r => r.id))
      const updatedRoundIds = new Set(
        body.rounds
          .filter((r: { id?: number }) => r.id)
          .map((r: { id: number }) => r.id)
      )

      // Delete rounds that are no longer in the update
      const roundsToDelete = existingRounds.filter(r => !updatedRoundIds.has(r.id))
      for (const round of roundsToDelete) {
        await db.delete(rounds).where(eq(rounds.id, round.id))
      }

      // Update or insert rounds
      for (const round of body.rounds) {
        const roundData = {
          leagueId,
          number: round.number,
          name: round.name,
          pointLimit: round.pointLimit,
          startDate: round.startDate,
          endDate: round.endDate
        }

        if (round.id && existingRoundIds.has(round.id)) {
          // Update existing round
          await db.update(rounds)
            .set(roundData)
            .where(eq(rounds.id, round.id))
        } else {
          // Insert new round
          await db.insert(rounds).values(roundData)
        }
      }
    }

    // Fetch updated league with rounds
    const updatedLeague = updated[0]
    const leagueRounds = await db.select()
      .from(rounds)
      .where(eq(rounds.leagueId, leagueId))
      .orderBy(rounds.number)

    return {
      success: true,
      data: {
        ...updatedLeague,
        rounds: leagueRounds
      }
    }
  } catch (error) {
    console.error('Error updating league:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update league',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
