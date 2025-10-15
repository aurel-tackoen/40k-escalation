import { db } from '../../db'
import { factions } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const gameSystemId = query.gameSystemId ? parseInt(query.gameSystemId as string) : null

    let factionQuery = db
      .select()
      .from(factions)
      .where(eq(factions.isActive, true))

    // Filter by game system if provided
    if (gameSystemId) {
      factionQuery = factionQuery.where(
        and(
          eq(factions.isActive, true),
          eq(factions.gameSystemId, gameSystemId)
        )
      )
    }

    const factionsList = await factionQuery.orderBy(factions.name)

    return {
      success: true,
      data: factionsList,
      count: factionsList.length,
      gameSystemId
    }
  } catch (error) {
    console.error('Error fetching factions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch factions'
    })
  }
})
