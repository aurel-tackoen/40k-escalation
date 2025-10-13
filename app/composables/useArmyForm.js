import { ref, computed } from 'vue'

/**
 * Army form state management and operations
 * Handles army builder form state, unit management, and validation
 *
 * @param {Ref} rounds - Reactive reference to rounds array
 * @param {Function} calculateTotal - Function to calculate army total points
 * @param {Function} isValidArmy - Function to validate army against point limit
 * @returns {Object} Army form utilities
 */
export function useArmyForm(rounds, calculateTotal, isValidArmy) {
  const showBuilder = ref(false)
  const editingArmy = ref(false)
  const currentArmy = ref({
    playerId: null,
    round: null,
    name: '',
    totalPoints: 0,
    units: [],
    isValid: false
  })

  /**
   * Get the point limit for the current army's round
   * @returns {number} Point limit or 0 if no round selected
   */
  const currentRoundLimit = computed(() => {
    if (!currentArmy.value.round) return 0
    const round = rounds.value.find(r => r.number === currentArmy.value.round)
    return round ? round.pointLimit : 0
  })

  /**
   * Calculate remaining points available
   * @returns {number} Remaining points (positive = under limit, negative = over limit)
   */
  const remainingPoints = computed(() => {
    return currentRoundLimit.value - currentArmy.value.totalPoints
  })

  /**
   * Check if current army is valid
   * @returns {boolean} True if army is within point limit
   */
  const isCurrentArmyValid = computed(() => {
    return isValidArmy(currentArmy.value, currentRoundLimit.value)
  })

  /**
   * Start building a new army
   * @param {number} defaultRound - Default round number to select
   */
  const startNewArmy = (defaultRound = 1) => {
    currentArmy.value = {
      playerId: null,
      round: defaultRound,
      name: '',
      totalPoints: 0,
      units: [],
      isValid: false
    }
    editingArmy.value = false
    showBuilder.value = true
  }

  /**
   * Edit an existing army
   * @param {Object} army - Army object to edit
   */
  const editArmy = (army) => {
    currentArmy.value = JSON.parse(JSON.stringify(army))
    editingArmy.value = true
    showBuilder.value = true
  }

  /**
   * Cancel the builder form and reset state
   */
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

  /**
   * Add a new empty unit to the current army
   * @returns {Object} The newly created unit
   */
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
    return newUnit
  }

  /**
   * Remove a unit from the current army by index
   * @param {number} index - Index of unit to remove
   */
  const removeUnit = (index) => {
    currentArmy.value.units.splice(index, 1)
    recalculateArmy()
  }

  /**
   * Recalculate army total points and validation status
   */
  const recalculateArmy = () => {
    currentArmy.value.totalPoints = calculateTotal(currentArmy.value.units)
    currentArmy.value.isValid = isCurrentArmyValid.value
  }

  /**
   * Copy units from a previous army
   * @param {Object} previousArmy - Previous army to copy from
   */
  const copyFromPreviousArmy = (previousArmy) => {
    if (previousArmy) {
      currentArmy.value.units = JSON.parse(JSON.stringify(previousArmy.units))
      currentArmy.value.name = `${previousArmy.name} (Round ${currentArmy.value.round})`
      recalculateArmy()
    }
  }

  /**
   * Set up form for escalating an army to next round
   * @param {Object} army - Army to escalate
   * @param {Object} escalatedArmy - Pre-escalated army data
   */
  const setupEscalation = (army, escalatedArmy) => {
    currentArmy.value = escalatedArmy
    editingArmy.value = false
    showBuilder.value = true
  }

  return {
    // State
    showBuilder,
    editingArmy,
    currentArmy,

    // Computed
    currentRoundLimit,
    remainingPoints,
    isCurrentArmyValid,

    // Methods
    startNewArmy,
    editArmy,
    cancelBuilder,
    addUnit,
    removeUnit,
    recalculateArmy,
    copyFromPreviousArmy,
    setupEscalation
  }
}
