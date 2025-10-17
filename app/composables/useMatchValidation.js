import { computed } from 'vue'
import { useLeaguesStore } from '~/stores/leagues'

/**
 * useMatchValidation - Game-specific match validation and winner determination
 *
 * @param {Ref} matchData - Reactive match data object
 * @returns {Object} Validation functions and computed properties
 */
export function useMatchValidation(matchData) {
  const leaguesStore = useLeaguesStore()

  // Get game system configuration for this match
  const gameSystemConfig = computed(() => {
    if (!matchData.value.gameSystemId) return null

    const gameSystem = leaguesStore.gameSystems.find(
      gs => gs.id === matchData.value.gameSystemId
    )
    return gameSystem?.matchConfig || null
  })

  /**
   * Calculate The Old World margin of victory based on percentage of casualties inflicted
   * @param {number} p1Casualties - Player 1 casualties inflicted (points)
   * @param {number} p2Casualties - Player 2 casualties inflicted (points)
   * @param {number} p1ArmyValue - Player 1 total army value
   * @param {number} p2ArmyValue - Player 2 total army value
   * @returns {string|null} Margin of victory or null
   */
  const calculateTowMargin = (p1Casualties, p2Casualties, p1ArmyValue, p2ArmyValue) => {
    if (!p1ArmyValue || !p2ArmyValue) return null

    // Calculate percentage of enemy army destroyed
    const p1Percentage = (p1Casualties / p2ArmyValue) * 100
    const p2Percentage = (p2Casualties / p1ArmyValue) * 100
    const diff = Math.abs(p1Percentage - p2Percentage)

    // Determine margin based on percentage difference
    if (diff < 10) return 'Draw'
    if (diff < 25) return 'Minor Victory'
    if (diff < 50) return 'Major Victory'
    return 'Massacre'
  }

  /**
   * Validate match data based on game system requirements
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  const validateMatch = () => {
    const errors = []
    const config = gameSystemConfig.value

    if (!config) {
      errors.push('Game system configuration not found')
      return { isValid: false, errors }
    }

    // Common validation
    if (!matchData.value.player1Id || !matchData.value.player2Id) {
      errors.push('Both players must be selected')
    }

    if (matchData.value.player1Id === matchData.value.player2Id) {
      errors.push('Players must be different')
    }

    if (!matchData.value.mission) {
      errors.push('Mission must be selected')
    }

    // Game-specific validation based on match type
    switch (matchData.value.matchType || config.matchType) {
      case 'victory_points':
        if (matchData.value.player1Points === null || matchData.value.player1Points === undefined) {
          errors.push(`${config.pointsLabel} required for Player 1`)
        }
        if (matchData.value.player2Points === null || matchData.value.player2Points === undefined) {
          errors.push(`${config.pointsLabel} required for Player 2`)
        }

        // Validate points range if specified
        if (config.pointsRange) {
          if (matchData.value.player1Points < config.pointsRange.min || matchData.value.player1Points > config.pointsRange.max) {
            errors.push(`Player 1 points must be between ${config.pointsRange.min} and ${config.pointsRange.max}`)
          }
          if (matchData.value.player2Points < config.pointsRange.min || matchData.value.player2Points > config.pointsRange.max) {
            errors.push(`Player 2 points must be between ${config.pointsRange.min} and ${config.pointsRange.max}`)
          }
        }
        break

      case 'percentage':
        if (!matchData.value.player1ArmyValue || !matchData.value.player2ArmyValue) {
          errors.push('Army values required for both players')
        }
        if (matchData.value.player1CasualtiesValue === null || matchData.value.player1CasualtiesValue === undefined) {
          errors.push('Casualties inflicted required for Player 1')
        }
        if (matchData.value.player2CasualtiesValue === null || matchData.value.player2CasualtiesValue === undefined) {
          errors.push('Casualties inflicted required for Player 2')
        }

        // Validate casualties don't exceed enemy army value
        if (matchData.value.player1CasualtiesValue > matchData.value.player2ArmyValue) {
          errors.push('Player 1 casualties cannot exceed Player 2 army value')
        }
        if (matchData.value.player2CasualtiesValue > matchData.value.player1ArmyValue) {
          errors.push('Player 2 casualties cannot exceed Player 1 army value')
        }
        break

      case 'scenario':
        if (config.objectiveRequired && !matchData.value.scenarioObjective) {
          errors.push('Scenario objective description required')
        }
        if (matchData.value.player1ObjectiveCompleted === null || matchData.value.player1ObjectiveCompleted === undefined) {
          errors.push('Objective completion status required for Player 1')
        }
        if (matchData.value.player2ObjectiveCompleted === null || matchData.value.player2ObjectiveCompleted === undefined) {
          errors.push('Objective completion status required for Player 2')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Determine the winner based on match type and game rules
   * @returns {number|null} Winner player ID or null for draw
   */
  const determineWinner = () => {
    const config = gameSystemConfig.value
    if (!config) return null

    const matchType = matchData.value.matchType || config.matchType

    switch (matchType) {
      case 'victory_points':
        if (matchData.value.player1Points > matchData.value.player2Points) {
          return matchData.value.player1Id
        }
        if (matchData.value.player2Points > matchData.value.player1Points) {
          return matchData.value.player2Id
        }
        return null // Draw

      case 'percentage': {
        const margin = calculateTowMargin(
          matchData.value.player1CasualtiesValue,
          matchData.value.player2CasualtiesValue,
          matchData.value.player1ArmyValue,
          matchData.value.player2ArmyValue
        )

        if (margin === 'Draw') return null

        // Calculate who inflicted more casualties as percentage of enemy army
        const p1Percentage = (matchData.value.player1CasualtiesValue / matchData.value.player2ArmyValue) * 100
        const p2Percentage = (matchData.value.player2CasualtiesValue / matchData.value.player1ArmyValue) * 100

        return p1Percentage > p2Percentage ? matchData.value.player1Id : matchData.value.player2Id
      }

      case 'scenario': {
        const p1Completed = matchData.value.player1ObjectiveCompleted
        const p2Completed = matchData.value.player2ObjectiveCompleted

        // If one player completed and the other didn't, they win
        if (p1Completed && !p2Completed) {
          return matchData.value.player1Id
        }
        if (p2Completed && !p1Completed) {
          return matchData.value.player2Id
        }

        // If both or neither completed, use casualties as tiebreaker
        if (matchData.value.player1Points > matchData.value.player2Points) {
          return matchData.value.player1Id
        }
        if (matchData.value.player2Points > matchData.value.player1Points) {
          return matchData.value.player2Id
        }

        return null // Draw
      }

      default:
        return null
    }
  }

  /**
   * Get human-readable match result description
   * @returns {string} Match result description
   */
  const getMatchResultDescription = () => {
    const winnerId = determineWinner()
    const config = gameSystemConfig.value

    if (!winnerId) return 'Draw'

    const matchType = matchData.value.matchType || config?.matchType

    if (matchType === 'percentage') {
      const margin = calculateTowMargin(
        matchData.value.player1CasualtiesValue,
        matchData.value.player2CasualtiesValue,
        matchData.value.player1ArmyValue,
        matchData.value.player2ArmyValue
      )
      return `${margin} (Player ${winnerId === matchData.value.player1Id ? '1' : '2'})`
    }

    if (matchType === 'scenario') {
      return winnerId === matchData.value.player1Id ? 'Player 1 Victory' : 'Player 2 Victory'
    }

    return winnerId === matchData.value.player1Id ? 'Player 1 Victory' : 'Player 2 Victory'
  }

  return {
    gameSystemConfig,
    validateMatch,
    determineWinner,
    calculateTowMargin,
    getMatchResultDescription
  }
}
