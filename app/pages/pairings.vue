<script setup>
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'
  import PairingsView from '~/components/views/PairingsView.vue'
  import LoadingSpinner from '~/components/LoadingSpinner.vue'

  // Store
  const leaguesStore = useLeaguesStore()
  const { currentLeague, players, pairings, matches, loading } = storeToRefs(leaguesStore)

  // Set page title
  useHead({
    title: 'Pairings - Warhammer League Manager'
  })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <LoadingSpinner v-if="loading" />

    <div v-else-if="!currentLeague" class="text-center py-12">
      <p class="text-gray-400 text-lg">
        Please select a league to view pairings
      </p>
    </div>

    <PairingsView
      v-else
      :players="players"
      :pairings="pairings"
      :matches="matches"
    />
  </div>
</template>
