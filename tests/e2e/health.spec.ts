/**
 * E2E tests for health check endpoint
 */
import { test, expect } from '@playwright/test'

test.describe('Health Check API', () => {
  test('should return ok status', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.database).toBe('connected')
    expect(data.timestamp).toBeDefined()
  })

  test('should have correct response structure', async ({ request }) => {
    const response = await request.get('/api/health')
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('database')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('environment')
  })

  test('should return valid ISO timestamp', async ({ request }) => {
    const response = await request.get('/api/health')
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp.toString()).not.toBe('Invalid Date')
  })
})
