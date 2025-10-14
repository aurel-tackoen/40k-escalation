import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues, leagueMemberships } from '../../../db/schema'

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

    const { userId, name, description, startDate, endDate, currentRound, isPublic, maxPlayers, status } = body

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User ID required'
      })
    }

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Check if user is owner or organizer
    const membershipResult = await db
      .select()
      .from(leagueMemberships)
      .where(eq(leagueMemberships.leagueId, leagueId))
      .where(eq(leagueMemberships.userId, userId))
      .limit(1)

    if (!membershipResult.length) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not a member of this league'
      })
    }

    const membership = membershipResult[0]
    if (membership.role !== 'owner' && membership.role !== 'organizer') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only league owner or organizer can update league settings'
      })
    }

    // Build update object with only provided fields
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate
    if (currentRound !== undefined) updateData.currentRound = currentRound
    if (isPublic !== undefined) updateData.isPublic = isPublic
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
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update league'
    })
  }
})
