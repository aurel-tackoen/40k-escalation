import { defineStore } from 'pinia'
import { useLeaguesStore } from './leagues'

/**
 * Auth Store - Manages authentication state with Auth0
 * Handles user login, logout, and session management
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * Check if user is authenticated
     */
    isAuthenticated: (state) => state.user !== null,

    /**
     * Get user display name
     */
    userName: (state) => state.user?.name || 'Guest',

    /**
     * Get user email
     */
    userEmail: (state) => state.user?.email || '',

    /**
     * Get user avatar URL
     */
    userAvatar: (state) => {
      if (state.user?.picture) {
        return state.user.picture
      }
      const name = state.user?.name || 'Guest'
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
    },

    /**
     * Get user role
     */
    userRole: (state) => state.user?.role || 'user',

    /**
     * Check if user is admin
     */
    isAdmin: (state) => state.user?.role === 'admin',

    /**
     * Check if user is organizer or admin
     */
    isOrganizer: (state) => {
      const role = state.user?.role
      return role === 'organizer' || role === 'admin'
    }
  },

  actions: {
    /**
     * Fetch current user from API
     */
    async fetchUser() {
      this.isLoading = true
      this.error = null

      try {
        const response = await $fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.success && response.data) {
          this.user = response.data
        } else {
          this.user = null
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
        this.error = err
        this.user = null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Redirect to Auth0 login
     * @param {string} screenHint - 'signup' to show signup screen, omit for login screen
     */
    login(screenHint = null) {
      const url = screenHint === 'signup'
        ? '/api/auth/login?screen_hint=signup'
        : '/api/auth/login'
      window.location.href = url
    },

    /**
     * Logout user and clear session
     */
    logout() {
      // Clear leagues store before redirecting
      if (process.client) {
        const leaguesStore = useLeaguesStore()
        leaguesStore.resetStore()
      }
      window.location.href = '/api/auth/logout'
    },

    /**
     * Clear user state (called after logout)
     */
    clearUser() {
      this.user = null
      this.error = null
    }
  }
})
