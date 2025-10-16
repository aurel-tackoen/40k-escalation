/**
 * Unit tests for useMatchResults composable
 */
import { describe, it, expect } from 'vitest'
import { useMatchResults } from '~/composables/useMatchResults'

describe('useMatchResults', () => {
  describe('determineWinner', () => {
    it('should return "player1" when player 1 wins', () => {
      const { determineWinner } = useMatchResults()
      expect(determineWinner(85, 60)).toBe('player1')
    })

    it('should return "player2" when player 2 wins', () => {
      const { determineWinner } = useMatchResults()
      expect(determineWinner(60, 85)).toBe('player2')
    })

    it('should return "draw" for a draw', () => {
      const { determineWinner } = useMatchResults()
      expect(determineWinner(75, 75)).toBe('draw')
    })
  })

  describe('isCloseMatch', () => {
    it('should return true for games within threshold', () => {
      const { isCloseMatch } = useMatchResults()
      expect(isCloseMatch(75, 70, 10)).toBe(true)
      expect(isCloseMatch(80, 75, 10)).toBe(true)
    })

    it('should return false for games outside threshold', () => {
      const { isCloseMatch } = useMatchResults()
      expect(isCloseMatch(90, 60, 10)).toBe(false)
    })

    it('should use default threshold of 5', () => {
      const { isCloseMatch } = useMatchResults()
      expect(isCloseMatch(75, 72)).toBe(true)
      expect(isCloseMatch(90, 60)).toBe(false)
    })
  })

  describe('isDecisiveVictory', () => {
    it('should return true for large point differentials', () => {
      const { isDecisiveVictory } = useMatchResults()
      expect(isDecisiveVictory(100, 30, 30)).toBe(true)
      expect(isDecisiveVictory(95, 50, 30)).toBe(true)
    })

    it('should return false for small differentials', () => {
      const { isDecisiveVictory } = useMatchResults()
      expect(isDecisiveVictory(80, 70, 30)).toBe(false)
    })

    it('should use default threshold of 15', () => {
      const { isDecisiveVictory } = useMatchResults()
      expect(isDecisiveVictory(100, 80)).toBe(true)
      expect(isDecisiveVictory(85, 75)).toBe(false)
    })
  })

  describe('getMatchStatus', () => {
    it('should return "close" for close games', () => {
      const { getMatchStatus } = useMatchResults()
      expect(getMatchStatus(75, 72)).toBe('close')
    })

    it('should return "decisive" for blowouts', () => {
      const { getMatchStatus } = useMatchResults()
      expect(getMatchStatus(100, 50)).toBe('decisive')
    })

    it('should return "draw" for equal scores', () => {
      const { getMatchStatus } = useMatchResults()
      expect(getMatchStatus(75, 75)).toBe('draw')
    })

    it('should return "normal" for standard games', () => {
      const { getMatchStatus } = useMatchResults()
      expect(getMatchStatus(85, 75)).toBe('normal')
    })
  })

  describe('getScoreDifference', () => {
    it('should calculate absolute difference', () => {
      const { getScoreDifference } = useMatchResults()
      expect(getScoreDifference(85, 60)).toBe(25)
      expect(getScoreDifference(60, 85)).toBe(25)
    })

    it('should return 0 for equal scores', () => {
      const { getScoreDifference } = useMatchResults()
      expect(getScoreDifference(75, 75)).toBe(0)
    })
  })
})
