/**
 * Composable for army management operations
 * Provides reusable functions for army-related business logic
 */
export function useArmyManagement(armies, rounds) {
  /**
   * Calculate total points for an army's units
   * @param {Array<Object>} units - Array of unit objects with points
   * @returns {number} Total points
   */
  const calculateArmyTotal = (units) => {
    if (!Array.isArray(units)) return 0
    return units.reduce((sum, unit) => sum + (unit.points || 0), 0)
  }

  /**
   * Check if an army is valid for a given point limit
   * @param {Object} army - Army object with units and totalPoints
   * @param {number} pointLimit - Maximum point limit
   * @returns {boolean} True if army is valid
   */
  const isValidArmy = (army, pointLimit) => {
    if (!army || !army.units) return false
    return army.units.length > 0 &&
      army.totalPoints <= pointLimit &&
      army.totalPoints > 0
  }

  /**
   * Check if an army can be escalated to the next round
   * @param {Object} army - Army object with playerId and round
   * @returns {boolean} True if army can be escalated
   */
  const canEscalateArmy = (army) => {
    if (!army) return false

    const nextRound = army.round + 1
    const hasNextRound = rounds.value?.some(r => r.number === nextRound)
    const hasNextRoundArmy = armies.value?.some(a =>
      a.playerId === army.playerId && a.round === nextRound
    )

    return hasNextRound && !hasNextRoundArmy
  }

  /**
   * Check if player has an army for the previous round
   * @param {number|string} playerId - Player ID
   * @param {number} round - Current round number
   * @returns {boolean} True if previous round army exists
   */
  const hasPreviousRoundArmy = (playerId, round) => {
    if (!playerId || !round || round <= 1) return false
    return armies.value?.some(army =>
      army.playerId === playerId && army.round === round - 1
    )
  }

  /**
   * Get army from previous round
   * @param {number|string} playerId - Player ID
   * @param {number} round - Current round number
   * @returns {Object|undefined} Previous round army or undefined
   */
  const getPreviousArmy = (playerId, round) => {
    if (!playerId || !round || round <= 1) return undefined
    return armies.value?.find(army =>
      army.playerId === playerId && army.round === round - 1
    )
  }

  /**
   * Copy army to next round with updated round number and name
   * @param {Object} army - Source army to copy
   * @param {number} nextRoundNumber - Target round number
   * @returns {Object} New army object for next round
   */
  const copyArmyToNextRound = (army, nextRoundNumber) => {
    // Force consistent "Round X" naming
    let baseName = army.name

    // Remove any existing round indicators to get base name
    baseName = baseName.replace(/\s*-?\s*Round \d+/i, '')
    baseName = baseName.replace(/\s*\(Round \d+\)/i, '')
    baseName = baseName.trim()

    // Always use "Round X" format
    const newName = `${baseName} Round ${nextRoundNumber}`

    return {
      playerId: army.playerId,
      round: nextRoundNumber,
      name: newName,
      totalPoints: army.totalPoints,
      units: JSON.parse(JSON.stringify(army.units)),
      isValid: false // Needs validation in new round context
    }
  }

  /**
   * Get all armies for a specific player
   * @param {number|string} playerId - Player ID
   * @returns {Array<Object>} Array of player's armies sorted by round
   */
  const getPlayerArmies = (playerId) => {
    if (!armies.value || !playerId) return []
    return armies.value
      .filter(army => army.playerId === playerId)
      .sort((a, b) => a.round - b.round)
  }

  /**
   * Get all armies for a specific round
   * @param {number} roundNumber - Round number
   * @returns {Array<Object>} Array of armies for the round
   */
  const getRoundArmies = (roundNumber) => {
    if (!armies.value || !roundNumber) return []
    return armies.value.filter(army => army.round === roundNumber)
  }

  /**
   * Calculate army composition statistics
   * @param {Object} army - Army object with units
   * @returns {Object} Statistics: { totalUnits, unitsByType, averagePoints }
   */
  const getArmyComposition = (army) => {
    if (!army || !army.units || army.units.length === 0) {
      return { totalUnits: 0, unitsByType: {}, averagePoints: 0 }
    }

    const unitsByType = army.units.reduce((acc, unit) => {
      const type = unit.type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const averagePoints = army.totalPoints / army.units.length

    return {
      totalUnits: army.units.length,
      unitsByType,
      averagePoints: Math.round(averagePoints)
    }
  }

  return {
    calculateArmyTotal,
    isValidArmy,
    canEscalateArmy,
    hasPreviousRoundArmy,
    getPreviousArmy,
    copyArmyToNextRound,
    getPlayerArmies,
    getRoundArmies,
    getArmyComposition
  }
}
