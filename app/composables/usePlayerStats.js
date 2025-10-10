/**
 * Composable for player statistics calculations
 * Provides reusable functions for calculating and displaying player stats
 */
export function usePlayerStats() {
  /**
   * Calculate total games played by a player
   * @param {Object} player - Player object with wins, losses, draws
   * @returns {number} Total number of games
   */
  const getTotalGames = (player) => {
    return (player.wins || 0) + (player.losses || 0) + (player.draws || 0)
  }

  /**
   * Calculate win percentage for a player
   * @param {Object} player - Player object with wins, losses, draws
   * @returns {number} Win percentage (0-100)
   */
  const getWinPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.wins / totalGames) * 100
  }

  /**
   * Calculate loss percentage for a player
   * @param {Object} player - Player object with wins, losses, draws
   * @returns {number} Loss percentage (0-100)
   */
  const getLossPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.losses / totalGames) * 100
  }

  /**
   * Calculate draw percentage for a player
   * @param {Object} player - Player object with wins, losses, draws
   * @returns {number} Draw percentage (0-100)
   */
  const getDrawPercentage = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return (player.draws / totalGames) * 100
  }

  /**
   * Sort players by standings (wins, then total points)
   * @param {Array<Object>} players - Array of player objects
   * @returns {Array<Object>} Sorted array of players
   */
  const sortPlayersByStandings = (players) => {
    return [...players].sort((a, b) => {
      // Sort by wins first, then by total points
      if (a.wins !== b.wins) {
        return b.wins - a.wins
      }
      return b.totalPoints - a.totalPoints
    })
  }

  /**
   * Get player's rank in the league
   * @param {Object} player - Player to find rank for
   * @param {Array<Object>} allPlayers - Array of all players
   * @returns {number} Player's rank (1-based)
   */
  const getPlayerRank = (player, allPlayers) => {
    const sorted = sortPlayersByStandings(allPlayers)
    return sorted.findIndex(p => p.id === player.id) + 1
  }

  /**
   * Calculate points per game average
   * @param {Object} player - Player object with totalPoints
   * @returns {number} Average points per game (0 if no games)
   */
  const getPointsPerGame = (player) => {
    const totalGames = getTotalGames(player)
    if (totalGames === 0) return 0
    return Math.round((player.totalPoints || 0) / totalGames)
  }

  /**
   * Check if player has winning record
   * @param {Object} player - Player object
   * @returns {boolean} True if more wins than losses
   */
  const hasWinningRecord = (player) => {
    return player.wins > player.losses
  }

  /**
   * Get player performance level
   * @param {Object} player - Player object
   * @returns {string} Performance level: 'excellent', 'good', 'average', 'struggling'
   */
  const getPerformanceLevel = (player) => {
    const winPercentage = getWinPercentage(player)
    if (winPercentage >= 75) return 'excellent'
    if (winPercentage >= 60) return 'good'
    if (winPercentage >= 40) return 'average'
    return 'struggling'
  }

  return {
    getTotalGames,
    getWinPercentage,
    getLossPercentage,
    getDrawPercentage,
    sortPlayersByStandings,
    getPlayerRank,
    getPointsPerGame,
    hasWinningRecord,
    getPerformanceLevel
  }
}
