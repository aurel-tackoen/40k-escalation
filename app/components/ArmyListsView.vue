<script setup>
  import { ref, computed, watch } from 'vue'

  // Props
  const props = defineProps({
    players: {
      type: Array,
      required: true
    },
    armies: {
      type: Array,
      required: true
    },
    currentRound: {
      type: Number,
      required: true
    },
    rounds: {
      type: Array,
      required: true
    }
  })

  // Emits
  const emit = defineEmits(['save-army', 'delete-army'])

  // Reactive data
  const showBuilder = ref(false)
  const editingArmy = ref(false)
  const selectedRound = ref('')
  const selectedPlayer = ref('')
  const armyToDelete = ref(null)
  const currentArmy = ref({
    playerId: null,
    round: null,
    name: '',
    totalPoints: 0,
    units: [],
    isValid: false
  })

  // Computed properties
  const filteredArmies = computed(() => {
    let filtered = props.armies

    if (selectedRound.value) {
      filtered = filtered.filter(army => army.round === selectedRound.value)
    }

    if (selectedPlayer.value) {
      filtered = filtered.filter(army => army.playerId === selectedPlayer.value)
    }

    return filtered.sort((a, b) => {
      if (a.round !== b.round) return b.round - a.round
      return new Date(b.lastModified) - new Date(a.lastModified)
    })
  })

  const currentRoundLimit = computed(() => {
    if (!currentArmy.value.round) return 0
    const round = props.rounds.find(r => r.number === currentArmy.value.round)
    return round ? round.pointLimit : 0
  })

  const remainingPoints = computed(() => {
    return currentRoundLimit.value - currentArmy.value.totalPoints
  })

  const isValidArmy = computed(() => {
    return currentArmy.value.units.length > 0 &&
      currentArmy.value.totalPoints <= currentRoundLimit.value &&
      currentArmy.value.totalPoints > 0
  })

  const hasPreviousRoundArmy = computed(() => {
    if (!currentArmy.value.playerId || !currentArmy.value.round) return false
    return props.armies.some(army =>
      army.playerId === currentArmy.value.playerId &&
      army.round === currentArmy.value.round - 1
    )
  })

  // Methods
  const startNewArmy = () => {
    currentArmy.value = {
      playerId: null,
      round: props.currentRound,
      name: '',
      totalPoints: 0,
      units: [],
      isValid: false
    }
    editingArmy.value = false
    showBuilder.value = true
  }

  const editArmy = (army) => {
    currentArmy.value = JSON.parse(JSON.stringify(army))
    editingArmy.value = true
    showBuilder.value = true
  }

  const cancelBuilder = () => {
    showBuilder.value = false
    editingArmy.value = false
    currentArmy.value = {
      playerId: null,
      round: null,
      name: '',
      totalPoints: 0,
      units: [],
      isValid: false
    }
  }

  const addUnit = () => {
    const newUnit = {
      id: Date.now(),
      name: '',
      points: 0,
      type: '',
      equipment: '',
      totalModels: 0,
      paintedModels: 0
    }
    currentArmy.value.units.push(newUnit)
  }

  const removeUnit = (index) => {
    currentArmy.value.units.splice(index, 1)
    calculateTotal()
  }

  const calculateTotal = () => {
    currentArmy.value.totalPoints = currentArmy.value.units.reduce((sum, unit) => {
      return sum + (unit.points || 0)
    }, 0)
    currentArmy.value.isValid = isValidArmy.value
  }

  const copyFromPreviousRound = () => {
    const previousArmy = props.armies.find(army =>
      army.playerId === currentArmy.value.playerId &&
      army.round === currentArmy.value.round - 1
    )

    if (previousArmy) {
      currentArmy.value.units = JSON.parse(JSON.stringify(previousArmy.units))
      currentArmy.value.name = `${previousArmy.name} (Round ${currentArmy.value.round})`
      calculateTotal()
    }
  }

  const escalateArmy = (army) => {
    const nextRound = army.round + 1
    const nextRoundData = props.rounds.find(r => r.number === nextRound)

    if (nextRoundData) {
      currentArmy.value = {
        playerId: army.playerId,
        round: nextRound,
        name: `${army.name} (Round ${nextRound})`,
        totalPoints: army.totalPoints,
        units: JSON.parse(JSON.stringify(army.units)),
        isValid: army.totalPoints <= nextRoundData.pointLimit
      }
      editingArmy.value = false
      showBuilder.value = true
    }
  }

  const canEscalateArmy = (army) => {
    const nextRound = army.round + 1
    const hasNextRound = props.rounds.some(r => r.number === nextRound)
    const hasNextRoundArmy = props.armies.some(a =>
      a.playerId === army.playerId && a.round === nextRound
    )
    return hasNextRound && !hasNextRoundArmy
  }

  const getPreviousArmyUnits = () => {
    const previousArmy = props.armies.find(army =>
      army.playerId === currentArmy.value.playerId &&
      army.round === currentArmy.value.round - 1
    )
    return previousArmy ? previousArmy.units.length : 0
  }

  const getPreviousArmyName = () => {
    const previousArmy = props.armies.find(army =>
      army.playerId === currentArmy.value.playerId &&
      army.round === currentArmy.value.round - 1
    )
    return previousArmy ? previousArmy.name : ''
  }

  const saveArmyList = () => {
    if (isValidArmy.value) {
      emit('save-army', { ...currentArmy.value })
      cancelBuilder()
    }
  }

  const confirmDeleteArmy = (army) => {
    armyToDelete.value = army
  }

  const deleteArmyConfirmed = () => {
    if (armyToDelete.value) {
      emit('delete-army', armyToDelete.value.playerId, armyToDelete.value.round)
      armyToDelete.value = null
    }
  }

  const getPlayerName = (playerId) => {
    const player = props.players.find(p => p.id === playerId)
    return player ? player.name : 'Unknown Player'
  }

  const getRoundName = (roundNumber) => {
    const round = props.rounds.find(r => r.number === roundNumber)
    return round ? round.name : `Round ${roundNumber}`
  }

  const getRoundLimit = (roundNumber) => {
    const round = props.rounds.find(r => r.number === roundNumber)
    return round ? round.pointLimit : 0
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getUnitPaintPercentage = (unit) => {
    if (!unit.totalModels || unit.totalModels === 0) return 0
    const painted = unit.paintedModels || 0
    return Math.round((painted / unit.totalModels) * 100)
  }

  const getArmyPaintingStats = (army) => {
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

  // Watchers
  watch(() => currentArmy.value.units, () => {
    calculateTotal()
  }, { deep: true })
</script>

<template>
  <div class="space-y-8">
    <!-- Army Builder Header -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-2xl font-bold text-yellow-500">Army List Manager</h3>
          <p class="text-gray-300 mt-2">Build and manage army lists for each round of the escalation league.</p>
        </div>
        <div class="flex items-center space-x-4">
          <select v-model="selectedRound" class="input-field w-auto">
            <option value="">All Rounds</option>
            <option v-for="round in rounds" :key="round.number" :value="round.number">
              Round {{ round.number }} ({{ round.pointLimit }}pts)
            </option>
          </select>
          <select v-model="selectedPlayer" class="input-field w-auto">
            <option value="">All Players</option>
            <option v-for="player in players" :key="player.id" :value="player.id">
              {{ player.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Escalation Guide -->
      <div class="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
        <h4 class="text-blue-200 font-semibold mb-2">📋 How to Escalate Your Army</h4>
        <div class="text-blue-300 text-sm space-y-1">
          <p><strong>Method 1:</strong> Click the <span class="bg-blue-800 px-2 py-1 rounded text-xs">⬆️ Escalate</span> button on any army card to copy it to the next round</p>
          <p><strong>Method 2:</strong> When building a new army, select a higher round and use the "📋 Copy Army" feature</p>
          <p><strong>Tip:</strong> After copying, add new units to reach the higher point limit for the new round</p>
        </div>
      </div>
    </div>

    <!-- Army Builder Form -->
    <div class="card" v-if="showBuilder">
      <div class="flex justify-between items-center mb-6">
        <h4 class="text-xl font-bold text-yellow-500">
          {{ editingArmy ? 'Edit' : 'Build' }} Army List
        </h4>
        <button @click="cancelBuilder" class="text-gray-400 hover:text-gray-200">
          <span class="text-xl">✕</span>
        </button>
      </div>

      <form @submit.prevent="saveArmyList" class="space-y-6">
        <!-- Basic Army Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Player</label>
            <select v-model="currentArmy.playerId" required class="input-field" :disabled="editingArmy">
              <option value="">Select Player</option>
              <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }} ({{ player.faction }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Round</label>
            <select v-model="currentArmy.round" required class="input-field" :disabled="editingArmy">
              <option value="">Select Round</option>
              <option v-for="round in rounds" :key="round.number" :value="round.number">
                Round {{ round.number }} - {{ round.name }} ({{ round.pointLimit }}pts)
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Army Name</label>
            <input
              v-model="currentArmy.name"
              type="text"
              required
              class="input-field"
              placeholder="e.g., Strike Force Alpha"
            />
          </div>
        </div>

        <!-- Point Summary -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-6">
              <div>
                <span class="text-sm text-gray-400">Total Points:</span>
                <span class="text-xl font-bold text-yellow-500 ml-2">{{ currentArmy.totalPoints }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-400">Point Limit:</span>
                <span class="text-lg text-gray-200 ml-2">{{ currentRoundLimit }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-400">Remaining:</span>
                <span
                  :class="[
                    'text-lg font-semibold ml-2',
                    remainingPoints >= 0 ? 'text-green-400' : 'text-red-400'
                  ]"
                >
                  {{ remainingPoints }}
                </span>
              </div>
            </div>
            <div
              :class="[
                'px-3 py-1 rounded-full text-sm font-semibold',
                isValidArmy ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'
              ]"
            >
              {{ isValidArmy ? 'Valid' : 'Invalid' }}
            </div>
          </div>
        </div>

        <!-- Unit Builder -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h5 class="text-lg font-semibold text-yellow-500">Units</h5>
            <button type="button" @click="addUnit" class="btn-primary">
              Add Unit
            </button>
          </div>

          <!-- Units List -->
          <div class="space-y-3">
            <div
              v-for="(unit, index) in currentArmy.units"
              :key="unit.id || index"
              class="bg-gray-700 border border-gray-600 rounded-lg p-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-400 mb-1">Unit Name</label>
                  <input
                    v-model="unit.name"
                    type="text"
                    required
                    class="input-field text-sm"
                    placeholder="e.g., Tactical Squad"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Type</label>
                  <select v-model="unit.type" required class="input-field text-sm">
                    <option value="">Type</option>
                    <option value="HQ">HQ</option>
                    <option value="Troops">Troops</option>
                    <option value="Elites">Elites</option>
                    <option value="Fast Attack">Fast Attack</option>
                    <option value="Heavy Support">Heavy Support</option>
                    <option value="Flyer">Flyer</option>
                    <option value="Dedicated Transport">Dedicated Transport</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Points</label>
                  <input
                    v-model.number="unit.points"
                    type="number"
                    min="0"
                    required
                    class="input-field text-sm"
                    @input="calculateTotal"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Total Models</label>
                  <input
                    v-model.number="unit.totalModels"
                    type="number"
                    min="1"
                    class="input-field text-sm"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">🎨 Painted</label>
                  <input
                    v-model.number="unit.paintedModels"
                    type="number"
                    min="0"
                    :max="unit.totalModels || 999"
                    class="input-field text-sm"
                    placeholder="0"
                  />
                </div>
                <div class="flex items-end">
                  <button
                    type="button"
                    @click="removeUnit(index)"
                    class="btn-secondary text-sm px-3 py-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <!-- Painting Progress Bar -->
              <div v-if="unit.totalModels > 0" class="mt-3">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Painting Progress</span>
                  <span>{{ unit.paintedModels || 0 }} / {{ unit.totalModels }} ({{ getUnitPaintPercentage(unit) }}%)</span>
                </div>
                <div class="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300"
                    :class="getPaintProgressClass(getUnitPaintPercentage(unit))"
                    :style="{ width: getUnitPaintPercentage(unit) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentArmy.units.length === 0" class="text-center py-8 text-gray-400 bg-gray-700 rounded-lg">
            <p>No units added yet. Click "Add Unit" to start building your army.</p>
          </div>
        </div>

        <!-- Copy from Previous Round -->
        <div v-if="!editingArmy && currentArmy.round > 1" class="bg-gradient-to-r from-blue-800 to-blue-700 p-4 rounded-lg border border-blue-600">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="font-semibold text-blue-200 flex items-center">
                <span class="mr-2">📋</span>
                Copy from Previous Round
              </h6>
              <p class="text-sm text-blue-300 mt-1">
                Start with your <strong>Round {{ currentArmy.round - 1 }}</strong> army list and add new units
              </p>
              <p v-if="hasPreviousRoundArmy" class="text-xs text-blue-400 mt-1">
                Found {{ getPreviousArmyUnits() }} units from {{ getPreviousArmyName() }}
              </p>
            </div>
            <button
              type="button"
              @click="copyFromPreviousRound"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-colors',
                hasPreviousRoundArmy
                  ? 'bg-blue-500 text-white hover:bg-blue-400'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              ]"
              :disabled="!hasPreviousRoundArmy"
            >
              {{ hasPreviousRoundArmy ? '📋 Copy Army' : 'No Previous Army' }}
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex space-x-4">
          <button
            type="submit"
            class="btn-primary"
            :disabled="!isValidArmy"
          >
            {{ editingArmy ? 'Update' : 'Save' }} Army List
          </button>
          <button type="button" @click="cancelBuilder" class="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Army Lists Grid -->
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold text-yellow-500">Army Lists</h3>
        <button @click="startNewArmy" class="btn-primary">
          Build New Army
        </button>
      </div>

      <!-- Round Tabs -->
      <div class="flex space-x-2 overflow-x-auto">
        <button
          @click="selectedRound = ''"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap',
            selectedRound === ''
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          All Rounds
        </button>
        <button
          v-for="round in rounds"
          :key="round.number"
          @click="selectedRound = round.number"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap',
            selectedRound === round.number
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          Round {{ round.number }} ({{ round.pointLimit }}pts)
        </button>
      </div>

      <!-- Army Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="army in filteredArmies"
          :key="army.id"
          class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500 transition-colors"
        >
          <!-- Army Header -->
          <div class="p-4 border-b border-gray-700">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-semibold text-gray-100">{{ army.name }}</h4>
                <p class="text-sm text-gray-400">{{ getPlayerName(army.playerId) }}</p>
                <p class="text-xs text-gray-500">Round {{ army.round }} • {{ getRoundName(army.round) }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'px-2 py-1 rounded text-xs font-semibold',
                    army.isValid ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'
                  ]"
                >
                  {{ army.isValid ? 'Valid' : 'Invalid' }}
                </div>
                <div class="flex space-x-1">
                  <button
                    v-if="canEscalateArmy(army)"
                    @click="escalateArmy(army)"
                    class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 bg-blue-900 rounded"
                    title="Escalate to Next Round"
                  >
                    ⬆️ Escalate
                  </button>
                  <button
                    @click="editArmy(army)"
                    class="text-yellow-500 hover:text-yellow-400 text-sm"
                    title="Edit Army"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDeleteArmy(army)"
                    class="text-red-400 hover:text-red-300 text-sm"
                    title="Delete Army"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Army Stats -->
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <div>
                <span class="text-2xl font-bold text-yellow-500">{{ army.totalPoints }}</span>
                <span class="text-gray-400 text-sm">/ {{ getRoundLimit(army.round) }} pts</span>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-400">{{ army.units.length }} units</div>
                <div class="text-xs text-gray-500">Modified {{ formatDate(army.lastModified) }}</div>
              </div>
            </div>

            <!-- Painting Progress Summary -->
            <div v-if="getArmyPaintingStats(army).totalModels > 0" class="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-semibold text-gray-300">🎨 Painting Progress</span>
                <span
                  class="text-sm font-bold"
                  :class="getPaintPercentageColor(getArmyPaintingStats(army).percentage)"
                >
                  {{ getArmyPaintingStats(army).percentage }}%
                </span>
              </div>
              <div class="h-3 bg-gray-600 rounded-full overflow-hidden mb-2">
                <div
                  class="h-full transition-all duration-500"
                  :class="getPaintProgressClass(getArmyPaintingStats(army).percentage)"
                  :style="{ width: getArmyPaintingStats(army).percentage + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-400">
                <span>{{ getArmyPaintingStats(army).painted }} / {{ getArmyPaintingStats(army).totalModels }} models</span>
                <span v-if="getArmyPaintingStats(army).percentage === 100" class="text-purple-400 font-semibold">✨ Fully Painted!</span>
              </div>
            </div>

            <!-- Units Summary -->
            <div class="space-y-2">
              <h6 class="text-sm font-semibold text-gray-300">Units:</h6>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="unit in army.units"
                  :key="unit.id"
                  class="text-sm bg-gray-700 p-2 rounded"
                >
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-gray-200 font-medium">{{ unit.name }}</span>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">{{ unit.type }}</span>
                      <span class="text-yellow-500 font-semibold">{{ unit.points }}pts</span>
                    </div>
                  </div>
                  <!-- Unit Painting Progress -->
                  <div v-if="unit.totalModels > 0" class="mt-2">
                    <div class="flex justify-between text-xs text-gray-400 mb-1">
                      <span>🎨 {{ unit.paintedModels || 0 }} / {{ unit.totalModels }} painted</span>
                      <span :class="getPaintPercentageColor(getUnitPaintPercentage(unit))">
                        {{ getUnitPaintPercentage(unit) }}%
                      </span>
                    </div>
                    <div class="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        class="h-full transition-all"
                        :class="getPaintProgressClass(getUnitPaintPercentage(unit))"
                        :style="{ width: getUnitPaintPercentage(unit) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredArmies.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-6xl mb-4">⚔️</div>
        <p class="text-lg">No army lists found</p>
        <p class="text-sm">{{ selectedRound ? `No armies for Round ${selectedRound}` : 'Start building your first army list!' }}</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="armyToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h4 class="text-xl font-bold text-yellow-500 mb-4">Confirm Deletion</h4>
        <p class="text-gray-300 mb-6">
          Are you sure you want to delete <strong>{{ armyToDelete.name }}</strong>?
          This action cannot be undone.
        </p>
        <div class="flex space-x-4">
          <button @click="deleteArmyConfirmed" class="btn-secondary flex-1">
            Delete Army
          </button>
          <button @click="armyToDelete = null" class="btn-primary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
