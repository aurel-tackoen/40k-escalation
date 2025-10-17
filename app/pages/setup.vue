<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, players, initializing, canManageLeague } = storeToRefs(leaguesStore)
</script>

<template>
  <div class="space-y-8">
    <LoadingSpinner v-if="initializing" message="Loading League Settings" />
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <div v-else-if="!canManageLeague" class="text-center py-8 text-red-400">
      You do not have permission to edit league settings. Only league owners and organizers can modify settings.
    </div>
    <ViewsLeagueSetupView
      v-else
      :league="league"
      :players="players"
      @update-league="leaguesStore.updateLeague"
    />
  </div>
</template>
