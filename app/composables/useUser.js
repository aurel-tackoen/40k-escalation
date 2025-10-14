import { ref } from 'vue'

/**
 * useUser - User profile management composable
 * Handles fetching and updating user profile data
 */
export function useUser() {
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch user profile with linked players
   */
  const fetchUserProfile = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.success) {
        profile.value = response.data
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile
   * @param {Object} data - Profile data to update { name, picture }
   */
  const updateUserProfile = async (data) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/users/me', {
        method: 'PUT',
        body: data,
        credentials: 'include'
      })

      if (response.success) {
        // Update profile with new data
        if (profile.value) {
          profile.value.user = response.data
        }
        return response.data
      }
    } catch (err) {
      console.error('Failed to update user profile:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Link a player to the current user
   * @param {number} playerId - Player ID to link
   */
  const linkPlayerToUser = async (playerId) => {
    // TODO: Implement when we add player linking endpoint
    console.log('Link player to user:', playerId)
  }

  /**
   * Get all players linked to the current user
   */
  const getLinkedPlayers = () => {
    return profile.value?.players || []
  }

  /**
   * Check if a player is linked to the current user
   * @param {number} playerId - Player ID to check
   */
  const isPlayerLinked = (playerId) => {
    const players = getLinkedPlayers()
    return players.some(p => p.id === playerId)
  }

  return {
    // State
    profile,
    isLoading,
    error,

    // Methods
    fetchUserProfile,
    updateUserProfile,
    linkPlayerToUser,
    getLinkedPlayers,
    isPlayerLinked
  }
}
