<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { currentLeague: league, loading, canManageLeague } = storeToRefs(leaguesStore)

  onMounted(async () => {
    await leaguesStore.initialize()
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading league settings...
    </div>
    <div v-else-if="!league" class="text-center py-8">
      No league selected. <NuxtLink to="/leagues" class="text-purple-400 hover:text-purple-300">Choose a league</NuxtLink>
    </div>
    <div v-else-if="!canManageLeague" class="text-center py-8 text-red-400">
      You do not have permission to edit league settings. Only league owners and organizers can modify settings.
    </div>
    <ViewsLeagueSetupView
      v-else
      :league="league"
      @update-league="leaguesStore.updateLeague"
    />
  </div>
</template>
