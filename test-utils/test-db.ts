/**
 * Test Database Utilities
 *
 * Note: For integration tests that require a real database,
 * you should either:
 * 1. Use a test database instance (separate from production)
 * 2. Mock database calls in unit tests
 * 3. Use transaction rollbacks to clean up after tests
 *
 * This file provides helpers for database testing.
 */

import { db } from '../db'

/**
 * Clear all test data from tables
 * WARNING: Only use in test environment!
 */
export const clearTestData = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearTestData can only be used in test environment')
  }

  // Add table clearing logic here when needed
  // Example:
  // await db.delete(matches).execute()
  // await db.delete(armies).execute()
  // etc.
}

/**
 * Setup test database connection
 * Currently using the existing Neon connection from db/index.ts
 */
export const setupTestDB = async () => {
  // Database connection is already established in db/index.ts
  // No additional setup needed for Drizzle + Neon
  return db
}

/**
 * Teardown test database
 * For Neon/Drizzle, connection pooling is handled automatically
 */
export const teardownTestDB = async () => {
  // Connection cleanup is handled by Neon automatically
  // No explicit teardown needed
}
