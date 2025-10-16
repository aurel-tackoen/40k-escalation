/**
 * Unit tests for useAuth composable
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useAuth', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should provide authentication state and methods', async () => {
    // Import after Pinia is set up
    const { useAuth } = await import('../../../app/composables/useAuth')
    const auth = useAuth()

    expect(auth).toHaveProperty('user')
    expect(auth).toHaveProperty('isLoading')
    expect(auth).toHaveProperty('error')
    expect(auth).toHaveProperty('isAuthenticated')
    expect(auth).toHaveProperty('getUserName')
    expect(auth).toHaveProperty('getUserEmail')
    expect(auth).toHaveProperty('getUserAvatar')
    expect(auth).toHaveProperty('fetchUser')
    expect(auth).toHaveProperty('login')
    expect(auth).toHaveProperty('logout')
    expect(auth).toHaveProperty('clearUser')
  })

  it('should start with no user', async () => {
    const { useAuth } = await import('../../../app/composables/useAuth')
    const auth = useAuth()

    expect(auth.user.value).toBeNull()
    expect(auth.isAuthenticated.value).toBe(false)
  })
})
