<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, players, matches, armies, loading, error } = storeToRefs(leaguesStore)

  // Initialize store and fetch data when component mounts
  onMounted(async () => {
    await leaguesStore.initialize()
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading...
    </div>
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
