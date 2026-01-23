/**
 * POST /api/leagues
 * Creates a new league with stages
 */
import { db } from '../../db'
import { leagues, stages } from '../../db/schema'

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
      currentStage: body.currentStage || 1
    }).returning()

    // Insert stages if provided (accepting "rounds" for backward compatibility)
    if (body.rounds && Array.isArray(body.rounds)) {
      const stagesToInsert = body.rounds.map((round: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
        leagueId: newLeague.id,
        number: round.number,
        name: round.name,
        pointLimit: round.pointLimit,
        startDate: round.startDate,
        endDate: round.endDate
      }))

      await db.insert(stages).values(stagesToInsert)
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
