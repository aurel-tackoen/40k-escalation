<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { User, Shield, Mail, Trophy, Calendar, Save, Loader } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'
  import { useLeagueStore } from '~/stores/league'
  import { factions } from '~/data/factions'

  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const leagueStore = useLeagueStore()

  const playerProfile = ref(null)
  const isLoadingProfile = ref(true)
  const isSaving = ref(false)
  const message = ref('')
  const error = ref('')

  // Form data
  const formData = ref({
    name: '',
    faction: ''
  })

  const hasProfile = computed(() => !!playerProfile.value)

  // Load player profile
  const loadProfile = async () => {
    try {
      isLoadingProfile.value = true
      error.value = ''

      const response = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${user.value?.token?.access_token}`
        }
      })

      if (response.success && response.data?.id) {
        playerProfile.value = response.data

        // Find full player data in store
        const fullPlayer = leagueStore.players.find(p => p.id === response.data.id)
        if (fullPlayer) {
          playerProfile.value = fullPlayer
          formData.value = {
            name: fullPlayer.name,
            faction: fullPlayer.faction || ''
          }
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      error.value = 'Failed to load profile'
    } finally {
      isLoadingProfile.value = false
    }
  }

  // Register new player
  const register = async () => {
    try {
      isSaving.value = true
      error.value = ''
      message.value = ''

      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.value?.token?.access_token}`
        },
        body: {
          name: formData.value.name,
          faction: formData.value.faction
        }
      })

      if (response.success) {
        message.value = 'Player profile created successfully!'
        playerProfile.value = response.data
        // Refresh store
        await leagueStore.loadPlayers()
      }
    } catch (err) {
      console.error('Error registering:', err)
      error.value = err.message || 'Failed to create profile'
    } finally {
      isSaving.value = false
    }
  }

  onMounted(async () => {
    if (isAuthenticated.value) {
      await loadProfile()
    }
  })

  // Computed stats
  const totalGames = computed(() => {
    if (!playerProfile.value) return 0
    return playerProfile.value.wins + playerProfile.value.losses + playerProfile.value.draws
  })

  const winPercentage = computed(() => {
    if (!playerProfile.value || totalGames.value === 0) return 0
    return Math.round((playerProfile.value.wins / totalGames.value) * 100)
  })
</script>

<template>
  <div class="min-h-[80vh]">
    <!-- Loading State -->
    <div v-if="authLoading || isLoadingProfile" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Loader :size="48" class="animate-spin text-amber-500 mx-auto mb-4" />
        <p class="text-gray-400">Loading profile...</p>
      </div>
    </div>

    <!-- Not Authenticated -->
    <div v-else-if="!isAuthenticated" class="text-center py-12">
      <User :size="64" class="text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-300 mb-2">Authentication Required</h2>
      <p class="text-gray-400">Please log in to view your profile</p>
    </div>

    <!-- Profile View -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-amber-500 mb-2 flex items-center gap-3">
          <User :size="32" />
          Player Profile
        </h1>
        <p class="text-gray-400">Manage your player information and view your statistics</p>
      </div>

      <!-- Messages -->
      <div v-if="message" class="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg text-green-400">
        {{ message }}
      </div>
      <div v-if="error" class="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400">
        {{ error }}
      </div>

      <!-- No Profile - Registration Form -->
      <div v-if="!hasProfile" class="card">
        <h2 class="text-xl font-bold text-amber-500 mb-4">Complete Your Player Profile</h2>
        <p class="text-gray-400 mb-6">
          You're authenticated but haven't created your player profile yet. Fill out the form below to join the league!
        </p>

        <div class="space-y-4">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Player Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Enter your name"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <!-- Faction Select -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Faction
            </label>
            <select
              v-model="formData.faction"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select a faction</option>
              <option v-for="faction in factions" :key="faction" :value="faction">
                {{ faction }}
              </option>
            </select>
          </div>

          <!-- Register Button -->
          <button
            @click="register"
            :disabled="!formData.name || isSaving"
            class="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save v-if="!isSaving" :size="20" />
            <Loader v-else :size="20" class="animate-spin" />
            {{ isSaving ? 'Creating Profile...' : 'Create Player Profile' }}
          </button>
        </div>
      </div>

      <!-- Has Profile - Display Stats -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="card lg:col-span-2">
          <h2 class="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
            <Shield :size="24" />
            Profile Information
          </h2>

          <div class="space-y-4">
            <!-- Name -->
            <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <User :size="20" class="text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Name</p>
                <p class="text-gray-100 font-semibold">{{ playerProfile.name }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Mail :size="20" class="text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Email</p>
                <p class="text-gray-100 font-semibold">{{ playerProfile.email }}</p>
              </div>
            </div>

            <!-- Faction -->
            <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Shield :size="20" class="text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Faction</p>
                <p class="text-gray-100 font-semibold">{{ playerProfile.faction || 'Not set' }}</p>
              </div>
            </div>

            <!-- Member Since -->
            <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Calendar :size="20" class="text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Member Since</p>
                <p class="text-gray-100 font-semibold">
                  {{ new Date(playerProfile.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <div class="card">
          <h2 class="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
            <Trophy :size="24" />
            Statistics
          </h2>

          <div class="space-y-4">
            <!-- Win Rate -->
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <p class="text-3xl font-bold text-green-400">{{ winPercentage }}%</p>
              <p class="text-sm text-gray-400">Win Rate</p>
            </div>

            <!-- Record -->
            <div class="p-4 bg-gray-800 rounded-lg">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-2xl font-bold text-green-400">{{ playerProfile.wins }}</p>
                  <p class="text-xs text-gray-400">Wins</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-400">{{ playerProfile.draws }}</p>
                  <p class="text-xs text-gray-400">Draws</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-red-400">{{ playerProfile.losses }}</p>
                  <p class="text-xs text-gray-400">Losses</p>
                </div>
              </div>
            </div>

            <!-- Total Games -->
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <p class="text-2xl font-bold text-amber-400">{{ totalGames }}</p>
              <p class="text-sm text-gray-400">Total Games</p>
            </div>

            <!-- Battle Points -->
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <p class="text-2xl font-bold text-purple-400">{{ playerProfile.totalPoints }}</p>
              <p class="text-sm text-gray-400">Battle Points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg;
}
</style>
