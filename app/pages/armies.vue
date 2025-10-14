<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, players, armies, loading } = storeToRefs(leaguesStore)

  onMounted(async () => {
    await leaguesStore.initialize()
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading army lists...
    </div>
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <ViewsArmyListsView
      v-else
      :players="players"
      :armies="armies"
      :current-round="league.currentRound"
      :rounds="league.rounds"
      @save-army="leaguesStore.saveArmy"
      @delete-army="leaguesStore.deleteArmy"
    />
  </div>
</template>
