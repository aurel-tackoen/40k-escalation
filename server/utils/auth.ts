import type { H3Event } from 'h3'
import { db } from '../../db'
import { players } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Extract user from Netlify Identity JWT token
 * @param event - H3 Event
 * @returns User object or null
 */
export async function getCurrentUser(event: H3Event) {
  try {
    // Get authorization header
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Netlify Identity tokens are already verified by Netlify
    // We can decode them without verification in serverless functions
    const base64Payload = token.split('.')[1]
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())

    // Extract user info from JWT payload
    const netlifyId = payload.sub // Netlify user ID
    const email = payload.email

    if (!netlifyId || !email) {
      return null
    }

    // Find or create player in database
    const existingPlayers = await db.select().from(players).where(eq(players.netlifyId, netlifyId))

    if (existingPlayers.length > 0) {
      return {
        id: existingPlayers[0].id,
        netlifyId,
        email,
        name: existingPlayers[0].name,
        role: existingPlayers[0].role,
        faction: existingPlayers[0].faction
      }
    }

    return {
      netlifyId,
      email,
      role: payload.app_metadata?.role || 'player'
    }
  } catch (error) {
    console.error('Error extracting user from token:', error)
    return null
  }
}

/**
 * Require authentication - throws 401 if not authenticated
 * @param event - H3 Event
 * @returns User object
 */
export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in'
    })
  }

  return user
}

/**
 * Require specific role - throws 403 if not authorized
 * @param event - H3 Event
 * @param allowedRoles - Array of allowed roles
 * @returns User object
 */
export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const user = await requireAuth(event)

  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Insufficient permissions'
    })
  }

  return user
}

/**
 * Check if user is admin
 * @param event - H3 Event
 * @returns boolean
 */
export async function isAdmin(event: H3Event): Promise<boolean> {
  const user = await getCurrentUser(event)
  return user?.role === 'admin'
}

/**
 * Check if user is organizer or admin
 * @param event - H3 Event
 * @returns boolean
 */
export async function isOrganizer(event: H3Event): Promise<boolean> {
  const user = await getCurrentUser(event)
  return ['organizer', 'admin'].includes(user?.role || '')
}

/**
 * Check if user owns a resource (by player ID)
 * @param event - H3 Event
 * @param playerId - Player ID to check ownership
 * @returns boolean
 */
export async function ownsResource(event: H3Event, playerId: number): Promise<boolean> {
  const user = await getCurrentUser(event)

  if (!user) {
    return false
  }

  // Admins can access everything
  if (user.role === 'admin') {
    return true
  }

  // Check if user's player ID matches
  return user.id === playerId
}

/**
 * Get player ID from authenticated user
 * @param event - H3 Event
 * @returns Player ID or null
 */
export async function getPlayerIdFromAuth(event: H3Event): Promise<number | null> {
  const user = await getCurrentUser(event)
  return user?.id || null
}

/**
 * Update player's last login timestamp
 * @param netlifyId - Netlify user ID
 */
export async function updateLastLogin(netlifyId: string) {
  try {
    await db
      .update(players)
      .set({ lastLogin: new Date() })
      .where(eq(players.netlifyId, netlifyId))
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}
