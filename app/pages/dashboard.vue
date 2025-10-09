<template>
  <div class="space-y-8">
    <DashboardView 
      :league="league" 
      :players="players" 
      :matches="matches" 
      :armies="armies" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { currentLeague: league, players, matches, armies } = storeToRefs(leagueStore)
</script>
