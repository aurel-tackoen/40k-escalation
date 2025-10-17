<script setup>
  import { computed, watch, toRef, ref, nextTick } from 'vue'
  import { Shield, Plus, X, Edit, Trash2, Copy, Filter, Users, TrendingUp, Paintbrush, ChevronUp, ChevronDown } from 'lucide-vue-next'
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePaintingStats } from '~/composables/usePaintingStats'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { useRoundLookup } from '~/composables/useRoundLookup'
  import { useConfirmation } from '~/composables/useConfirmation'
  import { useArmyManagement } from '~/composables/useArmyManagement'
  import { useArrayFiltering } from '~/composables/useArrayFiltering'
  import { useArmyForm } from '~/composables/useArmyForm'
  import { useArmyFiltering } from '~/composables/useArmyFiltering'
  import { useGameSystems } from '~/composables/useGameSystems'

  // Store
  const leaguesStore = useLeaguesStore()
  const { currentPlayer, canManageLeague, currentGameSystemName, gameSystems, availableUnitTypes } = storeToRefs(leaguesStore)

  // Game systems composable
  const { getGameSystemBadgeClasses, getGameSystemTextClasses } = useGameSystems(gameSystems)

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

  // Composables - Core utilities
  const {
    getUnitPaintPercentage,
    getArmyPaintingStats,
    getPaintProgressClass,
    getPaintPercentageColor,
    getUnitPaintedPoints,
    getUnitPaintedPointsPercentage,
    getArmyPaintedPoints
  } = usePaintingStats()

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

  // Composables - Army Form Management
  const {
    showBuilder,
    editingArmy,
    currentArmy,
    currentRoundLimit,
    remainingPoints,
    isCurrentArmyValid,
    startNewArmy,
    editArmy,
    cancelBuilder,
    addUnit,
    removeUnit,
    recalculateArmy,
    copyFromPreviousArmy,
    setupEscalation
  } = useArmyForm(
    toRef(props, 'rounds'),
    calculateArmyTotal,
    checkValidArmy
  )

  // Composables - Filtering
  const {
    selectedRound,
    selectedPlayer,
    filteredArmies,
    getArmyCountForRound
  } = useArmyFiltering(
    toRef(props, 'armies'),
    sortByField,
    filterByMultipleCriteria
  )

  // Refs
  const builderFormRef = ref(null)

  // Helper function to scroll to form
  const scrollToForm = () => {
    nextTick(() => {
      if (builderFormRef.value) {
        builderFormRef.value.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  }

  // Computed - Form helper methods
  const hasPreviousRoundArmy = computed(() => {
    return checkPreviousRoundArmy(currentArmy.value.playerId, currentArmy.value.round)
  })

  const getPreviousArmyUnits = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)
    return previousArmy ? previousArmy.units.length : 0
  }

  const getPreviousArmyName = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)
    return previousArmy ? previousArmy.name : ''
  }

  // Permission check: Can user modify a specific army?
  const canModifyArmy = (army) => {
    // Organizers can modify any army
    if (canManageLeague.value) {
      return true
    }
    // Regular users can only modify their own armies
    return currentPlayer.value && army.playerId === currentPlayer.value.id
  }

  // Methods - Form operations
  const handleStartNewArmy = () => {
    // Prevent opening form if user doesn't have a player and is not an organizer
    if (!canManageLeague.value && !currentPlayer.value) {
      return
    }

    startNewArmy(props.currentRound)
    // Auto-select current player if they have a player entity in this league
    if (currentPlayer.value) {
      currentArmy.value.playerId = currentPlayer.value.id
    }

    // Scroll to form
    scrollToForm()
  }

  const handleEditArmy = (army) => {
    // Check if user has permission to edit this army
    if (!canModifyArmy(army)) {
      console.error('Cannot edit army: permission denied')
      return
    }
    editArmy(army)
    scrollToForm()
  }

  const handleCopyFromPreviousRound = () => {
    const previousArmy = getPreviousArmy(currentArmy.value.playerId, currentArmy.value.round)
    copyFromPreviousArmy(previousArmy)
  }

  const escalateArmy = (army) => {
    // Check if user has permission to escalate this army
    if (!canModifyArmy(army)) {
      console.error('Cannot escalate army: permission denied')
      return
    }
    const nextRound = army.round + 1
    const escalatedArmy = copyArmyToNextRound(army, nextRound)
    setupEscalation(army, escalatedArmy)
    scrollToForm()
  }

  const handleDeleteArmy = (army) => {
    // Check if user has permission to delete this army
    if (!canModifyArmy(army)) {
      console.error('Cannot delete army: permission denied')
      return
    }
    confirmDeleteArmy(army)
  }

  const saveArmyList = () => {
    // Extra validation: ensure user has permission to create army for selected player
    if (!canManageLeague.value && currentArmy.value.playerId !== currentPlayer.value?.id) {
      console.error('Cannot create army for another player')
      return
    }

    if (isCurrentArmyValid.value) {
      emit('save-army', { ...currentArmy.value })
      cancelBuilder()
    }
  }

  // Unit Reordering with Up/Down arrows
  const moveUnitUp = (index) => {
    if (index === 0) return // Can't move first unit up

    const units = [...currentArmy.value.units]
    // Swap with previous unit
    const temp = units[index - 1]
    units[index - 1] = units[index]
    units[index] = temp

    currentArmy.value.units = units
  }

  const moveUnitDown = (index) => {
    if (index === currentArmy.value.units.length - 1) return // Can't move last unit down

    const units = [...currentArmy.value.units]
    // Swap with next unit
    const temp = units[index + 1]
    units[index + 1] = units[index]
    units[index] = temp

    currentArmy.value.units = units
  }

  // Watchers
  watch(() => currentArmy.value.units, () => {
    recalculateArmy()
  }, { deep: true })
</script>

<template>
  <div class="space-y-6">
    <!-- Army Manager Section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div class="flex items-center gap-3">
          <Shield :size="32" class="text-yellow-500" />
          <div>
            <h2 class="text-2xl font-serif font-bold text-yellow-500">Army List Manager</h2>
            <p class="text-gray-400 text-sm mt-1">Build and manage army lists for each round of the escalation league.</p>
          </div>
        </div>
        <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses()">
          <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pt-4 border-t border-gray-700">
        <!-- Player Filter -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <Users :size="18" class="text-gray-400 flex-shrink-0" />
          <select v-model="selectedPlayer" class="input-field w-full lg:max-w-xs">
            <option value="">All Players</option>
            <option v-for="player in players" :key="player.id" :value="player.id">
              {{ player.name }}
            </option>
          </select>
        </div>

        <!-- Action Button -->
        <div class="flex flex-col gap-1 w-full lg:w-auto lg:flex-shrink-0">
          <button
            @click="handleStartNewArmy"
            :disabled="!canManageLeague && !currentPlayer"
            :class="[
              'flex items-center justify-center gap-2 w-full lg:w-auto px-4 py-2 text-sm lg:text-base',
              (!canManageLeague && !currentPlayer)
                ? 'btn-secondary cursor-not-allowed opacity-50'
                : 'btn-primary cursor-pointer'
            ]"
          >
            <Plus :size="20" class="flex-shrink-0" />
            <span class="truncate">Build New Army</span>
          </button>
          <p v-if="!canManageLeague && !currentPlayer" class="text-xs text-red-400 text-center lg:text-right">
            Join as player first
          </p>
        </div>
      </div>
    </div>

    <!-- Round Timeline Filter -->
    <div class="card">
      <div class="flex items-center gap-2 mb-4">
        <Filter :size="20" class="text-yellow-500" />
        <h4 class="text-lg font-semibold text-gray-200">Filter by Round</h4>
      </div>

      <!-- Mobile Select (visible on mobile only) -->
      <div class="block md:hidden">
        <select v-model="selectedRound" class="input-field w-full">
          <option value="">All Rounds ({{ armies.length }} {{ armies.length === 1 ? 'army' : 'armies' }})</option>
          <option v-for="round in rounds" :key="round.number" :value="round.number">
            Round {{ round.number }} - {{ round.pointLimit }}pts ({{ getArmyCountForRound(round.number) }} {{ getArmyCountForRound(round.number) === 1 ? 'army' : 'armies' }})
          </option>
        </select>
      </div>

      <!-- Timeline (visible on desktop only) -->
      <div class="hidden md:block relative">
        <!-- Timeline Line -->
        <div class="absolute top-6 left-0 right-0 h-0.5 bg-gray-700" style="z-index: 0;"></div>

        <!-- Timeline Items -->
        <div class="flex justify-between items-start relative" style="z-index: 1;">
          <!-- All Rounds Button -->
          <button
            @click="selectedRound = ''"
            :class="[
              'flex flex-col items-center gap-2 transition-all group cursor-pointer',
              !selectedRound ? 'scale-110' : 'hover:scale-105'
            ]"
          >
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all',
                !selectedRound
                  ? 'bg-yellow-500 border-yellow-500 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-800 border-gray-600 group-hover:border-gray-500'
              ]"
            >
              <Filter :size="20" :class="!selectedRound ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-300'" />
            </div>
            <div class="text-center min-w-[80px]">
              <div :class="['text-sm font-semibold', !selectedRound ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-300']">
                All Rounds
              </div>
              <div class="text-xs text-gray-500">
                {{ armies.length }} {{ armies.length === 1 ? 'army' : 'armies' }}
              </div>
            </div>
          </button>

          <!-- Round Buttons -->
          <button
            v-for="round in rounds"
            :key="round.number"
            @click="selectedRound = round.number"
            :class="[
              'flex flex-col items-center gap-2 transition-all group cursor-pointer',
            ]"
          >
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-all',
                selectedRound === round.number
                  ? 'bg-yellow-500 border-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/50'
                  : round.number <= currentRound
                    ? 'bg-green-600 border-green-600 text-white group-hover:border-green-500'
                    : 'bg-gray-800 border-gray-600 text-gray-400 group-hover:border-gray-500'
              ]"
            >
              {{ round.number }}
            </div>
            <div class="text-center min-w-[80px]">
              <div :class="['text-sm font-semibold', selectedRound === round.number ? 'text-yellow-500' : 'text-gray-300 group-hover:text-gray-200']">
                Round {{ round.number }}
              </div>
              <div :class="['text-xs font-medium', selectedRound === round.number ? 'text-yellow-400' : 'text-gray-400']">
                {{ round.pointLimit }} pts
              </div>
              <div class="text-xs text-gray-500">
                {{ getArmyCountForRound(round.number) }} {{ getArmyCountForRound(round.number) === 1 ? 'army' : 'armies' }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Army Builder Form -->
    <div v-if="showBuilder" ref="builderFormRef" class="card">
      <!-- Form Header -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h3 class="text-2xl font-bold text-yellow-500 flex items-center gap-2">
          <Edit v-if="editingArmy" :size="24" />
          <Plus v-else :size="24" />
          {{ editingArmy ? 'Edit Army List' : 'Build New Army List' }}
        </h3>
        <button @click="cancelBuilder" class="text-gray-400 hover:text-red-400 transition-colors">
          <X :size="28" />
        </button>
      </div>

      <form @submit.prevent="saveArmyList" class="space-y-6">
        <!-- Step 1: Basic Info -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <span class="bg-yellow-500 text-gray-900 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Player Selection - Show dropdown only for organizers, read-only field for regular users -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Player *</label>

              <!-- Organizers: Full dropdown to select any player -->
              <select
                v-if="canManageLeague"
                v-model="currentArmy.playerId"
                required
                class="input-field"
                :disabled="editingArmy"
              >
                <option value="">Select Player</option>
                <option v-for="player in players" :key="player.id" :value="player.id">
                  {{ player.name }} ({{ player.faction }})
                  <template v-if="currentPlayer && player.id === currentPlayer.id"> - You</template>
                </option>
              </select>

              <!-- Regular users: Read-only display of their player -->
              <div v-else-if="currentPlayer" class="input-field bg-gray-800 cursor-not-allowed flex items-center">
                {{ currentPlayer.name }} ({{ currentPlayer.faction }})
              </div>

              <!-- No player entity: Show error state -->
              <div v-else class="input-field bg-red-900/20 border-red-700 text-red-400 cursor-not-allowed">
                No player profile in this league
              </div>

              <!-- Helper text -->
              <p v-if="!canManageLeague && currentPlayer" class="text-xs text-gray-500 mt-1">
                You can only create armies for yourself
              </p>
              <p v-else-if="!canManageLeague && !currentPlayer" class="text-xs text-red-400 mt-1">
                You need to join this league as a player first
              </p>
              <p v-else-if="canManageLeague" class="text-xs text-gray-500 mt-1">
                As organizer, you can create armies for any player
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Round *</label>
              <select v-model="currentArmy.round" required class="input-field" :disabled="editingArmy">
                <option value="">Select Round</option>
                <option v-for="round in rounds" :key="round.number" :value="round.number">
                  Round {{ round.number }} - {{ round.name }} ({{ round.pointLimit }}pts)
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Army Name *</label>
              <input
                v-model="currentArmy.name"
                type="text"
                required
                class="input-field"
                placeholder="e.g., Strike Force Alpha"
              />
            </div>
          </div>
        </div>

        <!-- Copy from Previous Round (if applicable) -->
        <div v-if="!editingArmy && currentArmy.round > 1" class="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="font-semibold text-blue-300 flex items-center gap-2 mb-1">
                <Copy :size="18" />
                Escalate from Previous Round
              </h6>
              <p class="text-sm text-blue-400">
                Copy your <strong>Round {{ currentArmy.round - 1 }}</strong> army list and add new units
              </p>
              <p v-if="hasPreviousRoundArmy" class="text-xs text-blue-400 mt-1">
                ✓ Found {{ getPreviousArmyUnits() }} units from "{{ getPreviousArmyName() }}"
              </p>
            </div>
            <button
              type="button"
              @click="handleCopyFromPreviousRound"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap',
                hasPreviousRoundArmy
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              ]"
              :disabled="!hasPreviousRoundArmy"
            >
              {{ hasPreviousRoundArmy ? '📋 Copy Army' : 'No Previous Army' }}
            </button>
          </div>
        </div>

        <!-- Step 2: Point Summary -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <span class="bg-yellow-500 text-gray-900 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Point Allocation
          </h4>

          <div class="bg-gray-700/50 border border-gray-600 p-5 rounded-lg">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
              <div class="text-center p-3 bg-gray-800 rounded-lg">
                <div class="text-xs text-gray-400 mb-1">Current Total</div>
                <div class="text-2xl font-bold text-yellow-500">{{ currentArmy.totalPoints }}</div>
              </div>
              <div class="text-center p-3 bg-gray-800 rounded-lg">
                <div class="text-xs text-gray-400 mb-1">Point Limit</div>
                <div class="text-2xl font-bold text-gray-200">{{ currentRoundLimit }}</div>
              </div>
              <div class="text-center p-3 bg-gray-800 rounded-lg">
                <div class="text-xs text-gray-400 mb-1">Remaining</div>
                <div
                  :class="[
                    'text-2xl font-bold',
                    remainingPoints >= 0 ? 'text-green-400' : 'text-red-400'
                  ]"
                >
                  {{ remainingPoints >= 0 ? '+' : '' }}{{ remainingPoints }}
                </div>
              </div>
              <div class="text-center p-3 rounded-lg" :class="[
                isCurrentArmyValid ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
              ]">
                <div class="text-xs text-gray-400 mb-1">Status</div>
                <div
                  :class="[
                    'text-lg font-bold',
                    isCurrentArmyValid ? 'text-green-400' : 'text-red-400'
                  ]"
                >
                  {{ isCurrentArmyValid ? '✓ Valid' : '✗ Invalid' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Unit Builder -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <span class="bg-yellow-500 text-gray-900 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Units ({{ currentArmy.units.length }})
              </h4>
              <p v-if="currentArmy.units.length >= 2" class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <ChevronUp :size="14" />
                Use arrows to reorder units
              </p>
            </div>
            <button type="button" @click="addUnit" class="btn-primary flex items-center gap-2">
              <Plus :size="18" />
              Add Unit
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="currentArmy.units.length === 0" class="text-center py-12 bg-gray-700/30 border-2 border-dashed border-gray-600 rounded-lg">
            <Shield :size="48" class="mx-auto text-gray-600 mb-3" />
            <p class="text-gray-400 text-lg font-medium">No units added yet</p>
            <p class="text-gray-500 text-sm mt-1">Click "Add Unit" to start building your army</p>
          </div>

          <!-- Units List -->
          <div v-else class="space-y-3">
            <div
              v-for="(unit, index) in currentArmy.units"
              :key="unit.id || index"
              class="bg-gray-700/50 border border-gray-600 rounded-lg p-4 transition-all duration-200 hover:border-gray-500"
            >
              <!-- Unit Header -->
              <div class="flex flex-col md:flex-row gap-3 mb-3">
                <!-- Reorder Buttons -->
                <div class="flex md:flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    @click="moveUnitUp(index)"
                    :disabled="index === 0"
                    class="p-1 rounded border transition-colors"
                    :class="[
                      index === 0
                        ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                        : 'border-gray-600 text-gray-400 hover:text-yellow-500 hover:border-yellow-500'
                    ]"
                    title="Move Up"
                  >
                    <ChevronUp :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="moveUnitDown(index)"
                    :disabled="index === currentArmy.units.length - 1"
                    class="p-1 rounded border transition-colors"
                    :class="[
                      index === currentArmy.units.length - 1
                        ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                        : 'border-gray-600 text-gray-400 hover:text-yellow-500 hover:border-yellow-500'
                    ]"
                    title="Move Down"
                  >
                    <ChevronDown :size="18" />
                  </button>
                </div>

                <!-- Unit Fields Grid -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
                  <div class="md:col-span-4">
                    <label class="block text-xs text-gray-400 mb-1.5">Unit Name *</label>
                    <input
                      v-model="unit.name"
                      type="text"
                      required
                      class="input-field text-sm"
                      placeholder="e.g., Tactical Squad"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Type *</label>
                    <select v-model="unit.type" required class="input-field text-sm">
                      <option value="">Select</option>
                      <option v-for="unitType in availableUnitTypes" :key="unitType.id" :value="unitType.name">
                        {{ unitType.name }}
                      </option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Points *</label>
                    <input
                      v-model.number="unit.points"
                      type="number"
                      min="0"
                      required
                      class="input-field text-sm"
                      @input="calculateTotal"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Models</label>
                    <input
                      v-model.number="unit.totalModels"
                      type="number"
                      min="1"
                      class="input-field text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-xs text-gray-400 mb-1.5">Painted</label>
                    <input
                      v-model.number="unit.paintedModels"
                      type="number"
                      min="0"
                      :max="unit.totalModels || 999"
                      class="input-field text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      @click="removeUnit(index)"
                      class="w-full btn-secondary text-sm px-2 py-2 flex items-center justify-center gap-1 hover:bg-red-900 hover:border-red-700 transition-colors"
                      title="Remove Unit"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Painting Progress Bar -->
              <div v-if="unit.totalModels > 0" class="mt-2 pt-2 border-t border-gray-600">
                <div class="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span class="flex items-center gap-1">
                    <Paintbrush :size="12" />
                    Painting Progress
                  </span>
                  <span class="font-medium">{{ unit.paintedModels || 0 }} / {{ unit.totalModels }} ({{ getUnitPaintPercentage(unit) }}%)</span>
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
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-700">
          <button type="button" @click="cancelBuilder" class="btn-secondary px-6">
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary px-8"
            :disabled="!isCurrentArmyValid"
            :class="{ 'opacity-50 cursor-not-allowed': !isCurrentArmyValid }"
          >
            {{ editingArmy ? 'Update Army List' : 'Save Army List' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Saved Army Lists -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <Shield :size="24" class="text-yellow-500" />
          <h3 class="text-2xl font-serif font-bold text-yellow-500">
            Saved Army Lists
            <span class="text-lg text-gray-300 font-bold">({{ filteredArmies.length }})</span>
          </h3>
        </div>
      </div>

      <!-- Army Cards -->
      <div v-if="filteredArmies.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="army in filteredArmies"
          :key="army.id"
          class="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden hover:border-yellow-500 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10"
        >
          <!-- Army Header -->
          <div class="p-4 bg-gray-700 border-b border-gray-700">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-100 mb-1">{{ army.name }}</h4>
                <p class="text-sm text-gray-400">{{ getPlayerName(army.playerId) }}</p>
              </div>
              <div
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-bold',
                  army.isValid ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                ]"
              >
                {{ army.isValid ? '✓ Valid' : '✗ Invalid' }}
              </div>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <span class="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-semibold">
                Round {{ army.round }}
              </span>
              <span class="text-gray-500">•</span>
              <span class="text-gray-400">{{ getRoundName(army.round) }}</span>
            </div>
          </div>

          <!-- Army Stats -->
          <div class="p-4">
            <!-- Points -->
            <div class="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-xs text-gray-400 mb-1">Army Points</div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-bold text-yellow-500">{{ army.totalPoints }}</span>
                    <span class="text-gray-400">/ {{ getRoundLimit(army.round) }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-400 mb-1">Units</div>
                  <div class="text-xl font-semibold text-gray-200">{{ army.units.length }}</div>
                </div>
              </div>
            </div>

            <!-- Painting Progress -->
            <div v-if="getArmyPaintingStats(army).totalModels > 0" class="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
              <!-- Models Progress -->
              <div class="mb-3">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <Paintbrush :size="14" />
                    Models Painted
                  </span>
                  <span
                    class="text-sm font-bold"
                    :class="getPaintPercentageColor(getArmyPaintingStats(army).percentage)"
                  >
                    {{ getArmyPaintingStats(army).percentage }}%
                  </span>
                </div>
                <div class="h-2.5 bg-gray-600 rounded-full overflow-hidden mb-2">
                  <div
                    class="h-full transition-all duration-500"
                    :class="getPaintProgressClass(getArmyPaintingStats(army).percentage)"
                    :style="{ width: getArmyPaintingStats(army).percentage + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-400">
                    {{ getArmyPaintingStats(army).painted }} / {{ getArmyPaintingStats(army).totalModels }} models
                  </span>
                  <span v-if="getArmyPaintingStats(army).percentage === 100" class="text-xs text-purple-400 font-semibold">
                    ✨ Complete!
                  </span>
                </div>
              </div>

              <!-- Points Progress -->
              <div v-if="getArmyPaintedPoints(army).totalPoints > 0">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <TrendingUp :size="14" />
                    Points Painted
                  </span>
                  <span
                    class="text-sm font-bold"
                    :class="getPaintPercentageColor(getArmyPaintedPoints(army).percentage)"
                  >
                    {{ getArmyPaintedPoints(army).percentage }}%
                  </span>
                </div>
                <div class="h-2.5 bg-gray-600 rounded-full overflow-hidden mb-2">
                  <div
                    class="h-full transition-all duration-500"
                    :class="getPaintProgressClass(getArmyPaintedPoints(army).percentage)"
                    :style="{ width: getArmyPaintedPoints(army).percentage + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-400">
                    {{ getArmyPaintedPoints(army).paintedPoints }} / {{ getArmyPaintedPoints(army).totalPoints }} pts
                  </span>
                  <span v-if="getArmyPaintedPoints(army).percentage === 100" class="text-xs text-purple-400 font-semibold">
                    ✨ Complete!
                  </span>
                </div>
              </div>
            </div>

            <!-- Units Summary -->
            <div class="mb-4">
              <h6 class="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Units</h6>
              <div class="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                <div
                  v-for="unit in army.units"
                  :key="unit.id"
                  class="text-sm bg-gray-800 p-2.5 rounded border border-gray-600"
                >
                  <div class="flex justify-between items-start mb-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded">{{ unit.type }}</span>
                      <span class="text-gray-200 font-medium">{{ unit.name }}</span>
                    </div>
                    <span class="text-yellow-500 font-semibold text-xs">{{ unit.points }}pts</span>
                  </div>
                  <!-- Unit Painting -->
                  <div v-if="unit.totalModels > 0" class="mt-2 space-y-2">
                    <!-- Models Progress -->
                    <div>
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span class="flex items-center gap-1">
                          <Paintbrush :size="12" />
                          {{ unit.paintedModels || 0 }} / {{ unit.totalModels }} models
                        </span>
                        <span :class="getPaintPercentageColor(getUnitPaintPercentage(unit))">
                          {{ getUnitPaintPercentage(unit) }}%
                        </span>
                      </div>
                      <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full transition-all"
                          :class="getPaintProgressClass(getUnitPaintPercentage(unit))"
                          :style="{ width: getUnitPaintPercentage(unit) + '%' }"
                        ></div>
                      </div>
                    </div>

                    <!-- Points Progress -->
                    <div>
                      <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span class="flex items-center gap-1">
                          <TrendingUp :size="12" />
                          {{ getUnitPaintedPoints(unit) }} / {{ unit.points }} pts
                        </span>
                        <span :class="getPaintPercentageColor(getUnitPaintedPointsPercentage(unit))">
                          {{ getUnitPaintedPointsPercentage(unit) }}%
                        </span>
                      </div>
                      <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full transition-all"
                          :class="getPaintProgressClass(getUnitPaintedPointsPercentage(unit))"
                          :style="{ width: getUnitPaintedPointsPercentage(unit) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer with Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-800">
              <div class="text-xs text-gray-500">
                Updated {{ formatDateShort(army.lastModified) }}
              </div>
              <div class="flex gap-1.5">
                <button
                  v-if="canEscalateArmy(army) && canModifyArmy(army)"
                  @click="escalateArmy(army)"
                  class="text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-2.5 py-1.5 rounded flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
                  title="Escalate to Next Round"
                >
                  <TrendingUp :size="14" />
                  Escalate
                </button>
                <button
                  v-if="canModifyArmy(army)"
                  @click="handleEditArmy(army)"
                  class="text-yellow-400 hover:text-yellow-300 bg-yellow-900/30 hover:bg-yellow-900/50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                  title="Edit Army"
                >
                  <Edit :size="16" />
                </button>
                <button
                  v-if="canModifyArmy(army)"
                  @click="handleDeleteArmy(army)"
                  class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                  title="Delete Army"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg">
        <Shield :size="64" class="mx-auto text-gray-700 mb-4" />
        <p class="text-xl text-gray-400 font-medium mb-2">No army lists found</p>
        <p class="text-sm text-gray-500 mb-6">
          {{ selectedRound ? `No armies for Round ${selectedRound}` : 'Start building your first army list!' }}
        </p>
        <button @click="handleStartNewArmy" class="btn-primary inline-flex items-center gap-2">
          <Plus :size="20" />
          Build Your First Army
        </button>
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
