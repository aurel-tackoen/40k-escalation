/**
 * GET /api/admin/system-status
 * Fetches system health status for admin dashboard
 * Requires admin role
 */
import { db } from '../../../db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // ✅ Require admin role
  await requireAdmin(event)

  const status = {
    healthy: true,
    checks: {
      database: { status: 'unknown', message: '', timestamp: new Date().toISOString() },
      api: { status: 'healthy', message: 'API responding', timestamp: new Date().toISOString() }
    },
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    deployment: process.env.NETLIFY === 'true' ? 'Netlify' : 'Local',
    timestamp: new Date().toISOString()
  }

  try {
    // Test database connection with a simple query
    const dbCheck = await db.execute(sql`SELECT 1 as health_check`)

    if (dbCheck && dbCheck.rows && dbCheck.rows.length > 0) {
      status.checks.database.status = 'healthy'
      status.checks.database.message = 'Database connection OK'
    } else {
      status.checks.database.status = 'degraded'
      status.checks.database.message = 'Database query returned unexpected result'
      status.healthy = false
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    status.checks.database.status = 'unhealthy'
    status.checks.database.message = error instanceof Error ? error.message : 'Database connection failed'
    status.healthy = false
  }

  return {
    success: true,
    data: status
  }
})
