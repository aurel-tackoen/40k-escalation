/**
 * Composable for match display utilities
 * Provides functions for determining match display details and formatting
 */
export function useMatchDisplay() {
  /**
   * Determine match type from match data (with backward compatibility)
   * @param {Object} match - Match object
   * @returns {string} Match type ('victory_points', 'percentage', 'scenario')
   */
  const getMatchType = (match) => {
    return match.matchType || 'victory_points'
  }

  /**
   * Get score display data for a player in a match
   * @param {Object} match - Match object
   * @param {number} playerNumber - Player number (1 or 2)
   * @returns {Object} Score display data
   */
  const getPlayerScoreDisplay = (match, playerNumber) => {
    const matchType = getMatchType(match)
    const isPlayer1 = playerNumber === 1
    const playerId = isPlayer1 ? match.player1Id : match.player2Id
    const isWinner = match.winnerId === playerId

    switch (matchType) {
      case 'victory_points':
        return {
          value: isPlayer1 ? match.player1Points : match.player2Points,
          label: 'VP',
          valueClass: isWinner ? 'text-yellow-400' : 'text-gray-500',
          fontSize: 'text-4xl'
        }

      case 'percentage': {
        const casualties = isPlayer1 ? match.player1CasualtiesValue || 0 : match.player2CasualtiesValue || 0
        const enemyArmy = isPlayer1 ? match.player2ArmyValue || 0 : match.player1ArmyValue || 0
        return {
          value: casualties,
          label: `of ${enemyArmy}pts`,
          valueClass: isWinner ? 'text-yellow-400' : 'text-gray-500',
          fontSize: 'text-2xl'
        }
      }

      case 'scenario': {
        const objectiveCompleted = isPlayer1 ? match.player1ObjectiveCompleted : match.player2ObjectiveCompleted
        return {
          value: objectiveCompleted,
          label: objectiveCompleted ? 'Objective ✓' : 'Failed',
          isBoolean: true,
          valueClass: objectiveCompleted ? 'text-green-400' : 'text-red-400',
          fontSize: 'text-2xl'
        }
      }

      default:
        return {
          value: 0,
          label: '',
          valueClass: 'text-gray-500',
          fontSize: 'text-2xl'
        }
    }
  }

  /**
   * Get match result description
   * @param {Object} match - Match object
   * @returns {string} Human-readable match result
   */
  const getMatchResultDescription = (match) => {
    const matchType = getMatchType(match)

    if (!match.winnerId) {
      return 'Draw'
    }

    const isPlayer1Winner = match.winnerId === match.player1Id

    switch (matchType) {
      case 'victory_points': {
        const vpDiff = Math.abs((match.player1Points || 0) - (match.player2Points || 0))
        return `${isPlayer1Winner ? 'Player 1' : 'Player 2'} wins by ${vpDiff} VP`
      }

      case 'percentage':
        return match.marginOfVictory || 'Victory'

      case 'scenario': {
        const p1Objective = match.player1ObjectiveCompleted
        const p2Objective = match.player2ObjectiveCompleted
        if (p1Objective && !p2Objective) {
          return 'Player 1 completed objective'
        } else if (!p1Objective && p2Objective) {
          return 'Player 2 completed objective'
        } else {
          const casualties1 = match.player1Points || 0
          const casualties2 = match.player2Points || 0
          return `Victory by ${Math.abs(casualties1 - casualties2)} casualties`
        }
      }

      default:
        return 'Victory'
    }
  }

  /**
   * Check if match should show additional details
   * @param {Object} match - Match object
   * @returns {boolean} True if should show additional details
   */
  const shouldShowMatchDetails = (match) => {
    const matchType = getMatchType(match)
    return matchType === 'percentage' && match.marginOfVictory
  }

  /**
   * Get CSS class for match winner indicator
   * @param {Object} match - Match object
   * @param {number} playerId - Player ID to check
   * @returns {string} CSS classes
   */
  const getWinnerIndicatorClass = (match, playerId) => {
    if (!match.winnerId) return 'text-gray-500'
    return match.winnerId === playerId ? 'text-green-400' : 'text-red-400'
  }

  /**
   * Format match type for display
   * @param {string} matchType - Match type code
   * @returns {string} Human-readable match type
   */
  const formatMatchType = (matchType) => {
    switch (matchType) {
      case 'victory_points':
        return 'Victory Points'
      case 'percentage':
        return 'Casualties & Percentage'
      case 'scenario':
        return 'Scenario Objective'
      default:
        return 'Standard'
    }
  }

  /**
   * Get icon component name for match type
   * @param {string} matchType - Match type code
   * @returns {string} Icon component name
   */
  const getMatchTypeIcon = (matchType) => {
    switch (matchType) {
      case 'victory_points':
        return 'Trophy'
      case 'percentage':
        return 'Shield'
      case 'scenario':
        return 'Target'
      default:
        return 'Swords'
    }
  }

  /**
   * Check if match is close (game-specific logic)
   * @param {Object} match - Match object
   * @param {number} closeThreshold - Threshold for close game (optional)
   * @returns {boolean} True if close match
   */
  const isCloseMatch = (match, closeThreshold = 10) => {
    const matchType = getMatchType(match)

    switch (matchType) {
      case 'victory_points': {
        const vpDiff = Math.abs((match.player1Points || 0) - (match.player2Points || 0))
        return vpDiff <= closeThreshold
      }

      case 'percentage':
        return match.marginOfVictory && Math.abs(parseFloat(match.marginOfVictory.replace('%', ''))) < 5

      case 'scenario': {
        const p1Objective = match.player1ObjectiveCompleted
        const p2Objective = match.player2ObjectiveCompleted
        return (p1Objective && p2Objective) || (!p1Objective && !p2Objective)
      }

      default:
        return false
    }
  }

  /**
   * Check if match is decisive victory (game-specific logic)
   * @param {Object} match - Match object
   * @param {number} decisiveThreshold - Threshold for decisive victory (optional)
   * @returns {boolean} True if decisive victory
   */
  const isDecisiveMatch = (match, decisiveThreshold = 30) => {
    const matchType = getMatchType(match)

    switch (matchType) {
      case 'victory_points': {
        const vpDiff = Math.abs((match.player1Points || 0) - (match.player2Points || 0))
        return vpDiff >= decisiveThreshold
      }

      case 'percentage':
        return match.marginOfVictory && Math.abs(parseFloat(match.marginOfVictory.replace('%', ''))) >= 15

      case 'scenario': {
        const p1Objective = match.player1ObjectiveCompleted
        const p2Objective = match.player2ObjectiveCompleted
        const casualtyDiff = Math.abs((match.player1Points || 0) - (match.player2Points || 0))
        return (p1Objective !== p2Objective) && casualtyDiff >= 10
      }

      default:
        return false
    }
  }

  return {
    getMatchType,
    getPlayerScoreDisplay,
    getMatchResultDescription,
    shouldShowMatchDetails,
    getWinnerIndicatorClass,
    formatMatchType,
    getMatchTypeIcon,
    isCloseMatch,
    isDecisiveMatch
  }
}
