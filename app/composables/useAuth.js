import { ref, computed, onMounted } from 'vue'

/**
 * Netlify Identity Authentication Composable
 * Simple implementation for netlify dev local testing
 */
export function useAuth() {
  const user = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.app_metadata?.role || 'player')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isOrganizer = computed(() => ['organizer', 'admin'].includes(userRole.value))

  onMounted(async () => {
    if (typeof window === 'undefined') {
      isLoading.value = false
      return
    }

    try {
      // Import Netlify Identity widget
      const netlifyIdentityWidget = await import('netlify-identity-widget')
      const netlifyIdentity = netlifyIdentityWidget.default || netlifyIdentityWidget
      window.netlifyIdentity = netlifyIdentity

      // Initialize the widget
      netlifyIdentity.init()

      // Listen for initialization
      netlifyIdentity.on('init', (netlifyUser) => {
        console.log('Netlify Identity initialized', netlifyUser ? 'User logged in' : 'No user')
        user.value = netlifyUser
        isLoading.value = false
      })

      // Listen for login
      netlifyIdentity.on('login', (netlifyUser) => {
        console.log('User logged in:', netlifyUser)
        user.value = netlifyUser
        error.value = null
      })

      // Listen for logout
      netlifyIdentity.on('logout', () => {
        console.log('User logged out')
        user.value = null
      })

      // Listen for errors
      netlifyIdentity.on('error', (err) => {
        console.error('Netlify Identity error:', err)
        error.value = err.message
      })

    } catch (err) {
      console.error('Failed to initialize Netlify Identity:', err)
      error.value = 'Authentication system unavailable'
      isLoading.value = false
    }
  })

  const login = () => {
    console.log('Opening login modal')
    window.netlifyIdentity?.open('login')
  }

  const signup = () => {
    console.log('Opening signup modal')
    window.netlifyIdentity?.open('signup')
  }

  const logout = () => {
    console.log('Logging out')
    window.netlifyIdentity?.logout()
  }

  const getToken = () => user.value?.token?.access_token || null

  const getAuthHeader = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
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
    getAuthHeader
  }
}
