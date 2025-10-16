<script setup>
  import { Shield, Users, CheckCircle, AlertCircle, Loader, LogIn, Lock, Globe } from 'lucide-vue-next'
  import { useGameSystems } from '~/composables/useGameSystems'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemNameWithFallback } = useGameSystems(gameSystems)

  const token = route.params.token
  const league = ref(null)
  const isJoining = ref(false)
  const joinStatus = ref('loading') // loading, success, error, already_member, ready, not_authenticated
  const errorMessage = ref('')

  // Fetch league info by token (without joining)
  const fetchLeagueInfo = async () => {
    try {
      const response = await $fetch(`/api/leagues/info-by-token/${token}`)
      league.value = response.data
      joinStatus.value = 'ready'
    } catch (error) {
      joinStatus.value = 'error'
      errorMessage.value = error.data?.message || 'League not found'
    }
  }

  // Join the league
  const joinLeague = async () => {
    // Check if user is authenticated before allowing join
    if (!authStore.isAuthenticated) {
      joinStatus.value = 'not_authenticated'
      return
    }

    isJoining.value = true
    try {
      const response = await $fetch(`/api/leagues/join-by-token/${token}`, {
        method: 'POST'
      })

      if (response.message?.includes('already a member')) {
        joinStatus.value = 'already_member'
      } else {
        joinStatus.value = 'success'

        // Refresh user's leagues and switch to the new league
        await leaguesStore.fetchMyLeagues()
        await leaguesStore.switchLeague(response.data.id)

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      if (error.statusCode === 401) {
        joinStatus.value = 'not_authenticated'
      } else if (error.statusCode === 400 && error.data?.message?.includes('already a member')) {
        joinStatus.value = 'already_member'
      } else {
        joinStatus.value = 'error'
        errorMessage.value = error.data?.message || 'Failed to join league'
      }
    } finally {
      isJoining.value = false
    }
  }

  // Login and redirect to this page
  const loginAndJoin = () => {
    // Store the current URL so we can redirect back after login
    sessionStorage.setItem('redirect_after_login', route.fullPath)
    authStore.login()
  }

  // Initialize on mount
  onMounted(async () => {
    // First check authentication
    await authStore.fetchUser()

    // Fetch game systems if not loaded
    if (gameSystems.value.length === 0) {
      await leaguesStore.fetchGameSystems()
    }

    if (token && token.length === 32) {
      fetchLeagueInfo()
    } else {
      joinStatus.value = 'error'
      errorMessage.value = 'Invalid share link'
    }
  })
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center p-4">
    <div class="max-w-lg w-full mx-auto">
      <!-- Loading State -->
      <div v-if="joinStatus === 'loading'" class="text-center">
        <div class="card">
          <Loader class="animate-spin text-yellow-500 mx-auto mb-4" :size="48" />
          <h2 class="text-xl font-semibold text-gray-100 mb-2">Loading League...</h2>
          <p class="text-gray-400">Fetching league information</p>
        </div>
      </div>

      <!-- League Info & Join -->
      <div v-else-if="joinStatus === 'ready' && league" class="card">
        <div class="text-center mb-6">
          <Shield class="text-yellow-500 mx-auto mb-4" :size="48" />
          <h1 class="text-2xl font-bold text-gray-100 mb-2">Join League</h1>
          <p class="text-gray-400">You've been invited to join this league</p>
        </div>

        <!-- League Details -->
        <div class="space-y-4 mb-4">
          <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="text-xl font-semibold text-yellow-400">{{ league.name }}</h3>
              <component
                :is="league.isPrivate ? Lock : Globe"
                :size="18"
                :class="league.isPrivate ? 'text-yellow-400' : 'text-green-400'"
                :title="league.isPrivate ? 'Private League' : 'Public League'"
              />
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Visibility:</span>
                <span :class="league.isPrivate ? 'text-yellow-400' : 'text-green-400'" class="font-medium flex items-center gap-1">
                  <component :is="league.isPrivate ? Lock : Globe" :size="14" />
                  {{ league.isPrivate ? 'Private (Invite-Only)' : 'Public' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-400">Game System:</span>
                <span class="text-gray-200 font-medium">{{ getGameSystemNameWithFallback(league.gameSystemId) }}</span>
              </div>

              <div v-if="league.description" class="flex items-start justify-between">
                <span class="text-gray-400">Description:</span>
                <span class="text-gray-200 text-right max-w-xs">{{ league.description }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-400">Current Round:</span>
                <span class="text-gray-200 font-medium">Round {{ league.currentRound }}</span>
              </div>

              <div v-if="league.startDate" class="flex items-center justify-between">
                <span class="text-gray-400">Started:</span>
                <span class="text-gray-200">{{ new Date(league.startDate).toLocaleDateString() }}</span>
              </div>

              <div v-if="league.maxPlayers" class="flex items-center justify-between">
                <span class="text-gray-400">Player Limit:</span>
                <span class="text-gray-200">{{ league.maxPlayers }} players</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Join Button (only show if authenticated) -->
        <button
          v-if="authStore.isAuthenticated"
          @click="joinLeague"
          :disabled="isJoining"
          class="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full"
        >
          <Loader v-if="isJoining" class="animate-spin" :size="20" />
          <Users v-else :size="20" />
          {{ isJoining ? 'Joining League...' : 'Join This League' }}
        </button>

        <!-- Login Button (show if not authenticated) -->
        <button
          v-else
          @click="loginAndJoin"
          class="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full"
        >
          <LogIn :size="20" />
          Login to Join League
        </button>

        <p class="text-center text-xs text-gray-500 mt-4">
          By joining, you agree to participate in good faith and follow league rules
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="joinStatus === 'success'" class="text-center">
        <div class="card">
          <CheckCircle class="text-green-500 mx-auto mb-4" :size="48" />
          <h2 class="text-xl font-semibold text-gray-100 mb-2">Welcome to the League!</h2>
          <p class="text-gray-400 mb-4">You've successfully joined "{{ league?.name }}"</p>
          <p class="text-sm text-green-400">Redirecting to dashboard...</p>
        </div>
      </div>

      <!-- Already Member State -->
      <div v-else-if="joinStatus === 'already_member'" class="text-center">
        <div class="card">
          <CheckCircle class="text-blue-500 mx-auto mb-4" :size="48" />
          <h2 class="text-xl font-semibold text-gray-100 mb-2">Already a Member!</h2>
          <p class="text-gray-400 mb-4">You're already part of "{{ league?.name }}"</p>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Not Authenticated State -->
      <div v-else-if="joinStatus === 'not_authenticated'" class="text-center">
        <div class="card">
          <LogIn class="text-blue-500 mx-auto mb-4" :size="48" />
          <h2 class="text-xl font-semibold text-gray-100 mb-2">Login Required</h2>
          <p class="text-gray-400 mb-6">You need to be logged in to join this league</p>

          <div v-if="league" class="bg-gray-700 rounded-lg p-4 border border-gray-600 mb-6">
            <h3 class="text-lg font-semibold text-yellow-400 mb-2">{{ league.name }}</h3>
            <p class="text-gray-300 text-sm">{{ getGameSystemNameWithFallback(league.gameSystemId) }}</p>
          </div>

          <button
            @click="loginAndJoin"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors mb-4"
          >
            <LogIn :size="20" />
            Login to Join League
          </button>

          <p class="text-center text-xs text-gray-500">
            You'll be redirected back here after logging in
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center">
        <div class="card">
          <AlertCircle class="text-red-500 mx-auto mb-4" :size="48" />
          <h2 class="text-xl font-semibold text-gray-100 mb-2">Unable to Join</h2>
          <p class="text-gray-400 mb-4">{{ errorMessage }}</p>
          <NuxtLink
            to="/leagues"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-gray-100 font-semibold rounded-lg transition-colors"
          >
            Browse Leagues
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
