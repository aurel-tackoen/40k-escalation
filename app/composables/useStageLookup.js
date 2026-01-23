/**
 * Composable for stage data lookup and utilities
 * Provides reusable functions for accessing stage information
 * (formerly useRoundLookup - renamed to avoid confusion with game rounds)
 */
export function useStageLookup(stages) {
  /**
   * Get stage name by number
   * @param {number} stageNumber - Stage number
   * @returns {string} Stage name or 'Stage {number}'
   */
  const getStageName = (stageNumber) => {
    const stage = stages.value?.find(s => s.number === stageNumber)
    return stage ? stage.name : `Stage ${stageNumber}`
  }

  /**
   * Get stage point limit by number
   * @param {number} stageNumber - Stage number
   * @returns {number} Point limit or 0
   */
  const getStageLimit = (stageNumber) => {
    const stage = stages.value?.find(s => s.number === stageNumber)
    return stage ? stage.pointLimit : 0
  }

  /**
   * Get complete stage object by number
   * @param {number} stageNumber - Stage number
   * @returns {Object|undefined} Stage object or undefined
   */
  const getStage = (stageNumber) => {
    return stages.value?.find(s => s.number === stageNumber)
  }

  /**
   * Get current stage from league object
   * @param {Object} league - League object with stages and currentStage
   * @returns {Object} Current stage object with default fallback
   */
  const getCurrentStage = (league) => {
    if (!league?.stages || league.stages.length === 0) {
      return { name: 'N/A', pointLimit: 0, number: 1 }
    }
    return league.stages.find(s => s.number === league.currentStage) || league.stages[0]
  }

  /**
   * Check if a stage exists
   * @param {number} stageNumber - Stage number
   * @returns {boolean} True if stage exists
   */
  const stageExists = (stageNumber) => {
    return stages.value?.some(s => s.number === stageNumber) || false
  }

  /**
   * Get all stages sorted by number
   * @returns {Array<Object>} Sorted array of stages
   */
  const getSortedStages = () => {
    if (!stages.value) return []
    return [...stages.value].sort((a, b) => a.number - b.number)
  }

  /**
   * Get stage by date range
   * @param {string} date - ISO date string
   * @returns {Object|undefined} Stage object if date falls within range
   */
  const getStageByDate = (date) => {
    if (!stages.value) return undefined
    const targetDate = new Date(date)
    return stages.value.find(s => {
      const start = new Date(s.startDate)
      const end = new Date(s.endDate)
      return targetDate >= start && targetDate <= end
    })
  }

  return {
    getStageName,
    getStageLimit,
    getStage,
    getCurrentStage,
    stageExists,
    getSortedStages,
    getStageByDate
  }
}
