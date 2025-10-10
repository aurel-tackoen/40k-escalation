/**
 * Composable for player data lookup and utilities
 * Provides reusable functions for accessing player information
 */
export function usePlayerLookup(players) {
  /**
   * Get player name by ID
   * @param {number|string} playerId - ID of the player
   * @returns {string} Player name or 'Unknown Player'
   */
  const getPlayerName = (playerId) => {
    const player = players.value?.find(p => p.id === playerId)
    return player ? player.name : 'Unknown Player'
  }

  /**
   * Get player faction by ID
   * @param {number|string} playerId - ID of the player
   * @returns {string} Player faction or 'Unknown Faction'
   */
  const getPlayerFaction = (playerId) => {
    const player = players.value?.find(p => p.id === playerId)
    return player ? player.faction : 'Unknown Faction'
  }

  /**
   * Get complete player object by ID
   * @param {number|string} playerId - ID of the player
   * @returns {Object|undefined} Player object or undefined
   */
  const getPlayer = (playerId) => {
    return players.value?.find(p => p.id === playerId)
  }

  /**
   * Get multiple players by IDs
   * @param {Array<number|string>} playerIds - Array of player IDs
   * @returns {Array<Object>} Array of player objects
   */
  const getPlayers = (playerIds) => {
    if (!players.value || !Array.isArray(playerIds)) return []
    return players.value.filter(p => playerIds.includes(p.id))
  }

  /**
   * Check if player exists
   * @param {number|string} playerId - ID of the player
   * @returns {boolean} True if player exists
   */
  const playerExists = (playerId) => {
    return players.value?.some(p => p.id === playerId) || false
  }

  return {
    getPlayerName,
    getPlayerFaction,
    getPlayer,
    getPlayers,
    playerExists
  }
}
