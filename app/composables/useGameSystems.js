/**
 * useGameSystems - Game System Utilities Composable
 *
 * Provides utilities for working with game systems including:
 * - Game system name lookups
 * - Game system badge component rendering
 * - Centralized game system display logic
 *
 * @param {Ref} gameSystems - Reactive reference to game systems array from store
 * @returns {Object} Game system utility functions
 */
export function useGameSystems(gameSystems) {
  /**
   * Get game system name by ID
   * Prefers shortName (e.g., "40k") over full name
   *
   * @param {number} gameSystemId - Game system ID
   * @returns {string|null} Game system name or null if not found
   */
  const getGameSystemName = (gameSystemId) => {
    if (!gameSystemId) return null
    const gameSystem = gameSystems.value.find(gs => gs.id === gameSystemId)
    return gameSystem?.shortName || gameSystem?.name || null
  }

  /**
   * Get game system name by ID with fallback
   * Returns 'Unknown' instead of null for display purposes
   *
   * @param {number} gameSystemId - Game system ID
   * @returns {string} Game system name or 'Unknown'
   */
  const getGameSystemNameWithFallback = (gameSystemId) => {
    return getGameSystemName(gameSystemId) || 'Unknown'
  }

  /**
   * Get full game system object by ID
   *
   * @param {number} gameSystemId - Game system ID
   * @returns {Object|null} Game system object or null
   */
  const getGameSystemById = (gameSystemId) => {
    if (!gameSystemId) return null
    return gameSystems.value.find(gs => gs.id === gameSystemId) || null
  }

  /**
   * Check if game systems are loaded
   *
   * @returns {boolean} True if game systems array has items
   */
  const hasGameSystems = () => {
    return gameSystems.value && gameSystems.value.length > 0
  }

  /**
   * Get CSS classes for game system badge
   * Consistent purple theme across the app
   *
   * @returns {string} Tailwind CSS classes
   */
  const getGameSystemBadgeClasses = () => {
    return 'bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg'
  }

  /**
   * Get CSS classes for game system text
   *
   * @returns {string} Tailwind CSS classes
   */
  const getGameSystemTextClasses = () => {
    return 'text-base text-purple-300 font-semibold'
  }

  /**
   * Get CSS classes for inline game system hint text
   * Used for form labels, etc.
   *
   * @returns {string} Tailwind CSS classes
   */
  const getGameSystemHintClasses = () => {
    return 'text-xs text-gray-400 ml-2'
  }

  return {
    getGameSystemName,
    getGameSystemNameWithFallback,
    getGameSystemById,
    hasGameSystems,
    getGameSystemBadgeClasses,
    getGameSystemTextClasses,
    getGameSystemHintClasses
  }
}
