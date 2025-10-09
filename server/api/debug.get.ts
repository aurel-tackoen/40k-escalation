/**
 * GET /api/debug
 * Debug endpoint to check what routes are available
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const headers = getHeaders(event)
  
  return {
    success: true,
    debug: {
      url: url.toString(),
      path: event.path,
      method: event.method,
      headers: {
        host: headers.host,
        'user-agent': headers['user-agent'],
        'x-forwarded-for': headers['x-forwarded-for']
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.NETLIFY_DATABASE_URL || !!process.env.DATABASE_URL,
        netlifyContext: process.env.CONTEXT
      }
    }
  }
})
