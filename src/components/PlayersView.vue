<template>
  <div class="space-y-8">
    <!-- Add Player Form -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Add New Player</h3>
      <form @submit.prevent="submitPlayer" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Player Name</label>
            <input 
              v-model="newPlayer.name"
              type="text" 
              required
              class="input-field"
              placeholder="Enter player name"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Faction</label>
            <select v-model="newPlayer.faction" required class="input-field">
              <option value="">Select Faction</option>
              <option v-for="faction in factions" :key="faction" :value="faction">
                {{ faction }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-2">Email (Optional)</label>
          <input 
            v-model="newPlayer.email"
            type="email" 
            class="input-field"
            placeholder="player@email.com"
          />
        </div>
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary">
            Add Player
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Players List -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Registered Players</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="player in players" 
          :key="player.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-yellow-500 transition-colors"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="text-lg font-semibold text-gray-100">{{ player.name }}</h4>
              <p class="text-sm text-yellow-500">{{ player.faction }}</p>
            </div>
            <button 
              @click="confirmRemoval(player)"
              class="text-red-400 hover:text-red-300 transition-colors"
              title="Remove Player"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Record:</span>
              <span class="text-gray-100">
                <span class="text-green-400">{{ player.wins }}W</span> - 
                <span class="text-red-400">{{ player.losses }}L</span> - 
                <span class="text-yellow-400">{{ player.draws }}D</span>
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Total Points:</span>
              <span class="text-yellow-500 font-bold">{{ player.totalPoints }}</span>
            </div>
            <div v-if="player.email" class="flex justify-between text-sm">
              <span class="text-gray-400">Email:</span>
              <span class="text-gray-300 text-xs">{{ player.email }}</span>
            </div>
          </div>

          <!-- Player Performance Chart -->
          <div class="mt-4 pt-3 border-t border-gray-600">
            <div class="flex items-center space-x-2 text-xs">
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div 
                  class="bg-yellow-500 rounded-full h-2 transition-all duration-300"
                  :style="{ width: getWinPercentage(player) + '%' }"
                ></div>
              </div>
              <span class="text-gray-400 min-w-max">{{ Math.round(getWinPercentage(player)) }}% wins</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="players.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-lg">No players registered yet.</p>
        <p class="text-sm">Add your first player above to get started!</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="playerToRemove" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h4 class="text-xl font-bold text-yellow-500 mb-4">Confirm Removal</h4>
        <p class="text-gray-300 mb-6">
          Are you sure you want to remove <strong>{{ playerToRemove.name }}</strong> from the league? 
          This action cannot be undone and all their match history will be lost.
        </p>
        <div class="flex space-x-4">
          <button @click="removePlayer" class="btn-secondary flex-1">
            Remove Player
          </button>
          <button @click="playerToRemove = null" class="btn-primary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayersView',
  props: {
    players: {
      type: Array,
      required: true
    }
  },
  emits: ['add-player', 'remove-player'],
  data() {
    return {
      newPlayer: {
        name: '',
        faction: '',
        email: ''
      },
      playerToRemove: null,
      factions: [
        'Space Marines',
        'Chaos Space Marines', 
        'Imperial Guard',
        'Orks',
        'Eldar',
        'Dark Eldar',
        'Tau Empire',
        'Necrons',
        'Tyranids',
        'Blood Angels',
        'Dark Angels',
        'Space Wolves',
        'Ultramarines',
        'Imperial Fists',
        'Iron Hands',
        'Raven Guard',
        'Salamanders',
        'White Scars',
        'Grey Knights',
        'Deathwatch',
        'Adeptus Custodes',
        'Sisters of Battle',
        'Thousand Sons',
        'Death Guard',
        'World Eaters',
        'Emperor\'s Children',
        'Iron Warriors',
        'Alpha Legion',
        'Night Lords',
        'Word Bearers',
        'Black Legion',
        'Craftworld Eldar',
        'Harlequins',
        'Ynnari',
        'Leagues of Votann'
      ]
    }
  },
  methods: {
    submitPlayer() {
      if (this.newPlayer.name && this.newPlayer.faction) {
        this.$emit('add-player', { ...this.newPlayer })
        this.resetForm()
      }
    },
    resetForm() {
      this.newPlayer = {
        name: '',
        faction: '',
        email: ''
      }
    },
    confirmRemoval(player) {
      this.playerToRemove = player
    },
    removePlayer() {
      if (this.playerToRemove) {
        this.$emit('remove-player', this.playerToRemove.id)
        this.playerToRemove = null
      }
    },
    getWinPercentage(player) {
      const totalGames = player.wins + player.losses + player.draws
      if (totalGames === 0) return 0
      return (player.wins / totalGames) * 100
    }
  }
}
</script>