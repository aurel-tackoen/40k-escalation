<script setup>
  import { ref, computed, toRef } from 'vue'
  import { Plus, Filter, Calendar, Users, Trophy, X, Download, Flame, TrendingUp } from 'lucide-vue-next'
  import { missions } from '~/data/missions'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useMatchResults } from '~/composables/useMatchResults'
  import { useDataExport } from '~/composables/useDataExport'

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

  // Composables
  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()

  const {
    determineWinner,
    getMatchStatus,
    isCloseMatch,
    getWinStreak
  } = useMatchResults(toRef(props, 'matches'))

  const { exportMatchHistory } = useDataExport()

  // Emits
  const emit = defineEmits(['add-match'])

  // Reactive data
  const newMatch = ref({
    player1Id: null,
    player2Id: null,
    player1Points: null,
    player2Points: null,
    round: null,
    mission: '',
    datePlayed: new Date().toISOString().split('T')[0],
    winnerId: null,
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
      winnerId: null,
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

  // Export matches function
  const exportMatches = () => {
    const exportData = props.matches.map(match => {
      const winner = determineWinner(match.player1Points, match.player2Points, match.player1Id, match.player2Id)
      const status = getMatchStatus(match.player1Points, match.player2Points)

      return {
        'Date': formatDate(match.datePlayed),
        'Round': match.round,
        'Mission': match.mission,
        'Player 1': getPlayerName(match.player1Id),
        'Player 1 Faction': getPlayerFaction(match.player1Id),
        'Player 1 Points': match.player1Points,
        'Player 2': getPlayerName(match.player2Id),
        'Player 2 Faction': getPlayerFaction(match.player2Id),
        'Player 2 Points': match.player2Points,
        'Winner': winner ? getPlayerName(winner) : 'Draw',
        'Point Difference': Math.abs(match.player1Points - match.player2Points),
        'Match Type': status,
        'Notes': match.notes || ''
      }
    })

    exportMatchHistory(exportData, 'match-history')
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
  <div class="space-y-8">
    <!-- Add Match Form -->
    <div class="card">
      <div class="flex items-center gap-2 mb-6">
        <Plus :size="24" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">Record New Match</h3>
      </div>
      <form @submit.prevent="submitMatch" class="space-y-6">
        <!-- Players Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Player 1</label>
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
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Player 1 Victory Points</label>
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
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Player 2</label>
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
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Player 2 Victory Points</label>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Round</label>
            <select v-model.number="newMatch.round" required class="input-field">
              <option value="">Select Round</option>
              <option value="1">Round 1 - Combat Patrol (500pts)</option>
              <option value="2">Round 2 - Incursion (1000pts)</option>
              <option value="3">Round 3 - Strike Force (2000pts)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Mission</label>
            <select v-model="newMatch.mission" required class="input-field">
              <option value="">Select Mission</option>
              <option v-for="mission in missions" :key="mission" :value="mission">
                {{ mission }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Date Played</label>
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
          <label class="block text-sm font-semibold text-yellow-500 mb-2">Result</label>
          <div class="grid grid-cols-3 gap-4">
            <button
              type="button"
              @click="setWinner(newMatch.player1Id)"
              :class="[
                'p-3 rounded-lg border-2 transition-colors cursor-pointer',
                newMatch.winnerId === newMatch.player1Id
                  ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-400'
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
                'p-3 rounded-lg border-2 transition-colors cursor-pointer',
                newMatch.winnerId === null
                  ? 'border-yellow-400 bg-yellow-400 bg-opacity-20 text-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-yellow-400'
              ]"
            >
              Draw
            </button>
            <button
              type="button"
              @click="setWinner(newMatch.player2Id)"
              :class="[
                'p-3 rounded-lg border-2 transition-colors cursor-pointer',
                newMatch.winnerId === newMatch.player2Id
                  ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-400'
                  : 'border-gray-600 text-gray-400 hover:border-green-400'
              ]"
              :disabled="!newMatch.player2Id"
            >
              {{ getPlayerName(newMatch.player2Id) || 'Player 2' }} Wins
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-2">Match Notes (Optional)</label>
          <textarea
            v-model="newMatch.notes"
            class="input-field"
            rows="3"
            placeholder="Any notable moments, strategies, or comments about the match..."
          ></textarea>
        </div>

        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex items-center gap-2 cursor-pointer">
            <Plus :size="18" />
            Record Match
          </button>
          <button type="button" @click="resetForm" class="btn-secondary flex items-center gap-2 cursor-pointer">
            <X :size="18" />
            Reset Form
          </button>
        </div>
      </form>
    </div>

    <!-- Match History -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Trophy :size="24" class="text-yellow-500" />
          <h3 class="text-2xl font-serif font-bold text-yellow-500">Match History</h3>
        </div>
        <button
          @click="exportMatches"
          class="btn-secondary flex items-center gap-2"
          :disabled="matches.length === 0"
        >
          <Download :size="18" />
          Export CSV
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="mb-6 flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-yellow-500" />
          <select v-model="filterRound" class="input-field w-auto">
            <option value="">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Users :size="18" class="text-yellow-500" />
          <select v-model="filterPlayer" class="input-field w-auto">
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
          class="bg-gray-700 border border-gray-600 rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center space-x-4">
              <span class="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                Round {{ match.round }}
              </span>
              <span class="text-sm text-gray-400 flex items-center gap-1">
                <Calendar :size="14" />
                {{ formatDate(match.datePlayed) }}
              </span>
              <span class="text-sm bg-gray-600 text-gray-300 px-2 py-1 rounded">{{ match.mission }}</span>
            </div>
            <!-- Match Quality Badge -->
            <div v-if="getMatchQualityBadge(match)" class="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                 :class="getMatchQualityBadge(match).class">
              <component :is="getMatchQualityBadge(match).icon" :size="14" />
              {{ getMatchQualityBadge(match).text }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <!-- Player 1 -->
            <div class="text-center">
              <div class="font-semibold text-lg">{{ getPlayerName(match.player1Id) }}</div>
              <div class="text-sm text-gray-400">{{ getPlayerFaction(match.player1Id) }}</div>
              <div class="text-2xl font-bold text-yellow-500 mt-2">{{ match.player1Points }}</div>
              <!-- Win Streak Badge -->
              <div v-if="getPlayerStreak(match.player1Id)" class="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                <Flame :size="12" />
                {{ getPlayerStreak(match.player1Id).text }}
              </div>
            </div>

            <!-- VS and Result -->
            <div class="text-center">
              <div class="text-gray-400 text-sm mb-2">VS</div>
              <div v-if="match.winnerId" class="text-green-400 font-semibold">
                🏆 {{ getPlayerName(match.winnerId) }} Wins
              </div>
              <div v-else class="text-yellow-400 font-semibold">
                🤝 Draw
              </div>
            </div>

            <!-- Player 2 -->
            <div class="text-center">
              <div class="font-semibold text-lg">{{ getPlayerName(match.player2Id) }}</div>
              <div class="text-sm text-gray-400">{{ getPlayerFaction(match.player2Id) }}</div>
              <div class="text-2xl font-bold text-yellow-500 mt-2">{{ match.player2Points }}</div>
              <!-- Win Streak Badge -->
              <div v-if="getPlayerStreak(match.player2Id)" class="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                <Flame :size="12" />
                {{ getPlayerStreak(match.player2Id).text }}
              </div>
            </div>
          </div>

          <div v-if="match.notes" class="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300 italic">
            "{{ match.notes }}"
          </div>
        </div>
      </div>

      <div v-if="filteredMatches.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-lg">No matches found.</p>
        <p class="text-sm">Record your first match above!</p>
      </div>
    </div>
  </div>
</template>
