/**
 * Unit tests for usePlayerStats composable
 */
import { describe, it, expect } from 'vitest'
import { usePlayerStats } from '~/composables/usePlayerStats'
import { createMockPlayer, createMockMatch } from '../../../test-utils/factories'

describe('usePlayerStats', () => {
  describe('getWinPercentage', () => {
    it('should calculate win percentage correctly', () => {
      const { getWinPercentage } = usePlayerStats()
      const player = createMockPlayer({ wins: 7, losses: 3, draws: 0 })
      expect(getWinPercentage(player)).toBe(70)
    })

    it('should handle draws in calculation', () => {
      const { getWinPercentage } = usePlayerStats()
      const player = createMockPlayer({ wins: 5, losses: 2, draws: 3 })
      expect(getWinPercentage(player)).toBe(50)
    })

    it('should return 0 for player with no games', () => {
      const { getWinPercentage } = usePlayerStats()
      const player = createMockPlayer({ wins: 0, losses: 0, draws: 0 })
      expect(getWinPercentage(player)).toBe(0)
    })

    it('should handle 100% win rate', () => {
      const { getWinPercentage } = usePlayerStats()
      const player = createMockPlayer({ wins: 10, losses: 0, draws: 0 })
      expect(getWinPercentage(player)).toBe(100)
    })

    it('should handle 0% win rate', () => {
      const { getWinPercentage } = usePlayerStats()
      const player = createMockPlayer({ wins: 0, losses: 10, draws: 0 })
      expect(getWinPercentage(player)).toBe(0)
    })
  })

  describe('getTotalGames', () => {
    it('should sum all games correctly', () => {
      const { getTotalGames } = usePlayerStats()
      const player = createMockPlayer({ wins: 5, losses: 3, draws: 2 })
      expect(getTotalGames(player)).toBe(10)
    })

    it('should return 0 for new player', () => {
      const { getTotalGames } = usePlayerStats()
      const player = createMockPlayer({ wins: 0, losses: 0, draws: 0 })
      expect(getTotalGames(player)).toBe(0)
    })
  })

  describe('sortPlayersByStandings', () => {
    it('should sort players by wins (descending)', () => {
      const { sortPlayersByStandings } = usePlayerStats()
      const players = [
        createMockPlayer({ id: 1, name: 'Player A', wins: 3, totalPoints: 100 }),
        createMockPlayer({ id: 2, name: 'Player B', wins: 7, totalPoints: 200 }),
        createMockPlayer({ id: 3, name: 'Player C', wins: 5, totalPoints: 150 })
      ]
      const sorted = sortPlayersByStandings(players)
      expect(sorted[0].name).toBe('Player B')
      expect(sorted[1].name).toBe('Player C')
      expect(sorted[2].name).toBe('Player A')
    })

    it('should use total points as tiebreaker', () => {
      const { sortPlayersByStandings } = usePlayerStats()
      const players = [
        createMockPlayer({ id: 1, name: 'Player A', wins: 5, totalPoints: 150 }),
        createMockPlayer({ id: 2, name: 'Player B', wins: 5, totalPoints: 200 }),
        createMockPlayer({ id: 3, name: 'Player C', wins: 5, totalPoints: 100 })
      ]
      const sorted = sortPlayersByStandings(players)
      expect(sorted[0].name).toBe('Player B')
      expect(sorted[1].name).toBe('Player A')
      expect(sorted[2].name).toBe('Player C')
    })
  })

  describe('getPlayerRank', () => {
    it('should return correct rank for player', () => {
      const { getPlayerRank } = usePlayerStats()
      const player1 = createMockPlayer({ id: 1, wins: 3 })
      const player2 = createMockPlayer({ id: 2, wins: 7 })
      const player3 = createMockPlayer({ id: 3, wins: 5 })
      const players = [player1, player2, player3]
      
      expect(getPlayerRank(player2, players)).toBe(1)
      expect(getPlayerRank(player3, players)).toBe(2)
      expect(getPlayerRank(player1, players)).toBe(3)
    })

    it('should return 0 for non-existent player', () => {
      const { getPlayerRank } = usePlayerStats()
      const player1 = createMockPlayer({ id: 1, wins: 3 })
      const players = [player1]
      const nonExistentPlayer = createMockPlayer({ id: 999, wins: 0 })
      
      expect(getPlayerRank(nonExistentPlayer, players)).toBe(0)
    })
  })

  // Remove getPlayerStats tests as this function doesn't exist in usePlayerStats
  // It's part of other composables or store logic
})
