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

    // Create session data
    const sessionData = JSON.stringify({
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
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

    // Redirect to dashboard
    return sendRedirect(event, '/dashboard', 302)
  } catch (err: unknown) {
    console.error('Auth callback error:', err)
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Authentication failed'
    return sendRedirect(event, `/?error=${encodeURIComponent(String(message))}`, 302)
  }
})
