import { ref, computed } from 'vue'

/**
 * Army form state management and operations
 * Handles army builder form state, unit management, and validation
 *
 * @param {Ref} phases - Reactive reference to phases array
 * @param {Function} calculateTotal - Function to calculate army total points
 * @param {Function} isValidArmy - Function to validate army against point limit
 * @returns {Object} Army form utilities
 */
export function useArmyForm(phases, calculateTotal, isValidArmy) {
  const showBuilder = ref(false)
  const editingArmy = ref(false)
  const newlyAddedUnitId = ref(null)
  const currentArmy = ref({
    playerId: null,
    phase: null,
    name: '',
    totalPoints: 0,
    units: [],
    builderLink: '',
    isValid: false
  })

  /**
   * Get the point limit for the current army's phase
   * @returns {number} Point limit or 0 if no phase selected
   */
  const currentPhaseLimit = computed(() => {
    if (!currentArmy.value.phase) return 0
    const phase = phases.value.find(p => p.number === currentArmy.value.phase)
    return phase ? phase.pointLimit : 0
  })

  /**
   * Calculate remaining points available
   * @returns {number} Remaining points (positive = under limit, negative = over limit)
   */
  const remainingPoints = computed(() => {
    return currentPhaseLimit.value - currentArmy.value.totalPoints
  })

  /**
   * Check if current army is valid
   * @returns {boolean} True if army is within point limit
   */
  const isCurrentArmyValid = computed(() => {
    return isValidArmy(currentArmy.value, currentPhaseLimit.value)
  })

  /**
   * Start building a new army
   * @param {number} defaultPhase - Default phase number to select
   */
  const startNewArmy = (defaultPhase = 1) => {
    currentArmy.value = {
      playerId: null,
      phase: defaultPhase,
      name: '',
      totalPoints: 0,
      units: [],
      builderLink: '',
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
      phase: null,
      name: '',
      totalPoints: 0,
      units: [],
      builderLink: '',
      isValid: false
    }
  }

  /**
   * Add a new empty unit to the current army
   * Units are added at the top of the list for better UX
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
    // Add unit at the beginning of the array
    currentArmy.value.units.unshift(newUnit)

    // Track newly added unit for animation
    newlyAddedUnitId.value = newUnit.id

    // Clear the animation flag after animation completes
    setTimeout(() => {
      newlyAddedUnitId.value = null
    }, 1000)

    return newUnit
  }

  /**
   * Check if a unit is newly added (for animation purposes)
   * @param {number} unitId - Unit ID to check
   * @returns {boolean} True if unit was just added
   */
  const isNewlyAdded = (unitId) => {
    return newlyAddedUnitId.value === unitId
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
      currentArmy.value.name = `${previousArmy.name} - Phase ${currentArmy.value.phase}`
      recalculateArmy()
    }
  }

  /**
   * Set up form for escalating an army to next phase
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
    newlyAddedUnitId,

    // Computed
    currentPhaseLimit,
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
    setupEscalation,
    isNewlyAdded
  }
}
