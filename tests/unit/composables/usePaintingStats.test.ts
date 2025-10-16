/**
 * Unit tests for usePaintingStats composable
 */
import { describe, it, expect } from 'vitest'
import { usePaintingStats } from '~/composables/usePaintingStats'

describe('usePaintingStats', () => {
  describe('getUnitPaintPercentage', () => {
    it('should calculate paint percentage correctly', () => {
      const { getUnitPaintPercentage } = usePaintingStats()
      const unit = {
        name: 'Tactical Squad',
        totalModels: 10,
        paintedModels: 7
      }
      expect(getUnitPaintPercentage(unit)).toBe(70)
    })

    it('should return 0 for unit with no models painted', () => {
      const { getUnitPaintPercentage } = usePaintingStats()
      const unit = {
        name: 'Tactical Squad',
        totalModels: 10,
        paintedModels: 0
      }
      expect(getUnitPaintPercentage(unit)).toBe(0)
    })

    it('should return 100 for fully painted unit', () => {
      const { getUnitPaintPercentage } = usePaintingStats()
      const unit = {
        name: 'Captain',
        totalModels: 1,
        paintedModels: 1
      }
      expect(getUnitPaintPercentage(unit)).toBe(100)
    })
  })

  describe('getArmyPaintingStats', () => {
    it('should calculate army painting stats', () => {
      const { getArmyPaintingStats } = usePaintingStats()
      const army = {
        units: [
          { name: 'Squad 1', totalModels: 10, paintedModels: 7 },
          { name: 'Squad 2', totalModels: 10, paintedModels: 10 }
        ]
      }

      const stats = getArmyPaintingStats(army)
      expect(stats.totalModels).toBe(20)
      expect(stats.painted).toBe(17)
      expect(stats.percentage).toBe(85)
    })
  })

  describe('getPaintProgressClass', () => {
    it('should return correct class for different percentages', () => {
      const { getPaintProgressClass } = usePaintingStats()

      expect(getPaintProgressClass(100)).toContain('purple')
      expect(getPaintProgressClass(80)).toContain('green')
      expect(getPaintProgressClass(50)).toContain('yellow')
      expect(getPaintProgressClass(20)).toContain('red')
    })
  })

  describe('getArmyPaintedPoints', () => {
    it('should calculate painted points for army', () => {
      const { getArmyPaintedPoints } = usePaintingStats()
      const army = {
        totalPoints: 500,
        units: [
          { name: 'Squad 1', points: 300, totalModels: 10, paintedModels: 10 },
          { name: 'Squad 2', points: 200, totalModels: 5, paintedModels: 3 }
        ]
      }

      const stats = getArmyPaintedPoints(army)
      expect(stats.totalPoints).toBe(500)
      expect(stats.paintedPoints).toBeGreaterThan(0)
      expect(stats.percentage).toBeGreaterThan(0)
    })
  })
})
