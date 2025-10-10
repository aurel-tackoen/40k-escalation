/**
 * Composable for calculating painting statistics and styling
 * Provides reusable functions for tracking painting progress across armies and units
 */
export function usePaintingStats() {
  /**
   * Calculate painting statistics for a single unit
   * @param {Object} unit - Unit object with totalModels and paintedModels
   * @returns {number} Percentage of painted models (0-100)
   */
  const getUnitPaintPercentage = (unit) => {
    if (!unit.totalModels || unit.totalModels === 0) return 0
    const painted = unit.paintedModels || 0
    return Math.round((painted / unit.totalModels) * 100)
  }

  /**
   * Calculate painting statistics for an entire army
   * @param {Object} army - Army object with units array
   * @returns {Object} { totalModels, painted, percentage }
   */
  const getArmyPaintingStats = (army) => {
    if (!army || !army.units) {
      return { totalModels: 0, painted: 0, percentage: 0 }
    }

    const unitsWithModels = army.units.filter(u => u.totalModels > 0)

    if (unitsWithModels.length === 0) {
      return { totalModels: 0, painted: 0, percentage: 0 }
    }

    const totalModels = unitsWithModels.reduce((sum, u) => sum + (u.totalModels || 0), 0)
    const painted = unitsWithModels.reduce((sum, u) => sum + (u.paintedModels || 0), 0)
    const percentage = totalModels > 0 ? Math.round((painted / totalModels) * 100) : 0

    return { totalModels, painted, percentage }
  }

  /**
   * Calculate painting statistics for a player's current army
   * @param {number|string} playerId - ID of the player
   * @param {number} currentRound - Current round number
   * @param {Array} armies - Array of all armies
   * @returns {Object} { totalModels, painted, percentage }
   */
  const getPlayerPaintingStats = (playerId, currentRound, armies) => {
    const army = armies.find(a => a.playerId === playerId && a.round === currentRound)
    return getArmyPaintingStats(army)
  }

  /**
   * Get CSS class for painting progress bar based on percentage
   * @param {number} percentage - Painting completion percentage (0-100)
   * @returns {string} Tailwind CSS gradient class
   */
  const getPaintProgressClass = (percentage) => {
    if (percentage === 100) return 'bg-gradient-to-r from-purple-500 to-purple-600'
    if (percentage >= 71) return 'bg-gradient-to-r from-green-500 to-green-600'
    if (percentage >= 31) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }

  /**
   * Get CSS color class for painting percentage text based on completion
   * @param {number} percentage - Painting completion percentage (0-100)
   * @returns {string} Tailwind CSS text color class
   */
  const getPaintPercentageColor = (percentage) => {
    if (percentage === 100) return 'text-purple-400'
    if (percentage >= 71) return 'text-green-400'
    if (percentage >= 31) return 'text-yellow-400'
    return 'text-red-400'
  }

  return {
    getUnitPaintPercentage,
    getArmyPaintingStats,
    getPlayerPaintingStats,
    getPaintProgressClass,
    getPaintPercentageColor
  }
}
