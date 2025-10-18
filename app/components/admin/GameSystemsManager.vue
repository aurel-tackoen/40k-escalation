<script setup>
  import { ref, onMounted } from 'vue'
  import { Plus, Edit, Trash2, Save, X } from 'lucide-vue-next'
  import AdminModal from '~/components/admin/AdminModal.vue'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'
  import { useToast } from '~/composables/useToast'

  const { toastSuccess, toastError } = useToast()

  const gameSystems = ref([])
  const loading = ref(false)
  const error = ref(null)
  const editingId = ref(null)
  const showModal = ref(false)

  // Confirmation state
  const showConfirmation = ref(false)
  const confirmationMessage = ref('')
  const confirmationAction = ref(null)
  const confirmationVariant = ref('default')

  // Form state
  const formData = ref({
    name: '',
    shortName: '',
    description: '',
    matchType: 'victory_points',
    matchConfig: ''
  })

  const matchTypes = [
    { value: 'victory_points', label: 'Victory Points (40k, AoS, HH)' },
    { value: 'percentage', label: 'Percentage/Casualties (ToW)' },
    { value: 'scenario', label: 'Scenario Objectives (MESBG)' }
  ]

  // Fetch game systems
  const fetchGameSystems = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/game-systems')
      gameSystems.value = response.data || []
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to fetch game systems:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Reset form
  const resetForm = () => {
    formData.value = {
      name: '',
      shortName: '',
      description: '',
      matchType: 'victory_points',
      matchConfig: ''
    }
    editingId.value = null
    showModal.value = false
  }

  // Open add form
  const openAddForm = () => {
    formData.value = {
      name: '',
      shortName: '',
      description: '',
      matchType: 'victory_points',
      matchConfig: ''
    }
    editingId.value = null
    showModal.value = true
  }

  // Start editing
  const startEdit = (system) => {
    editingId.value = system.id
    formData.value = {
      name: system.name,
      shortName: system.shortName,
      description: system.description || '',
      matchType: system.matchType || 'victory_points',
      matchConfig: typeof system.matchConfig === 'object'
        ? JSON.stringify(system.matchConfig, null, 2)
        : system.matchConfig || ''
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

  // Save game system (create or update) - with confirmation for updates
  const confirmSaveGameSystem = () => {
    if (!formData.value.name || !formData.value.shortName) {
      toastError('Name and Short Name are required')
      return
    }

    if (editingId.value) {
      // Updating - ask for confirmation
      requestConfirmation(
        `Are you sure you want to update "${formData.value.name}"? This may affect existing leagues using this game system.`,
        saveGameSystem
      )
    } else {
      // Creating - no confirmation needed
      saveGameSystem()
    }
  }

  const saveGameSystem = async () => {
    if (!formData.value.name || !formData.value.shortName) {
      toastError('Name and Short Name are required')
      return
    }

    loading.value = true
    error.value = null

    console.log('saveGameSystem called', {
      editingId: editingId.value,
      formData: formData.value
    })

    try {
      // Parse matchConfig if it's a string
      let matchConfig = formData.value.matchConfig
      if (typeof matchConfig === 'string' && matchConfig.trim()) {
        try {
          matchConfig = JSON.parse(matchConfig)
        }
        catch {
          toastError('Invalid JSON in Match Config')
          loading.value = false
          return
        }
      }

      const payload = {
        ...formData.value,
        matchConfig
      }

      console.log('Payload:', payload)

      if (editingId.value) {
        // Update existing
        console.log('Updating game system:', editingId.value)
        const response = await $fetch(`/api/admin/game-systems/${editingId.value}`, {
          method: 'PUT',
          body: payload
        })
        console.log('Update response:', response)
        toastSuccess(`Game system "${formData.value.name}" updated successfully`)
      }
      else {
        // Create new
        console.log('Creating new game system')
        const response = await $fetch('/api/admin/game-systems', {
          method: 'POST',
          body: payload
        })
        console.log('Create response:', response)
        toastSuccess(`Game system "${formData.value.name}" created successfully`)
      }

      await fetchGameSystems()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to save game system: ${err.message}`)
      console.error('Failed to save game system:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete game system
  const confirmDeleteGameSystem = (id, name) => {
    requestConfirmation(
      `Are you sure you want to delete "${name}"? This will also delete all associated factions, missions, and unit types. This action cannot be undone.`,
      () => deleteGameSystem(id, name),
      'danger'
    )
  }

  const deleteGameSystem = async (id, name) => {

    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/game-systems/${id}`, {
        method: 'DELETE'
      })
      await fetchGameSystems()
      toastSuccess(`Game system "${name}" deleted successfully`)
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to delete game system: ${err.message}`)
      console.error('Failed to delete game system:', err)
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchGameSystems()
  })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="">
        <h2 class="text-2xl font-bold text-white mb-2">Game Systems Management</h2>
        <p class="text-gray-400 text-sm">Manage game systems, match types, and configurations</p>
      </div>
      <button
        @click="openAddForm"
        class="admin-btn-primary"
      >
        <Plus class="w-4 h-4" />
        Add Game System
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
      {{ error }}
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="showModal"
      :title="editingId ? 'Edit Game System' : 'Add New Game System'"
      size="lg"
      @close="cancelEdit"
    >
      <div class="space-y-4">
        <div>
          <label class="admin-label">Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="admin-input"
            placeholder="Warhammer 40,000"
          >
        </div>

        <div>
          <label class="admin-label">Short Name *</label>
          <input
            v-model="formData.shortName"
            type="text"
            class="admin-input"
            placeholder="40k"
          >
        </div>

        <div>
          <label class="admin-label">Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="admin-textarea"
            placeholder="The grim darkness of the far future..."
          />
        </div>

        <div>
          <label class="admin-label">Match Type</label>
          <select
            v-model="formData.matchType"
            class="admin-select"
          >
            <option v-for="type in matchTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="admin-label">Match Config (JSON)</label>
          <textarea
            v-model="formData.matchConfig"
            rows="5"
            class="admin-textarea font-mono text-sm"
            placeholder='{"pointsLabel": "Victory Points", "pointsRange": {"min": 0, "max": 100}}'
          />
          <p class="admin-hint">Optional: Game-specific configuration as JSON</p>
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
          @click="confirmSaveGameSystem"
          :disabled="loading"
          class="admin-btn-secondary"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
      </template>
    </AdminModal>

    <!-- Loading State -->
    <div v-if="loading && !gameSystems.length" class="text-center py-8 text-gray-400">
      Loading game systems...
    </div>

    <!-- Game Systems List -->
    <div v-else-if="gameSystems.length" class="space-y-4">
      <div
        v-for="system in gameSystems"
        :key="system.id"
        class="p-4 bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-bold text-white">{{ system.name }}</h3>
              <span class="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-300 rounded">
                ID: {{ system.id }}
              </span>
              <span class="px-2 py-1 text-xs font-mono bg-gray-800 text-gray-300 rounded">
                {{ system.shortName }}
              </span>
              <span class="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                {{ system.matchType }}
              </span>
            </div>
            <p v-if="system.description" class="text-sm text-gray-400 mb-2">
              {{ system.description }}
            </p>
            <div v-if="system.matchConfig" class="text-xs text-gray-500 font-mono">
              <pre class="admin-pre">{{ typeof system.matchConfig === 'object' ? JSON.stringify(system.matchConfig, null, 2) : system.matchConfig }}</pre>
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="startEdit(system)"
              class="admin-btn-info"
            >
              <Edit class="w-3 h-3" />
              Edit
            </button>
            <button
              @click="confirmDeleteGameSystem(system.id, system.name)"
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
      <p class="mb-4">No game systems found.</p>
      <button
        @click="showAddForm = true; resetForm()"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Add Your First Game System
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

