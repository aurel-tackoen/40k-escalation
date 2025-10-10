<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="card">
      <h1 class="text-3xl font-bold text-yellow-500 mb-2">🎨 Painting Progress</h1>
      <p class="text-gray-300">Track your miniature painting progress throughout the escalation league.</p>
    </div>

    <!-- Painting Leaderboard -->
    <div class="card">
      <h2 class="text-2xl font-bold text-yellow-500 mb-4">🏆 Painting Leaderboard</h2>
      <p class="text-gray-400 text-sm mb-4">Current Round: {{ store.currentLeague?.currentRound || 1 }}</p>
      
      <div v-if="store.paintingLeaderboard.length === 0" class="text-center text-gray-400 py-8">
        No painting progress recorded yet. Start tracking your painted models!
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="(entry, index) in store.paintingLeaderboard" 
          :key="entry.playerId" 
          class="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center space-x-3">
              <div class="text-2xl font-bold">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else class="text-gray-500">#{{ index + 1 }}</span>
              </div>
              <div>
                <div class="font-bold text-lg">{{ entry.playerName }}</div>
                <div class="text-sm text-gray-400">{{ entry.faction }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="getPercentageColorClass(entry.paintedPercentage)">
                {{ entry.paintedPercentage }}%
              </div>
              <div class="text-sm text-gray-400">
                {{ entry.paintedModels }} / {{ entry.totalModels }} models
              </div>
            </div>
          </div>
          
          <div class="progress-bar h-6 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500"
              :style="{ width: entry.paintedPercentage + '%' }"
              :class="getProgressBarClass(entry.paintedPercentage)"
            ></div>
          </div>

          <div class="mt-3 flex justify-between text-sm text-gray-400">
            <span>{{ entry.paintedPoints }} / {{ entry.totalPoints }} points painted</span>
            <span v-if="entry.isFullyPainted" class="text-purple-400 font-semibold">✨ Fully Painted!</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Filters -->
    <div class="card">
      <div class="flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Filter by Player</label>
          <select v-model="selectedPlayerId" class="input-field">
            <option :value="null">All Players</option>
            <option v-for="player in store.players" :key="player.id" :value="player.id">
              {{ player.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Filter by Round</label>
          <select v-model="selectedRound" class="input-field">
            <option :value="null">All Rounds</option>
            <option v-for="round in maxRounds" :key="round" :value="round">
              Round {{ round }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Player Progress Details -->
    <div v-for="player in filteredPlayers" :key="player.id" class="card">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-bold text-yellow-500">{{ player.name }}</h3>
          <p class="text-sm text-gray-400">{{ player.faction }}</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-400">Overall Progress</div>
          <div class="text-lg font-bold" :class="getPercentageColorClass(getOverallStats(player.id).paintedPercentage)">
            {{ getOverallStats(player.id).paintedPercentage }}%
          </div>
        </div>
      </div>

      <div v-for="round in filteredRounds" :key="round" class="mb-6 last:mb-0">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-lg font-semibold">Round {{ round }}</h4>
          <button 
            @click="openModal(player.id, round)"
            class="btn-primary text-sm"
          >
            + Add Unit
          </button>
        </div>
        
        <PaintingProgress 
          :stats="store.getPaintingStats(player.id, round)"
          :editable="true"
          @add-unit="openModal(player.id, round)"
          @edit-unit="editUnit"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredPlayers.length === 0" class="card text-center py-12">
      <div class="text-gray-400 text-lg">
        No players found. Add players to start tracking painting progress!
      </div>
    </div>

    <!-- Painting Progress Modal -->
    <PaintingProgressModal
      :show="showModal"
      :playerId="modalPlayerId"
      :round="modalRound"
      :editingUnit="editingUnit"
      @save="handleSave"
      @delete="handleDelete"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeagueStore } from '~/stores/league'
import PaintingProgress from '~/components/PaintingProgress.vue'
import PaintingProgressModal from '~/components/PaintingProgressModal.vue'

const store = useLeagueStore()

// Reactive state
const showModal = ref(false)
const modalPlayerId = ref(null)
const modalRound = ref(null)
const editingUnit = ref(null)
const selectedPlayerId = ref(null)
const selectedRound = ref(null)

// Computed properties
const maxRounds = computed(() => {
  return store.currentLeague?.currentRound || 5
})

const filteredPlayers = computed(() => {
  if (selectedPlayerId.value) {
    return store.players.filter(p => p.id === selectedPlayerId.value)
  }
  return store.players
})

const filteredRounds = computed(() => {
  if (selectedRound.value) {
    return [selectedRound.value]
  }
  return Array.from({ length: maxRounds.value }, (_, i) => i + 1)
})

// Methods
const openModal = (playerId, round) => {
  modalPlayerId.value = playerId
  modalRound.value = round
  editingUnit.value = null
  showModal.value = true
}

const editUnit = (unit) => {
  modalPlayerId.value = unit.playerId
  modalRound.value = unit.round
  editingUnit.value = unit
  showModal.value = true
}

const handleSave = async (data) => {
  try {
    await store.updatePaintingProgress(data)
    showModal.value = false
    editingUnit.value = null
  } catch (error) {
    alert('Failed to save painting progress: ' + error.message)
  }
}

const handleDelete = async (data) => {
  try {
    await store.deletePaintingProgress(data.playerId, data.round, data.unitName)
    showModal.value = false
    editingUnit.value = null
  } catch (error) {
    alert('Failed to delete painting progress: ' + error.message)
  }
}

const closeModal = () => {
  showModal.value = false
  editingUnit.value = null
}

const getOverallStats = (playerId) => {
  return store.getOverallPaintingStats(playerId)
}

const getPercentageColorClass = (percentage) => {
  if (percentage === 100) return 'text-purple-400'
  if (percentage >= 71) return 'text-green-400'
  if (percentage >= 31) return 'text-yellow-400'
  return 'text-red-400'
}

const getProgressBarClass = (percentage) => {
  if (percentage === 100) return 'bg-gradient-to-r from-purple-500 to-purple-600'
  if (percentage >= 71) return 'bg-gradient-to-r from-green-500 to-green-600'
  if (percentage >= 31) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  return 'bg-gradient-to-r from-red-500 to-red-600'
}

// Lifecycle
onMounted(async () => {
  await store.fetchAll()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.input-field {
  background: #374151;
  border: 1px solid #4b5563;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  min-width: 200px;
}

.input-field:focus {
  outline: none;
  border-color: #fbbf24;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.progress-bar {
  background: #374151;
  border-radius: 9999px;
  overflow: hidden;
}
</style>
