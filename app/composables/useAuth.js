import { ref, computed } from 'vue'

/**
 * useAuth - Authentication composable for Auth0 integration
 * Provides login, logout, and user state management
 */
export function useAuth() {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed: Check if user is authenticated
  const isAuthenticated = computed(() => user.value !== null)

  /**
   * Fetch current user from API
   */
  const fetchUser = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.success && response.data) {
        user.value = response.data
      } else {
        user.value = null
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      error.value = err
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Redirect to Auth0 login
   * Netlify handles the Auth0 OAuth flow
   */
  const login = () => {
    // Redirect to Netlify's Auth0 login endpoint
    window.location.href = '/.netlify/functions/auth-login'
  }

  /**
   * Logout user and clear session
   */
  const logout = () => {
    // Redirect to Netlify's Auth0 logout endpoint
    window.location.href = '/.netlify/functions/auth-logout'
  }

  /**
   * Get user display name
   */
  const getUserName = computed(() => {
    return user.value?.name || 'Guest'
  })

  /**
   * Get user email
   */
  const getUserEmail = computed(() => {
    return user.value?.email || ''
  })

  /**
   * Get user avatar URL
   */
  const getUserAvatar = computed(() => {
    return user.value?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName.value)}`
  })

  return {
    // State
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    getUserName,
    getUserEmail,
    getUserAvatar,

    // Methods
    fetchUser,
    login,
    logout
  }
}
