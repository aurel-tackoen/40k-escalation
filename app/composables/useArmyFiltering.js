import { ref, computed } from 'vue'

/**
 * Army list filtering and sorting utilities
 * Handles player and round filters with advanced sorting
 *
 * @param {Ref} armies - Reactive reference to armies array
 * @param {Function} sortByField - Sort function from useArrayFiltering
 * @param {Function} filterByMultipleCriteria - Filter function from useArrayFiltering
 * @returns {Object} Filtering utilities
 */
export function useArmyFiltering(armies, sortByField, filterByMultipleCriteria) {
  const selectedRound = ref('')
  const selectedPlayer = ref('')

  /**
   * Get filtered and sorted armies based on current filters
   * Filters by round and player, then sorts by round (desc) and lastModified (desc)
   * @returns {Array} Filtered and sorted armies
   */
  const filteredArmies = computed(() => {
    let filtered = armies.value

    // Build filter criteria
    const filters = {}
    if (selectedRound.value) filters.round = selectedRound.value
    if (selectedPlayer.value) filters.playerId = selectedPlayer.value

    // Apply filters if any exist
    if (Object.keys(filters).length > 0) {
      filtered = filterByMultipleCriteria(filtered, filters)
    }

    // Sort by round (desc) then lastModified (desc)
    return sortByField(
      sortByField(filtered, 'lastModified', 'desc'),
      'round',
      'desc'
    )
  })

  /**
   * Get count of armies for a specific round
   * @param {number} roundNumber - Round number to count
   * @returns {number} Count of armies in that round
   */
  const getArmyCountForRound = (roundNumber) => {
    return armies.value.filter(a => a.round === roundNumber).length
  }

  /**
   * Reset all filters to default state
   */
  const resetFilters = () => {
    selectedRound.value = ''
    selectedPlayer.value = ''
  }

  /**
   * Set round filter
   * @param {number|string} round - Round number to filter by
   */
  const setRoundFilter = (round) => {
    selectedRound.value = round
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
    return selectedRound.value !== '' || selectedPlayer.value !== ''
  })

  return {
    // State
    selectedRound,
    selectedPlayer,

    // Computed
    filteredArmies,
    hasActiveFilters,

    // Methods
    getArmyCountForRound,
    resetFilters,
    setRoundFilter,
    setPlayerFilter
  }
}
