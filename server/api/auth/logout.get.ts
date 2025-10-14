/**
 * GET /api/auth/logout
 * Clears session and redirects to Auth0 logout
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const AUTH0_DOMAIN = config.auth0Domain || process.env.AUTH0_DOMAIN
  const AUTH0_CLIENT_ID = config.auth0ClientId || process.env.AUTH0_CLIENT_ID
  const AUTH0_LOGOUT_URL = config.auth0LogoutUrl || process.env.AUTH0_LOGOUT_URL || 'http://localhost:3000'

  // Clear session cookie
  deleteCookie(event, 'auth_session')

  // Build Auth0 logout URL
  const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?${new URLSearchParams({
    client_id: AUTH0_CLIENT_ID,
    returnTo: AUTH0_LOGOUT_URL
  })}`

  // Redirect to Auth0 logout
  return sendRedirect(event, logoutUrl, 302)
})
