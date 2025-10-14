<script setup>
  const leagueStore = useLeagueStore()
  const { currentLeague: league, players, armies, loading } = storeToRefs(leagueStore)

  onMounted(async () => {
    await Promise.all([
      leagueStore.fetchLeague(),
      leagueStore.fetchPlayers(),
      leagueStore.fetchArmies()
    ])
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading army lists...
    </div>
    <ViewsArmyListsView
      v-else-if="league"
      :players="players"
      :armies="armies"
      :current-round="league.currentRound"
      :rounds="league.rounds"
      @save-army="leagueStore.saveArmy"
      @delete-army="leagueStore.deleteArmy"
    />
  </div>
</template>
