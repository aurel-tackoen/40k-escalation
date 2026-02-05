/**
 * POST /api/leagues
 * Creates a new league with phases
 */
import { db } from '../../db'
import { leagues, phases } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.startDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and start date are required'
      })
    }

    // Insert league
    const [newLeague] = await db.insert(leagues).values({
      name: body.name,
      description: body.description || null,
      startDate: body.startDate,
      endDate: body.endDate || null,
      currentPhase: body.currentPhase || 1
    }).returning()

    // Insert phases if provided
    if (body.phases && Array.isArray(body.phases)) {
      const phasesToInsert = body.phases.map((phase: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
        leagueId: newLeague.id,
        number: phase.number,
        name: phase.name,
        pointLimit: phase.pointLimit,
        startDate: phase.startDate,
        endDate: phase.endDate
      }))

      await db.insert(phases).values(phasesToInsert)
    }

    return {
      success: true,
      data: newLeague
    }
  } catch (error) {
    console.error('Error creating league:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create league'
    })
  }
})
