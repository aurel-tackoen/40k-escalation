import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues, stages } from '../../../db/schema'
import { requireLeagueRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    const leagueId = parseInt(id)
    const body = await readBody(event)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID'
      })
    }

    // ✅ Require owner or organizer role
    await requireLeagueRole(event, leagueId, ['owner', 'organizer'])

    const { name, description, rules, gameSystemId, startDate, endDate, currentStage, isPrivate, shareToken, maxPlayers, status, stages: leagueStages } = body

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (rules !== undefined) updateData.rules = rules
    if (gameSystemId !== undefined) updateData.gameSystemId = gameSystemId
    if (startDate !== undefined) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate
    if (currentStage !== undefined) updateData.currentStage = currentStage
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate
    if (shareToken !== undefined) updateData.shareToken = shareToken
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0 && !leagueStages) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }

    // Update league if there are league-level changes
    let updatedLeague
    if (Object.keys(updateData).length > 0) {
      const result = await db
        .update(leagues)
        .set(updateData)
        .where(eq(leagues.id, leagueId))
        .returning()
      updatedLeague = result[0]
    } else {
      // Fetch current league data if only rounds are being updated
      const result = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, leagueId))
        .limit(1)
      updatedLeague = result[0]
    }

    // Handle stages update if provided
    if (leagueStages && Array.isArray(leagueStages)) {
      // Delete existing stages
      await db.delete(stages).where(eq(stages.leagueId, leagueId))

      // Insert new stages
      if (leagueStages.length > 0) {
        const stagesToInsert = leagueStages.map((stage: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
          leagueId,
          number: stage.number,
          name: stage.name,
          pointLimit: stage.pointLimit,
          startDate: stage.startDate,
          endDate: stage.endDate
        }))

        await db.insert(stages).values(stagesToInsert)
      }
    }

    // Fetch updated stages to return complete data
    const updatedStages = await db
      .select()
      .from(stages)
      .where(eq(stages.leagueId, leagueId))
      .orderBy(stages.number)

    return {
      success: true,
      data: {
        ...updatedLeague,
        stages: updatedStages
      },
      message: 'League updated successfully'
    }
  } catch (error) {
    console.error('Error updating league:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update league'
    })
  }
})
