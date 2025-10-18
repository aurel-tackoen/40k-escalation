import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues } from '../../../db/schema'
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

    const { name, description, rules, gameSystemId, startDate, endDate, currentRound, isPrivate, shareToken, allowDirectJoin, maxPlayers, status } = body

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
    if (currentRound !== undefined) updateData.currentRound = currentRound
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate
    if (shareToken !== undefined) updateData.shareToken = shareToken
    if (allowDirectJoin !== undefined) updateData.allowDirectJoin = allowDirectJoin
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }

    // Update league
    const updatedLeague = await db
      .update(leagues)
      .set(updateData)
      .where(eq(leagues.id, leagueId))
      .returning()

    return {
      success: true,
      data: updatedLeague[0],
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
