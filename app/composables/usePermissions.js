/**
 * Composable for permission checking utilities
 * Provides reusable functions for checking user permissions in league contexts
 */
export function usePermissions(currentPlayer, canManageLeague, isLeagueOwner) {
  /**
   * Check if user can modify a specific army
   * @param {Object} army - Army object with playerId
   * @returns {boolean} True if user can modify this army
   */
  const canModifyArmy = (army) => {
    // Organizers can modify any army
    if (canManageLeague?.value) {
      return true
    }
    // Regular users can only modify their own armies
    return currentPlayer?.value && army.playerId === currentPlayer.value.id
  }

  /**
   * Check if user can delete a specific match
   * @param {Object} match - Match object with player1Id and player2Id
   * @returns {boolean} True if user can delete this match
   */
  const canDeleteMatch = (match) => {
    // Organizers can delete any match
    if (canManageLeague?.value) {
      return true
    }
    // Participants can delete their own matches
    if (currentPlayer?.value) {
      return match.player1Id === currentPlayer.value.id || match.player2Id === currentPlayer.value.id
    }
    return false
  }

  /**
   * Check if user can remove a specific player
   * @param {Object} player - Player object with userId and membershipStatus
   * @param {Object} user - Current authenticated user
   * @returns {boolean} True if user can remove this player
   */
  const canRemovePlayer = (player, user) => {
    if (!user) return false
    if (player.membershipStatus === 'inactive') return false // Already inactive

    const isSelf = player.userId === user.id

    // Owner cannot remove themselves (must transfer ownership first)
    if (isLeagueOwner?.value && isSelf) return false

    // Owner can remove anyone else, regular user can only remove themselves
    return isLeagueOwner?.value || isSelf
  }

  /**
   * Check if user can edit league settings
   * @returns {boolean} True if user can edit league
   */
  const canEditLeague = () => {
    return canManageLeague?.value || false
  }

  /**
   * Check if user can delete league
   * @returns {boolean} True if user can delete league
   */
  const canDeleteLeague = () => {
    return isLeagueOwner?.value || false
  }

  /**
   * Check if user can manage league members
   * @returns {boolean} True if user can manage members
   */
  const canManageMembers = () => {
    return canManageLeague?.value || false
  }

  /**
   * Check if user can create content for another player
   * @param {number|string} playerId - Target player ID
   * @returns {boolean} True if user can create content for this player
   */
  const canCreateForPlayer = (playerId) => {
    // Organizers can create for any player
    if (canManageLeague?.value) {
      return true
    }
    // Regular users can only create for themselves
    return currentPlayer?.value && playerId === currentPlayer.value.id
  }

  /**
   * Check if user is a participant in a match
   * @param {Object} match - Match object with player1Id and player2Id
   * @returns {boolean} True if user is a participant
   */
  const isMatchParticipant = (match) => {
    if (!currentPlayer?.value) return false
    return match.player1Id === currentPlayer.value.id || match.player2Id === currentPlayer.value.id
  }

  /**
   * Check if user owns a specific army
   * @param {Object} army - Army object with playerId
   * @returns {boolean} True if user owns this army
   */
  const isArmyOwner = (army) => {
    return currentPlayer?.value && army.playerId === currentPlayer.value.id
  }

  return {
    canModifyArmy,
    canDeleteMatch,
    canRemovePlayer,
    canEditLeague,
    canDeleteLeague,
    canManageMembers,
    canCreateForPlayer,
    isMatchParticipant,
    isArmyOwner
  }
}
