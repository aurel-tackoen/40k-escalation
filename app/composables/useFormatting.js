/**
 * Composable for formatting utilities (dates, numbers, etc.)
 * Provides consistent formatting across the application
 */
export function useFormatting() {
  /**
   * Format a date string with customizable options
   * @param {string} dateString - ISO date string
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString, options = {}) => {
    const defaultOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options })
  }

  /**
   * Format a date without the year (short format)
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string (e.g., "Oct 15")
   */
  const formatDateShort = (dateString) => {
    return formatDate(dateString, { year: undefined })
  }

  /**
   * Format a date with full details
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string (e.g., "October 15, 2025")
   */
  const formatDateLong = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  /**
   * Format points value
   * @param {number} points - Point value
   * @returns {string} Formatted points (e.g., "500pts")
   */
  const formatPoints = (points) => {
    return `${points}pts`
  }

  /**
   * Format a percentage value
   * @param {number} value - Percentage value (0-100)
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage (e.g., "75.5%")
   */
  const formatPercentage = (value, decimals = 0) => {
    return `${value.toFixed(decimals)}%`
  }

  /**
   * Format a win/loss/draw record
   * @param {number} wins - Number of wins
   * @param {number} losses - Number of losses
   * @param {number} draws - Number of draws
   * @returns {string} Formatted record (e.g., "5W - 2L - 1D")
   */
  const formatRecord = (wins, losses, draws) => {
    return `${wins}W - ${losses}L - ${draws}D`
  }

  /**
   * Format a number with commas
   * @param {number} number - Number to format
   * @returns {string} Formatted number (e.g., "1,000")
   */
  const formatNumber = (number) => {
    return number.toLocaleString('en-US')
  }

  /**
   * Format a score comparison
   * @param {number} score1 - First score
   * @param {number} score2 - Second score
   * @returns {string} Formatted score (e.g., "25 - 18")
   */
  const formatScore = (score1, score2) => {
    return `${score1} - ${score2}`
  }

  /**
   * Format date for HTML date input (yyyy-MM-dd)
   * Converts any date format to the format required by HTML5 date inputs
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string (yyyy-MM-dd)
   */
  const formatDateForInput = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  /**
   * Normalize all dates in a league object for date inputs
   * Converts ISO timestamps to yyyy-MM-dd format
   * @param {Object} league - League object with date fields
   * @returns {Object} League object with normalized dates
   */
  const normalizeDates = (league) => {
    const normalized = JSON.parse(JSON.stringify(league))
    if (normalized.startDate) {
      normalized.startDate = formatDateForInput(normalized.startDate)
    }
    if (normalized.endDate) {
      normalized.endDate = formatDateForInput(normalized.endDate)
    }
    if (normalized.rounds) {
      normalized.rounds = normalized.rounds.map(round => ({
        ...round,
        startDate: formatDateForInput(round.startDate),
        endDate: formatDateForInput(round.endDate)
      }))
    }
    return normalized
  }

  return {
    formatDate,
    formatDateShort,
    formatDateLong,
    formatPoints,
    formatPercentage,
    formatRecord,
    formatNumber,
    formatScore,
    formatDateForInput,
    normalizeDates
  }
}
