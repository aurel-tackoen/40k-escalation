<script setup>
  const leagueStore = useLeagueStore()
  const { players, loading } = storeToRefs(leagueStore)

  onMounted(async () => {
    await leagueStore.fetchPlayers()
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
      @add-player="leagueStore.addPlayer"
      @remove-player="leagueStore.removePlayer"
    />
  </div>
</template>
