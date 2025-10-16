<script setup>
  import { Shield, Users, CheckCircle, AlertCircle, Loader } from 'lucide-vue-next'
  import { useGameSystems } from '~/composables/useGameSystems'
  import { useLeaguesStore } from '~/stores/leagues'

  const route = useRoute()
  const router = useRouter()
  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemNameWithFallback } = useGameSystems(gameSystems)

  const token = route.params.token
  const league = ref(null)
  const isJoining = ref(false)
  const joinStatus = ref('loading') // loading, success, error, already_member, ready
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
      if (error.statusCode === 400 && error.data?.message?.includes('already a member')) {
        joinStatus.value = 'already_member'
      } else {
        joinStatus.value = 'error'
        errorMessage.value = error.data?.message || 'Failed to join league'
      }
    } finally {
      isJoining.value = false
    }
  }

  // Fetch game systems if not loaded
  onMounted(async () => {
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

  // TODO: Add authentication middleware when Auth0 is implemented
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
        <div class="space-y-4 mb-8">
          <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 class="text-xl font-semibold text-yellow-400 mb-3">{{ league.name }}</h3>

            <div class="space-y-2 text-sm">
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

        <!-- Join Button -->
        <button
          @click="joinLeague"
          :disabled="isJoining"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-gray-900 disabled:text-gray-400 font-bold rounded-lg transition-colors"
        >
          <Loader v-if="isJoining" class="animate-spin" :size="20" />
          <Users v-else :size="20" />
          {{ isJoining ? 'Joining League...' : 'Join This League' }}
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
