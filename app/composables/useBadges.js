/**
 * Composable for badge styling utilities
 * Provides reusable functions for consistent badge styling across components
 */
export function useBadges() {
  /**
   * Get CSS classes for role badges
   * @param {string} role - User role (owner, organizer, player, etc.)
   * @returns {string} CSS classes for the role badge
   */
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-600 text-yellow-100'
      case 'organizer':
        return 'bg-blue-600 text-blue-100'
      case 'player':
        return 'bg-gray-600 text-gray-100'
      default:
        return 'bg-gray-600 text-gray-100'
    }
  }

  /**
   * Get CSS classes for status badges
   * @param {string} status - Status (active, completed, pending, etc.)
   * @returns {string} CSS classes for the status badge
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-400 border border-green-600/40'
      case 'completed':
        return 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40'
      case 'inactive':
        return 'bg-gray-600/20 text-gray-400 border border-gray-600/40'
      default:
        return 'bg-gray-600/20 text-gray-400 border border-gray-600/40'
    }
  }

  /**
   * Get CSS classes for priority badges
   * @param {string} priority - Priority level (high, medium, low)
   * @returns {string} CSS classes for the priority badge
   */
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600/20 text-red-400 border border-red-600/40'
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40'
      case 'low':
        return 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
      default:
        return 'bg-gray-600/20 text-gray-400 border border-gray-600/40'
    }
  }

  /**
   * Get display text for role
   * @param {string} role - User role
   * @returns {string} Display text for the role
   */
  const getRoleDisplayText = (role) => {
    if (!role) return 'Member'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  /**
   * Get display text for status
   * @param {string} status - Status
   * @returns {string} Display text for the status
   */
  const getStatusDisplayText = (status) => {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return {
    getRoleBadgeClass,
    getStatusBadgeClass,
    getPriorityBadgeClass,
    getRoleDisplayText,
    getStatusDisplayText
  }
}
