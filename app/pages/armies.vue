<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, players, armies, initializing } = storeToRefs(leaguesStore)
</script>

<template>
  <div class="space-y-8">
    <LoadingSpinner v-if="initializing" message="Loading Army Lists" />
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <ViewsArmyListsView
      v-else
      :players="players"
      :armies="armies"
      :current-phase="league.currentPhase"
      :phases="league.phases"
      @save-army="leaguesStore.saveArmy"
      @delete-army="leaguesStore.deleteArmy"
    />
  </div>
</template>
