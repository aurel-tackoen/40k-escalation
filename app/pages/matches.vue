<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { matches, players, currentLeague: league, loading } = storeToRefs(leaguesStore)

  onMounted(async () => {
    await leaguesStore.initialize()
  })
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="text-center py-8">
      Loading matches...
    </div>
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
