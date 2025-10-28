import crypto from 'crypto'

/**
 * Generate a secure random token for share URLs
 * @param length - Number of bytes (default: 16, which creates 32 hex characters)
 * @returns A hex string token of length * 2 characters
 */
export function generateShareToken(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Validate a share token format
 * @param token - The token to validate
 * @param expectedLength - Expected character length (default: 32)
 * @returns true if token is valid format
 */
export function isValidShareToken(token: string | null | undefined, expectedLength: number = 32): boolean {
  if (!token) return false
  if (typeof token !== 'string') return false
  if (token.length !== expectedLength) return false
  // Verify it's a valid hex string
  return /^[0-9a-f]+$/i.test(token)
}
