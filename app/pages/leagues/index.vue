<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { Swords, Users, Calendar, Plus, LogIn, Settings, LogOut, Trash2 } from 'lucide-vue-next'

  const leaguesStore = useLeaguesStore()
  const { myLeagues, currentLeagueId, loading } = storeToRefs(leaguesStore)

  onMounted(async () => {
    await leaguesStore.fetchMyLeagues()
  })

  const switchToLeague = async (leagueId) => {
    await leaguesStore.switchLeague(leagueId)
    navigateTo('/dashboard')
  }

  const handleLeave = async (leagueId, leagueName) => {
    if (confirm(`Are you sure you want to leave "${leagueName}"? This will delete your player profile in this league.`)) {
      // Temporarily switch to this league to leave it
      const originalLeagueId = currentLeagueId.value
      leaguesStore.currentLeagueId = leagueId
      await leaguesStore.leaveLeague()
      // If we left the current league, it will auto-switch to another
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

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600 text-yellow-100'
      case 'organizer': return 'bg-blue-600 text-blue-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
      <div
        v-for="league in myLeagues"
        :key="league.id"
        class="card hover:border-purple-500 transition-all duration-200 cursor-pointer group relative"
        :class="{ 'ring-2 ring-purple-500 border-purple-500': league.id === currentLeagueId }"
        @click="switchToLeague(league.id)"
      >
        <!-- Current League Badge -->
        <div
          v-if="league.id === currentLeagueId"
          class="absolute -top-3 -right-3 bg-purple-600 text-purple-100 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
        >
          ✓ Current
        </div>

        <!-- League Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors">
              {{ league.name }}
            </h3>
            <p v-if="league.description" class="text-gray-400 text-sm mt-1 line-clamp-2">
              {{ league.description }}
            </p>
          </div>
          <span
            class="px-2 py-1 rounded text-xs font-bold uppercase"
            :class="getRoleBadgeClass(league.role)"
          >
            {{ league.role }}
          </span>
        </div>

        <!-- League Stats -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-gray-300 text-sm">
            <Users :size="16" class="text-gray-500" />
            <span>{{ league.memberCount || 0 }} members</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar :size="16" class="text-gray-500" />
            <span>Round {{ league.currentRound || 1 }} of {{ league.rounds?.length || 0 }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-300 text-sm">
            <Swords :size="16" class="text-gray-500" />
            <span>{{ league.rounds?.[league.currentRound - 1]?.pointLimit || 0 }} points</span>
          </div>
        </div>

        <!-- League Dates -->
        <div class="text-xs text-gray-500 mb-4">
          <div>Started: {{ formatDate(league.startDate) }}</div>
          <div v-if="league.endDate">Ends: {{ formatDate(league.endDate) }}</div>
          <div>Joined: {{ formatDate(league.joinedAt) }}</div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-700" @click.stop>
          <button
            v-if="league.role === 'owner' || league.role === 'organizer'"
            @click="navigateTo('/setup')"
            class="btn-secondary text-xs flex items-center gap-1 flex-1"
            title="League Settings"
          >
            <Settings :size="14" />
            Settings
          </button>
          <button
            v-if="league.role !== 'owner'"
            @click="handleLeave(league.id, league.name)"
            class="btn-secondary text-xs flex items-center gap-1 flex-1 hover:bg-red-600 hover:border-red-600"
            title="Leave League"
          >
            <LogOut :size="14" />
            Leave
          </button>
          <button
            v-if="league.role === 'owner'"
            @click="handleDelete(league.id, league.name)"
            class="btn-secondary text-xs flex items-center gap-1 flex-1 hover:bg-red-600 hover:border-red-600"
            title="Delete League"
          >
            <Trash2 :size="14" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Help Text -->
    <div v-if="myLeagues && myLeagues.length > 0" class="text-center text-gray-500 text-sm">
      Click on a league card to switch to it and view its dashboard
    </div>
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
