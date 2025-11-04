<script setup>
  import { ref, computed, toRef, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Plus, Filter, Users, Trophy, X, Flame, TrendingUp, Handshake, Trash2, LayoutGrid, TableProperties, Swords } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useMatchResults } from '~/composables/useMatchResults'
  import { useGameSystems } from '~/composables/useGameSystems'
  import { useMatchValidation } from '~/composables/useMatchValidation'
  import { usePlaceholders } from '~/composables/usePlaceholders'
  import { useToast } from '~/composables/useToast'
  import { usePlayerDisplay } from '~/composables/usePlayerDisplay'
  import { usePermissions } from '~/composables/usePermissions'
  import { useViewMode } from '~/composables/useViewMode'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'
  import MatchCard from '~/components/MatchCard.vue'

  // Props
  const props = defineProps({
    matches: {
      type: Array,
      required: true
    },
    players: {
      type: Array,
      required: true
    }
  })

  // Get dynamic missions from store
  const leaguesStore = useLeaguesStore()
  const { availableMissions, currentGameSystemName, gameSystems, canManageLeague, currentPlayer, currentLeague, selectedLeague } = storeToRefs(leaguesStore)

  // Get rounds from current league
  const leagueRounds = computed(() => currentLeague.value?.rounds || [])

  // Composables
  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()
  const { getGameSystemBadgeClasses, getGameSystemTextClasses, getGameSystemHintClasses } = useGameSystems(gameSystems)
  const { placeholders } = usePlaceholders(selectedLeague)
  const { getPlayerDisplayName, getPlayerFilterName } = usePlayerDisplay(currentPlayer)

  const {
    isCloseMatch,
    getWinStreak
  } = useMatchResults(toRef(props, 'matches'))

  const { canDeleteMatch } = usePermissions(currentPlayer, canManageLeague, null)

  const { viewMode, setViewMode } = useViewMode('cards')

  // Toast notifications
  const { toastSuccess, toastError } = useToast()

  // Emits
  const emit = defineEmits(['add-match', 'delete-match'])

  // Match deletion state
  const matchToDelete = ref(null)
  const showDeleteModal = ref(false)

  const confirmDeleteMatch = (match) => {
    matchToDelete.value = match
    showDeleteModal.value = true
  }

  const deleteMatchConfirmed = () => {
    if (matchToDelete.value) {
      console.log('Delete match callback called with match:', matchToDelete.value)
      emit('delete-match', matchToDelete.value.id)
      console.log('Emitted delete-match event with id:', matchToDelete.value.id)
      toastSuccess('Match deleted successfully')
      matchToDelete.value = null
      showDeleteModal.value = false
    }
  }

  const cancelDeleteMatch = () => {
    matchToDelete.value = null
    showDeleteModal.value = false
  }

  // Get current game system and match config
  const currentGameSystem = computed(() =>
    gameSystems.value.find(gs => gs.id === currentLeague.value?.gameSystemId)
  )

  const matchConfig = computed(() => currentGameSystem.value?.matchConfig || {})
  const matchType = computed(() => currentGameSystem.value?.matchType || 'victory_points')

  // Reactive data - with all match type fields
  const newMatch = ref({
    player1Id: null,
    player2Id: null,

    // Match type and game system
    matchType: matchType.value,
    gameSystemId: null,

    // Victory Points (40k, AoS, HH)
    player1Points: null,
    player2Points: null,

    // Percentage/Casualties (ToW)
    player1ArmyValue: null,
    player2ArmyValue: null,
    player1CasualtiesValue: null,
    player2CasualtiesValue: null,

    // Scenario (MESBG)
    scenarioObjective: '',
    player1ObjectiveCompleted: false,
    player2ObjectiveCompleted: false,

    // Common fields
    round: null,
    mission: '',
    datePlayed: new Date().toISOString().split('T')[0],
    winnerId: undefined, // undefined = not set, null = draw
    notes: ''
  })

  // Watch for league changes to update matchType
  watch(currentLeague, (league) => {
    if (league?.gameSystemId) {
      newMatch.value.gameSystemId = league.gameSystemId
      newMatch.value.matchType = matchType.value
    }
  }, { immediate: true })

  // Use validation composable
  const matchValidation = useMatchValidation(toRef(() => newMatch.value))

  const filterRound = ref('')
  const filterPlayer = ref('')

  // Computed properties
  const filteredMatches = computed(() => {
    let filtered = [...props.matches].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed))

    if (filterRound.value) {
      filtered = filtered.filter(match => match.round === parseInt(filterRound.value))
    }

    if (filterPlayer.value) {
      const playerId = parseInt(filterPlayer.value)
      filtered = filtered.filter(match =>
        match.player1Id === playerId || match.player2Id === playerId
      )
    }

    return filtered
  })

  // Methods
  const submitMatch = () => {
    // Validate match using composable
    const validation = matchValidation.validateMatch()
    if (!validation.isValid) {
      toastError(validation.errors.join('\n'))
      return
    }

    // Determine winner using composable (unless explicitly set)
    if (newMatch.value.winnerId === undefined) {
      newMatch.value.winnerId = matchValidation.determineWinner()
    }

    // Calculate ToW margin if applicable
    if (matchType.value === 'percentage') {
      newMatch.value.marginOfVictory = matchValidation.calculateTowMargin(
        newMatch.value.player1CasualtiesValue,
        newMatch.value.player2CasualtiesValue,
        newMatch.value.player1ArmyValue,
        newMatch.value.player2ArmyValue
      )
    }

    emit('add-match', { ...newMatch.value })
    resetForm()

    toastSuccess('Match recorded successfully!')

    // Scroll to top to see the newly added match
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    newMatch.value = {
      player1Id: null,
      player2Id: null,

      // Match type and game system
      matchType: matchType.value,
      gameSystemId: currentLeague.value?.gameSystemId || null,

      // Victory Points (40k, AoS, HH)
      player1Points: null,
      player2Points: null,

      // Percentage/Casualties (ToW)
      player1ArmyValue: null,
      player2ArmyValue: null,
      player1CasualtiesValue: null,
      player2CasualtiesValue: null,

      // Scenario (MESBG)
      scenarioObjective: '',
      player1ObjectiveCompleted: false,
      player2ObjectiveCompleted: false,

      // Common fields
      round: null,
      mission: '',
      datePlayed: new Date().toISOString().split('T')[0],
      winnerId: undefined, // undefined = not set, null = draw
      notes: ''
    }
  }

  const setWinner = (playerId) => {
    newMatch.value.winnerId = playerId
  }

  // Computed ToW margin for real-time display
  const calculatedTowMargin = computed(() => {
    if (matchType.value !== 'percentage') return null
    if (!newMatch.value.player1ArmyValue || !newMatch.value.player2ArmyValue) return null

    return matchValidation.calculateTowMargin(
      newMatch.value.player1CasualtiesValue || 0,
      newMatch.value.player2CasualtiesValue || 0,
      newMatch.value.player1ArmyValue,
      newMatch.value.player2ArmyValue
    )
  })


  // Get match quality badge
  const getMatchQualityBadge = (match) => {
    if (isCloseMatch(match.player1Points, match.player2Points)) {
      return { text: 'Close Game!', class: 'bg-orange-500 text-white', icon: Flame }
    }
    const diff = Math.abs(match.player1Points - match.player2Points)
    if (diff >= 20) {
      return { text: 'Decisive Victory', class: 'bg-purple-500 text-white', icon: TrendingUp }
    }
    return null
  }

  // Get player win streak for display
  const getPlayerStreak = (playerId) => {
    const streak = getWinStreak(playerId)
    if (streak >= 3) {
      return { count: streak, text: `${streak} Win Streak!` }
    }
    return null
  }
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Match History -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">

        <div class="flex items-center gap-3">
          <Trophy :size="32" class="text-yellow-500" />
          <div>
            <h2 class="text-2xl font-serif font-bold text-yellow-500">Match History</h2>
            <p class="text-gray-400 text-sm mt-1">View and filter all recorded matches.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses() + ' flex-shrink-0'">
            <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-yellow-500 flex-shrink-0" />
          <select v-model="filterRound" class="input-field flex-1">
            <option value="">All Rounds</option>
            <option v-for="round in leagueRounds" :key="round.number" :value="round.number">
              {{ round.name }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Users :size="18" class="text-yellow-500 flex-shrink-0" />
          <select v-model="filterPlayer" class="input-field flex-1">
            <option value="">All Players</option>
            <option v-for="player in players" :key="player.id" :value="player.id">
              {{ getPlayerFilterName(player) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Section Header with View Toggle -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-2">
          <Swords :size="24" class="text-yellow-500" />
          <h3 class="text-2xl font-serif font-bold text-yellow-500">
            Recorded Matches
            <span class="text-lg text-gray-300 font-bold">({{ filteredMatches.length }})</span>
          </h3>
        </div>

        <!-- View Toggle -->
        <div class="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          <button
            @click="setViewMode('cards')"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm font-medium cursor-pointer',
              viewMode === 'cards'
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            <LayoutGrid :size="16" />
            Cards
          </button>
          <button
            @click="setViewMode('table')"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm font-medium cursor-pointer',
              viewMode === 'table'
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            <TableProperties :size="16" />
            Table
          </button>
        </div>
      </div>
      <!-- Card View -->
      <div v-if="filteredMatches.length > 0 && viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MatchCard
          v-for="match in filteredMatches"
          :key="match.id"
          :match="match"
          :get-player-name="getPlayerName"
          :get-player-faction="getPlayerFaction"
          :format-date="formatDate"
          :get-match-quality-badge="getMatchQualityBadge"
          :get-player-streak="getPlayerStreak"
          :show-delete="true"
          :can-delete="canDeleteMatch(match)"
          @delete="confirmDeleteMatch"
        />
      </div>

      <!-- Table View -->
      <div v-if="filteredMatches.length > 0 && viewMode === 'table'" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-600">
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Round</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Date</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Player 1</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">Score</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Player 2</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-300">Mission</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">Result</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-300">Quality</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="match in filteredMatches"
              :key="match.id"
              class="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
            >
              <!-- Round -->
              <td class="py-3 px-4">
                <span class="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-semibold text-sm whitespace-nowrap">
                  Round {{ match.round }}
                </span>
              </td>

              <!-- Date -->
              <td class="py-3 px-4 text-gray-300 text-sm">
                {{ formatDate(match.datePlayed) }}
              </td>

              <!-- Player 1 -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-1">
                  <span class="font-semibold text-gray-200">{{ getPlayerName(match.player1Id) }}</span>
                  <span class="text-xs text-gray-400">{{ getPlayerFaction(match.player1Id) }}</span>
                  <span v-if="getPlayerStreak(match.player1Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold">
                    <Flame :size="12" class="flex-shrink-0" />
                    {{ getPlayerStreak(match.player1Id).count }}W
                  </span>
                </div>
              </td>

              <!-- Score -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span class="text-yellow-500 font-bold text-lg" :class="match.winnerId === match.player1Id ? 'text-green-400' : ''">
                    {{ match.player1Points }}
                  </span>
                  <span class="text-gray-500">-</span>
                  <span class="text-yellow-500 font-bold text-lg" :class="match.winnerId === match.player2Id ? 'text-green-400' : ''">
                    {{ match.player2Points }}
                  </span>
                </div>
              </td>

              <!-- Player 2 -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-1">
                  <span class="font-semibold text-gray-200">{{ getPlayerName(match.player2Id) }}</span>
                  <span class="text-xs text-gray-400">{{ getPlayerFaction(match.player2Id) }}</span>
                  <span v-if="getPlayerStreak(match.player2Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold">
                    <Flame :size="12" class="flex-shrink-0" />
                    {{ getPlayerStreak(match.player2Id).count }}W
                  </span>
                </div>
              </td>

              <!-- Mission -->
              <td class="py-3 px-4 min-w-[120px]">
                <span class="inline-block text-xs bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 px-2 py-1 rounded font-semibold whitespace-nowrap">
                  {{ match.mission }}
                </span>
              </td>

              <!-- Result -->
              <td class="py-3 px-4 text-center min-w-[100px]">
                <div v-if="match.winnerId" class="inline-flex items-center gap-1 text-green-400 text-sm font-semibold whitespace-nowrap">
                  <Trophy :size="14" class="flex-shrink-0" />
                  <span class="hidden lg:inline">{{ getPlayerName(match.winnerId) }}</span>
                  <span class="lg:hidden">Win</span>
                </div>
                <div v-else class="inline-flex items-center gap-1 text-yellow-400 text-sm font-semibold whitespace-nowrap">
                  <Handshake :size="14" class="flex-shrink-0" />
                  <span>Draw</span>
                </div>
              </td>

              <!-- Quality Badge -->
              <td class="py-3 px-4 text-center min-w-[120px]">
                <span v-if="getMatchQualityBadge(match)" class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
                      :class="getMatchQualityBadge(match).class">
                  <component :is="getMatchQualityBadge(match).icon" :size="12" class="flex-shrink-0" />
                  <span>{{ getMatchQualityBadge(match).text }}</span>
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <button
                  v-if="canDeleteMatch(match)"
                  @click="confirmDeleteMatch(match)"
                  class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                  title="Delete match"
                >
                  <Trash2 :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredMatches.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-base sm:text-lg">No matches found.</p>
        <p class="text-sm sm:text-base">Record your first match above!</p>
      </div>
    </div>

    <!-- Add Match Form -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-2">
          <Plus :size="24" class="text-yellow-500 flex-shrink-0" />
          <h2 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Record New Match</h2>
        </div>
        <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses()">
          <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
        </div>
      </div>
      <form @submit.prevent="submitMatch" class="space-y-6">
        <!-- Players Selection -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div class="space-y-4">
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Player 1</label>
            <select v-model="newMatch.player1Id" required class="input-field">
              <option value="">Select Player 1</option>
              <option
                v-for="player in players"
                :key="player.id"
                :value="player.id"
                :disabled="newMatch.player2Id === player.id"
              >
                {{ getPlayerDisplayName(player) }}
              </option>
            </select>
          </div>

          <div class="space-y-4">
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Player 2</label>
            <select v-model="newMatch.player2Id" required class="input-field">
              <option value="">Select Player 2</option>
              <option
                v-for="player in players"
                :key="player.id"
                :value="player.id"
                :disabled="newMatch.player1Id === player.id"
              >
                {{ getPlayerDisplayName(player) }}
              </option>
            </select>
          </div>
        </div>

        <!-- CONDITIONAL SCORING FIELDS BASED ON MATCH TYPE -->

        <!-- Victory Points (40k, AoS, HH) -->
        <template v-if="matchType === 'victory_points'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">
                Player 1 {{ matchConfig.pointsLabel || 'Victory Points' }}
              </label>
              <input
                v-model.number="newMatch.player1Points"
                type="number"
                :min="matchConfig.pointsRange?.min || 0"
                :max="matchConfig.pointsRange?.max || 100"
                required
                class="input-field"
                :placeholder="`${matchConfig.pointsRange?.min || 0}-${matchConfig.pointsRange?.max || 100}`"
              />
            </div>
            <div>
              <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">
                Player 2 {{ matchConfig.pointsLabel || 'Victory Points' }}
              </label>
              <input
                v-model.number="newMatch.player2Points"
                type="number"
                :min="matchConfig.pointsRange?.min || 0"
                :max="matchConfig.pointsRange?.max || 100"
                required
                class="input-field"
                :placeholder="`${matchConfig.pointsRange?.min || 0}-${matchConfig.pointsRange?.max || 100}`"
              />
            </div>
          </div>
        </template>

        <!-- Percentage/Casualties (The Old World) -->
        <template v-if="matchType === 'percentage'">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-yellow-500 flex items-center gap-2">
              <Swords :size="20" />
              Army Values
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 1 Army Value (points)
                </label>
                <input
                  v-model.number="newMatch.player1ArmyValue"
                  type="number"
                  min="0"
                  required
                  class="input-field"
                  placeholder="Total army points"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 2 Army Value (points)
                </label>
                <input
                  v-model.number="newMatch.player2ArmyValue"
                  type="number"
                  min="0"
                  required
                  class="input-field"
                  placeholder="Total army points"
                />
              </div>
            </div>

            <h3 class="text-lg font-semibold text-yellow-500 flex items-center gap-2 mt-6">
              <Trophy :size="20" />
              Casualties Inflicted
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 1 Casualties (points destroyed)
                </label>
                <input
                  v-model.number="newMatch.player1CasualtiesValue"
                  type="number"
                  min="0"
                  required
                  class="input-field"
                  placeholder="Enemy points destroyed"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 2 Casualties (points destroyed)
                </label>
                <input
                  v-model.number="newMatch.player2CasualtiesValue"
                  type="number"
                  min="0"
                  required
                  class="input-field"
                  placeholder="Enemy points destroyed"
                />
              </div>
            </div>

            <!-- Show calculated margin -->
            <div v-if="calculatedTowMargin" class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <p class="text-sm text-purple-300">
                Calculated Margin:
                <span class="font-bold text-purple-100 ml-2">{{ calculatedTowMargin }}</span>
              </p>
            </div>
          </div>
        </template>

        <!-- Scenario-based (MESBG) -->
        <template v-if="matchType === 'scenario'">
          <div class="space-y-4">
            <div>
              <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">
                Scenario Objective *
              </label>
              <textarea
                v-model="newMatch.scenarioObjective"
                class="input-field"
                rows="3"
                required
                :placeholder="placeholders.scenarioObjective"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
                <input
                  type="checkbox"
                  id="p1-objective"
                  v-model="newMatch.player1ObjectiveCompleted"
                  class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0 checked:bg-yellow-500 checked:border-yellow-500 hover:border-yellow-400 transition-colors cursor-pointer"
                />
                <label for="p1-objective" class="text-sm font-semibold text-gray-200 cursor-pointer">
                  Player 1 Completed Objective
                </label>
              </div>

              <div class="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
                <input
                  type="checkbox"
                  id="p2-objective"
                  v-model="newMatch.player2ObjectiveCompleted"
                  class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0 checked:bg-yellow-500 checked:border-yellow-500 hover:border-yellow-400 transition-colors cursor-pointer"
                />
                <label for="p2-objective" class="text-sm font-semibold text-gray-200 cursor-pointer">
                  Player 2 Completed Objective
                </label>
              </div>
            </div>

            <h3 class="text-sm font-semibold text-gray-400 mt-6">Casualties (Optional Tiebreaker)</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 1 Casualties Inflicted
                </label>
                <input
                  v-model.number="newMatch.player1Points"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-yellow-500 mb-2">
                  Player 2 Casualties Inflicted
                </label>
                <input
                  v-model.number="newMatch.player2Points"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Match Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Round</label>
            <select v-model.number="newMatch.round" required class="input-field">
              <option value="">Select Round</option>
              <option v-for="round in leagueRounds" :key="round.number" :value="round.number">
                {{ round.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">
              Mission
              <span v-if="currentGameSystemName" :class="getGameSystemHintClasses()">({{ currentGameSystemName }})</span>
            </label>
            <select v-model="newMatch.mission" required class="input-field">
              <option value="">Select Mission</option>
              <option v-for="mission in availableMissions" :key="mission.id" :value="mission.name">
                {{ mission.name }}
                <span v-if="mission.category"> - {{ mission.category }}</span>
              </option>
            </select>
          </div>
          <div class="sm:col-span-2 lg:col-span-1">
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Date Played</label>
            <input
              v-model="newMatch.datePlayed"
              type="date"
              required
              class="input-field cursor-pointer"
              @click="(e) => e.target.showPicker?.()"
            />
          </div>
        </div>

        <!-- Winner Selection -->
        <div>
          <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Result (Optional - Auto-calculated from points)</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              type="button"
              @click="setWinner(newMatch.player1Id)"
              :class="[
                'p-3 rounded-lg border-2 transition-colors font-bold text-sm sm:text-base',
                !newMatch.player1Id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                newMatch.winnerId === newMatch.player1Id && newMatch.player1Id
                  ? 'border-green-400 bg-green-400 bg-opacity-20 text-gray-900'
                  : 'border-gray-600 text-gray-400 hover:border-green-400'
              ]"
              :disabled="!newMatch.player1Id"
            >
              {{ getPlayerName(newMatch.player1Id) || 'Player 1' }} Wins
            </button>
            <button
              type="button"
              @click="setWinner(null)"
              :class="[
                'p-3 rounded-lg border-2 transition-colors cursor-pointer font-bold text-sm sm:text-base',
                newMatch.winnerId === null && newMatch.winnerId !== undefined
                  ? 'border-yellow-400 bg-yellow-400 bg-opacity-20 text-gray-900'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              ]"
            >
              Draw
            </button>
            <button
              type="button"
              @click="setWinner(newMatch.player2Id)"
              :class="[
                'p-3 rounded-lg border-2 transition-colors font-bold text-sm sm:text-base',
                !newMatch.player2Id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                newMatch.winnerId === newMatch.player2Id && newMatch.player2Id
                  ? 'border-green-400 bg-green-400 bg-opacity-20 text-gray-900'
                  : 'border-gray-600 text-gray-400 hover:border-green-400'
              ]"
              :disabled="!newMatch.player2Id"
            >
              {{ getPlayerName(newMatch.player2Id) || 'Player 2' }} Wins
            </button>
          </div>
          <p class="text-xs sm:text-sm text-gray-500 mt-2">Leave unselected to auto-determine winner based on points</p>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Match Notes (Optional)</label>
          <textarea
            v-model="newMatch.notes"
            class="input-field"
            rows="3"
            placeholder="Any notable moments, strategies, or comments about the match..."
          ></textarea>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button type="submit" class="btn-primary flex items-center justify-center gap-2">
            <Plus :size="18" class="flex-shrink-0" />
            <span>Save Match</span>
          </button>
          <button type="button" @click="resetForm" class="btn-secondary flex items-center justify-center gap-2">
            <X :size="18" class="flex-shrink-0" />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete Match?"
      :message="`Are you sure you want to delete this match between <span class='font-semibold text-yellow-500'>${matchToDelete ? getPlayerName(matchToDelete.player1Id) : ''}</span> and <span class='font-semibold text-yellow-500'>${matchToDelete ? getPlayerName(matchToDelete.player2Id) : ''}</span>? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="deleteMatchConfirmed"
      @cancel="cancelDeleteMatch"
    />
  </div>
</template>
