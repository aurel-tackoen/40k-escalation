<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, players, matches, armies, initializing, error } = storeToRefs(leaguesStore)

  // Handle redirect after login (client-side only)
  onMounted(() => {
    if (import.meta.client) {
      const redirectUrl = sessionStorage.getItem('redirect_after_login')
      if (redirectUrl) {
        sessionStorage.removeItem('redirect_after_login')
        navigateTo(redirectUrl)
      }
    }
  })
</script>

<template>
  <div class="space-y-8">
    <LoadingSpinner v-if="initializing" message="Loading Dashboard" />
    <div v-else-if="error" class="text-red-500 text-center py-8">
      Error: {{ error }}
    </div>
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <ViewsDashboardView
      v-else
      :league="league"
      :players="players"
      :matches="matches"
      :armies="armies"
      :paintingLeaderboard="leaguesStore.paintingLeaderboard"
    />
  </div>
</template>
