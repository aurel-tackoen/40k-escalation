<script setup>
  const leagueStore = useLeagueStore()
  const { matches, players, loading } = storeToRefs(leagueStore)

  onMounted(async () => {
    await Promise.all([
      leagueStore.fetchMatches(),
      leagueStore.fetchPlayers()
    ])
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading matches...
    </div>
    <ViewsMatchesView
      v-else
      :matches="matches"
      :players="players"
      @add-match="leagueStore.addMatch"
    />
  </div>
</template>
