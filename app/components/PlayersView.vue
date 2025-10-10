<script setup>
  import { UserPlus, X, TrendingUp, Mail, Shield, Trophy, Paintbrush, Download } from 'lucide-vue-next'
  import { factions } from '~/data/factions'
  import { usePaintingStats } from '~/composables/usePaintingStats'
  import { usePlayerStats } from '~/composables/usePlayerStats'
  import { useConfirmation } from '~/composables/useConfirmation'
  import { useFormManagement } from '~/composables/useFormManagement'
  import { useDataExport } from '~/composables/useDataExport'

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

  // Composables
  const {
    getPlayerPaintingStats,
    getPaintProgressClass,
    getPaintPercentageColor
  } = usePaintingStats()

  const { getWinPercentage } = usePlayerStats()

  const {
    item: playerToRemove,
    confirm: confirmRemoval,
    execute: removePlayer
  } = useConfirmation((player) => {
    emit('remove-player', player.id)
  })

  const {
    formData: newPlayer,
    resetForm,
    isFormValid
  } = useFormManagement({
    name: '',
    faction: '',
    email: ''
  })

  const { downloadCSV, formatForExport } = useDataExport()

  // Methods
  const submitPlayer = () => {
    if (isFormValid(['name', 'faction'])) {
      emit('add-player', { ...newPlayer.value })
      resetForm()
    }
  }

  const exportPlayers = () => {
    const exportData = formatForExport(props.players, {
      'Name': 'name',
      'Faction': 'faction',
      'Email': 'email',
      'Wins': 'wins',
      'Losses': 'losses',
      'Draws': 'draws',
      'Points': 'points',
      'Win %': (player) => `${getWinPercentage(player)}%`
    })

    downloadCSV(exportData, 'player-standings')
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Players List -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Trophy :size="24" class="text-yellow-500" />
          <h3 class="text-2xl font-serif font-bold text-yellow-500">Registered Players</h3>
        </div>
        <button @click="exportPlayers" class="btn-secondary flex items-center gap-2">
          <Download :size="18" />
          Export CSV
        </button>
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
            <div v-if="getPlayerPaintingStats(player.id, currentRound, armies).totalModels > 0" class="flex items-center space-x-2 text-xs">
              <Paintbrush :size="14" class="text-gray-400" />
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  class="rounded-full h-2 transition-all duration-300"
                  :class="getPaintProgressClass(getPlayerPaintingStats(player.id, currentRound, armies).percentage)"
                  :style="{ width: getPlayerPaintingStats(player.id, currentRound, armies).percentage + '%' }"
                ></div>
              </div>
              <span class="min-w-max" :class="getPaintPercentageColor(getPlayerPaintingStats(player.id, currentRound, armies).percentage)">
                {{ getPlayerPaintingStats(player.id, currentRound, armies).painted }}/{{ getPlayerPaintingStats(player.id, currentRound, armies).totalModels }}
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
          <button @click="removePlayer()" class="btn-secondary flex-1">
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
