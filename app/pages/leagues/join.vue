<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { Swords, Users, Calendar, Lock, LogIn } from 'lucide-vue-next'

  const leaguesStore = useLeaguesStore()

  const selectedLeagueId = ref(null)
  const password = ref('')
  const error = ref('')
  const loading = ref(false)
  const loadingLeagues = ref(true)
  const publicLeagues = ref([])

  // Fetch public leagues on mount
  onMounted(async () => {
    try {
      const response = await $fetch('/api/leagues')
      if (response.success) {
        // Filter out leagues user is already in
        await leaguesStore.fetchMyLeagues()
        const myLeagueIds = leaguesStore.myLeagues.map(l => l.id)
        publicLeagues.value = response.data.filter(league =>
          league.isPublic && !myLeagueIds.includes(league.id)
        )
      }
    } catch (err) {
      error.value = 'Failed to load leagues'
      console.error('Error fetching public leagues:', err)
    } finally {
      loadingLeagues.value = false
    }
  })

  const selectedLeague = computed(() => {
    return publicLeagues.value.find(l => l.id === selectedLeagueId.value)
  })

  const handleJoin = async () => {
    if (!selectedLeagueId.value) {
      error.value = 'Please select a league to join'
      return
    }

    loading.value = true
    error.value = ''

    try {
      await leaguesStore.joinLeague(selectedLeagueId.value, password.value || null)
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
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-gray-100 flex items-center gap-3">
        <Swords :size="40" class="text-purple-400" />
        Join a League
      </h1>
      <p class="text-gray-400 mt-2">Browse and join existing public leagues</p>
    </div>

    <!-- Loading State -->
    <div v-if="loadingLeagues" class="text-center py-12">
      <div class="text-gray-400">Loading available leagues...</div>
    </div>

    <!-- No Leagues State -->
    <div v-else-if="publicLeagues.length === 0" class="card text-center py-12">
      <Swords :size="64" class="text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-300 mb-2">No Public Leagues Available</h2>
      <p class="text-gray-400 mb-6">There are no public leagues to join at the moment</p>
      <NuxtLink to="/leagues/create" class="btn-primary inline-flex items-center gap-2">
        <Swords :size="20" />
        Create Your Own League
      </NuxtLink>
    </div>

    <!-- League Selection -->
    <div v-else class="space-y-8">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- Available Leagues -->
      <div class="card space-y-6">
        <h2 class="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3">
          Available Leagues
        </h2>

        <div class="grid grid-cols-1 gap-4">
          <label
            v-for="league in publicLeagues"
            :key="league.id"
            class="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
            :class="selectedLeagueId === league.id
              ? 'border-purple-500 bg-purple-900/20'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'"
          >
            <input
              v-model="selectedLeagueId"
              type="radio"
              :value="league.id"
              class="mt-1 mr-4 w-5 h-5 text-purple-600 border-gray-600 focus:ring-purple-500"
            />
            <div class="flex-1">
              <!-- League Header -->
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-lg font-bold text-gray-100">{{ league.name }}</h3>
                  <p v-if="league.description" class="text-gray-400 text-sm mt-1">
                    {{ league.description }}
                  </p>
                </div>
                <span
                  v-if="league.requiresPassword || !league.isPublic"
                  class="flex items-center gap-1 text-yellow-400 text-sm"
                >
                  <Lock :size="14" />
                  Password Required
                </span>
              </div>

              <!-- League Stats -->
              <div class="flex flex-wrap gap-4 text-sm text-gray-300 mt-3">
                <div class="flex items-center gap-2">
                  <Users :size="16" class="text-gray-500" />
                  <span>{{ league.memberCount || 0 }} members</span>
                  <span v-if="league.maxPlayers" class="text-gray-500">/ {{ league.maxPlayers }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Calendar :size="16" class="text-gray-500" />
                  <span>Round {{ league.currentRound || 1 }} of {{ league.rounds?.length || 0 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Swords :size="16" class="text-gray-500" />
                  <span>Started: {{ formatDate(league.startDate) }}</span>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Password Input (shown when league selected and requires password) -->
      <div v-if="selectedLeague && (selectedLeague.requiresPassword || !selectedLeague.isPublic)" class="card space-y-4">
        <h2 class="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Lock :size="24" />
          Enter Password
        </h2>
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            League Password <span class="text-red-400">*</span>
          </label>
          <input
            v-model="password"
            type="password"
            class="input w-full"
            placeholder="Enter the league password"
            @keyup.enter="handleJoin"
          />
          <p class="text-gray-500 text-sm mt-1">
            Contact the league organizer if you don't have the password
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
          :disabled="!selectedLeagueId || loading"
        >
          <LogIn v-if="!loading" :size="20" />
          <span v-if="loading">Joining...</span>
          <span v-else>Join League</span>
        </button>
      </div>
    </div>
  </div>
</template>
