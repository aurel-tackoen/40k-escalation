<script setup>
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { matches, players, currentLeague: league, initializing } = storeToRefs(leaguesStore)

  // Debug handler for delete match
  const handleDeleteMatch = async (matchId) => {
    console.log('Page received delete-match event with matchId:', matchId)
    try {
      await leaguesStore.deleteMatch(matchId)
      console.log('Match deleted successfully')
    } catch (error) {
      console.error('Error deleting match:', error)
    }
  }
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
      @delete-match="handleDeleteMatch"
    />
  </div>
</template>
