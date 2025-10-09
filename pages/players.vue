<template>
  <div class="space-y-8">
    <PlayersView 
      :players="players" 
      @add-player="leagueStore.addPlayer" 
      @remove-player="leagueStore.removePlayer" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { players } = storeToRefs(leagueStore)
</script>
