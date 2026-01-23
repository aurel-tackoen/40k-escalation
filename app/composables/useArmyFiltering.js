import { ref, computed } from 'vue'

/**
 * Army list filtering and sorting utilities
 * Handles player and stage filters with advanced sorting
 *
 * @param {Ref} armies - Reactive reference to armies array
 * @param {Function} sortByField - Sort function from useArrayFiltering
 * @param {Function} filterByMultipleCriteria - Filter function from useArrayFiltering
 * @returns {Object} Filtering utilities
 */
export function useArmyFiltering(armies, sortByField, filterByMultipleCriteria) {
  const selectedStage = ref('')
  const selectedPlayer = ref('')

  /**
   * Get filtered and sorted armies based on current filters
   * Filters by stage and player, then sorts by stage (desc) and lastModified (desc)
   * @returns {Array} Filtered and sorted armies
   */
  const filteredArmies = computed(() => {
    let filtered = armies.value

    // Build filter criteria
    const filters = {}
    if (selectedStage.value) filters.stage = selectedStage.value
    if (selectedPlayer.value) filters.playerId = selectedPlayer.value

    // Apply filters if any exist
    if (Object.keys(filters).length > 0) {
      filtered = filterByMultipleCriteria(filtered, filters)
    }

    // Sort by stage (desc) then lastModified (desc)
    return sortByField(
      sortByField(filtered, 'lastModified', 'desc'),
      'stage',
      'desc'
    )
  })

  /**
   * Get count of armies for a specific stage
   * @param {number} stageNumber - Stage number to count
   * @returns {number} Count of armies in that stage
   */
  const getArmyCountForStage = (stageNumber) => {
    return armies.value.filter(a => a.stage === stageNumber).length
  }

  /**
   * Reset all filters to default state
   */
  const resetFilters = () => {
    selectedStage.value = ''
    selectedPlayer.value = ''
  }

  /**
   * Set stage filter
   * @param {number|string} stage - Stage number to filter by
   */
  const setStageFilter = (stage) => {
    selectedStage.value = stage
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
    return selectedStage.value !== '' || selectedPlayer.value !== ''
  })

  return {
    // State
    selectedStage,
    selectedPlayer,

    // Computed
    filteredArmies,
    hasActiveFilters,

    // Methods
    getArmyCountForStage,
    resetFilters,
    setStageFilter,
    setPlayerFilter
  }
}
