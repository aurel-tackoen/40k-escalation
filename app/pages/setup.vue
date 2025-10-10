<script setup>
const leagueStore = useLeagueStore()
const { currentLeague: league, loading } = storeToRefs(leagueStore)

onMounted(async () => {
  await leagueStore.fetchLeague()
})
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading league settings...
    </div>
    <LeagueSetupView 
      v-else-if="league"
      :league="league" 
      @update-league="leagueStore.updateLeague" 
    />
  </div>
</template>
