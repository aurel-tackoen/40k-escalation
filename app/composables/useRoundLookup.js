/**
 * Composable for round data lookup and utilities
 * Provides reusable functions for accessing round information
 */
export function useRoundLookup(rounds) {
  /**
   * Get round name by number
   * @param {number} roundNumber - Round number
   * @returns {string} Round name or 'Round {number}'
   */
  const getRoundName = (roundNumber) => {
    const round = rounds.value?.find(r => r.number === roundNumber)
    return round ? round.name : `Round ${roundNumber}`
  }

  /**
   * Get round point limit by number
   * @param {number} roundNumber - Round number
   * @returns {number} Point limit or 0
   */
  const getRoundLimit = (roundNumber) => {
    const round = rounds.value?.find(r => r.number === roundNumber)
    return round ? round.pointLimit : 0
  }

  /**
   * Get complete round object by number
   * @param {number} roundNumber - Round number
   * @returns {Object|undefined} Round object or undefined
   */
  const getRound = (roundNumber) => {
    return rounds.value?.find(r => r.number === roundNumber)
  }

  /**
   * Get current round from league object
   * @param {Object} league - League object with rounds and currentRound
   * @returns {Object} Current round object with default fallback
   */
  const getCurrentRound = (league) => {
    if (!league?.rounds || league.rounds.length === 0) {
      return { name: 'N/A', pointLimit: 0, number: 1 }
    }
    return league.rounds.find(r => r.number === league.currentRound) || league.rounds[0]
  }

  /**
   * Check if a round exists
   * @param {number} roundNumber - Round number
   * @returns {boolean} True if round exists
   */
  const roundExists = (roundNumber) => {
    return rounds.value?.some(r => r.number === roundNumber) || false
  }

  /**
   * Get all rounds sorted by number
   * @returns {Array<Object>} Sorted array of rounds
   */
  const getSortedRounds = () => {
    if (!rounds.value) return []
    return [...rounds.value].sort((a, b) => a.number - b.number)
  }

  /**
   * Get round by date range
   * @param {string} date - ISO date string
   * @returns {Object|undefined} Round object if date falls within range
   */
  const getRoundByDate = (date) => {
    if (!rounds.value) return undefined
    const targetDate = new Date(date)
    return rounds.value.find(r => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      return targetDate >= start && targetDate <= end
    })
  }

  return {
    getRoundName,
    getRoundLimit,
    getRound,
    getCurrentRound,
    roundExists,
    getSortedRounds,
    getRoundByDate
  }
}
