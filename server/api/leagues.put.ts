/**
 * PUT /api/leagues?id=<leagueId>
 * Updates an existing league
 */
import { db } from '../../db'
import { leagues } from '../../db/schema'
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
    const updateData: any = {}

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

    return {
      success: true,
      data: updated[0]
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
