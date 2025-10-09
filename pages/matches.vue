<template>
  <div class="space-y-8">
    <MatchesView 
      :matches="matches" 
      :players="players" 
      @add-match="leagueStore.addMatch" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { matches, players } = storeToRefs(leagueStore)
</script>
