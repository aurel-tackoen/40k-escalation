import { ref, computed, onMounted } from 'vue'

/**
 * Netlify Identity Authentication Composable (Simplified)
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
      const netlifyIdentityWidget = await import('netlify-identity-widget')
      const netlifyIdentity = netlifyIdentityWidget.default || netlifyIdentityWidget
      window.netlifyIdentity = netlifyIdentity

      netlifyIdentity.on('init', (netlifyUser) => {
        user.value = netlifyUser
        isLoading.value = false
        // Force close the widget if it's open on init
        if (netlifyUser) {
          setTimeout(() => netlifyIdentity.close(), 100)
        }
      })

      netlifyIdentity.on('login', (netlifyUser) => {
        user.value = netlifyUser
        // Force close immediately on login
        netlifyIdentity.close()
        // Double-check closure after a short delay
        setTimeout(() => netlifyIdentity.close(), 100)
        setTimeout(() => netlifyIdentity.close(), 500)
      })

      netlifyIdentity.on('logout', () => {
        user.value = null
        netlifyIdentity.close()
      })

      netlifyIdentity.on('error', (err) => {
        error.value = err.message
        isLoading.value = false
        // Close on error too
        setTimeout(() => netlifyIdentity.close(), 500)
      })

      netlifyIdentity.on('close', () => {
        // Ensure proper cleanup when modal closes
        console.log('Netlify Identity modal closed')
        // Force remove any lingering classes
        setTimeout(() => {
          const widget = document.querySelector('.netlify-identity-widget')
          if (widget && !widget.classList.contains('netlify-identity-open')) {
            widget.style.display = 'none'
          }
        }, 100)
      })

      netlifyIdentity.on('open', () => {
        // Log when modal opens for debugging
        console.log('Netlify Identity modal opened')
      })

      // Initialize with container option to better control the widget
      netlifyIdentity.init({
        container: '#netlify-modal'
      })

      // Extra safety: close widget after initialization if user is already logged in
      setTimeout(() => {
        if (user.value) {
          netlifyIdentity.close()
        }
      }, 500)
    } catch (err) {
      console.error('Netlify Identity initialization error:', err)
      error.value = 'Authentication unavailable'
      isLoading.value = false
    }
  })

  const login = () => window.netlifyIdentity?.open('login')
  const signup = () => window.netlifyIdentity?.open('signup')
  const logout = () => window.netlifyIdentity?.logout()
  const getToken = () => user.value?.token?.access_token || null
  const getAuthHeader = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Force close the widget (useful for cleanup)
  const forceClose = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.close()
      // Also manually hide the widget element
      setTimeout(() => {
        const widget = document.querySelector('.netlify-identity-widget')
        if (widget) {
          widget.classList.remove('netlify-identity-open')
          widget.style.display = 'none'
        }
      }, 50)
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
    forceClose
  }
}
