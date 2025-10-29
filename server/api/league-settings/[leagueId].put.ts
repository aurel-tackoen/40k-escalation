import { db } from '../../../db'
import { leagueSettings } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireLeagueRole } from '../../utils/auth'

/**
 * PUT /api/league-settings/:leagueId
 * Update league settings
 * Auth: Owner/Organizer only
 */
export default defineEventHandler(async (event) => {
  try {
    const leagueId = parseInt(getRouterParam(event, 'leagueId') || '0')
    const body = await readBody(event)

    if (!leagueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'leagueId is required'
      })
    }

    // Require organizer role
    await requireLeagueRole(event, leagueId, ['owner', 'organizer'])

    // Update settings
    const [updatedSettings] = await db
      .update(leagueSettings)
      .set(body)
      .where(eq(leagueSettings.leagueId, leagueId))
      .returning()

    if (!updatedSettings) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League settings not found'
      })
    }

    return {
      success: true,
      data: updatedSettings,
      message: 'League settings updated successfully'
    }
  } catch (error) {
    console.error('Error updating league settings:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update league settings'
    })
  }
})
