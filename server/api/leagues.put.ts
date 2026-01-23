/**
 * PUT /api/leagues?id=<leagueId>
 * Updates an existing league and its stages
 */
import { db } from '../../db'
import { leagues, stages } from '../../db/schema'
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
    if (body.currentStage !== undefined) updateData.currentStage = body.currentStage

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

    // Handle stages updates if provided (accepting "rounds" for backward compatibility)
    if (body.rounds && Array.isArray(body.rounds)) {
      // Get existing stages for this league
      const existingStages = await db.select()
        .from(stages)
        .where(eq(stages.leagueId, leagueId))

      const existingStageIds = new Set(existingStages.map(r => r.id))
      const updatedStageIds = new Set(
        body.rounds
          .filter((r: { id?: number }) => r.id)
          .map((r: { id: number }) => r.id)
      )

      // Delete stages that are no longer in the update
      const stagesToDelete = existingStages.filter(r => !updatedStageIds.has(r.id))
      for (const stage of stagesToDelete) {
        await db.delete(stages).where(eq(stages.id, stage.id))
      }

      // Update or insert stages
      for (const round of body.rounds) {
        const stageData = {
          leagueId,
          number: round.number,
          name: round.name,
          pointLimit: round.pointLimit,
          startDate: round.startDate,
          endDate: round.endDate
        }

        if (round.id && existingStageIds.has(round.id)) {
          // Update existing stage
          await db.update(stages)
            .set(stageData)
            .where(eq(stages.id, round.id))
        } else {
          // Insert new stage
          await db.insert(stages).values(stageData)
        }
      }
    }

    // Fetch updated league with stages
    const updatedLeague = updated[0]
    const leagueStages = await db.select()
      .from(stages)
      .where(eq(stages.leagueId, leagueId))
      .orderBy(stages.number)

    return {
      success: true,
      data: {
        ...updatedLeague,
        stages: leagueStages
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
