import { defineEventHandler, getRouterParams, createError } from 'h3'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { leagueMemberships, users, players } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    const leagueId = parseInt(id)

    if (!leagueId || isNaN(leagueId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid league ID'
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

    // Fetch memberships with user and player info
    const membershipsResult = await db
      .select({
        userId: leagueMemberships.userId,
        playerId: leagueMemberships.playerId,
        role: leagueMemberships.role,
        status: leagueMemberships.status,
        joinedAt: leagueMemberships.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userPicture: users.picture,
        playerName: players.name,
        playerFaction: players.faction,
        playerWins: players.wins,
        playerLosses: players.losses,
        playerDraws: players.draws
      })
      .from(leagueMemberships)
      .leftJoin(users, eq(leagueMemberships.userId, users.id))
      .leftJoin(players, eq(leagueMemberships.playerId, players.id))
      .where(eq(leagueMemberships.leagueId, leagueId))
      .orderBy(leagueMemberships.joinedAt)

    // Transform to cleaner structure
    const members = membershipsResult.map(m => ({
      userId: m.userId,
      playerId: m.playerId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      user: {
        name: m.userName,
        email: m.userEmail,
        picture: m.userPicture
      },
      player: m.playerId ? {
        name: m.playerName,
        faction: m.playerFaction,
        wins: m.playerWins,
        losses: m.playerLosses,
        draws: m.playerDraws
      } : null
    }))

    return {
      success: true,
      data: members,
      count: members.length
    }
  } catch (error) {
    console.error('Error fetching league members:', error)
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch league members'
    })
  }
})
