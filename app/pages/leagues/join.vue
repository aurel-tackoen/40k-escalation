<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { usePlaceholders } from '~/composables/usePlaceholders'
  import { Swords, Users, Calendar, LogIn, Shield, User } from 'lucide-vue-next'

  const leaguesStore = useLeaguesStore()
  const route = useRoute()

  const league = ref(null)
  const playerName = ref('')
  const faction = ref('')
  const armyName = ref('')
  const availableFactions = ref([])
  const error = ref('')
  const loading = ref(false)
  const loadingLeague = ref(true)

  // Get game-specific placeholders
  const { placeholders } = usePlaceholders(league)

  // Fetch specific league on mount
  onMounted(async () => {
    try {
      // Get league ID from URL query parameter
      const leagueIdFromUrl = route.query.leagueId ? parseInt(route.query.leagueId) : null

      if (!leagueIdFromUrl) {
        error.value = 'No league specified'
        loadingLeague.value = false
        return
      }

      // Fetch the specific league
      const response = await $fetch(`/api/leagues/${leagueIdFromUrl}`)
      if (response.success) {
        // Check if user is already an ACTIVE member
        await leaguesStore.fetchMyLeagues()
        const isAlreadyMember = leaguesStore.myLeagues.some(l => l.id === leagueIdFromUrl)

        if (isAlreadyMember) {
          error.value = 'You are already a member of this league'
        } else if (response.data.isPrivate) {
          error.value = 'This league is private'
        } else {
          league.value = response.data

          // Fetch factions for this game system
          const factionsResponse = await $fetch(`/api/factions?gameSystemId=${response.data.gameSystemId}`)
          if (factionsResponse.success) {
            availableFactions.value = factionsResponse.data
          }

          // Check for existing inactive membership (user previously joined but left)
          // Pre-fill form with their previous data
          try {
            const authStore = useAuthStore()
            const membershipResponse = await $fetch(`/api/leagues/${leagueIdFromUrl}/membership?userId=${authStore.user?.id}`)
            if (membershipResponse.success && membershipResponse.data) {
              const existingMembership = membershipResponse.data
              // Pre-fill form with existing data
              if (existingMembership.player) {
                playerName.value = existingMembership.player.name || ''
                faction.value = existingMembership.player.faction || ''
              }
              armyName.value = existingMembership.armyName || ''
            }
          } catch {
            // No existing membership, that's fine - form stays empty
          }
        }
      }
    } catch (err) {
      error.value = 'Failed to load league details'
      console.error('Error fetching league:', err)
    } finally {
      loadingLeague.value = false
    }
  })

  const handleJoin = async () => {
    if (!league.value) return

    // Validate required fields
    if (!playerName.value || playerName.value.trim().length === 0) {
      error.value = 'Please enter a player name'
      return
    }

    if (!faction.value) {
      error.value = 'Please select a faction'
      return
    }

    if (!armyName.value || armyName.value.trim().length === 0) {
      error.value = 'Please enter an army name'
      return
    }

    loading.value = true
    error.value = ''

    try {
      await leaguesStore.joinLeague(
        league.value.id,
        playerName.value.trim(),
        faction.value,
        armyName.value.trim()
      )
      // Success - redirect to dashboard
      navigateTo('/dashboard')
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Failed to join league'
      console.error('Error joining league:', err)
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block">
        ← Back to Leagues
      </NuxtLink>
      <h1 class="text-4xl font-bold text-gray-100 flex items-center gap-3">
        <Swords :size="40" class="text-purple-400" />
        Join League
      </h1>
    </div>

    <!-- Loading State -->
    <div v-if="loadingLeague" class="py-12">
      <LoadingSpinner message="Loading League Details" />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !league" class="card text-center py-12">
      <Swords :size="64" class="text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-300 mb-2">Unable to Load League</h2>
      <p class="text-red-400 mb-6">{{ error }}</p>
      <NuxtLink to="/leagues" class="btn-primary inline-flex items-center gap-2">
        <Swords :size="20" />
        Browse All Leagues
      </NuxtLink>
    </div>

    <!-- League Details -->
    <div v-else-if="league" class="space-y-6">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- League Info Card -->
      <div class="card space-y-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ league.name }}</h2>
          <p v-if="league.description" class="text-gray-400">{{ league.description }}</p>
        </div>

        <!-- League Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2 text-purple-400">
              <Users :size="20" />
              <span class="font-semibold">Members</span>
            </div>
            <p class="text-2xl font-bold text-gray-100">
              {{ league.memberCount || 0 }}<span v-if="league.maxPlayers" class="text-gray-400 text-lg"> / {{ league.maxPlayers }}</span>
            </p>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2 text-purple-400">
              <Calendar :size="20" />
              <span class="font-semibold">Current Round</span>
            </div>
            <p class="text-2xl font-bold text-gray-100">{{ league.currentRound || 1 }}</p>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2 text-purple-400">
              <Swords :size="20" />
              <span class="font-semibold">Status</span>
            </div>
            <p class="text-lg font-bold text-green-400 capitalize">{{ league.status || 'active' }}</p>
          </div>
        </div>

        <!-- League Timeline -->
        <div class="border-t border-gray-700 pt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-400">Started:</span>
              <span class="text-gray-100 ml-2 font-semibold">{{ formatDate(league.startDate) }}</span>
            </div>
            <div v-if="league.endDate">
              <span class="text-gray-400">Ends:</span>
              <span class="text-gray-100 ml-2 font-semibold">{{ formatDate(league.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Profile Input -->
      <div class="card space-y-4">
        <div>
          <h3 class="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
            <User :size="24" class="text-purple-400" />
            Your Player Profile
          </h3>
          <p class="text-gray-400 text-sm">
            Set up your player identity for this league.
          </p>
        </div>

        <div class="space-y-4">
          <!-- Player Name -->
          <div>
            <label class="block text-gray-300 font-semibold mb-2">
              Player Name <span class="text-red-400">*</span>
            </label>
            <input
              v-model="playerName"
              type="text"
              class="input-field"
              placeholder="Your display name in this league"
              maxlength="255"
              @keyup.enter="handleJoin"
            />
            <p class="text-gray-500 text-sm mt-1">
              This is how you'll appear on leaderboards and in match records
            </p>
          </div>

          <!-- Faction Dropdown -->
          <div>
            <label class="block text-gray-300 font-semibold mb-2">
              Faction <span class="text-red-400">*</span>
            </label>
            <select
              v-model="faction"
              class="input-field"
              @change="() => {}"
            >
              <option value="" disabled>Select your faction</option>
              <option
                v-for="factionOption in availableFactions"
                :key="factionOption.id"
                :value="factionOption.name"
              >
                {{ factionOption.name }}
              </option>
            </select>
            <p class="text-gray-500 text-sm mt-1">
              Choose the faction you'll be playing in this league
            </p>
          </div>
        </div>
      </div>

      <!-- Army Name Input -->
      <div class="card space-y-4">
        <div>
          <h3 class="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
            <Shield :size="24" class="text-yellow-400" />
            Your Army
          </h3>
          <p class="text-gray-400 text-sm">
            Choose a name for your army in this league. This will be used for all your army lists.
          </p>
        </div>
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            Army Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="armyName"
            type="text"
            class="input-field"
            :placeholder="placeholders.armyName"
            maxlength="255"
            @keyup.enter="handleJoin"
          />
          <p class="text-gray-500 text-sm mt-1">
            Examples: {{ placeholders.armyExamples }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 justify-end">
        <NuxtLink to="/leagues" class="btn-secondary">
          Cancel
        </NuxtLink>
        <button
          @click="handleJoin"
          class="btn-primary flex items-center gap-2"
          :disabled="loading"
        >
          <LogIn v-if="!loading" :size="20" />
          <span v-if="loading">Joining...</span>
          <span v-else>Join League</span>
        </button>
      </div>
    </div>
  </div>
</template>
