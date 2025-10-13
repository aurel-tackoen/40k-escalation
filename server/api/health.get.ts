/**
 * GET /api/health
 * Health check endpoint to verify database connectivity
 */
import { db } from '../../db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as health`)

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  } catch (error) {
    console.error('Health check failed:', error)

    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Database connection failed'
    })
  }
})
