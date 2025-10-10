<script setup>
  const leagueStore = useLeagueStore()
  const { players, armies, league, loading } = storeToRefs(leagueStore)

  onMounted(async () => {
    await leagueStore.fetchPlayers()
    await leagueStore.fetchArmies()
    await leagueStore.fetchLeague()
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading players...
    </div>
    <PlayersView
      v-else
      :players="players"
      :armies="armies"
      :currentRound="league?.currentRound || 1"
      @add-player="leagueStore.addPlayer"
      @remove-player="leagueStore.removePlayer"
    />
  </div>
</template>
