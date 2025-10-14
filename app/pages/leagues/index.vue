<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { Swords, Plus, LogIn, Globe } from 'lucide-vue-next'

  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { myLeagues, publicLeagues, currentLeagueId, loading } = storeToRefs(leaguesStore)

  // Computed to ensure stable public leagues list
  const hasPublicLeagues = computed(() => {
    return publicLeagues.value && Array.isArray(publicLeagues.value) && publicLeagues.value.length > 0
  })

  onMounted(async () => {
    // Ensure auth user is loaded first
    if (!authStore.user) {
      await authStore.fetchUser()
    }

    // Then fetch leagues data
    await leaguesStore.fetchMyLeagues()
    await leaguesStore.fetchPublicLeagues()
  })

  const switchToLeague = async (leagueId) => {
    await leaguesStore.switchLeague(leagueId)
    navigateTo('/dashboard')
  }

  const handleSettings = (leagueId) => {
    leaguesStore.currentLeagueId = leagueId
    navigateTo('/setup')
  }

  const handleLeave = async (leagueId, leagueName) => {
    if (confirm(`Are you sure you want to leave "${leagueName}"? This will delete your player profile in this league.`)) {
      const originalLeagueId = currentLeagueId.value
      leaguesStore.currentLeagueId = leagueId
      await leaguesStore.leaveLeague()
      if (leagueId === originalLeagueId) {
        if (myLeagues.value.length > 0) {
          navigateTo('/dashboard')
        }
      }
    }
  }

  const handleDelete = async (leagueId, leagueName) => {
    if (confirm(`⚠️ WARNING: Are you sure you want to DELETE "${leagueName}"?\n\nThis will permanently delete:\n- All players in this league\n- All army lists\n- All match records\n- All league data\n\nThis action CANNOT be undone!`)) {
      const secondConfirm = confirm(`Type the league name to confirm deletion:\n\nExpected: ${leagueName}\n\nAre you absolutely sure?`)
      if (secondConfirm) {
        const originalLeagueId = currentLeagueId.value
        leaguesStore.currentLeagueId = leagueId
        await leaguesStore.deleteLeague()
        if (leagueId === originalLeagueId && myLeagues.value.length > 0) {
          navigateTo('/dashboard')
        }
      }
    }
  }

  const handleJoin = (leagueId) => {
    navigateTo(`/leagues/join?leagueId=${leagueId}`)
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-gray-100 flex items-center gap-3">
          <Swords :size="40" class="text-purple-400" />
          My Leagues
        </h1>
        <p class="text-gray-400 mt-2">Manage your escalation league campaigns</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          to="/leagues/create"
          class="btn-primary flex items-center gap-2"
        >
          <Plus :size="20" />
          Create League
        </NuxtLink>
        <NuxtLink
          to="/leagues/join"
          class="btn-secondary flex items-center gap-2"
        >
          <LogIn :size="20" />
          Join League
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-400">Loading your leagues...</div>
    </div>

    <!-- No Leagues State -->
    <div v-else-if="!myLeagues || myLeagues.length === 0" class="text-center py-12">
      <Swords :size="64" class="text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-300 mb-2">No Leagues Yet</h2>
      <p class="text-gray-400 mb-6">Create your first league or join an existing one to get started</p>
      <div class="flex gap-4 justify-center">
        <NuxtLink to="/leagues/create" class="btn-primary flex items-center gap-2">
          <Plus :size="20" />
          Create League
        </NuxtLink>
        <NuxtLink to="/leagues/join" class="btn-secondary flex items-center gap-2">
          <LogIn :size="20" />
          Join League
        </NuxtLink>
      </div>
    </div>

    <!-- Leagues Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LeagueCard
        v-for="league in myLeagues"
        :key="league.id"
        :league="league"
        variant="my-league"
        :is-current="league.id === currentLeagueId"
        @click="switchToLeague"
        @settings="handleSettings"
        @leave="handleLeave"
        @delete="handleDelete"
      />
    </div>

    <!-- Public Leagues Section -->
    <div v-if="hasPublicLeagues" class="space-y-6">
      <div class="border-t border-gray-700 pt-8">
        <div class="flex items-center gap-3 mb-6">
          <Globe :size="32" class="text-green-400" />
          <div>
            <h2 class="text-2xl font-bold text-gray-100">Public Leagues</h2>
            <p class="text-gray-400 text-sm mt-1">Discover and join public leagues</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeagueCard
            v-for="league in publicLeagues"
            :key="league.id"
            :league="league"
            variant="public"
            @join="handleJoin"
          />
        </div>
      </div>
    </div>

    <!-- Help Text -->
    <div v-if="myLeagues && myLeagues.length > 0" class="text-center text-gray-500 text-sm">
      Click on a league card to switch to it and view its dashboard
    </div>
  </div>
</template>
