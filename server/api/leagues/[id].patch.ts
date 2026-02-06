import { defineEventHandler, getRouterParams, readBody, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq, sql } from 'drizzle-orm'
import { leagues, phases, matches } from '../../../db/schema'
import { requireLeagueRole } from '../../utils/auth'
import { getFormatConfig } from '../../../app/data/format-registry'

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

    // Require owner or organizer role
    await requireLeagueRole(event, leagueId, ['owner', 'organizer'])

    const { name, description, rules, gameSystemId, startDate, endDate, currentPhase, isPrivate, shareToken, maxPlayers, status, format, phases: leaguePhases } = body

    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const neonSql = neon(databaseUrl)
    const db = drizzle(neonSql)

    // Format validation and immutability check
    if (format !== undefined) {
      // Validate format key exists in registry
      if (!getFormatConfig(format)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid league format'
        })
      }

      // Check if matches exist -- format locks after first match
      const matchCount = await db
        .select({ count: sql`count(*)::int` })
        .from(matches)
        .where(eq(matches.leagueId, leagueId))

      if (matchCount[0].count > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Format cannot be changed after matches have been recorded'
        })
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (rules !== undefined) updateData.rules = rules
    if (gameSystemId !== undefined) updateData.gameSystemId = gameSystemId
    if (startDate !== undefined) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate
    if (currentPhase !== undefined) updateData.currentPhase = currentPhase
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate
    if (shareToken !== undefined) updateData.shareToken = shareToken
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (status !== undefined) updateData.status = status
    if (format !== undefined) updateData.format = format

    if (Object.keys(updateData).length === 0 && !leaguePhases) {
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
      // Fetch current league data if only phases are being updated
      const result = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, leagueId))
        .limit(1)
      updatedLeague = result[0]
    }

    // Handle phases update if provided
    if (leaguePhases && Array.isArray(leaguePhases)) {
      // Delete existing phases
      await db.delete(phases).where(eq(phases.leagueId, leagueId))

      // Insert new phases
      if (leaguePhases.length > 0) {
        const phasesToInsert = leaguePhases.map((phase: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
          leagueId,
          number: phase.number,
          name: phase.name,
          pointLimit: phase.pointLimit,
          startDate: phase.startDate,
          endDate: phase.endDate
        }))

        await db.insert(phases).values(phasesToInsert)
      }
    }

    // Fetch updated phases to return complete data
    const updatedPhases = await db
      .select()
      .from(phases)
      .where(eq(phases.leagueId, leagueId))
      .orderBy(phases.number)

    return {
      success: true,
      data: {
        ...updatedLeague,
        phases: updatedPhases
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
