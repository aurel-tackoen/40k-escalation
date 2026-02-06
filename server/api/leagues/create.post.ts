import { db } from '../../../db'
import { leagues, leagueMemberships, phases } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { generateShareToken } from '../../utils/tokens'
import { getFormatConfig } from '../../../app/data/format-registry'

/**
 * POST /api/leagues/create
 * Create a new league with phases and auto-assign creator as owner
 *
 * Body:
 * {
 *   name: string
 *   description?: string
 *   gameSystemId: number (required - which game system this league uses)
 *   format: string (required - format key from format-registry, e.g., 'ow-ptg')
 *   startDate: string (ISO date)
 *   endDate?: string (ISO date)
 *   isPrivate: boolean
 *   maxPlayers?: number
 *   phases: Array<{
 *     number: number
 *     name: string
 *     pointLimit: number
 *     startDate: string
 *     endDate: string
 *   }>
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authentication - get userId from session
    const user = await requireAuth(event)

    const body = await readBody(event)

    // Validation
    if (!body.name || !body.startDate || !body.gameSystemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, startDate, gameSystemId'
      })
    }

    if (!body.format) {
      throw createError({
        statusCode: 400,
        statusMessage: 'League format is required'
      })
    }

    const formatConfig = getFormatConfig(body.format)
    if (!formatConfig) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league format'
      })
    }

    // Backward compatibility: UI historically used `rounds` while DB/API uses `phases`
    const incomingPhases = body.phases ?? body.rounds

    if (!incomingPhases || !Array.isArray(incomingPhases) || incomingPhases.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'League must have at least one phase'
      })
    }

    // Default to private league (user can explicitly set to public)
    const isPrivate = body.isPrivate ?? true

    // Generate share token for private leagues
    let shareToken = null
    if (isPrivate) {
      // Generate 32-character hex token (16 bytes = 32 hex chars)
      shareToken = generateShareToken()
    }

    // Create league
    const [newLeague] = await db.insert(leagues).values({
      name: body.name,
      description: body.description || null,
      rules: body.rules || null,
      gameSystemId: body.gameSystemId,
      format: body.format,
      startDate: body.startDate,
      endDate: body.endDate || null,
      currentPhase: 1,
      createdBy: user.id, // Use authenticated user ID from session
      isPrivate,
      shareToken,
      maxPlayers: body.maxPlayers || null,
      status: 'active'
    }).returning()

    // Create phases
    const phasesToInsert = incomingPhases.map((phase: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
      leagueId: newLeague.id,
      number: phase.number,
      name: phase.name,
      pointLimit: phase.pointLimit,
      startDate: phase.startDate,
      endDate: phase.endDate
    }))

    await db.insert(phases).values(phasesToInsert)

    // Create league membership for creator with 'owner' role
    const [newMembership] = await db.insert(leagueMemberships).values({
      leagueId: newLeague.id,
      userId: user.id, // Use authenticated user ID from session
      playerId: null, // Will be set when user creates their player in this league
      role: 'owner',
      status: 'active'
    }).returning()

    // Fetch complete league data with phases
    const leagueWithPhases = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, newLeague.id))
      .limit(1)

    const leaguePhases = await db
      .select()
      .from(phases)
      .where(eq(phases.leagueId, newLeague.id))

    return {
      success: true,
      message: 'League created successfully',
      data: {
        league: leagueWithPhases[0],
        phases: leaguePhases,
        membership: newMembership
      }
    }
  } catch (error) {
    // Re-throw validation errors (4xx) as-is
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }
    console.error('Error creating league:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create league'
    })
  }
})
