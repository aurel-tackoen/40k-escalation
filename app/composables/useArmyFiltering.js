import { ref, computed } from 'vue'

/**
 * Army list filtering and sorting utilities
 * Handles player and phase filters with advanced sorting
 *
 * @param {Ref} armies - Reactive reference to armies array
 * @param {Function} sortByField - Sort function from useArrayFiltering
 * @param {Function} filterByMultipleCriteria - Filter function from useArrayFiltering
 * @returns {Object} Filtering utilities
 */
export function useArmyFiltering(armies, sortByField, filterByMultipleCriteria) {
  const selectedPhase = ref('')
  const selectedPlayer = ref('')

  /**
   * Get filtered and sorted armies based on current filters
   * Filters by phase and player, then sorts by phase (desc) and lastModified (desc)
   * @returns {Array} Filtered and sorted armies
   */
  const filteredArmies = computed(() => {
    let filtered = armies.value

    // Build filter criteria
    const filters = {}
    if (selectedPhase.value) filters.phase = selectedPhase.value
    if (selectedPlayer.value) filters.playerId = selectedPlayer.value

    // Apply filters if any exist
    if (Object.keys(filters).length > 0) {
      filtered = filterByMultipleCriteria(filtered, filters)
    }

    // Sort by phase (desc) then lastModified (desc)
    return sortByField(
      sortByField(filtered, 'lastModified', 'desc'),
      'phase',
      'desc'
    )
  })

  /**
   * Get count of armies for a specific phase
   * @param {number} phaseNumber - Phase number to count
   * @returns {number} Count of armies in that phase
   */
  const getArmyCountForPhase = (phaseNumber) => {
    return armies.value.filter(a => a.phase === phaseNumber).length
  }

  /**
   * Reset all filters to default state
   */
  const resetFilters = () => {
    selectedPhase.value = ''
    selectedPlayer.value = ''
  }

  /**
   * Set phase filter
   * @param {number|string} phase - Phase number to filter by
   */
  const setPhaseFilter = (phase) => {
    selectedPhase.value = phase
  }

  /**
   * Set player filter
   * @param {number|string} playerId - Player ID to filter by
   */
  const setPlayerFilter = (playerId) => {
    selectedPlayer.value = playerId
  }

  /**
   * Check if any filters are active
   * @returns {boolean} True if any filter is set
   */
  const hasActiveFilters = computed(() => {
    return selectedPhase.value !== '' || selectedPlayer.value !== ''
  })

  return {
    // State
    selectedPhase,
    selectedPlayer,

    // Computed
    filteredArmies,
    hasActiveFilters,

    // Methods
    getArmyCountForPhase,
    resetFilters,
    setPhaseFilter,
    setPlayerFilter
  }
}
