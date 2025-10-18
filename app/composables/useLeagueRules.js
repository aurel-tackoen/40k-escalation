/**
 * League Rules Composable
 * Utilities for generating and managing game-specific league rules
 */

import { computed } from 'vue'
import { generateLeagueRules } from '~/data/default-rules'

/**
 * Composable for managing league rules based on game system
 * @param {Object} gameSystem - Reactive game system object
 * @returns {Object} Rules utilities
 */
export function useLeagueRules(gameSystem) {
  /**
   * Generate complete rules for the current game system
   */
  const generatedRules = computed(() => {
    if (!gameSystem?.value) {
      return null
    }

    try {
      return generateLeagueRules(gameSystem.value)
    } catch (error) {
      console.error('Failed to generate league rules:', error)
      return null
    }
  })

  /**
   * Get rules summary (first few sections for preview)
   */
  const rulesSummary = computed(() => {
    const rules = generatedRules.value
    if (!rules) return null

    // Extract up to "Army Building" section for preview
    const sections = rules.split('## ')
    return sections.slice(0, 3).join('## ')
  })

  /**
   * Get scoring section only
   */
  const scoringRules = computed(() => {
    const rules = generatedRules.value
    if (!rules) return null

    const match = rules.match(/## Scoring System([\s\S]*?)---\n\n## /)
    return match ? `## Scoring System${match[1]}---` : null
  })

  /**
   * Get army building section only
   */
  const armyBuildingRules = computed(() => {
    const rules = generatedRules.value
    if (!rules) return null

    const match = rules.match(/## Army Building([\s\S]*?)---\n\n## /)
    return match ? `## Army Building${match[1]}---` : null
  })

  /**
   * Get match requirements section only
   */
  const matchRequirementsRules = computed(() => {
    const rules = generatedRules.value
    if (!rules) return null

    const match = rules.match(/## Match Requirements([\s\S]*?)---\n\n## /)
    return match ? `## Match Requirements${match[1]}---` : null
  })

  /**
   * Check if rules are available
   */
  const hasRules = computed(() => {
    return generatedRules.value !== null
  })

  /**
   * Get match type label
   */
  const matchTypeLabel = computed(() => {
    if (!gameSystem?.value?.matchType) return 'Unknown'

    const labels = {
      victory_points: 'Victory Points',
      percentage: 'Percentage/Casualties',
      scenario: 'Scenario Objectives'
    }

    return labels[gameSystem.value.matchType] || 'Unknown'
  })

  /**
   * Get league points system description
   */
  const leaguePointsSystem = computed(() => {
    if (!gameSystem?.value?.matchType) return null

    const { matchType } = gameSystem.value

    if (matchType === 'percentage') {
      return {
        massacre: 5,
        majorVictory: 4,
        minorVictory: 3,
        draw: 1,
        loss: 0
      }
    }

    // victory_points and scenario use standard system
    return {
      win: 3,
      draw: 1,
      loss: 0
    }
  })

  return {
    // Complete rules
    generatedRules,

    // Rule sections
    rulesSummary,
    scoringRules,
    armyBuildingRules,
    matchRequirementsRules,

    // Utilities
    hasRules,
    matchTypeLabel,
    leaguePointsSystem
  }
}
