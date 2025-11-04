/**
 * Composable for player display utilities
 * Provides reusable functions for displaying player names with context indicators
 */
export function usePlayerDisplay(currentPlayer) {
  /**
   * Get player display name with faction and (me) indicator for forms
   * @param {Object} player - Player object with name and faction
   * @returns {string} Formatted player name with faction, e.g., "John (Space Marines) - me"
   */
  const getPlayerDisplayName = (player) => {
    if (!player) return ''
    const baseName = player.faction ? `${player.name} (${player.faction})` : player.name
    if (currentPlayer?.value && player.id === currentPlayer.value.id) {
      return `${baseName} - me`
    }
    return baseName
  }

  /**
   * Get player name for filter dropdown (name only with me indicator)
   * @param {Object} player - Player object
   * @returns {string} Formatted player name for filters, e.g., "John (me)"
   */
  const getPlayerFilterName = (player) => {
    if (!player) return ''
    if (currentPlayer?.value && player.id === currentPlayer.value.id) {
      return `${player.name} (me)`
    }
    return player.name
  }

  /**
   * Get simple player label with faction
   * @param {Object} player - Player object
   * @returns {string} Player name with faction, e.g., "John - Space Marines"
   */
  const getPlayerLabel = (player) => {
    if (!player) return ''
    return player.faction ? `${player.name} - ${player.faction}` : player.name
  }

  /**
   * Check if player is the current user
   * @param {Object} player - Player object
   * @returns {boolean} True if player is the current user
   */
  const isCurrentPlayer = (player) => {
    if (!player || !currentPlayer?.value) return false
    return player.id === currentPlayer.value.id
  }

  /**
   * Get player initials for avatar
   * @param {Object} player - Player object
   * @returns {string} Player initials, e.g., "JD"
   */
  const getPlayerInitials = (player) => {
    if (!player || !player.name) return '?'
    const names = player.name.trim().split(' ')
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase()
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  /**
   * Get CSS classes for player card/element based on current player
   * @param {Object} player - Player object
   * @returns {string} CSS classes
   */
  const getPlayerCardClasses = (player) => {
    if (isCurrentPlayer(player)) {
      return 'bg-yellow-900/20 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-500/30'
    }
    return 'bg-gray-700 border border-gray-600 hover:border-yellow-500'
  }

  return {
    getPlayerDisplayName,
    getPlayerFilterName,
    getPlayerLabel,
    isCurrentPlayer,
    getPlayerInitials,
    getPlayerCardClasses
  }
}
