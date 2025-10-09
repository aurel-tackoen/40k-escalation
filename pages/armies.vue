<template>
  <div class="space-y-8">
    <ArmyListsView 
      :players="players" 
      :armies="armies" 
      :current-round="league.currentRound"
      :rounds="league.rounds"
      @save-army="leagueStore.saveArmy" 
      @delete-army="leagueStore.deleteArmy" 
    />
  </div>
</template>

<script setup>
const leagueStore = useLeagueStore()
const { currentLeague: league, players, armies } = storeToRefs(leagueStore)
</script>
