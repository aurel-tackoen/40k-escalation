/**
 * Composable for match result calculations and comparisons
 * Provides reusable functions for match-related logic
 */
export function useMatchResults(matches) {
  /**
   * Determine the winner of a match
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @returns {string} 'player1', 'player2', or 'draw'
   */
  const determineWinner = (score1, score2) => {
    if (score1 > score2) return 'player1'
    if (score2 > score1) return 'player2'
    return 'draw'
  }

  /**
   * Calculate score difference
   * @param {number} score1 - First score
   * @param {number} score2 - Second score
   * @returns {number} Absolute difference
   */
  const getScoreDifference = (score1, score2) => {
    return Math.abs(score1 - score2)
  }

  /**
   * Check if match is a close game
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @param {number} threshold - Points difference threshold (default 5)
   * @returns {boolean} True if match is close
   */
  const isCloseMatch = (score1, score2, threshold = 5) => {
    return getScoreDifference(score1, score2) <= threshold
  }

  /**
   * Check if match is a decisive victory
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @param {number} threshold - Points difference threshold (default 15)
   * @returns {boolean} True if match is decisive
   */
  const isDecisiveVictory = (score1, score2, threshold = 15) => {
    return getScoreDifference(score1, score2) >= threshold
  }

  /**
   * Get match result status
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @returns {string} 'decisive', 'close', or 'draw'
   */
  const getMatchStatus = (score1, score2) => {
    const winner = determineWinner(score1, score2)

    if (winner === 'draw') return 'draw'
    if (isDecisiveVictory(score1, score2)) return 'decisive'
    if (isCloseMatch(score1, score2)) return 'close'

    return 'normal'
  }

  /**
   * Calculate total points scored by a player across all matches
   * @param {number|string} playerId - Player ID
   * @returns {number} Total points
   */
  const getTotalPointsScored = (playerId) => {
    if (!matches.value) return 0

    return matches.value.reduce((total, match) => {
      if (match.player1Id === playerId) {
        return total + (match.player1Score || 0)
      } else if (match.player2Id === playerId) {
        return total + (match.player2Score || 0)
      }
      return total
    }, 0)
  }

  /**
   * Calculate average points per game for a player
   * @param {number|string} playerId - Player ID
   * @returns {number} Average points
   */
  const getAveragePointsScored = (playerId) => {
    if (!matches.value) return 0

    const playerMatches = matches.value.filter(
      match => match.player1Id === playerId || match.player2Id === playerId
    )

    if (playerMatches.length === 0) return 0

    const totalPoints = getTotalPointsScored(playerId)
    return Math.round(totalPoints / playerMatches.length)
  }

  /**
   * Get head-to-head record between two players
   * @param {number|string} player1Id - First player ID
   * @param {number|string} player2Id - Second player ID
   * @returns {Object} Record with wins, losses, draws
   */
  const getHeadToHeadRecord = (player1Id, player2Id) => {
    if (!matches.value) {
      return { wins: 0, losses: 0, draws: 0 }
    }

    const headToHead = matches.value.filter(
      match =>
        (match.player1Id === player1Id && match.player2Id === player2Id) ||
        (match.player1Id === player2Id && match.player2Id === player1Id)
    )

    const record = { wins: 0, losses: 0, draws: 0 }

    headToHead.forEach(match => {
      const winner = determineWinner(match.player1Score, match.player2Score)

      if (winner === 'draw') {
        record.draws++
      } else if (
        (winner === 'player1' && match.player1Id === player1Id) ||
        (winner === 'player2' && match.player2Id === player1Id)
      ) {
        record.wins++
      } else {
        record.losses++
      }
    })

    return record
  }

  /**
   * Get matches for a specific player
   * @param {number|string} playerId - Player ID
   * @returns {Array<Object>} Player's matches
   */
  const getPlayerMatches = (playerId) => {
    if (!matches.value) return []

    return matches.value.filter(
      match => match.player1Id === playerId || match.player2Id === playerId
    )
  }

  /**
   * Get matches for a specific round
   * @param {number} roundNumber - Round number
   * @returns {Array<Object>} Round's matches
   */
  const getRoundMatches = (roundNumber) => {
    if (!matches.value) return []

    return matches.value.filter(match => match.round === roundNumber)
  }

  /**
   * Calculate win streak for a player
   * @param {number|string} playerId - Player ID
   * @returns {number} Current win streak
   */
  const getWinStreak = (playerId) => {
    if (!matches.value) return 0

    const playerMatches = getPlayerMatches(playerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first

    let streak = 0

    for (const match of playerMatches) {
      const isPlayer1 = match.player1Id === playerId
      const winner = determineWinner(match.player1Score, match.player2Score)

      if (
        (winner === 'player1' && isPlayer1) ||
        (winner === 'player2' && !isPlayer1)
      ) {
        streak++
      } else {
        break // Streak broken
      }
    }

    return streak
  }

  /**
   * Check if player is on a winning streak
   * @param {number|string} playerId - Player ID
   * @param {number} minStreak - Minimum streak length (default 2)
   * @returns {boolean} True if on winning streak
   */
  const isOnWinningStreak = (playerId, minStreak = 2) => {
    return getWinStreak(playerId) >= minStreak
  }

  return {
    determineWinner,
    getScoreDifference,
    isCloseMatch,
    isDecisiveVictory,
    getMatchStatus,
    getTotalPointsScored,
    getAveragePointsScored,
    getHeadToHeadRecord,
    getPlayerMatches,
    getRoundMatches,
    getWinStreak,
    isOnWinningStreak
  }
}
