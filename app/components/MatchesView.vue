<template>
  <div class="space-y-8">
    <!-- Add Match Form -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Record New Match</h3>
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
                'p-3 rounded-lg border-2 transition-colors',
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
                'p-3 rounded-lg border-2 transition-colors',
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
                'p-3 rounded-lg border-2 transition-colors',
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
          <button type="submit" class="btn-primary">
            Record Match
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            Reset Form
          </button>
        </div>
      </form>
    </div>

    <!-- Match History -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Match History</h3>
      
      <!-- Filter Controls -->
      <div class="mb-6 flex space-x-4">
        <select v-model="filterRound" class="input-field w-auto">
          <option value="">All Rounds</option>
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
        </select>
        <select v-model="filterPlayer" class="input-field w-auto">
          <option value="">All Players</option>
          <option v-for="player in players" :key="player.id" :value="player.id">
            {{ player.name }}
          </option>
        </select>
      </div>

      <div class="space-y-4">
        <div 
          v-for="match in filteredMatches" 
          :key="match.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center space-x-4">
              <span class="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                Round {{ match.round }}
              </span>
              <span class="text-sm text-gray-400">{{ formatDate(match.datePlayed) }}</span>
              <span class="text-sm bg-gray-600 text-gray-300 px-2 py-1 rounded">{{ match.mission }}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <!-- Player 1 -->
            <div class="text-center">
              <div class="font-semibold text-lg">{{ getPlayerName(match.player1Id) }}</div>
              <div class="text-sm text-gray-400">{{ getPlayerFaction(match.player1Id) }}</div>
              <div class="text-2xl font-bold text-yellow-500 mt-2">{{ match.player1Points }}</div>
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

<script>
export default {
  name: 'MatchesView',
  props: {
    matches: {
      type: Array,
      required: true
    },
    players: {
      type: Array,
      required: true
    }
  },
  emits: ['add-match'],
  data() {
    return {
      newMatch: {
        player1Id: null,
        player2Id: null,
        player1Points: null,
        player2Points: null,
        round: null,
        mission: '',
        datePlayed: new Date().toISOString().split('T')[0],
        winnerId: null,
        notes: ''
      },
      filterRound: '',
      filterPlayer: '',
      missions: [
        'Purge the Enemy',
        'Secure and Control',
        'The Scouring',
        'Big Guns Never Tire',
        'Crusade',
        'Emperor\'s Will',
        'Relic',
        'Vanguard Strike',
        'Dawn of War',
        'Hammer and Anvil'
      ]
    }
  },
  computed: {
    filteredMatches() {
      let filtered = [...this.matches].sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed))
      
      if (this.filterRound) {
        filtered = filtered.filter(match => match.round === parseInt(this.filterRound))
      }
      
      if (this.filterPlayer) {
        const playerId = parseInt(this.filterPlayer)
        filtered = filtered.filter(match => 
          match.player1Id === playerId || match.player2Id === playerId
        )
      }
      
      return filtered
    }
  },
  methods: {
    submitMatch() {
      if (this.isValidMatch()) {
        // Determine winner based on points if not explicitly set
        if (this.newMatch.winnerId === undefined) {
          if (this.newMatch.player1Points > this.newMatch.player2Points) {
            this.newMatch.winnerId = this.newMatch.player1Id
          } else if (this.newMatch.player2Points > this.newMatch.player1Points) {
            this.newMatch.winnerId = this.newMatch.player2Id
          } else {
            this.newMatch.winnerId = null // Draw
          }
        }
        
        this.$emit('add-match', { ...this.newMatch })
        this.resetForm()
      }
    },
    resetForm() {
      this.newMatch = {
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
    },
    setWinner(playerId) {
      this.newMatch.winnerId = playerId
    },
    isValidMatch() {
      return this.newMatch.player1Id && 
             this.newMatch.player2Id && 
             this.newMatch.player1Points !== null && 
             this.newMatch.player2Points !== null &&
             this.newMatch.round &&
             this.newMatch.mission &&
             this.newMatch.datePlayed
    },
    getPlayerName(playerId) {
      const player = this.players.find(p => p.id === playerId)
      return player ? player.name : 'Unknown Player'
    },
    getPlayerFaction(playerId) {
      const player = this.players.find(p => p.id === playerId)
      return player ? player.faction : 'Unknown Faction'
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>