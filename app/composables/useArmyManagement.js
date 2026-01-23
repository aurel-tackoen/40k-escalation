/**
 * Composable for army management operations
 * Provides reusable functions for army-related business logic
 */
export function useArmyManagement(armies, stages) {
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
   * Check if an army can be escalated to the next stage
   * @param {Object} army - Army object with playerId and stage
   * @returns {boolean} True if army can be escalated
   */
  const canEscalateArmy = (army) => {
    if (!army) return false

    const nextStage = army.stage + 1
    const hasNextStage = stages.value?.some(s => s.number === nextStage)
    const hasNextStageArmy = armies.value?.some(a =>
      a.playerId === army.playerId && a.stage === nextStage
    )

    return hasNextStage && !hasNextStageArmy
  }

  /**
   * Check if player has an army for the previous stage
   * @param {number|string} playerId - Player ID
   * @param {number} stage - Current stage number
   * @returns {boolean} True if previous stage army exists
   */
  const hasPreviousStageArmy = (playerId, stage) => {
    if (!playerId || !stage || stage <= 1) return false
    return armies.value?.some(army =>
      army.playerId === playerId && army.stage === stage - 1
    )
  }

  /**
   * Get army from previous stage
   * @param {number|string} playerId - Player ID
   * @param {number} stage - Current stage number
   * @returns {Object|undefined} Previous stage army or undefined
   */
  const getPreviousArmy = (playerId, stage) => {
    if (!playerId || !stage || stage <= 1) return undefined
    return armies.value?.find(army =>
      army.playerId === playerId && army.stage === stage - 1
    )
  }

  /**
   * Copy army to next stage with updated stage number and name
   * @param {Object} army - Source army to copy
   * @param {number} nextStageNumber - Target stage number
   * @returns {Object} New army object for next stage
   */
  const copyArmyToNextStage = (army, nextStageNumber) => {
    // Force consistent "Stage X" naming
    let baseName = army.name

    // Remove any existing stage indicators to get base name
    baseName = baseName.replace(/\s*-?\s*Stage \d+/i, '')
    baseName = baseName.replace(/\s*\(Stage \d+\)/i, '')
    baseName = baseName.trim()

    // Always use "Stage X" format
    const newName = `${baseName} Stage ${nextStageNumber}`

    return {
      playerId: army.playerId,
      stage: nextStageNumber,
      name: newName,
      totalPoints: army.totalPoints,
      units: JSON.parse(JSON.stringify(army.units)),
      isValid: false // Needs validation in new stage context
    }
  }

  /**
   * Get all armies for a specific player
   * @param {number|string} playerId - Player ID
   * @returns {Array<Object>} Array of player's armies sorted by stage
   */
  const getPlayerArmies = (playerId) => {
    if (!armies.value || !playerId) return []
    return armies.value
      .filter(army => army.playerId === playerId)
      .sort((a, b) => a.stage - b.stage)
  }

  /**
   * Get all armies for a specific stage
   * @param {number} stageNumber - Stage number
   * @returns {Array<Object>} Array of armies for the stage
   */
  const getStageArmies = (stageNumber) => {
    if (!armies.value || !stageNumber) return []
    return armies.value.filter(army => army.stage === stageNumber)
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
    hasPreviousStageArmy,
    getPreviousArmy,
    copyArmyToNextStage,
    getPlayerArmies,
    getStageArmies,
    getArmyComposition
  }
}
