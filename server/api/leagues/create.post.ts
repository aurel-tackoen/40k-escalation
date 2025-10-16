import { db } from '../../../db'
import { leagues, leagueMemberships, rounds } from '../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/leagues/create
 * Create a new league with rounds and auto-assign creator as owner
 *
 * Body:
 * {
 *   name: string
 *   description?: string
 *   gameSystemId: number (required - which game system this league uses)
 *   startDate: string (ISO date)
 *   endDate?: string (ISO date)
 *   createdBy: number (userId)
 *   isPrivate: boolean
 *   allowDirectJoin?: boolean
 *   maxPlayers?: number
 *   rounds: Array<{
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
    const body = await readBody(event)

    // Validation
    if (!body.name || !body.startDate || !body.createdBy || !body.gameSystemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, startDate, createdBy, gameSystemId'
      })
    }

    if (!body.rounds || body.rounds.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'League must have at least one round'
      })
    }

    // Generate share token for private leagues
    let shareToken = null
    if (body.isPrivate) {
      // Generate 32-character share token
      shareToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    }

    // Create league
    const [newLeague] = await db.insert(leagues).values({
      name: body.name,
      description: body.description || null,
      gameSystemId: body.gameSystemId,
      startDate: body.startDate,
      endDate: body.endDate || null,
      currentRound: 1,
      createdBy: body.createdBy,
      isPrivate: body.isPrivate ?? false,
      shareToken,
      allowDirectJoin: body.allowDirectJoin ?? true,
      maxPlayers: body.maxPlayers || null,
      status: 'active'
    }).returning()

    // Create rounds
    const roundsToInsert = body.rounds.map((round: { number: number; name: string; pointLimit: number; startDate: string; endDate: string }) => ({
      leagueId: newLeague.id,
      number: round.number,
      name: round.name,
      pointLimit: round.pointLimit,
      startDate: round.startDate,
      endDate: round.endDate
    }))

    await db.insert(rounds).values(roundsToInsert)

    // Create league membership for creator with 'owner' role
    const [newMembership] = await db.insert(leagueMemberships).values({
      leagueId: newLeague.id,
      userId: body.createdBy,
      playerId: null, // Will be set when user creates their player in this league
      role: 'owner',
      status: 'active'
    }).returning()

    // Fetch complete league data with rounds
    const leagueWithRounds = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, newLeague.id))
      .limit(1)

    const leagueRounds = await db
      .select()
      .from(rounds)
      .where(eq(rounds.leagueId, newLeague.id))

    return {
      success: true,
      message: 'League created successfully',
      data: {
        league: leagueWithRounds[0],
        rounds: leagueRounds,
        membership: newMembership
      }
    }
  } catch (error) {
    console.error('Error creating league:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create league'
    })
  }
})
