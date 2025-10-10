import { ref } from 'vue'

/**
 * Composable for form state management
 * Provides reusable functions for form handling and validation
 */
export function useFormManagement(initialState = {}) {
  const formData = ref({ ...initialState })
  const errors = ref({})
  const isDirty = ref(false)
  const isSubmitting = ref(false)

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    formData.value = { ...initialState }
    errors.value = {}
    isDirty.value = false
    isSubmitting.value = false
  }

  /**
   * Update a single form field
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const updateField = (field, value) => {
    formData.value[field] = value
    isDirty.value = true
    // Clear error for this field when updated
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  /**
   * Set multiple form fields at once
   * @param {Object} data - Object with field names and values
   */
  const setFormData = (data) => {
    formData.value = { ...formData.value, ...data }
    isDirty.value = true
  }

  /**
   * Check if form has any validation errors
   * @returns {boolean} True if form has errors
   */
  const hasErrors = () => {
    return Object.keys(errors.value).length > 0
  }

  /**
   * Set validation error for a field
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setError = (field, message) => {
    errors.value[field] = message
  }

  /**
   * Clear validation error for a field
   * @param {string} field - Field name
   */
  const clearError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  /**
   * Clear all validation errors
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * Validate a required field
   * @param {string} field - Field name
   * @param {string} message - Error message
   * @returns {boolean} True if valid
   */
  const validateRequired = (field, message = 'This field is required') => {
    const value = formData.value[field]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      setError(field, message)
      return false
    }
    clearError(field)
    return true
  }

  /**
   * Check if form is valid (no errors and all required fields filled)
   * @param {Array<string>} requiredFields - List of required field names
   * @returns {boolean} True if form is valid
   */
  const isFormValid = (requiredFields = []) => {
    let valid = true
    requiredFields.forEach(field => {
      if (!validateRequired(field)) {
        valid = false
      }
    })
    return valid && !hasErrors()
  }

  return {
    formData,
    errors,
    isDirty,
    isSubmitting,
    resetForm,
    updateField,
    setFormData,
    hasErrors,
    setError,
    clearError,
    clearErrors,
    validateRequired,
    isFormValid
  }
}
