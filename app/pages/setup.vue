<template>
  <div class="space-y-8">
    <LeagueSetupView 
      :league="league" 
      @update-league="leagueStore.updateLeague" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { currentLeague: league } = storeToRefs(leagueStore)
</script>
