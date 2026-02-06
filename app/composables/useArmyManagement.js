/**
 * Composable for army management operations
 * Provides reusable functions for army-related business logic
 */
export function useArmyManagement(armies, phases) {
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
   * Check if an army can be escalated to the next phase
   * @param {Object} army - Army object with playerId and phase
   * @returns {boolean} True if army can be escalated
   */
  const canEscalateArmy = (army) => {
    if (!army) return false

    const nextPhase = army.phase + 1
    const hasNextPhase = phases.value?.some(p => p.number === nextPhase)
    const hasNextPhaseArmy = armies.value?.some(a =>
      a.playerId === army.playerId && a.phase === nextPhase
    )

    return hasNextPhase && !hasNextPhaseArmy
  }

  /**
   * Check if player has an army for the previous phase
   * @param {number|string} playerId - Player ID
   * @param {number} phase - Current phase number
   * @returns {boolean} True if previous phase army exists
   */
  const hasPreviousPhaseArmy = (playerId, phase) => {
    if (!playerId || !phase || phase <= 1) return false
    return armies.value?.some(army =>
      army.playerId === playerId && army.phase === phase - 1
    )
  }

  /**
   * Get army from previous phase
   * @param {number|string} playerId - Player ID
   * @param {number} phase - Current phase number
   * @returns {Object|undefined} Previous phase army or undefined
   */
  const getPreviousArmy = (playerId, phase) => {
    if (!playerId || !phase || phase <= 1) return undefined
    return armies.value?.find(army =>
      army.playerId === playerId && army.phase === phase - 1
    )
  }

  /**
   * Copy army to next phase with updated phase number and name
   * @param {Object} army - Source army to copy
   * @param {number} nextPhaseNumber - Target phase number
   * @returns {Object} New army object for next phase
   */
  const copyArmyToNextPhase = (army, nextPhaseNumber) => {
    // Force consistent "Phase X" naming
    let baseName = army.name

    // Remove any existing phase indicators to get base name
    baseName = baseName.replace(/\s*-?\s*Phase \d+/i, '')
    baseName = baseName.replace(/\s*\(Phase \d+\)/i, '')
    baseName = baseName.trim()

    // Always use "Phase X" format
    const newName = `${baseName} Phase ${nextPhaseNumber}`

    return {
      playerId: army.playerId,
      phase: nextPhaseNumber,
      name: newName,
      totalPoints: army.totalPoints,
      units: JSON.parse(JSON.stringify(army.units)),
      isValid: false // Needs validation in new phase context
    }
  }

  /**
   * Get all armies for a specific player
   * @param {number|string} playerId - Player ID
   * @returns {Array<Object>} Array of player's armies sorted by phase
   */
  const getPlayerArmies = (playerId) => {
    if (!armies.value || !playerId) return []
    return armies.value
      .filter(army => army.playerId === playerId)
      .sort((a, b) => a.phase - b.phase)
  }

  /**
   * Get all armies for a specific phase
   * @param {number} phaseNumber - Phase number
   * @returns {Array<Object>} Array of armies for the phase
   */
  const getPhaseArmies = (phaseNumber) => {
    if (!armies.value || !phaseNumber) return []
    return armies.value.filter(army => army.phase === phaseNumber)
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
    hasPreviousPhaseArmy,
    getPreviousArmy,
    copyArmyToNextPhase,
    getPlayerArmies,
    getPhaseArmies,
    getArmyComposition
  }
}
