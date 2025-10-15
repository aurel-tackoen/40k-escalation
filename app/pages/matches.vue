<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { matches, players, currentLeague: league, initializing } = storeToRefs(leaguesStore)
</script>

<template>
  <div class="space-y-8">
    <LoadingSpinner v-if="initializing" message="Loading Matches" />
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <ViewsMatchesView
      v-else
      :matches="matches"
      :players="players"
      @add-match="leaguesStore.addMatch"
    />
  </div>
</template>
