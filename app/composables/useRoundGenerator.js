import { ref } from 'vue'

/**
 * Composable for round generation and management
 * Provides utilities for auto-generating and managing league rounds
 */
export function useRoundGenerator() {
  const autoConfig = ref({
    startingPoints: 500,
    pointsStep: 500,
    numberOfRounds: 4,
    weeksPerRound: 4
  })

  /**
   * Generate rounds automatically based on configuration
   * @param {string} startDate - League start date (ISO format)
   * @param {Object} config - Auto-generation config (optional, uses autoConfig if not provided)
   * @returns {Array} Array of generated round objects
   */
  const generateAutoRounds = (startDate, config = null) => {
    if (!startDate || startDate === '') {
      throw new Error('Start date is required to generate rounds')
    }

    const cfg = config || autoConfig.value
    const generatedRounds = []
    let currentDate = new Date(startDate)
    let currentPoints = cfg.startingPoints

    for (let i = 0; i < cfg.numberOfRounds; i++) {
      const roundStartDate = new Date(currentDate)
      const roundEndDate = new Date(currentDate)
      roundEndDate.setDate(roundEndDate.getDate() + (cfg.weeksPerRound * 7))

      generatedRounds.push({
        number: i + 1,
        name: `${currentPoints} Points`,
        pointLimit: currentPoints,
        startDate: roundStartDate.toISOString().split('T')[0],
        endDate: roundEndDate.toISOString().split('T')[0]
      })

      // Next round starts day after current ends
      currentDate = new Date(roundEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
      currentPoints += cfg.pointsStep
    }

    return generatedRounds
  }

  /**
   * Calculate league end date from rounds
   * @param {Array} rounds - Array of round objects
   * @returns {string|null} Latest end date in ISO format, or null if no rounds
   */
  const calculateLeagueEndDate = (rounds) => {
    if (!rounds || rounds.length === 0) return null

    const roundsWithDates = rounds.filter(r => r.endDate)
    if (roundsWithDates.length === 0) return null

    // Find the latest end date
    const latestEndDate = roundsWithDates.reduce((latest, round) => {
      return round.endDate > latest ? round.endDate : latest
    }, roundsWithDates[0].endDate)

    return latestEndDate
  }

  /**
   * Create a new round with incremented values
   * @param {Array} existingRounds - Current array of rounds
   * @param {number} pointsIncrement - Points to add (default: 500)
   * @returns {Object} New round object
   */
  const createNextRound = (existingRounds, pointsIncrement = 500) => {
    const lastRound = existingRounds[existingRounds.length - 1]
    const nextNumber = lastRound.number + 1
    const nextLimit = lastRound.pointLimit + pointsIncrement

    return {
      number: nextNumber,
      name: `${nextLimit} Points`,
      pointLimit: nextLimit,
      startDate: '',
      endDate: ''
    }
  }

  /**
   * Renumber rounds after deletion or reordering
   * @param {Array} rounds - Array of round objects
   * @returns {Array} Renumbered rounds
   */
  const renumberRounds = (rounds) => {
    return rounds.map((round, idx) => ({
      ...round,
      number: idx + 1
    }))
  }

  /**
   * Validate a round object
   * @param {Object} round - Round object to validate
   * @returns {Object} Validation result { isValid, errors }
   */
  const validateRound = (round) => {
    const errors = []

    if (!round.name || !round.name.trim()) {
      errors.push(`Round ${round.number} name is required`)
    }

    if (!round.pointLimit || round.pointLimit <= 0) {
      errors.push(`Round ${round.number} must have a valid point limit`)
    }

    if (!round.startDate) {
      errors.push(`Round ${round.number} start date is required`)
    }

    if (!round.endDate) {
      errors.push(`Round ${round.number} end date is required`)
    }

    if (round.startDate && round.endDate && round.startDate > round.endDate) {
      errors.push(`Round ${round.number} start date must be before end date`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate all rounds
   * @param {Array} rounds - Array of round objects
   * @returns {Object} Validation result { isValid, errors }
   */
  const validateAllRounds = (rounds) => {
    if (!rounds || rounds.length === 0) {
      return {
        isValid: false,
        errors: ['At least one round is required']
      }
    }

    const allErrors = []
    rounds.forEach(round => {
      const validation = validateRound(round)
      if (!validation.isValid) {
        allErrors.push(...validation.errors)
      }
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    }
  }

  /**
   * Sanitize rounds data for API submission
   * @param {Array} rounds - Array of round objects
   * @returns {Array} Sanitized rounds (empty strings converted to null)
   */
  const sanitizeRounds = (rounds) => {
    return rounds.map(round => ({
      ...round,
      startDate: round.startDate || null,
      endDate: round.endDate || null
    }))
  }

  /**
   * Get round summary for display
   * @param {Array} rounds - Array of round objects
   * @returns {Object} Summary statistics
   */
  const getRoundsSummary = (rounds) => {
    if (!rounds || rounds.length === 0) {
      return {
        totalRounds: 0,
        startingPoints: 0,
        endingPoints: 0,
        totalDuration: 0
      }
    }

    const startingPoints = rounds[0]?.pointLimit || 0
    const endingPoints = rounds[rounds.length - 1]?.pointLimit || 0

    // Calculate total duration if dates are available
    let totalDuration = 0
    if (rounds[0]?.startDate && rounds[rounds.length - 1]?.endDate) {
      const start = new Date(rounds[0].startDate)
      const end = new Date(rounds[rounds.length - 1].endDate)
      totalDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) // Days
    }

    return {
      totalRounds: rounds.length,
      startingPoints,
      endingPoints,
      totalDuration
    }
  }

  return {
    autoConfig,
    generateAutoRounds,
    calculateLeagueEndDate,
    createNextRound,
    renumberRounds,
    validateRound,
    validateAllRounds,
    sanitizeRounds,
    getRoundsSummary
  }
}
