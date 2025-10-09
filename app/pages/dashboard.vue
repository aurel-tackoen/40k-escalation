<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading...
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
      Error: {{ error }}
    </div>
    <div v-else-if="!league" class="text-center py-8">
      No league data available. Please set up a league first.
    </div>
    <DashboardView 
      v-else
      :league="league" 
      :players="players" 
      :matches="matches" 
      :armies="armies" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { currentLeague: league, players, matches, armies, loading, error } = storeToRefs(leagueStore)

// Fetch all data when component mounts
onMounted(async () => {
  await leagueStore.fetchAll()
})
</script>
