import { defineEventHandler, getRouterParam, createError, getHeader } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagues } from '../../../../db/schema'
import { generateShareToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const leagueId = getRouterParam(event, 'id')
  // TODO: Add authentication when Auth0 is implemented
  // const user = await requireAuth(event)

  if (!leagueId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'League ID is required'
    })
  }

  try {
    const leagueIdNum = parseInt(leagueId)

    if (isNaN(leagueIdNum)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID'
      })
    }

    // Initialize database connection
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (!databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database configuration error'
      })
    }

    const sql = neon(databaseUrl)
    const db = drizzle(sql)

    // Check if league exists
    const existingLeague = await db.select()
      .from(leagues)
      .where(eq(leagues.id, leagueIdNum))
      .limit(1)

    if (!existingLeague[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'League not found'
      })
    }

    // TODO: Verify user is league owner/organizer when auth is implemented
    // if (existingLeague[0].createdBy !== user.id) {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: 'Only league owners can generate share URLs'
    //   })
    // }

    // Generate secure random token using utility function
    const shareToken = generateShareToken()

    // Update league with new share token
    await db.update(leagues)
      .set({ shareToken })
      .where(eq(leagues.id, leagueIdNum))

    // Generate full share URL
    const baseUrl = getHeader(event, 'origin') || process.env.SITE_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/join/${shareToken}`

    return {
      success: true,
      data: {
        shareUrl,
        shareToken
      },
      message: 'Share URL generated successfully'
    }
  } catch (error) {
    console.error('Error generating share URL:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate share URL'
    })
  }
})
