import { ref, computed } from 'vue'

/**
 * Composable for array filtering and searching utilities
 * Provides reusable functions for filtering, searching, and sorting arrays
 */
export function useArrayFiltering(items) {
  const searchQuery = ref('')
  const sortBy = ref('')
  const sortOrder = ref('asc')
  const filters = ref({})

  /**
   * Filter array by search query
   * @param {Array} array - Array to search
   * @param {string} query - Search query
   * @param {Array<string>} fields - Fields to search in
   * @returns {Array} Filtered array
   */
  const searchInFields = (array, query, fields) => {
    if (!query || !array) return array

    const lowerQuery = query.toLowerCase()
    return array.filter(item => {
      return fields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(lowerQuery)
      })
    })
  }

  /**
   * Sort array by field
   * @param {Array} array - Array to sort
   * @param {string} field - Field to sort by
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  const sortByField = (array, field, order = 'asc') => {
    if (!array || !field) return array

    return [...array].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      // Handle null/undefined
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // Compare values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return order === 'asc' ? comparison : -comparison
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return order === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Filter array by multiple criteria
   * @param {Array} array - Array to filter
   * @param {Object} filterCriteria - Object with field names and values
   * @returns {Array} Filtered array
   */
  const filterByMultipleCriteria = (array, filterCriteria) => {
    if (!array || !filterCriteria || Object.keys(filterCriteria).length === 0) {
      return array
    }

    return array.filter(item => {
      return Object.entries(filterCriteria).every(([field, value]) => {
        // Skip empty/null filter values
        if (value === '' || value === null || value === undefined) return true

        return item[field] === value
      })
    })
  }

  /**
   * Get unique values for a field
   * @param {Array} array - Source array
   * @param {string} field - Field name
   * @returns {Array} Array of unique values
   */
  const getUniqueValues = (array, field) => {
    if (!array || !field) return []

    const values = array.map(item => item[field]).filter(val => val !== null && val !== undefined)
    return [...new Set(values)]
  }

  /**
   * Paginate array
   * @param {Array} array - Array to paginate
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Items per page
   * @returns {Object} Object with items, totalPages, currentPage
   */
  const paginate = (array, page = 1, pageSize = 10) => {
    if (!array) return { items: [], totalPages: 0, currentPage: 1 }

    const totalPages = Math.ceil(array.length / pageSize)
    const currentPage = Math.max(1, Math.min(page, totalPages))
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: array.slice(startIndex, endIndex),
      totalPages,
      currentPage,
      totalItems: array.length
    }
  }

  /**
   * Filter array by date range
   * @param {Array} array - Array to filter
   * @param {string} dateField - Field name containing date
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Array} Filtered array
   */
  const filterByDateRange = (array, dateField, startDate, endDate) => {
    if (!array || !dateField) return array

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    return array.filter(item => {
      const itemDate = new Date(item[dateField])
      if (isNaN(itemDate.getTime())) return false

      if (start && itemDate < start) return false
      if (end && itemDate > end) return false

      return true
    })
  }

  /**
   * Group array by field
   * @param {Array} array - Array to group
   * @param {string} field - Field to group by
   * @returns {Object} Object with grouped items
   */
  const groupBy = (array, field) => {
    if (!array || !field) return {}

    return array.reduce((groups, item) => {
      const key = item[field]
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {})
  }

  /**
   * Set search query
   * @param {string} query - Search query
   */
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  /**
   * Set sort configuration
   * @param {string} field - Field to sort by
   * @param {string} order - Sort order ('asc' or 'desc')
   */
  const setSorting = (field, order = 'asc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  /**
   * Set filter value
   * @param {string} field - Filter field name
   * @param {any} value - Filter value
   */
  const setFilter = (field, value) => {
    filters.value[field] = value
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {}
    searchQuery.value = ''
    sortBy.value = ''
    sortOrder.value = 'asc'
  }

  /**
   * Get filtered and sorted items (computed)
   */
  const filteredItems = computed(() => {
    let result = items.value || []

    // Apply filters
    if (Object.keys(filters.value).length > 0) {
      result = filterByMultipleCriteria(result, filters.value)
    }

    // Apply sorting
    if (sortBy.value) {
      result = sortByField(result, sortBy.value, sortOrder.value)
    }

    return result
  })

  return {
    searchQuery,
    sortBy,
    sortOrder,
    filters,
    searchInFields,
    sortByField,
    filterByMultipleCriteria,
    getUniqueValues,
    paginate,
    filterByDateRange,
    groupBy,
    setSearchQuery,
    setSorting,
    setFilter,
    clearFilters,
    filteredItems
  }
}
