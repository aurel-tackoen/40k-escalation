<script setup>
  import { Swords, Users, Trophy, Lock, Globe } from 'lucide-vue-next'
  import { useAuthStore } from '~/stores/auth'

  const authStore = useAuthStore()
  const publicLeagues = ref([])
  const loading = ref(true)
  const error = ref(null)

  // Redirect to dashboard if authenticated
  onMounted(async () => {
    if (authStore.isAuthenticated) {
      await navigateTo('/dashboard')
      return
    }

    // Fetch public leagues for logged-out users
    try {
      const response = await $fetch('/api/leagues/public')
      if (response.success) {
        publicLeagues.value = response.data
      }
    } catch (err) {
      console.error('Error fetching public leagues:', err)
      error.value = 'Failed to load public leagues'
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <div class="min-h-screen -mx-4 -mt-8">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-b border-yellow-600/40">
      <div class="container mx-auto px-4 py-16 text-center">
        <div class="flex justify-center mb-6">
          <Swords :size="64" class="text-yellow-500" />
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-gray-100 mb-4 font-serif">
          Warhammer 40K
        </h1>
        <p class="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 font-bold mb-6 tracking-wide">
          ESCALATION LEAGUE MANAGER
        </p>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Organize and track your Warhammer 40K escalation campaigns with ease.
          Manage players, armies, matches, and painting progress all in one place.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink
            to="/api/auth/login"
            class="btn-primary"
          >
            Create Account
          </NuxtLink>
          <NuxtLink
            to="/api/auth/login"
            class="btn-login"
          >
            Login
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-900 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-100 mb-12">
          Features
        </h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Users :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Player Management</h3>
            <p class="text-gray-400">
              Track players, their factions, win/loss records, and battle points across the campaign.
            </p>
          </div>
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Trophy :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Match Recording</h3>
            <p class="text-gray-400">
              Log battle results, track win streaks, and analyze match statistics with detailed analytics.
            </p>
          </div>
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Swords :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Army List Builder</h3>
            <p class="text-gray-400">
              Build armies with point validation, track painting progress, and manage escalation across rounds.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Public Leagues Section -->
    <div class="bg-gray-850 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-100 mb-4">
          Join a Public League
        </h2>
        <p class="text-center text-gray-400 mb-12">
          Browse active campaigns and join the battle!
        </p>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p class="text-gray-400 mt-4">Loading leagues...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-400">{{ error }}</p>
        </div>

        <!-- No Leagues -->
        <div v-else-if="publicLeagues.length === 0" class="text-center py-12">
          <Globe :size="64" class="text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400 text-lg">No public leagues available at the moment.</p>
          <p class="text-gray-500 mt-2">Create an account to start your own league!</p>
        </div>

        <!-- Leagues Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div
            v-for="league in publicLeagues"
            :key="league.id"
            class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-600/20"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-100 mb-1">{{ league.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <Globe :size="14" />
                  <span>Public League</span>
                </div>
              </div>
            </div>

            <p v-if="league.description" class="text-gray-400 mb-4 line-clamp-2">
              {{ league.description }}
            </p>

            <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <div class="flex items-center gap-1">
                <Users :size="16" />
                <span>{{ league.memberCount || 0 }} members</span>
              </div>
              <div class="flex items-center gap-1">
                <Trophy :size="16" />
                <span>Round {{ league.currentRound || 1 }}</span>
              </div>
            </div>

            <NuxtLink
              to="/api/auth/login"
              class="block w-full px-4 py-2 bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-600/50 transition-all duration-300 text-center"
            >
              Join League
            </NuxtLink>
          </div>
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-400 mb-4">
            Want to create your own private league?
          </p>
          <NuxtLink
            to="/api/auth/login"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-100 font-semibold rounded-lg border border-gray-600 hover:border-yellow-600 hover:bg-gray-600 transition-all duration-300"
          >
            <Lock :size="18" />
            <span>Create Private League</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 py-8">
      <div class="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2025 Warhammer 40K Escalation League Manager</p>
        <p class="mt-2 text-sm">Manage your campaigns with the Emperor's blessing</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
