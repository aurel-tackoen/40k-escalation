/**
 * PUT /api/leagues?id=<leagueId>
 * Updates an existing league and its phases
 */
import { db } from '../../db'
import { leagues, phases } from '../../db/schema'
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
    if (body.currentPhase !== undefined) updateData.currentPhase = body.currentPhase

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

    // Handle phases updates if provided
    if (body.phases && Array.isArray(body.phases)) {
      // Get existing phases for this league
      const existingPhases = await db.select()
        .from(phases)
        .where(eq(phases.leagueId, leagueId))

      const existingPhaseIds = new Set(existingPhases.map(p => p.id))
      const updatedPhaseIds = new Set(
        body.phases
          .filter((p: { id?: number }) => p.id)
          .map((p: { id: number }) => p.id)
      )

      // Delete phases that are no longer in the update
      const phasesToDelete = existingPhases.filter(p => !updatedPhaseIds.has(p.id))
      for (const phase of phasesToDelete) {
        await db.delete(phases).where(eq(phases.id, phase.id))
      }

      // Update or insert phases
      for (const phase of body.phases) {
        const phaseData = {
          leagueId,
          number: phase.number,
          name: phase.name,
          pointLimit: phase.pointLimit,
          startDate: phase.startDate,
          endDate: phase.endDate
        }

        if (phase.id && existingPhaseIds.has(phase.id)) {
          // Update existing phase
          await db.update(phases)
            .set(phaseData)
            .where(eq(phases.id, phase.id))
        } else {
          // Insert new phase
          await db.insert(phases).values(phaseData)
        }
      }
    }

    // Fetch updated league with phases
    const updatedLeague = updated[0]
    const leaguePhases = await db.select()
      .from(phases)
      .where(eq(phases.leagueId, leagueId))
      .orderBy(phases.number)

    return {
      success: true,
      data: {
        ...updatedLeague,
        phases: leaguePhases
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
