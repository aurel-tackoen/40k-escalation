/**
 * Unit tests for game-systems data module
 */
import { describe, it, expect } from 'vitest'
import { gameSystems } from '../../../app/data/game-systems'

describe('Game Systems Data Tests', () => {
  it('should have all required game systems', () => {
    expect(gameSystems).toBeDefined()
    expect(Array.isArray(gameSystems)).toBe(true)
    expect(gameSystems.length).toBeGreaterThan(0)
  })

  it('should have valid game system structure', () => {
    const gameSystem = gameSystems[0]
    expect(gameSystem).toHaveProperty('name')
    expect(gameSystem).toHaveProperty('shortName')
    expect(typeof gameSystem.name).toBe('string')
    expect(typeof gameSystem.shortName).toBe('string')
  })
})
