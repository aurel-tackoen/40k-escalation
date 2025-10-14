import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

/**
 * useAuth - Authentication composable (wrapper around auth store)
 * Provides convenient access to auth state and methods
 *
 * This is a thin wrapper to maintain backward compatibility
 * and provide a composable-style API. The actual state is managed
 * by the Pinia auth store for better organization and DevTools support.
 */
export function useAuth() {
  const authStore = useAuthStore()

  // Extract reactive refs from store
  const { user, isLoading, error, isAuthenticated, userName, userEmail, userAvatar } = storeToRefs(authStore)

  // Extract actions from store (not reactive, so no storeToRefs needed)
  const { fetchUser, login, logout, clearUser } = authStore

  return {
    // State (reactive refs)
    user,
    isLoading,
    error,

    // Getters (computed, reactive)
    isAuthenticated,
    getUserName: userName,      // Alias for consistency
    getUserEmail: userEmail,    // Alias for consistency
    getUserAvatar: userAvatar,  // Alias for consistency

    // Actions
    fetchUser,
    login,
    logout,
    clearUser
  }
}
