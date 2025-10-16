/**
 * Integration tests for Leagues Pinia Store
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLeaguesStore } from '../../../app/stores/leagues'

describe('Leagues Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useLeaguesStore()
    expect(store.myLeagues).toEqual([])
    expect(store.publicLeagues).toEqual([])
    expect(store.currentLeagueId).toBeNull()
  })

  it('should have fetchMyLeagues action', () => {
    const store = useLeaguesStore()
    expect(typeof store.fetchMyLeagues).toBe('function')
  })

  it('should have fetchPublicLeagues action', () => {
    const store = useLeaguesStore()
    expect(typeof store.fetchPublicLeagues).toBe('function')
  })

  it('should have computed properties', () => {
    const store = useLeaguesStore()
    expect(store.currentLeague).toBeDefined()
    expect(store.availableFactions).toBeDefined()
    expect(store.availableMissions).toBeDefined()
  })
})
