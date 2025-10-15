<script setup>
  import { ref, computed, toRef } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Plus, Filter, Users, Trophy, X, Flame, TrendingUp, Handshake, Swords, Trash2 } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useMatchResults } from '~/composables/useMatchResults'
  import { useConfirmation } from '~/composables/useConfirmation'
  import { useGameSystems } from '~/composables/useGameSystems'

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
  const { availableMissions, currentGameSystemName, gameSystems } = storeToRefs(leaguesStore)

  // Composables
  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()
  const { getGameSystemBadgeClasses, getGameSystemTextClasses, getGameSystemHintClasses } = useGameSystems(gameSystems)

  const {
    isCloseMatch,
    getWinStreak
  } = useMatchResults(toRef(props, 'matches'))

  const {
    item: matchToDelete,
    confirm: confirmDeleteMatch,
    execute: deleteMatchConfirmed
  } = useConfirmation((match) => {
    emit('delete-match', match.id)
  })

  // Emits
  const emit = defineEmits(['add-match', 'delete-match'])

  // Reactive data
  const newMatch = ref({
    player1Id: null,
    player2Id: null,
    player1Points: null,
    player2Points: null,
    round: null,
    mission: '',
    datePlayed: new Date().toISOString().split('T')[0],
    winnerId: undefined, // undefined = not set, null = draw
    notes: ''
  })

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
    if (isValidMatch()) {
      // Determine winner based on points if not explicitly set
      if (newMatch.value.winnerId === undefined) {
        if (newMatch.value.player1Points > newMatch.value.player2Points) {
          newMatch.value.winnerId = newMatch.value.player1Id
        } else if (newMatch.value.player2Points > newMatch.value.player1Points) {
          newMatch.value.winnerId = newMatch.value.player2Id
        } else {
          newMatch.value.winnerId = null // Draw
        }
      }

      emit('add-match', { ...newMatch.value })
      resetForm()
    }
  }

  const resetForm = () => {
    newMatch.value = {
      player1Id: null,
      player2Id: null,
      player1Points: null,
      player2Points: null,
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

  const isValidMatch = () => {
    return newMatch.value.player1Id &&
      newMatch.value.player2Id &&
      newMatch.value.player1Points !== null &&
      newMatch.value.player2Points !== null &&
      newMatch.value.round &&
      newMatch.value.mission &&
      newMatch.value.datePlayed
  }


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
    <!-- Add Match Form -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Plus :size="24" class="text-yellow-500 flex-shrink-0" />
          <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Record New Match</h3>
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
                {{ player.name }} ({{ player.faction }})
              </option>
            </select>
            <div>
              <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Player 1 Victory Points</label>
              <input
                v-model.number="newMatch.player1Points"
                type="number"
                min="0"
                max="45"
                required
                class="input-field"
                placeholder="0-45"
              />
            </div>
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
                {{ player.name }} ({{ player.faction }})
              </option>
            </select>
            <div>
              <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Player 2 Victory Points</label>
              <input
                v-model.number="newMatch.player2Points"
                type="number"
                min="0"
                max="45"
                required
                class="input-field"
                placeholder="0-45"
              />
            </div>
          </div>
        </div>

        <!-- Match Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm sm:text-base font-semibold text-yellow-500 mb-2">Round</label>
            <select v-model.number="newMatch.round" required class="input-field">
              <option value="">Select Round</option>
              <option value="1">Round 1 - Combat Patrol (500pts)</option>
              <option value="2">Round 2 - Incursion (1000pts)</option>
              <option value="3">Round 3 - Strike Force (2000pts)</option>
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
              class="input-field"
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

    <!-- Match History -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-2">
          <Trophy :size="24" class="text-yellow-500 flex-shrink-0" />
          <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Match History</h3>
        </div>
        <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses() + ' flex-shrink-0'">
          <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-yellow-500 flex-shrink-0" />
          <select v-model="filterRound" class="input-field flex-1">
            <option value="">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Users :size="18" class="text-yellow-500 flex-shrink-0" />
          <select v-model="filterPlayer" class="input-field flex-1">
            <option value="">All Players</option>
            <option v-for="player in players" :key="player.id" :value="player.id">
              {{ player.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="match in filteredMatches"
          :key="match.id"
          class="bg-gray-700 p-3 sm:p-4 rounded-lg"
        >
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm text-gray-200 font-bold">Round {{ match.round }}</span>
              <span class="text-xs sm:text-sm text-gray-400">{{ formatDate(match.datePlayed) }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 px-2 py-1 rounded font-semibold whitespace-nowrap">{{ match.mission }}</span>
              <!-- Match Quality Badge -->
              <span v-if="getMatchQualityBadge(match)" class="flex items-center gap-1 px-2 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap"
                    :class="getMatchQualityBadge(match).class">
                <component :is="getMatchQualityBadge(match).icon" :size="12" class="flex-shrink-0" />
                {{ getMatchQualityBadge(match).text }}
              </span>
              <!-- Delete Button -->
              <button
                @click="confirmDeleteMatch(match)"
                class="p-1.5 sm:p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete match"
              >
                <Trash2 :size="16" class="flex-shrink-0" />
              </button>
            </div>
          </div>

          <div class="mt-3">
            <!-- Match Score - Responsive Design -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <!-- Mobile Scoreboard -->
              <div class="sm:hidden bg-gray-800 rounded-lg border border-gray-600 overflow-hidden flex-1">
                <div class="grid grid-cols-[1fr_auto_1fr] items-stretch">
                  <!-- Player 1 -->
                  <div class="p-3 text-right flex flex-col justify-center" :class="match.winnerId === match.player1Id ? 'bg-green-900/20' : ''">
                    <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player1Id) }}</div>
                    <div class="text-xs text-gray-400 mb-2 truncate">{{ getPlayerFaction(match.player1Id) }}</div>
                    <div class="text-yellow-500 font-bold text-2xl">{{ match.player1Points }}</div>
                    <!-- Win Streak Badge -->
                    <div v-if="getPlayerStreak(match.player1Id)" class="mt-2 inline-flex items-center justify-end gap-1 text-red-400 text-xs font-bold">
                      <Flame :size="12" class="flex-shrink-0" />
                      <span>{{ getPlayerStreak(match.player1Id).count }}W</span>
                    </div>
                  </div>

                  <!-- VS Divider -->
                  <div class="px-3 bg-gray-900/50 border-x border-gray-600 flex items-center justify-center">
                    <Swords :size="18" class="text-gray-400" />
                  </div>

                  <!-- Player 2 -->
                  <div class="p-3 text-left flex flex-col justify-center" :class="match.winnerId === match.player2Id ? 'bg-green-900/20' : ''">
                    <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player2Id) }}</div>
                    <div class="text-xs text-gray-400 mb-2 truncate">{{ getPlayerFaction(match.player2Id) }}</div>
                    <div class="text-yellow-500 font-bold text-2xl">{{ match.player2Points }}</div>
                    <!-- Win Streak Badge -->
                    <div v-if="getPlayerStreak(match.player2Id)" class="mt-2 inline-flex items-center justify-start gap-1 text-red-400 text-xs font-bold">
                      <Flame :size="12" class="flex-shrink-0" />
                      <span>{{ getPlayerStreak(match.player2Id).count }}W</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Scoreboard -->
              <div class="hidden sm:flex items-center justify-start gap-3 sm:gap-4 min-w-0 flex-1">
                <!-- Player 1 -->
                <div class="flex flex-col gap-1 min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm sm:text-base truncate">{{ getPlayerName(match.player1Id) }}</span>
                    <span class="text-yellow-500 font-bold text-base sm:text-lg flex-shrink-0">{{ match.player1Points }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player1Id) }}</span>
                    <!-- Win Streak Badge -->
                    <span v-if="getPlayerStreak(match.player1Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold flex-shrink-0">
                      <Flame :size="12" class="flex-shrink-0" />
                      {{ getPlayerStreak(match.player1Id).count }}W
                    </span>
                  </div>
                </div>

                <!-- VS separator -->
                <span class="text-gray-400 text-xs sm:text-sm font-semibold flex-shrink-0 px-1">VS</span>

                <!-- Player 2 -->
                <div class="flex flex-col gap-1 min-w-0 flex-1">
                  <div class="flex items-center gap-2 justify-end">
                    <span class="text-yellow-500 font-bold text-base sm:text-lg flex-shrink-0">{{ match.player2Points }}</span>
                    <span class="font-semibold text-sm sm:text-base truncate">{{ getPlayerName(match.player2Id) }}</span>
                  </div>
                  <div class="flex items-center gap-2 justify-end">
                    <!-- Win Streak Badge -->
                    <span v-if="getPlayerStreak(match.player2Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold flex-shrink-0">
                      <Flame :size="12" class="flex-shrink-0" />
                      {{ getPlayerStreak(match.player2Id).count }}W
                    </span>
                    <span class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player2Id) }}</span>
                  </div>
                </div>
              </div>

              <!-- Winner/Draw badge -->
              <div class="flex items-center justify-center sm:justify-end flex-shrink-0">
                <div v-if="match.winnerId" class="text-green-400 font-semibold flex items-center gap-2 text-sm bg-green-900/30 px-4 py-2.5 rounded-lg border border-green-700/50">
                  <Trophy :size="16" class="flex-shrink-0" />
                  <span>{{ getPlayerName(match.winnerId) }} Wins!</span>
                </div>
                <div v-else class="text-yellow-400 font-semibold flex items-center gap-2 text-sm bg-yellow-900/30 px-4 py-2.5 rounded-lg border border-yellow-700/50">
                  <Handshake :size="16" class="flex-shrink-0" />
                  <span>Draw</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="match.notes" class="text-center sm:text-left mt-2 text-xs sm:text-sm text-gray-400 italic">
            "{{ match.notes }}"
          </div>
        </div>
      </div>

      <div v-if="filteredMatches.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-base sm:text-lg">No matches found.</p>
        <p class="text-sm sm:text-base">Record your first match above!</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="matchToDelete" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-red-500">
        <h3 class="text-xl font-bold text-red-400 mb-4">Delete Match?</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to delete this match between
          <span class="font-semibold text-yellow-500">{{ getPlayerName(matchToDelete.player1Id) }}</span>
          and
          <span class="font-semibold text-yellow-500">{{ getPlayerName(matchToDelete.player2Id) }}</span>?
          This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <button
            @click="deleteMatchConfirmed"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors cursor-pointer"
          >
            Delete
          </button>
          <button
            @click="matchToDelete = null"
            class="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
