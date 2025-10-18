<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Plus, Edit, Trash2, Save, X, Filter, ChevronDown } from 'lucide-vue-next'
  import AdminModal from '~/components/admin/AdminModal.vue'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'
  import { useToast } from '~/composables/useToast'

  const { toastSuccess, toastError } = useToast()

  const missions = ref([])
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
    category: ''
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

  // Fetch missions
  const fetchMissions = async () => {
    loading.value = true
    error.value = null
    try {
      const url = selectedGameSystem.value
        ? `/api/missions?gameSystemId=${selectedGameSystem.value}`
        : '/api/missions'
      const response = await $fetch(url)
      missions.value = response.data || []
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to fetch missions:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Filtered missions by selected game system
  const filteredMissions = computed(() => {
    if (!selectedGameSystem.value) return missions.value
    return missions.value.filter(m => m.gameSystemId === selectedGameSystem.value)
  })

  // Get game system name
  const getGameSystemName = (id) => {
    const system = gameSystems.value.find(s => s.id === id)
    return system?.name || 'Unknown'
  }

  // Reset form
  const resetForm = () => {
    formData.value = {
      gameSystemId: selectedGameSystem.value || null,
      name: '',
      category: ''
    }
    editingId.value = null
    showModal.value = false
  }

  // Open add form
  const openAddForm = () => {
    formData.value = {
      gameSystemId: selectedGameSystem.value || null,
      name: '',
      category: ''
    }
    editingId.value = null
    showModal.value = true
  }

  // Start editing
  const startEdit = (mission) => {
    editingId.value = mission.id
    formData.value = {
      gameSystemId: mission.gameSystemId,
      name: mission.name,
      category: mission.category || ''
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

  // Save mission (create or update) - with confirmation for updates
  const confirmSaveMission = () => {
    if (!formData.value.name || !formData.value.gameSystemId) {
      toastError('Name and Game System are required')
      return
    }

    if (editingId.value) {
      // Updating - ask for confirmation
      requestConfirmation(
        `Are you sure you want to update "${formData.value.name}"? This may affect existing matches using this mission.`,
        saveMission
      )
    } else {
      // Creating - no confirmation needed
      saveMission()
    }
  }

  // Save mission
  const saveMission = async () => {
    if (!formData.value.name || !formData.value.gameSystemId) {
      toastError('Name and Game System are required')
      return
    }

    loading.value = true
    error.value = null

    try {
      if (editingId.value) {
        // Update
        await $fetch(`/api/admin/missions/${editingId.value}`, {
          method: 'PUT',
          body: formData.value
        })
        toastSuccess(`Mission "${formData.value.name}" updated successfully`)
      }
      else {
        // Create
        await $fetch('/api/admin/missions', {
          method: 'POST',
          body: formData.value
        })
        toastSuccess(`Mission "${formData.value.name}" created successfully`)
      }

      await fetchMissions()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to save mission: ${err.message}`)
      console.error('Failed to save mission:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete mission
  const confirmDeleteMission = (id, name) => {
    requestConfirmation(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      () => deleteMission(id, name),
      'danger'
    )
  }

  const deleteMission = async (id, name) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/missions/${id}`, {
        method: 'DELETE'
      })
      await fetchMissions()
      toastSuccess(`Mission "${name}" deleted successfully`)
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to delete mission: ${err.message}`)
      console.error('Failed to delete mission:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Watch game system change
  const onGameSystemChange = () => {
    fetchMissions()
  }

  onMounted(async () => {
    await fetchGameSystems()
    await fetchMissions()
  })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="">
        <h2 class="text-2xl font-bold text-white mb-2">Missions Management</h2>
        <p class="text-gray-400 text-sm">Manage missions and scenarios for each game system</p>
      </div>
      <button
        @click="openAddForm"
        class="admin-btn-primary"
      >
        <Plus class="w-4 h-4" />
        Add Mission
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
          {{ filteredMissions.length }} missions
        </span>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="showModal"
      :title="editingId ? 'Edit Mission' : 'Add New Mission'"
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
          <label class="admin-label">Mission Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="admin-input"
            placeholder="Purge the Enemy"
          >
        </div>

        <div>
          <label class="admin-label">Category</label>
          <input
            v-model="formData.category"
            type="text"
            class="admin-input"
            placeholder="Matched Play, Narrative, Crusade, etc."
          >
          <p class="admin-hint">Optional: Mission category or type</p>
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
          @click="confirmSaveMission"
          :disabled="loading"
          class="admin-btn-secondary"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
      </template>
    </AdminModal>

    <!-- Loading State -->
    <div v-if="loading && !filteredMissions.length" class="text-center py-8 text-gray-400">
      Loading missions...
    </div>

    <!-- Missions List -->
    <div v-else-if="filteredMissions.length" class="space-y-4">
      <div
        v-for="mission in filteredMissions"
        :key="mission.id"
        class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-white">{{ mission.name }}</h3>
              <span class="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-300 rounded">
                ID: {{ mission.id }}
              </span>
              <span class="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                {{ getGameSystemName(mission.gameSystemId) }}
              </span>
              <span v-if="mission.category" class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                {{ mission.category }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="startEdit(mission)"
              class="admin-btn-info"
            >
              <Edit class="w-3 h-3" />
              Edit
            </button>
            <button
              @click="confirmDeleteMission(mission.id, mission.name)"
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
        No missions found{{ selectedGameSystem ? ` for ${getGameSystemName(selectedGameSystem)}` : '' }}.
      </p>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Add First Mission
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
