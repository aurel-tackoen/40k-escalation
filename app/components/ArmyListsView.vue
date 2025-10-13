<script setup>
  import { ref, computed, watch, toRef } from 'vue'
  import { Shield, Plus, X, Edit, Trash2, Copy, Filter, Users, TrendingUp, Paintbrush, Download } from 'lucide-vue-next'
  import { usePaintingStats } from '~/composables/usePaintingStats'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useRoundLookup } from '~/composables/useRoundLookup'
  import { useConfirmation } from '~/composables/useConfirmation'
  import { useArmyManagement } from '~/composables/useArmyManagement'
  import { useArrayFiltering } from '~/composables/useArrayFiltering'
  import { useDataExport } from '~/composables/useDataExport'

  // Composables
  const {
    getUnitPaintPercentage,
    getArmyPaintingStats,
    getPaintProgressClass,
    getPaintPercentageColor
  } = usePaintingStats()

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

  const { getPlayerName } = usePlayerLookup(toRef(props, 'players'))
  const { formatDateShort } = useFormatting()
  const { getRoundName, getRoundLimit } = useRoundLookup(toRef(props, 'rounds'))
  const {
    item: armyToDelete,
    confirm: confirmDeleteArmy,
    execute: deleteArmyConfirmed
  } = useConfirmation((army) => {
    emit('delete-army', army.playerId, army.round)
  })
  const {
    calculateArmyTotal,
    isValidArmy: checkValidArmy,
    canEscalateArmy,
    hasPreviousRoundArmy: checkPreviousRoundArmy,
    getPreviousArmy,
    copyArmyToNextRound
  } = useArmyManagement(toRef(props, 'armies'), toRef(props, 'rounds'))

  const {
    sortByField,
    filterByMultipleCriteria
  } = useArrayFiltering(toRef(props, 'armies'))

  const {
    downloadCSV,
    formatForExport
  } = useDataExport()

  // Emits
  const emit = defineEmits(['save-army', 'delete-army'])

  // Reactive data
  const showBuilder = ref(false)
  const editingArmy = ref(false)
  const selectedRound = ref('')
  const selectedPlayer = ref('')
  const currentArmy = ref({
    playerId: null,
    round: null,
    name: '',
    totalPoints: 0,
    units: [],
    isValid: false
  })

  // Computed properties using useArrayFiltering
  const filteredArmies = computed(() => {
    let filtered = props.armies

    // Apply filters using composable
    const filters = {}
    if (selectedRound.value) filters.round = selectedRound.value
    if (selectedPlayer.value) filters.playerId = selectedPlayer.value

    if (Object.keys(filters).length > 0) {
      filtered = filterByMultipleCriteria(filtered, filters)
    }

    // Sort by round (desc) then lastModified (desc)
    return sortByField(
      sortByField(filtered, 'lastModified', 'desc'),
      'round',
      'desc'
    )
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
    return checkValidArmy(currentArmy.value, currentRoundLimit.value)
  })

  const hasPreviousRoundArmy = computed(() => {
    return checkPreviousRoundArmy(currentArmy.value.playerId, currentArmy.value.round)
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
    currentArmy.value.totalPoints = calculateArmyTotal(currentArmy.value.units)
    currentArmy.value.isValid = isValidArmy.value
  }

  const calculateTotal = () => {
    currentArmy.value.totalPoints = calculateArmyTotal(currentArmy.value.units)
    currentArmy.value.isValid = isValidArmy.value
  }

  const copyFromPreviousRound = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)

    if (previousArmy) {
      currentArmy.value.units = JSON.parse(JSON.stringify(previousArmy.units))
      currentArmy.value.name = `${previousArmy.name} (Round ${currentArmy.value.round})`
      calculateTotal()
    }
  }

  const escalateArmy = (army) => {
    const nextRound = army.round + 1

    currentArmy.value = copyArmyToNextRound(army, nextRound)
    editingArmy.value = false
    showBuilder.value = true
  }

  const getPreviousArmyUnits = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)
    return previousArmy ? previousArmy.units.length : 0
  }

  const getPreviousArmyName = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)
    return previousArmy ? previousArmy.name : ''
  }

  const saveArmyList = () => {
    if (isValidArmy.value) {
      emit('save-army', { ...currentArmy.value })
      cancelBuilder()
    }
  }

  const exportArmies = () => {
    const exportData = formatForExport(filteredArmies.value, {
      'Player': (army) => getPlayerName(army.playerId),
      'Army Name': 'name',
      'Round': (army) => `Round ${army.round}`,
      'Total Points': 'totalPoints',
      'Point Limit': (army) => getRoundLimit(army.round),
      'Units': (army) => army.units.length,
      'Valid': (army) => army.isValid ? 'Yes' : 'No',
      'Last Modified': (army) => formatDateShort(army.lastModified)
    })

    downloadCSV(exportData, 'army-lists')
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
          <div class="flex items-center gap-2">
            <Shield :size="28" class="text-yellow-500" />
            <h3 class="text-2xl font-bold font-serif text-yellow-500">Army List Manager</h3>
          </div>
          <p class="text-gray-300 mt-2">Build and manage army lists for each round of the escalation league.</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center gap-2">
            <Filter :size="18" class="text-yellow-500" />
            <select v-model="selectedRound" class="input-field w-auto">
              <option value="">All Rounds</option>
              <option v-for="round in rounds" :key="round.number" :value="round.number">
                Round {{ round.number }} ({{ round.pointLimit }}pts)
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <Users :size="18" class="text-yellow-500" />
            <select v-model="selectedPlayer" class="input-field w-auto">
              <option value="">All Players</option>
              <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Escalation Guide -->
      <div class="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
        <h4 class="text-yellow-200 font-semibold mb-2">📋 How to Escalate Your Army</h4>
        <div class="text-yellow-300 text-sm space-y-1">
          <p><strong>Method 1:</strong> Click the <span
            class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 bg-blue-900 rounded inline-flex items-center gap-1"
            title="Escalate to Next Round"
          >
            <TrendingUp :size="16" />
            Escalate
          </span> button on any army card to copy it to the next round</p>
          <p><strong>Method 2:</strong> When building a new army, select a higher round and use the "📋 Copy Army" feature</p>
          <p><strong>Tip:</strong> After copying, add new units to reach the higher point limit for the new round</p>
        </div>
      </div>
    </div>

    <!-- Army Builder Form -->
    <div class="card" v-if="showBuilder">
      <div class="flex justify-between items-center mb-6">
        <h4 class="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <Edit v-if="editingArmy" :size="20" />
          <Plus v-else :size="20" />
          {{ editingArmy ? 'Edit' : 'Build' }} Army List
        </h4>
        <button @click="cancelBuilder" class="text-gray-400 hover:text-gray-200">
          <X :size="24" />
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
            <button type="button" @click="addUnit" class="btn-primary flex items-center gap-2">
              <Plus :size="18" />
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
                  <label class="block text-xs text-gray-400 mb-1">Painted</label>
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
                    class="btn-secondary text-sm px-3 py-2 flex items-center gap-1"
                  >
                    <Trash2 :size="16" />
                    Remove
                  </button>
                </div>
              </div>
              <!-- Painting Progress Bar -->
              <div v-if="unit.totalModels > 0" class="mt-3">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span class="flex items-center gap-1">
                    <Paintbrush :size="12" />
                    Painting Progress
                  </span>
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
              <h6 class="font-semibold text-blue-200 flex items-center gap-2">
                <Copy :size="18" />
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
        <h3 class="text-2xl font-bold font-serif text-yellow-500">Army Lists</h3>
        <div class="flex gap-2">
          <button @click="exportArmies" class="btn-secondary flex items-center gap-2">
            <Download :size="20" />
            Export CSV
          </button>
          <button @click="startNewArmy" class="btn-primary flex items-center gap-2">
            <Plus :size="20" />
            Build New Army
          </button>
        </div>
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
                    class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 bg-blue-900 rounded flex items-center gap-1"
                    title="Escalate to Next Round"
                  >
                    <TrendingUp :size="16" />
                    Escalate
                  </button>
                  <button
                    @click="editArmy(army)"
                    class="text-yellow-500 hover:text-yellow-400 text-sm px-2 py-1"
                    title="Edit Army"
                  >
                    <Edit :size="18" />
                  </button>
                  <button
                    @click="confirmDeleteArmy(army)"
                    class="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                    title="Delete Army"
                  >
                    <Trash2 :size="18" />
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
                <div class="text-xs text-gray-500">Modified {{ formatDateShort(army.lastModified) }}</div>
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
              <div class="space-y-2 max-h-64 overflow-y-auto">
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
          <button @click="deleteArmyConfirmed()" class="btn-secondary flex-1">
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
