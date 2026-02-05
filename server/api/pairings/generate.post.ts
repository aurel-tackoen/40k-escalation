import { db } from '../../../db'
import { pairings } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireLeagueRole } from '../../utils/auth'

/**
 * POST /api/pairings/generate
 * Generate pairings for a phase using Swiss or Random method
 * Auth: Owner/Organizer only
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leagueId, phase, pairings: newPairings } = body

    if (!leagueId || !phase || !newPairings || !Array.isArray(newPairings)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: leagueId, phase, pairings'
      })
    }

    // Require organizer role
    await requireLeagueRole(event, leagueId, ['owner', 'organizer'])

    // Check if pairings already exist for this phase
    const existingPairings = await db
      .select()
      .from(pairings)
      .where(and(
        eq(pairings.leagueId, leagueId),
        eq(pairings.phase, phase)
      ))

    // If pairings exist, delete them first (regenerate)
    if (existingPairings.length > 0) {
      await db
        .delete(pairings)
        .where(and(
          eq(pairings.leagueId, leagueId),
          eq(pairings.phase, phase)
        ))
    }

    // Insert new pairings
    const insertedPairings = await db
      .insert(pairings)
      .values(newPairings)
      .returning()

    return {
      success: true,
      data: insertedPairings,
      count: insertedPairings.length,
      message: `Generated ${insertedPairings.length} pairings for Phase ${phase}`
    }
  } catch (error) {
    console.error('Error generating pairings:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate pairings'
    })
  }
})
