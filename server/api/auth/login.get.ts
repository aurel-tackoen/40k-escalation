/**
 * GET /api/auth/login
 * Redirects user to Auth0 hosted login page
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const AUTH0_DOMAIN = config.auth0Domain || process.env.AUTH0_DOMAIN
  const AUTH0_CLIENT_ID = config.auth0ClientId || process.env.AUTH0_CLIENT_ID
  const AUTH0_CALLBACK_URL = config.auth0CallbackUrl || process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/api/auth/callback'

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Auth0 not configured. Please set AUTH0_DOMAIN and AUTH0_CLIENT_ID environment variables.'
    })
  }

  // Build Auth0 authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: AUTH0_CALLBACK_URL,
    scope: 'openid profile email',
    state: Math.random().toString(36).substring(7) // Simple state for CSRF protection
  })

  const authUrl = `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`

  // Redirect to Auth0
  return sendRedirect(event, authUrl, 302)
})
