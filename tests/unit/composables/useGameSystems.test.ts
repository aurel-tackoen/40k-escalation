/**
 * Unit tests for useGameSystems composable
 */
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useGameSystems } from '~/composables/useGameSystems'
import { createMockGameSystem } from '../../../test-utils/factories'

describe('useGameSystems', () => {
  const mockGameSystems = ref([
    createMockGameSystem({ id: 1, name: 'Warhammer 40,000', shortName: '40k' }),
    createMockGameSystem({ id: 2, name: 'Age of Sigmar', shortName: 'aos' }),
    createMockGameSystem({ id: 3, name: 'The Old World', shortName: 'tow' })
  ])

  describe('getGameSystemName', () => {
    it('should return short name for valid game system ID', () => {
      const { getGameSystemName } = useGameSystems(mockGameSystems)
      expect(getGameSystemName(1)).toBe('40k')
      expect(getGameSystemName(2)).toBe('aos')
    })

    it('should return null for invalid game system ID', () => {
      const { getGameSystemName } = useGameSystems(mockGameSystems)
      expect(getGameSystemName(999)).toBeNull()
    })

    it('should return null for null game system ID', () => {
      const { getGameSystemName } = useGameSystems(mockGameSystems)
      expect(getGameSystemName(null)).toBeNull()
    })
  })

  describe('getGameSystemNameWithFallback', () => {
    it('should return short name for valid game system ID', () => {
      const { getGameSystemNameWithFallback } = useGameSystems(mockGameSystems)
      expect(getGameSystemNameWithFallback(1)).toBe('40k')
    })

    it('should return "Unknown" for invalid game system ID', () => {
      const { getGameSystemNameWithFallback } = useGameSystems(mockGameSystems)
      expect(getGameSystemNameWithFallback(999)).toBe('Unknown')
    })
  })

  describe('getGameSystemById', () => {
    it('should return full game system object for valid ID', () => {
      const { getGameSystemById } = useGameSystems(mockGameSystems)
      const result = getGameSystemById(1)
      expect(result).toMatchObject({
        id: 1,
        name: 'Warhammer 40,000',
        shortName: '40k'
      })
    })

    it('should return null for invalid ID', () => {
      const { getGameSystemById } = useGameSystems(mockGameSystems)
      expect(getGameSystemById(999)).toBeNull()
    })
  })

  describe('hasGameSystems', () => {
    it('should return true when game systems exist', () => {
      const { hasGameSystems } = useGameSystems(mockGameSystems)
      expect(hasGameSystems()).toBe(true)
    })

    it('should return false when game systems array is empty', () => {
      const emptyGameSystems = ref([])
      const { hasGameSystems } = useGameSystems(emptyGameSystems)
      expect(hasGameSystems()).toBe(false)
    })
  })

  describe('CSS class getters', () => {
    it('should return badge CSS classes', () => {
      const { getGameSystemBadgeClasses } = useGameSystems(mockGameSystems)
      expect(getGameSystemBadgeClasses()).toBe('bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg')
    })

    it('should return text CSS classes', () => {
      const { getGameSystemTextClasses } = useGameSystems(mockGameSystems)
      expect(getGameSystemTextClasses()).toBe('text-base text-purple-300 font-semibold')
    })

    it('should return hint CSS classes', () => {
      const { getGameSystemHintClasses } = useGameSystems(mockGameSystems)
      expect(getGameSystemHintClasses()).toBe('text-xs text-gray-400 ml-2')
    })
  })
})
