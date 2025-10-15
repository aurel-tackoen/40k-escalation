<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { players, armies, currentLeague: league, initializing } = storeToRefs(leaguesStore)
</script>

<template>
  <div class="space-y-8">
    <LoadingSpinner v-if="initializing" message="Loading Players" />
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <ViewsPlayersView
      v-else
      :players="players"
      :armies="armies"
      :currentRound="league?.currentRound || 1"
      @add-player="leaguesStore.addPlayer"
      @update-player="leaguesStore.updatePlayer"
      @remove-player="leaguesStore.removePlayer"
    />
  </div>
</template>
