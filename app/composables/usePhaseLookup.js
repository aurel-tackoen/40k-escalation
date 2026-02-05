/**
 * Composable for phase data lookup and utilities
 * Provides reusable functions for accessing phase information
 */
export function usePhaseLookup(phases) {
  /**
   * Get phase name by number
   * @param {number} phaseNumber - Phase number
   * @returns {string} Phase name or 'Phase {number}'
   */
  const getPhaseName = (phaseNumber) => {
    const phase = phases.value?.find(p => p.number === phaseNumber)
    return phase ? phase.name : `Phase ${phaseNumber}`
  }

  /**
   * Get phase point limit by number
   * @param {number} phaseNumber - Phase number
   * @returns {number} Point limit or 0
   */
  const getPhaseLimit = (phaseNumber) => {
    const phase = phases.value?.find(p => p.number === phaseNumber)
    return phase ? phase.pointLimit : 0
  }

  /**
   * Get complete phase object by number
   * @param {number} phaseNumber - Phase number
   * @returns {Object|undefined} Phase object or undefined
   */
  const getPhase = (phaseNumber) => {
    return phases.value?.find(p => p.number === phaseNumber)
  }

  /**
   * Get current phase from league object
   * @param {Object} league - League object with phases and currentPhase
   * @returns {Object} Current phase object with default fallback
   */
  const getCurrentPhase = (league) => {
    if (!league?.phases || league.phases.length === 0) {
      return { name: 'N/A', pointLimit: 0, number: 1 }
    }
    return league.phases.find(p => p.number === league.currentPhase) || league.phases[0]
  }

  /**
   * Check if a phase exists
   * @param {number} phaseNumber - Phase number
   * @returns {boolean} True if phase exists
   */
  const phaseExists = (phaseNumber) => {
    return phases.value?.some(p => p.number === phaseNumber) || false
  }

  /**
   * Get all phases sorted by number
   * @returns {Array<Object>} Sorted array of phases
   */
  const getSortedPhases = () => {
    if (!phases.value) return []
    return [...phases.value].sort((a, b) => a.number - b.number)
  }

  /**
   * Get phase by date range
   * @param {string} date - ISO date string
   * @returns {Object|undefined} Phase object if date falls within range
   */
  const getPhaseByDate = (date) => {
    if (!phases.value) return undefined
    const targetDate = new Date(date)
    return phases.value.find(p => {
      const start = new Date(p.startDate)
      const end = new Date(p.endDate)
      return targetDate >= start && targetDate <= end
    })
  }

  return {
    getPhaseName,
    getPhaseLimit,
    getPhase,
    getCurrentPhase,
    phaseExists,
    getSortedPhases,
    getPhaseByDate
  }
}
