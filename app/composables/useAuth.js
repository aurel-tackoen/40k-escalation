import { ref, computed, onMounted } from 'vue'

/**
 * Netlify Identity Authentication Composable
 * Manages user authentication state and provides login/logout functionality
 *
 * Usage:
 * const { user, isLoading, isAuthenticated, login, logout, signup } = useAuth()
 */
export function useAuth() {
  const user = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  // Computed: Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  // Computed: Get user role
  const userRole = computed(() => user.value?.app_metadata?.role || 'player')

  // Computed: Check if user is admin
  const isAdmin = computed(() => userRole.value === 'admin')

  // Computed: Check if user is organizer or admin
  const isOrganizer = computed(() => ['organizer', 'admin'].includes(userRole.value))

  // Initialize Netlify Identity widget
  const initIdentity = async () => {
    if (typeof window !== 'undefined' && !window.netlifyIdentity) {
      try {
        const netlifyIdentityWidget = await import('netlify-identity-widget')
        window.netlifyIdentity = netlifyIdentityWidget.default || netlifyIdentityWidget
      } catch (err) {
        console.error('Failed to load Netlify Identity widget:', err)
        error.value = 'Authentication service unavailable'
        isLoading.value = false
        return null
      }
    }
    return window.netlifyIdentity
  }

  // Setup event listeners
  onMounted(async () => {
    const netlifyIdentity = await initIdentity()
    if (!netlifyIdentity) return

    // Handle initialization
    netlifyIdentity.on('init', (netlifyUser) => {
      user.value = netlifyUser
      isLoading.value = false
      console.log('Netlify Identity initialized:', netlifyUser ? 'User logged in' : 'No user')
    })

    // Handle login
    netlifyIdentity.on('login', async (netlifyUser) => {
      user.value = netlifyUser
      netlifyIdentity.close()

      // Update last login timestamp
      try {
        await $fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${netlifyUser.token.access_token}`
          }
        })
      } catch (err) {
        console.error('Failed to update login timestamp:', err)
      }

      console.log('User logged in:', netlifyUser)
    })

    // Handle logout
    netlifyIdentity.on('logout', () => {
      user.value = null
      console.log('User logged out')
    })

    // Handle signup
    netlifyIdentity.on('signup', (netlifyUser) => {
      console.log('User signed up:', netlifyUser)
    })

    // Handle errors
    netlifyIdentity.on('error', (err) => {
      error.value = err.message
      console.error('Netlify Identity error:', err)
    })

    // Initialize the widget
    netlifyIdentity.init()
  })

  /**
   * Open login modal
   */
  const login = async () => {
    if (typeof window !== 'undefined' && window.netlifyIdentity) {
      window.netlifyIdentity.open('login')
    } else {
      const netlifyIdentity = await initIdentity()
      if (netlifyIdentity) {
        netlifyIdentity.open('login')
      }
    }
  }

  /**
   * Open signup modal
   */
  const signup = async () => {
    if (typeof window !== 'undefined' && window.netlifyIdentity) {
      window.netlifyIdentity.open('signup')
    } else {
      const netlifyIdentity = await initIdentity()
      if (netlifyIdentity) {
        netlifyIdentity.open('signup')
      }
    }
  }

  /**
   * Logout current user
   */
  const logout = async () => {
    if (typeof window !== 'undefined' && window.netlifyIdentity) {
      window.netlifyIdentity.logout()
    } else {
      const netlifyIdentity = await initIdentity()
      if (netlifyIdentity) {
        netlifyIdentity.logout()
      }
    }
  }

  /**
   * Get current user's JWT token
   * @returns {string|null} JWT token
   */
  const getToken = () => {
    return user.value?.token?.access_token || null
  }

  /**
   * Get authorization header
   * @returns {Object} Authorization header object
   */
  const getAuthHeader = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Refresh user token
   */
  const refreshToken = async () => {
    const netlifyIdentity = await initIdentity()
    if (netlifyIdentity && user.value) {
      try {
        await netlifyIdentity.refresh()
      } catch (err) {
        console.error('Failed to refresh token:', err)
      }
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    userRole,
    error,
    login,
    logout,
    signup,
    getToken,
    getAuthHeader,
    refreshToken
  }
}
