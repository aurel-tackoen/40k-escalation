<script setup>
  import { ref } from 'vue'
  import { UserPlus, X, TrendingUp, Mail, Shield, Trophy, Paintbrush } from 'lucide-vue-next'
  import { factions } from '~/data/factions'

  // Props
  const props = defineProps({
    players: {
      type: Array,
      required: true
    },
    armies: {
      type: Array,
      default: () => []
    },
    currentRound: {
      type: Number,
      default: 1
    }
  })

  // Emits
  const emit = defineEmits(['add-player', 'remove-player'])

  // Reactive data
  const newPlayer = ref({
    name: '',
    faction: '',
    email: ''
  })

  const playerToRemove = ref(null)

  // Methods
  const submitPlayer = () => {
    if (newPlayer.value.name && newPlayer.value.faction) {
      emit('add-player', { ...newPlayer.value })
      resetForm()
    }
  }

  const resetForm = () => {
    newPlayer.value = {
      name: '',
      faction: '',
      email: ''
    }
  }

  const confirmRemoval = (player) => {
    playerToRemove.value = player
  }

  const removePlayer = () => {
    if (playerToRemove.value) {
      emit('remove-player', playerToRemove.value.id)
      playerToRemove.value = null
    }
  }

  const getWinPercentage = (player) => {
    const totalGames = player.wins + player.losses + player.draws
    if (totalGames === 0) return 0
    return (player.wins / totalGames) * 100
  }

  const getPlayerPaintingStats = (playerId) => {
    const army = props.armies.find(a => a.playerId === playerId && a.round === props.currentRound)

    if (!army || !army.units) {
      return { totalModels: 0, painted: 0, percentage: 0 }
    }

    const unitsWithModels = army.units.filter(u => u.totalModels > 0)

    if (unitsWithModels.length === 0) {
      return { totalModels: 0, painted: 0, percentage: 0 }
    }

    const totalModels = unitsWithModels.reduce((sum, u) => sum + (u.totalModels || 0), 0)
    const painted = unitsWithModels.reduce((sum, u) => sum + (u.paintedModels || 0), 0)
    const percentage = totalModels > 0 ? Math.round((painted / totalModels) * 100) : 0

    return { totalModels, painted, percentage }
  }

  const getPaintProgressClass = (percentage) => {
    if (percentage === 100) return 'bg-gradient-to-r from-purple-500 to-purple-600'
    if (percentage >= 71) return 'bg-gradient-to-r from-green-500 to-green-600'
    if (percentage >= 31) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }

  const getPaintPercentageColor = (percentage) => {
    if (percentage === 100) return 'text-purple-400'
    if (percentage >= 71) return 'text-green-400'
    if (percentage >= 31) return 'text-yellow-400'
    return 'text-red-400'
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Players List -->
    <div class="card">
      <div class="flex items-center gap-2 mb-6">
        <Trophy :size="24" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">Registered Players</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="player in players"
          :key="player.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-yellow-500 transition-colors"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="text-lg font-semibold text-gray-100">{{ player.name }}</h4>
              <div class="flex items-center gap-1 text-sm text-yellow-500">
                <Shield :size="14" />
                <p>{{ player.faction }}</p>
              </div>
            </div>
            <button
              @click="confirmRemoval(player)"
              class="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Remove Player"
            >
              <X :size="20" />
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
              <span class="text-gray-400 flex items-center gap-1">
                <Mail :size="14" />
                Email:
              </span>
              <span class="text-gray-300 text-xs">{{ player.email }}</span>
            </div>
          </div>

          <!-- Player Performance Chart -->
          <div class="mt-4 pt-3 border-t border-gray-600">
            <div class="flex items-center space-x-2 text-xs mb-3">
              <TrendingUp :size="14" class="text-gray-400" />
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  class="bg-yellow-500 rounded-full h-2 transition-all duration-300"
                  :style="{ width: getWinPercentage(player) + '%' }"
                ></div>
              </div>
              <span class="text-gray-400 min-w-max">{{ Math.round(getWinPercentage(player)) }}% wins</span>
            </div>

            <!-- Painting Progress -->
            <div v-if="getPlayerPaintingStats(player.id).totalModels > 0" class="flex items-center space-x-2 text-xs">
              <Paintbrush :size="14" class="text-gray-400" />
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  class="rounded-full h-2 transition-all duration-300"
                  :class="getPaintProgressClass(getPlayerPaintingStats(player.id).percentage)"
                  :style="{ width: getPlayerPaintingStats(player.id).percentage + '%' }"
                ></div>
              </div>
              <span class="min-w-max" :class="getPaintPercentageColor(getPlayerPaintingStats(player.id).percentage)">
                {{ getPlayerPaintingStats(player.id).painted }}/{{ getPlayerPaintingStats(player.id).totalModels }}
              </span>
            </div>
            <div v-else class="flex items-center space-x-2 text-xs text-gray-500 italic">
              <Paintbrush :size="14" />
              <span>No army data for current round</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="players.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-lg">No players registered yet.</p>
        <p class="text-sm">Add your first player above to get started!</p>
      </div>
    </div>

    <!-- Add Player Form -->
    <div class="card">
      <div class="flex items-center gap-2 mb-6">
        <UserPlus :size="24" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">Add New Player</h3>
      </div>
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
          <button type="submit" class="btn-primary flex items-center gap-2">
            <UserPlus :size="18" />
            Add Player
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            Reset
          </button>
        </div>
      </form>
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
