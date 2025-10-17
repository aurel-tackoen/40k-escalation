/**
 * Composable for match result calculations and comparisons
 * Supports multiple match types: victory_points, percentage, scenario
 * Provides reusable functions for match-related logic
 */
export function useMatchResults(matches) {
  /**
   * Determine the winner of a match (supports all match types)
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
   * Check if match is a close game (supports all match types)
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @param {number} threshold - Points difference threshold (default 5)
   * @param {Object} match - Full match object (optional, for advanced type checking)
   * @returns {boolean} True if match is close
   */
  const isCloseMatch = (score1, score2, threshold = 5, match = null) => {
    // Handle The Old World percentage matches
    if (match?.matchType === 'percentage') {
      // Close if margin is Draw or Minor Victory
      const margin = match.marginOfVictory
      return margin === 'Draw' || margin === 'Minor Victory'
    }

    // Handle MESBG scenario matches
    if (match?.matchType === 'scenario') {
      // If both completed or both failed, check casualties
      const p1Completed = match.player1ObjectiveCompleted
      const p2Completed = match.player2ObjectiveCompleted

      if (p1Completed === p2Completed) {
        // Use casualties as tiebreaker
        return getScoreDifference(score1 || 0, score2 || 0) <= threshold
      }
      // If objectives differ, not a close game
      return false
    }

    // Default: Victory Points (40k, AoS, HH) or backward compatibility
    return getScoreDifference(score1, score2) <= threshold
  }

  /**
   * Check if match is a decisive victory (supports all match types)
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @param {number} threshold - Points difference threshold (default 15)
   * @param {Object} match - Full match object (optional, for advanced type checking)
   * @returns {boolean} True if match is decisive
   */
  const isDecisiveVictory = (score1, score2, threshold = 15, match = null) => {
    // Handle The Old World percentage matches
    if (match?.matchType === 'percentage') {
      // Decisive if margin is Massacre or Major Victory
      const margin = match.marginOfVictory
      return margin === 'Massacre' || margin === 'Major Victory'
    }

    // Handle MESBG scenario matches
    if (match?.matchType === 'scenario') {
      // If one completed and other didn't, it's decisive
      const p1Completed = match.player1ObjectiveCompleted
      const p2Completed = match.player2ObjectiveCompleted

      if (p1Completed !== p2Completed) {
        return true
      }
      // If objectives are same, check casualties
      return getScoreDifference(score1 || 0, score2 || 0) >= threshold
    }

    // Default: Victory Points (40k, AoS, HH) or backward compatibility
    return getScoreDifference(score1, score2) >= threshold
  }

  /**
   * Get match result status (supports all match types)
   * @param {number} score1 - Player 1 score
   * @param {number} score2 - Player 2 score
   * @param {Object} match - Full match object (optional)
   * @returns {string} 'decisive', 'close', 'draw', or 'normal'
   */
  const getMatchStatus = (score1, score2, match = null) => {
    const winner = determineWinner(score1, score2)

    if (winner === 'draw') return 'draw'
    if (isDecisiveVictory(score1, score2, 15, match)) return 'decisive'
    if (isCloseMatch(score1, score2, 5, match)) return 'close'

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
   * Get head-to-head record between two players (supports all match types)
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
      // Use winnerId if available (more reliable)
      if (match.winnerId === player1Id) {
        record.wins++
      } else if (match.winnerId === null) {
        record.draws++
      } else if (match.winnerId) {
        record.losses++
      } else {
        // Fallback: calculate from scores (backward compatibility)
        const winner = determineWinner(match.player1Score || match.player1Points, match.player2Score || match.player2Points)

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
   * Calculate win streak for a player (supports all match types)
   * @param {number|string} playerId - Player ID
   * @returns {number} Current win streak
   */
  const getWinStreak = (playerId) => {
    if (!matches.value) return 0

    const playerMatches = getPlayerMatches(playerId)
      .sort((a, b) => new Date(b.datePlayed || b.date) - new Date(a.datePlayed || a.date)) // Most recent first

    let streak = 0

    for (const match of playerMatches) {
      // Use winnerId if available (more reliable across all match types)
      if (match.winnerId === playerId) {
        streak++
      } else if (match.winnerId === null) {
        // Draw - streak continues but doesn't increment
        continue
      } else {
        break // Loss - streak broken
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

  /**
   * Get match quality description for all match types
   * @param {Object} match - Match object
   * @returns {string|null} Quality description or null
   */
  const getMatchQualityText = (match) => {
    if (!match) return null

    const matchType = match.matchType || 'victory_points'

    switch (matchType) {
      case 'percentage':
        // The Old World uses margin of victory
        return match.marginOfVictory || null

      case 'scenario': {
        // MESBG: check if objectives match (close game)
        if (match.player1ObjectiveCompleted === match.player2ObjectiveCompleted) {
          return 'Close Game'
        }
        return 'Decisive Victory'
      }

      default: {
        // Victory Points: use score difference
        const diff = getScoreDifference(match.player1Points || 0, match.player2Points || 0)
        if (diff <= 5) return 'Close Game'
        if (diff >= 20) return 'Decisive Victory'
        return null
      }
    }
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
    isOnWinningStreak,
    getMatchQualityText
  }
}
