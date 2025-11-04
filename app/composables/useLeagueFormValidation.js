/**
 * Composable for league form validation
 * Provides validation functions for league creation and editing forms
 */
export function useLeagueFormValidation() {
  /**
   * Validate league name
   * @param {string} name - League name
   * @returns {Object} Validation result { isValid, error }
   */
  const validateName = (name) => {
    if (!name || !name.trim()) {
      return {
        isValid: false,
        error: 'League name is required'
      }
    }
    if (name.trim().length < 3) {
      return {
        isValid: false,
        error: 'League name must be at least 3 characters'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate game system selection
   * @param {number|string} gameSystemId - Game system ID
   * @returns {Object} Validation result { isValid, error }
   */
  const validateGameSystem = (gameSystemId) => {
    if (!gameSystemId) {
      return {
        isValid: false,
        error: 'Game system selection is required'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate start date
   * @param {string} startDate - Start date in ISO format
   * @returns {Object} Validation result { isValid, error }
   */
  const validateStartDate = (startDate) => {
    if (!startDate) {
      return {
        isValid: false,
        error: 'Start date is required'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date (optional)
   * @returns {Object} Validation result { isValid, error }
   */
  const validateDateRange = (startDate, endDate) => {
    if (endDate && startDate > endDate) {
      return {
        isValid: false,
        error: 'End date must be after start date'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate max players
   * @param {number} maxPlayers - Maximum players (optional)
   * @returns {Object} Validation result { isValid, error }
   */
  const validateMaxPlayers = (maxPlayers) => {
    if (maxPlayers !== null && maxPlayers !== undefined && maxPlayers !== '') {
      if (maxPlayers < 2) {
        return {
          isValid: false,
          error: 'Maximum players must be at least 2'
        }
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate complete league form
   * @param {Object} formData - League form data
   * @returns {Object} Validation result { isValid, errors }
   */
  const validateLeagueForm = (formData) => {
    const errors = []

    // Validate name
    const nameValidation = validateName(formData.name)
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error)
    }

    // Validate game system
    const gameSystemValidation = validateGameSystem(formData.gameSystemId)
    if (!gameSystemValidation.isValid) {
      errors.push(gameSystemValidation.error)
    }

    // Validate start date
    const startDateValidation = validateStartDate(formData.startDate)
    if (!startDateValidation.isValid) {
      errors.push(startDateValidation.error)
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const dateRangeValidation = validateDateRange(formData.startDate, formData.endDate)
      if (!dateRangeValidation.isValid) {
        errors.push(dateRangeValidation.error)
      }
    }

    // Validate max players
    const maxPlayersValidation = validateMaxPlayers(formData.maxPlayers)
    if (!maxPlayersValidation.isValid) {
      errors.push(maxPlayersValidation.error)
    }

    // Validate rounds exist
    if (!formData.rounds || formData.rounds.length === 0) {
      errors.push('At least one round is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate league description (optional but with constraints)
   * @param {string} description - League description
   * @returns {Object} Validation result { isValid, error }
   */
  const validateDescription = (description) => {
    if (description && description.length > 1000) {
      return {
        isValid: false,
        error: 'Description must be less than 1000 characters'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Validate league rules (optional but with constraints)
   * @param {string} rules - League rules
   * @returns {Object} Validation result { isValid, error }
   */
  const validateRules = (rules) => {
    if (rules && rules.length > 10000) {
      return {
        isValid: false,
        error: 'Rules must be less than 10000 characters'
      }
    }
    return { isValid: true, error: null }
  }

  /**
   * Check if form has required fields filled
   * @param {Object} formData - League form data
   * @returns {boolean} True if required fields are filled
   */
  const hasRequiredFields = (formData) => {
    return !!(
      formData.name &&
      formData.name.trim() &&
      formData.gameSystemId &&
      formData.startDate
    )
  }

  /**
   * Get first validation error from form
   * @param {Object} formData - League form data
   * @returns {string|null} First error message or null
   */
  const getFirstError = (formData) => {
    const validation = validateLeagueForm(formData)
    return validation.errors.length > 0 ? validation.errors[0] : null
  }

  return {
    validateName,
    validateGameSystem,
    validateStartDate,
    validateDateRange,
    validateMaxPlayers,
    validateDescription,
    validateRules,
    validateLeagueForm,
    hasRequiredFields,
    getFirstError
  }
}
