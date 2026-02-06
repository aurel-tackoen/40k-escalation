import { db } from '../../../db'
import { leagueSettings } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueMembership } from '../../utils/auth'

/**
 * GET /api/league-settings/:leagueId
 * Get league settings (creates default if not exists)
 * Auth: Requires league membership
 */
export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(getRouterParam(event, 'leagueId') || '0')

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // Require league membership
    await requireLeagueMembership(event, leagueId)

    // Fetch settings
    const [settings] = await db
      .select()
      .from(leagueSettings)
      .where(eq(leagueSettings.leagueId, leagueId))
      .limit(1)

    // If no settings exist, create default
    if (!settings) {
      const defaultSettings = {
        leagueId,
        pairingMethod: 'swiss',
        allowRematches: false,
        autoGeneratePairings: false,
        tiebreakMethod: 'points_differential',
        playoffEnabled: false,
        playoffTopN: 4,
        allowMidLeagueJoins: true,
        byeHandling: 'auto',
        firstPhasePairingMethod: 'manual',
        subsequentPhaseMethod: 'swiss'
      }

      const [newSettings] = await db
        .insert(leagueSettings)
        .values(defaultSettings)
        .returning()

      return {
        success: true,
        data: newSettings,
        created: true
      }
    }

    return {
      success: true,
      data: settings
    }
  } catch (error) {
    console.error('Error fetching league settings:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch league settings'
    })
  }
})
