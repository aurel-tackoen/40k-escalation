/**
 * GET /api/auth/callback
 * Handles the OAuth callback from Auth0
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const AUTH0_DOMAIN = config.auth0Domain || process.env.AUTH0_DOMAIN
  const AUTH0_CLIENT_ID = config.auth0ClientId || process.env.AUTH0_CLIENT_ID
  const AUTH0_CLIENT_SECRET = config.auth0ClientSecret || process.env.AUTH0_CLIENT_SECRET
  const AUTH0_CALLBACK_URL = config.auth0CallbackUrl || process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/api/auth/callback'

  // Get authorization code from query params
  const query = getQuery(event)
  const code = query.code as string
  const error = query.error as string

  if (error) {
    return sendRedirect(event, `/?error=${encodeURIComponent(error)}`, 302)
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No authorization code provided'
    })
  }

  try {
    // Exchange code for tokens
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenResponse: any = await $fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        grant_type: 'authorization_code',
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: AUTH0_CALLBACK_URL
      }
    })

    // Get user info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await $fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    })

    // Extract role from custom claims (set by Auth0 Action)
    // See guide/AUTH0_ROLES_SETUP.md for how to create the Action
    const namespace = 'https://40k-escalation.app'
    const role = user[`${namespace}/role`] || 'user'
    // const roles = user[`${namespace}/roles`] || []

    // console.log('User role from Auth0:', role, 'All roles:', roles)

    // Create or update user in database immediately
    const { db } = await import('../../../db')
    const { users } = await import('../../../db/schema')
    const { eq } = await import('drizzle-orm')

    let dbUser
    const auth0Id = user.sub
    const email = user.email

    const [existingByAuth0Id] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))

    const [existingByEmail] = !existingByAuth0Id && email
      ? await db
        .select()
        .from(users)
        .where(eq(users.email, email))
      : [undefined]

    const existingUser = existingByAuth0Id || existingByEmail

    if (!existingUser) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          auth0Id,
          email,
          name: user.name || email.split('@')[0],
          picture: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || email)}`,
          role,
          lastLoginAt: new Date()
        })
        .returning()

      dbUser = newUser
    } else {
      // Update existing user (also link by email -> auth0Id if needed)
      const [updatedUser] = await db
        .update(users)
        .set({
          auth0Id,
          email: email || existingUser.email,
          lastLoginAt: new Date(),
          role,
          name: user.name || existingUser.name,
          picture: user.picture || existingUser.picture
        })
        .where(eq(users.id, existingUser.id))
        .returning()

      dbUser = updatedUser
    }

    // Create session data with database user ID
    const sessionData = JSON.stringify({
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role, // Add role to session
      // roles, // Add all roles to session
      userId: dbUser.id, // Add database user ID to session
      access_token: tokenResponse.access_token,
      expires_at: Date.now() + (tokenResponse.expires_in * 1000)
    })

    // Simple base64 encoding (in production, use proper encryption)
    const sessionToken = Buffer.from(sessionData).toString('base64')

    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production'
    setCookie(event, 'auth_session', sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
      secure: isProduction
    })

    // Check if user has any leagues (for redirect logic)
    const { leagueMemberships } = await import('../../../db/schema')
    const userMemberships = await db
      .select()
      .from(leagueMemberships)
      .where(eq(leagueMemberships.userId, dbUser.id))

    // If user has no leagues, send them to the leagues page to join/create
    // Otherwise, send to dashboard
    const redirectUrl = userMemberships.length === 0 ? '/leagues' : '/dashboard'

    return sendRedirect(event, redirectUrl, 302)
  } catch (err: unknown) {
    console.error('Auth callback error:', err)
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Authentication failed'
    return sendRedirect(event, `/?error=${encodeURIComponent(String(message))}`, 302)
  }
})
