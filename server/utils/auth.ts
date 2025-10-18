import type { H3Event } from 'h3'
import { parseCookies } from 'h3'
import { db } from '../../db'
import { users, leagueMemberships } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Require authentication for an API route
 * Returns authenticated user object from database
 * @throws 401 if not authenticated or session invalid
 */
export async function requireAuth(event: H3Event) {
  const cookies = parseCookies(event)
  const sessionCookie = cookies.auth_session

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // Decode session cookie (base64 encoded JSON)
    const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8')
    const sessionData = JSON.parse(decoded)
    const auth0Id = sessionData.sub

    if (!auth0Id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session data'
      })
    }

    // Fetch user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return user
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session'
    })
  }
}

/**
 * Check if user has required role in a league
 * @param event - H3 event
 * @param leagueId - League ID to check
 * @param requiredRoles - Array of acceptable roles (default: ['owner', 'organizer'])
 * @returns User and membership objects
 * @throws 401 if not authenticated, 403 if insufficient permissions
 */
export async function requireLeagueRole(
  event: H3Event,
  leagueId: number,
  requiredRoles: string[] = ['owner', 'organizer']
) {
  const user = await requireAuth(event)

  // Check membership and role
  const [membership] = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, user.id)
      )
    )

  if (!membership) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not a member of this league'
    })
  }

  if (!requiredRoles.includes(membership.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}`
    })
  }

  return { user, membership }
}

/**
 * Check if user is a member of a league (any role)
 * @param event - H3 event
 * @param leagueId - League ID to check
 * @returns User and membership objects
 * @throws 401 if not authenticated, 403 if not a member
 */
export async function requireLeagueMembership(event: H3Event, leagueId: number) {
  const user = await requireAuth(event)

  const [membership] = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, user.id)
      )
    )

  if (!membership) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not a member of this league'
    })
  }

  return { user, membership }
}

/**
 * Check if user has admin role
 * @param event - H3 event
 * @returns User object
 * @throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return user
}
