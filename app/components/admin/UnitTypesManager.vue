<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Plus, Edit, Trash2, Save, X, Filter, ChevronDown } from 'lucide-vue-next'
  import AdminModal from '~/components/admin/AdminModal.vue'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'
  import { useToast } from '~/composables/useToast'

  const { toastSuccess, toastError } = useToast()

  const unitTypes = ref([])
  const gameSystems = ref([])
  const loading = ref(false)
  const error = ref(null)
  const editingId = ref(null)
  const showModal = ref(false)
  const selectedGameSystem = ref(null)

  // Confirmation state
  const showConfirmation = ref(false)
  const confirmationMessage = ref('')
  const confirmationAction = ref(null)
  const confirmationVariant = ref('default')

  // Form state
  const formData = ref({
    gameSystemId: null,
    name: '',
    category: '',
    displayOrder: 1
  })

  // Fetch game systems
  const fetchGameSystems = async () => {
    try {
      const response = await $fetch('/api/game-systems')
      gameSystems.value = response.data || []
      // Default to "All" (null) instead of first game system
      if (!selectedGameSystem.value) {
        selectedGameSystem.value = null
      }
    }
    catch (err) {
      console.error('Failed to fetch game systems:', err)
    }
  }

  // Fetch unit types
  const fetchUnitTypes = async () => {
    loading.value = true
    error.value = null
    try {
      const url = selectedGameSystem.value
        ? `/api/unit-types?gameSystemId=${selectedGameSystem.value}`
        : '/api/unit-types'
      const response = await $fetch(url)
      unitTypes.value = response.data || []
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to fetch unit types:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Filtered unit types by selected game system
  const filteredUnitTypes = computed(() => {
    if (!selectedGameSystem.value) return unitTypes.value
    return unitTypes.value.filter(u => u.gameSystemId === selectedGameSystem.value)
  })

  // Get game system name
  const getGameSystemName = (id) => {
    const system = gameSystems.value.find(s => s.id === id)
    return system?.name || 'Unknown'
  }

  // Get next display order
  const getNextDisplayOrder = () => {
    if (filteredUnitTypes.value.length === 0) return 1
    const maxOrder = Math.max(...filteredUnitTypes.value.map(u => u.displayOrder || 0))
    return maxOrder + 1
  }

  // Reset form
  const resetForm = () => {
    formData.value = {
      gameSystemId: selectedGameSystem.value || null,
      name: '',
      category: '',
      displayOrder: getNextDisplayOrder()
    }
    editingId.value = null
    showModal.value = false
  }

  // Open add form
  const openAddForm = () => {
    formData.value = {
      gameSystemId: selectedGameSystem.value || null,
      name: '',
      category: '',
      displayOrder: getNextDisplayOrder()
    }
    editingId.value = null
    showModal.value = true
  }

  // Start editing
  const startEdit = (unitType) => {
    editingId.value = unitType.id
    formData.value = {
      gameSystemId: unitType.gameSystemId,
      name: unitType.name,
      category: unitType.category || '',
      displayOrder: unitType.displayOrder
    }
    showModal.value = true
  }

  // Cancel editing
  const cancelEdit = () => {
    resetForm()
  }

  // Confirmation helper
  const requestConfirmation = (message, action, variant = 'default') => {
    confirmationMessage.value = message
    confirmationAction.value = action
    confirmationVariant.value = variant
    showConfirmation.value = true
  }

  const handleConfirm = () => {
    if (confirmationAction.value) {
      confirmationAction.value()
    }
    showConfirmation.value = false
    confirmationAction.value = null
  }

  const handleCancelConfirmation = () => {
    showConfirmation.value = false
    confirmationAction.value = null
  }

  // Save unit type (create or update) - with confirmation for updates
  const confirmSaveUnitType = () => {
    if (!formData.value.name || !formData.value.gameSystemId || formData.value.displayOrder === undefined) {
      toastError('Name, Game System, and Display Order are required')
      return
    }

    if (editingId.value) {
      // Updating - ask for confirmation
      requestConfirmation(
        `Are you sure you want to update "${formData.value.name}"? This may affect existing armies using this unit type.`,
        saveUnitType
      )
    } else {
      // Creating - no confirmation needed
      saveUnitType()
    }
  }

  // Save unit type
  const saveUnitType = async () => {
    if (!formData.value.name || !formData.value.gameSystemId || formData.value.displayOrder === undefined) {
      toastError('Name, Game System, and Display Order are required')
      return
    }

    loading.value = true
    error.value = null

    try {
      if (editingId.value) {
        // Update
        await $fetch(`/api/admin/unit-types/${editingId.value}`, {
          method: 'PUT',
          body: formData.value
        })
        toastSuccess(`Unit type "${formData.value.name}" updated successfully`)
      }
      else {
        // Create
        await $fetch('/api/admin/unit-types', {
          method: 'POST',
          body: formData.value
        })
        toastSuccess(`Unit type "${formData.value.name}" created successfully`)
      }

      await fetchUnitTypes()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to save unit type: ${err.message}`)
      console.error('Failed to save unit type:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete unit type
  const confirmDeleteUnitType = (id, name) => {
    requestConfirmation(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      () => deleteUnitType(id, name),
      'danger'
    )
  }

  const deleteUnitType = async (id, name) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/unit-types/${id}`, {
        method: 'DELETE'
      })
      await fetchUnitTypes()
      toastSuccess(`Unit type "${name}" deleted successfully`)
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to delete unit type: ${err.message}`)
      console.error('Failed to delete unit type:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Watch game system change
  const onGameSystemChange = () => {
    fetchUnitTypes()
  }

  onMounted(async () => {
    await fetchGameSystems()
    await fetchUnitTypes()
  })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="">
        <h2 class="text-2xl font-bold text-white mb-2">Unit Types Management</h2>
        <p class="text-gray-400 text-sm">Manage unit types and their display order for each game system</p>
      </div>
      <button
        @click="openAddForm"
        class="admin-btn-primary"
      >
        <Plus class="w-4 h-4" />
        Add Unit Type
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
      {{ error }}
    </div>

    <!-- Filter by Game System -->
    <div class="mb-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
      <div class="flex items-center gap-4">
        <Filter class="w-5 h-5 text-gray-400" />
        <label class="text-sm font-medium text-gray-300">Filter by Game System:</label>
        <div class="admin-select-wrapper flex-1">
          <select
            v-model="selectedGameSystem"
            @change="onGameSystemChange"
            class="admin-select"
          >
            <option :value="null">All Game Systems</option>
            <option v-for="system in gameSystems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
          <ChevronDown class="chevron-icon w-4 h-4" />
        </div>
        <span class="text-sm text-gray-400">
          {{ filteredUnitTypes.length }} unit types
        </span>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="showModal"
      :title="editingId ? 'Edit Unit Type' : 'Add New Unit Type'"
      size="md"
      @close="cancelEdit"
    >
      <div class="space-y-4">
        <div>
          <label class="admin-label">Game System *</label>
          <div class="admin-select-wrapper">
            <select
              v-model="formData.gameSystemId"
              class="admin-select"
            >
              <option :value="null">Select a game system</option>
              <option v-for="system in gameSystems" :key="system.id" :value="system.id">
                {{ system.name }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <div>
          <label class="admin-label">Unit Type Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="admin-input"
            placeholder="HQ, Troops, Leaders, Battleline, etc."
          >
        </div>

        <div>
          <label class="admin-label">Category</label>
          <input
            v-model="formData.category"
            type="text"
            class="admin-input"
            placeholder="Command, Core, Elite, Support, etc."
          >
          <p class="admin-hint">Optional: Unit type category or grouping</p>
        </div>

        <div>
          <label class="admin-label">Display Order *</label>
          <input
            v-model.number="formData.displayOrder"
            type="number"
            min="1"
            class="admin-input"
            placeholder="1"
          >
          <p class="admin-hint">Lower numbers appear first in dropdowns</p>
        </div>
      </div>

      <template #footer>
        <button
          @click="cancelEdit"
          class="admin-btn-neutral"
        >
          <X class="w-4 h-4" />
          Cancel
        </button>
        <button
          @click="confirmSaveUnitType"
          :disabled="loading"
          class="admin-btn-secondary"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
      </template>
    </AdminModal>

    <!-- Loading State -->
    <div v-if="loading && !filteredUnitTypes.length" class="text-center py-8 text-gray-400">
      Loading unit types...
    </div>

    <!-- Unit Types List -->
    <div v-else-if="filteredUnitTypes.length" class="space-y-4">
      <div
        v-for="unitType in filteredUnitTypes"
        :key="unitType.id"
        class="p-4 bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-white">{{ unitType.name }}</h3>
              <span class="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-300 rounded">
                ID: {{ unitType.id }}
              </span>
              <span class="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                {{ getGameSystemName(unitType.gameSystemId) }}
              </span>
              <span v-if="unitType.category" class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                {{ unitType.category }}
              </span>
              <span class="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                Order: {{ unitType.displayOrder }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="startEdit(unitType)"
              class="admin-btn-info"
            >
              <Edit class="w-3 h-3" />
              Edit
            </button>
            <button
              @click="confirmDeleteUnitType(unitType.id, unitType.name)"
              class="admin-btn-danger"
            >
              <Trash2 class="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-400">
      <p class="mb-4">
        No unit types found{{ selectedGameSystem ? ` for ${getGameSystemName(selectedGameSystem)}` : '' }}.
      </p>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Add First Unit Type
      </button>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmation"
      :message="confirmationMessage"
      :variant="confirmationVariant"
      @confirm="handleConfirm"
      @cancel="handleCancelConfirmation"
    />
  </div>
</template>
