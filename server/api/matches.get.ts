/**
 * GET /api/matches
 * Fetches all matches
 */
import { db } from '../../db'
import { matches } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const allMatches = await db.select().from(matches)
    
    return {
      success: true,
      data: allMatches
    }
  } catch (error) {
    console.error('Error fetching matches:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch matches'
    })
  }
})
