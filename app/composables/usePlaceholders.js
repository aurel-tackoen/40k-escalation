import { computed } from 'vue'
import { getPlaceholders, genericPlaceholders } from '~/data/placeholders'

/**
 * Composable: usePlaceholders
 *
 * Provides game-system-specific placeholder text for forms and inputs.
 * Automatically adapts placeholders based on the current game system.
 *
 * @param {Ref|ComputedRef} gameSystem - The game system object (must have shortName property)
 * @returns {Object} Object containing all placeholder texts
 *
 * @example
 * const { placeholders } = usePlaceholders(selectedGameSystem)
 * // Use in template: :placeholder="placeholders.armyName"
 */
export function usePlaceholders(gameSystem) {
  // Compute placeholders based on game system
  const placeholders = computed(() => {
    const system = gameSystem?.value
    if (!system || !system.shortName) {
      return genericPlaceholders
    }
    return getPlaceholders(system.shortName)
  })

  return {
    placeholders
  }
}
