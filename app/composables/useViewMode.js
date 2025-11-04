import { ref } from 'vue'

/**
 * Composable for view mode management
 * Provides reusable state and functions for toggling between different view modes
 */
export function useViewMode(initialMode = 'cards') {
  /**
   * Current view mode
   * @type {Ref<string>}
   */
  const viewMode = ref(initialMode)

  /**
   * Set view mode
   * @param {string} mode - View mode to set (e.g., 'cards', 'table', 'list')
   */
  const setViewMode = (mode) => {
    viewMode.value = mode
  }

  /**
   * Toggle between two view modes
   * @param {string} mode1 - First mode
   * @param {string} mode2 - Second mode
   */
  const toggleViewMode = (mode1 = 'cards', mode2 = 'table') => {
    viewMode.value = viewMode.value === mode1 ? mode2 : mode1
  }

  /**
   * Check if current view mode matches
   * @param {string} mode - Mode to check
   * @returns {boolean} True if current mode matches
   */
  const isViewMode = (mode) => {
    return viewMode.value === mode
  }

  /**
   * Check if current view mode is cards
   * @returns {boolean} True if cards view
   */
  const isCardsView = () => {
    return viewMode.value === 'cards'
  }

  /**
   * Check if current view mode is table
   * @returns {boolean} True if table view
   */
  const isTableView = () => {
    return viewMode.value === 'table'
  }

  /**
   * Check if current view mode is list
   * @returns {boolean} True if list view
   */
  const isListView = () => {
    return viewMode.value === 'list'
  }

  /**
   * Get icon name for current view mode
   * @returns {string} Icon name for the current mode
   */
  const getViewModeIcon = () => {
    switch (viewMode.value) {
      case 'cards':
        return 'LayoutGrid'
      case 'table':
        return 'TableProperties'
      case 'list':
        return 'List'
      default:
        return 'LayoutGrid'
    }
  }

  /**
   * Get display text for current view mode
   * @returns {string} Display text for the current mode
   */
  const getViewModeText = () => {
    switch (viewMode.value) {
      case 'cards':
        return 'Cards View'
      case 'table':
        return 'Table View'
      case 'list':
        return 'List View'
      default:
        return 'View'
    }
  }

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isViewMode,
    isCardsView,
    isTableView,
    isListView,
    getViewModeIcon,
    getViewModeText
  }
}
