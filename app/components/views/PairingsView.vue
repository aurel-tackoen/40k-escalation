<script setup>
  import { ref, computed, toRef, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Users, Shuffle, Target, Plus, Trash2, ExternalLink } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePairings } from '~/composables/usePairings'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useToast } from '~/composables/useToast'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'  // Props
  const props = defineProps({
    players: {
      type: Array,
      required: true
    },
    pairings: {
      type: Array,
      required: true
    },
    matches: {
      type: Array,
      required: true
    }
  })

  // Store
  const leaguesStore = useLeaguesStore()
  const { currentLeague, leagueSettings, canManageLeague } = storeToRefs(leaguesStore)

  // State - Selected phase (defaults to current phase)
  const selectedPhase = ref(null)

  // Watch for league changes to set initial phase
  watch(() => currentLeague.value, (league) => {
    if (league?.currentPhase && !selectedPhase.value) {
      selectedPhase.value = league.currentPhase
    }
  }, { immediate: true })

  // Composables
  const { toastSuccess, toastError } = useToast()
  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))

  const {
    generateSwissPairings,
    generateRandomPairings,
    createManualPairing,
    getUnpairedPlayers,
    suggestPairingMethod
  } = usePairings(
    toRef(props, 'players'),
    toRef(props, 'matches'),
    toRef(props, 'pairings'),
    leagueSettings
  )

  // State
  const isGenerating = ref(false)
  const manualForm = ref({
    player1Id: null,
    player2Id: null
  })
  const pairingToDelete = ref(null)
  const showDeleteModal = ref(false)
  const showClearAllModal = ref(false)

  // Computed
  const phaseOptions = computed(() => {
    if (!currentLeague.value?.phases || !Array.isArray(currentLeague.value.phases)) {
      return []
    }
    return currentLeague.value.phases.map(r => ({
      value: r.number,
      label: `Phase ${r.number} - ${r.name}`
    }))
  })

  const selectedPhasePairings = computed(() => {
    if (!selectedPhase.value || !props.pairings) return []
    return props.pairings.filter(p => p.phase === selectedPhase.value)
  })

  const selectedPhaseUnpairedCount = computed(() => {
    if (!selectedPhase.value || !props.players || !props.pairings) return 0
    const pairedPlayerIds = new Set()
    selectedPhasePairings.value.forEach(pairing => {
      pairedPlayerIds.add(pairing.player1Id)
      if (pairing.player2Id) pairedPlayerIds.add(pairing.player2Id)
    })
    const activePlayers = props.players.filter(p => p.isActive !== false)
    return activePlayers.length - pairedPlayerIds.size
  })

  const unpairedPlayers = computed(() => {
    if (!selectedPhase.value) return []
    return getUnpairedPlayers(selectedPhase.value)
  })

  const suggestedMethod = computed(() => {
    if (!selectedPhase.value) return 'swiss'
    return suggestPairingMethod(selectedPhase.value)
  })

  // Methods
  const changePhase = (phaseNumber) => {
    selectedPhase.value = phaseNumber
  }

  // Methods
  const generatePairings = async (method) => {
    if (!currentLeague.value || !selectedPhase.value) return

    isGenerating.value = true

    try {
      let newPairings
      if (method === 'swiss') {
        newPairings = generateSwissPairings(selectedPhase.value, currentLeague.value.id)
      } else if (method === 'random') {
        newPairings = generateRandomPairings(selectedPhase.value, currentLeague.value.id)
      }

      // Send to API via store
      await leaguesStore.generatePairings(selectedPhase.value, newPairings)

      toastSuccess(`Generated ${newPairings.length} pairings using ${method} method`)
    } catch (error) {
      console.error('Error generating pairings:', error)
      toastError('Failed to generate pairings')
    } finally {
      isGenerating.value = false
    }
  }

  const addManualPairing = async () => {
    if (!currentLeague.value || !manualForm.value.player1Id || !selectedPhase.value) return

    try {
      const pairing = createManualPairing(
        manualForm.value.player1Id,
        manualForm.value.player2Id,
        selectedPhase.value,
        currentLeague.value.id
      )

      await leaguesStore.createManualPairing(pairing)

      // Reset form
      manualForm.value = { player1Id: null, player2Id: null }

      toastSuccess('Manual pairing created')
    } catch (error) {
      console.error('Error creating manual pairing:', error)
      toastError(error.message || 'Failed to create pairing')
    }
  }

  const confirmDeletePairing = (pairing) => {
    pairingToDelete.value = pairing
    showDeleteModal.value = true
  }

  const deletePairingConfirmed = async () => {
    if (!pairingToDelete.value) return

    try {
      await leaguesStore.deletePairing(pairingToDelete.value.id)
      toastSuccess('Pairing deleted')
      pairingToDelete.value = null
      showDeleteModal.value = false
    } catch (error) {
      console.error('Error deleting pairing:', error)
      toastError('Failed to delete pairing')
    }
  }

  const confirmClearAll = () => {
    showClearAllModal.value = true
  }

  const clearAllPairingsConfirmed = async () => {
    if (!selectedPhase.value || selectedPhasePairings.value.length === 0) return

    try {
      // Delete all pairings for the selected phase
      const deletePromises = selectedPhasePairings.value.map(pairing =>
        leaguesStore.deletePairing(pairing.id)
      )

      await Promise.all(deletePromises)

      toastSuccess(`Cleared all ${deletePromises.length} pairings for Phase ${selectedPhase.value}`)
      showClearAllModal.value = false
    } catch (error) {
      console.error('Error clearing all pairings:', error)
      toastError('Failed to clear all pairings')
    }
  }

  const cancelDeletePairing = () => {
    pairingToDelete.value = null
    showDeleteModal.value = false
  }
</script>

<template>
  <div v-if="!currentLeague" class="text-center py-12">
    <p class="text-gray-400 text-lg">Loading league data...</p>
  </div>

  <div v-else-if="phaseOptions.length === 0" class="text-center py-12">
    <p class="text-gray-400 text-lg">No phases configured for this league.</p>
    <p class="text-gray-500 text-sm mt-2">Set up phases in League Setup first.</p>
  </div>

  <div v-else class="space-y-6">
    <!-- Header with Phase Selector -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <Users class="w-8 h-8 text-blue-400" />
          Pairings
        </h2>

        <!-- Phase Selector -->
        <select
          v-if="phaseOptions.length > 0"
          v-model="selectedPhase"
          @change="changePhase(selectedPhase)"
          class="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="option in phaseOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Clear All Button (Organizer Only) -->
        <button
          v-if="canManageLeague && selectedPhasePairings.length > 0"
          @click="confirmClearAll"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          title="Clear all pairings for this phase"
        >
          <Trash2 class="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div class="text-sm text-gray-400">
        {{ selectedPhasePairings.length }} pairings •
        {{ selectedPhaseUnpairedCount }} unpaired players
      </div>
    </div>

    <!-- Generate Pairings (Organizer Only) -->
    <div v-if="canManageLeague && selectedPhaseUnpairedCount > 0" class="card">
      <h3 class="text-lg font-semibold mb-4">Generate Pairings</h3>

      <div v-if="suggestedMethod" class="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
        <p class="text-sm text-blue-300">
          💡 <strong>Suggested Method:</strong> {{ suggestedMethod }}
          <span v-if="selectedPhase === 1">
            (First phase - use manual or random for balanced start)
          </span>
          <span v-else>
            (Based on league settings)
          </span>
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="generatePairings('swiss')"
          :disabled="isGenerating"
          class="btn-primary flex items-center gap-2"
        >
          <Target class="w-4 h-4" />
          Swiss Pairing
        </button>

        <button
          @click="generatePairings('random')"
          :disabled="isGenerating"
          class="btn-secondary flex items-center gap-2"
        >
          <Shuffle class="w-4 h-4" />
          Random Pairing
        </button>
      </div>

      <p class="text-xs text-gray-400 mt-2">
        Swiss: Pairs players with similar records.
        Random: Randomly assigns matchups.
      </p>
    </div>

    <!-- Manual Pairing (Organizer Only) -->
    <div v-if="canManageLeague" class="card">
      <h3 class="text-lg font-semibold mb-4">Manual Pairing</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          v-model="manualForm.player1Id"
          class="px-4 py-3 rounded-lg bg-gray-700 border-2 border-gray-500 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:border-gray-400 transition-colors"
        >
          <option :value="null" class="bg-gray-800">Select Player 1</option>
          <option
            v-for="player in unpairedPlayers"
            :key="player.id"
            :value="player.id"
            class="bg-gray-800"
          >
            {{ player.name }}
          </option>
        </select>

        <select
          v-model="manualForm.player2Id"
          class="px-4 py-3 rounded-lg bg-gray-700 border-2 border-gray-500 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:border-gray-400 transition-colors"
        >
          <option :value="null" class="bg-gray-800">Select Player 2 (or BYE)</option>
          <option
            v-for="player in unpairedPlayers.filter(p => p.id !== manualForm.player1Id)"
            :key="player.id"
            :value="player.id"
            class="bg-gray-800"
          >
            {{ player.name }}
          </option>
        </select>

        <button
          @click="addManualPairing"
          :disabled="!manualForm.player1Id"
          class="px-6 py-3 rounded-lg font-semibold text-base flex items-center gap-2 justify-start transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white border-2 border-green-500 hover:border-green-400 shadow-lg hover:shadow-green-500/50 disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-600 disabled:shadow-none cursor-pointer"
        >
          <Plus class="w-5 h-5" />
          Create Pairing
        </button>
      </div>

      <p class="text-xs text-gray-400 mt-2">
        Leave Player 2 empty to assign a BYE. BYE players get a free win.
      </p>
    </div>

    <!-- Current Pairings -->
    <div class="space-y-3">
      <h3 class="text-lg font-semibold">Current Pairings</h3>

      <div v-if="selectedPhasePairings.length === 0" class="card text-center py-8 text-gray-400">
        <p>No pairings for this phase yet.</p>
        <p v-if="canManageLeague" class="text-sm mt-2">Generate pairings above to get started.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-600">
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Player 1</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">VS</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Player 2</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">Type</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pairing in selectedPhasePairings"
              :key="pairing.id"
              class="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
            >
              <!-- Player 1 -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-1">
                  <span class="font-semibold text-gray-200">
                    {{ pairing.player1Name || getPlayerName(pairing.player1Id) }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ getPlayerFaction(pairing.player1Id) }}
                  </span>
                </div>
              </td>

              <!-- VS or BYE Indicator -->
              <td class="py-3 px-4 text-center">
                <span class="px-3 py-1 bg-gray-700 rounded font-bold text-sm whitespace-nowrap">
                  {{ pairing.isBye ? 'BYE' : 'VS' }}
                </span>
              </td>

              <!-- Player 2 or Empty -->
              <td class="py-3 px-4">
                <div v-if="pairing.player2Id" class="flex flex-col gap-1">
                  <span class="font-semibold text-gray-200">
                    {{ pairing.player2Name || getPlayerName(pairing.player2Id) }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ getPlayerFaction(pairing.player2Id) }}
                  </span>
                </div>
                <span v-else class="text-gray-500 italic text-sm">Free Win</span>
              </td>

              <!-- Status Badge -->
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap',
                    pairing.status === 'completed'
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  ]"
                >
                  {{ pairing.status === 'completed' ? '✓ Complete' : '⏳ Pending' }}
                </span>
              </td>

              <!-- Pairing Type -->
              <td class="py-3 px-4 text-center">
                <span
                  v-if="pairing.isBye"
                  class="inline-block text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded font-medium whitespace-nowrap"
                >
                  BYE
                </span>
                <span
                  v-else
                  class="inline-block text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded font-medium whitespace-nowrap"
                >
                  Match
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- View Match Button (for completed pairings) -->
                  <NuxtLink
                    v-if="pairing.status === 'completed' && pairing.matchId"
                    :to="`/matches`"
                    class="text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                    title="View match result"
                  >
                    <ExternalLink :size="16" />
                    <span class="text-xs font-medium hidden lg:inline">View</span>
                  </NuxtLink>

                  <!-- Delete Button (Organizer, pending only) -->
                  <button
                    v-if="canManageLeague && pairing.status === 'pending'"
                    @click="confirmDeletePairing(pairing)"
                    class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                    title="Delete pairing"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      :title="`Delete Pairing?`"
      :message="`Are you sure you want to delete this pairing? This action cannot be undone.`"
      confirm-text="Delete"
      @confirm="deletePairingConfirmed"
      @cancel="cancelDeletePairing"
    />

    <!-- Clear All Confirmation Modal -->
    <ConfirmationModal
      :show="showClearAllModal"
      :title="`Clear All Pairings for Phase ${selectedPhase}?`"
      :message="`Are you sure you want to delete all ${selectedPhasePairings.length} pairings for this phase? This action cannot be undone.`"
      confirm-text="Clear All"
      @confirm="clearAllPairingsConfirmed"
      @cancel="showClearAllModal = false"
    />
  </div>
</template>

