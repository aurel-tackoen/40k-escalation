<script setup>
  import { Swords, Users, Trophy, Lock, Globe } from 'lucide-vue-next'
  import { useAuthStore } from '~/stores/auth'
  import { useLeaguesStore } from '~/stores/leagues'

  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { publicLeagues, loading } = storeToRefs(leaguesStore)

  // Fetch public leagues
  onMounted(async () => {
    await leaguesStore.fetchPublicLeagues()
  })

  const handleJoin = () => {
    authStore.login('signup')
  }
</script>

<template>
  <div class="-mx-4 -my-8">
    <!-- Hero Section - Full Width -->
    <div class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-b border-yellow-600/40">
      <div class="px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
        <div class="flex justify-center mb-6">
          <Swords :size="72" class="text-yellow-500" />
        </div>
        <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-100 mb-5 font-serif">
          Warhammer 40K
        </h1>
        <p class="text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 font-bold mb-6 tracking-wide">
          ESCALATION LEAGUE MANAGER
        </p>
        <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 px-4">
          Organize and track your Warhammer 40K escalation campaigns with ease.
          Manage players, armies, matches, and painting progress all in one place.
        </p>

        <!-- Authenticated User Buttons -->
        <div v-if="authStore.isAuthenticated" class="flex flex-wrap gap-4 justify-center">
          <NuxtLink
            to="/leagues"
            class="btn-primary text-lg px-8 py-3 flex items-center gap-2"
          >
            <Swords :size="20" />
            My Leagues
          </NuxtLink>
          <NuxtLink
            to="/leagues"
            class="btn-secondary text-lg px-8 py-3 flex items-center gap-2"
          >
            <Globe :size="20" />
            Browse Leagues
          </NuxtLink>
        </div>

        <!-- Non-Authenticated User Buttons -->
        <div v-else class="flex flex-wrap gap-4 justify-center">
          <button
            @click="authStore.login('signup')"
            class="btn-primary text-lg px-8 py-3"
          >
            Create Account
          </button>
          <button
            @click="authStore.login()"
            class="btn-login text-lg px-8 py-3"
          >
            Login
          </button>
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
        <div v-if="loading" class="py-8">
          <LoadingSpinner message="Loading Public Leagues" />
        </div>

        <!-- Error State -->
        <div v-else-if="leaguesStore.error" class="text-center py-8">
          <p class="text-red-400">{{ leaguesStore.error }}</p>
        </div>

        <!-- No Leagues -->
        <div v-else-if="publicLeagues.length === 0" class="text-center py-12">
          <Globe :size="64" class="text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400 text-lg">No public leagues available at the moment.</p>
          <p class="text-gray-500 mt-2">Create an account to start your own league!</p>
        </div>

        <!-- Leagues Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <LeagueCard
            v-for="league in publicLeagues"
            :key="league.id"
            :league="league"
            variant="public-guest"
            @join="handleJoin"
          />
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
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
