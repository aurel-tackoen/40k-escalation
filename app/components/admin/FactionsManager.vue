<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Plus, Edit, Trash2, Save, X, Filter, ChevronDown } from 'lucide-vue-next'
  import AdminModal from '~/components/admin/AdminModal.vue'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'
  import { useToast } from '~/composables/useToast'

  const { toastSuccess, toastError } = useToast()

  const factions = ref([])
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

  // Fetch factions
  const fetchFactions = async () => {
    loading.value = true
    error.value = null
    try {
      const url = selectedGameSystem.value
        ? `/api/factions?gameSystemId=${selectedGameSystem.value}`
        : '/api/factions'
      const response = await $fetch(url)
      factions.value = response.data || []
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to fetch factions:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Filtered factions by selected game system
  const filteredFactions = computed(() => {
    if (!selectedGameSystem.value) return factions.value
    return factions.value.filter(f => f.gameSystemId === selectedGameSystem.value)
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
  const startEdit = (faction) => {
    editingId.value = faction.id
    formData.value = {
      gameSystemId: faction.gameSystemId,
      name: faction.name,
      category: faction.category || ''
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

  // Save faction (create or update) - with confirmation for updates
  const confirmSaveFaction = () => {
    if (!formData.value.name || !formData.value.gameSystemId) {
      toastError('Name and Game System are required')
      return
    }

    if (editingId.value) {
      // Updating - ask for confirmation
      requestConfirmation(
        `Are you sure you want to update "${formData.value.name}"? This may affect existing players using this faction.`,
        saveFaction
      )
    } else {
      // Creating - no confirmation needed
      saveFaction()
    }
  }

  // Save faction
  const saveFaction = async () => {
    if (!formData.value.name || !formData.value.gameSystemId) {
      toastError('Name and Game System are required')
      return
    }

    loading.value = true
    error.value = null

    try {
      if (editingId.value) {
        // Update
        await $fetch(`/api/admin/factions/${editingId.value}`, {
          method: 'PUT',
          body: formData.value
        })
        toastSuccess(`Faction "${formData.value.name}" updated successfully`)
      }
      else {
        // Create
        await $fetch('/api/admin/factions', {
          method: 'POST',
          body: formData.value
        })
        toastSuccess(`Faction "${formData.value.name}" created successfully`)
      }

      await fetchFactions()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to save faction: ${err.message}`)
      console.error('Failed to save faction:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete faction
  const confirmDeleteFaction = (id, name) => {
    requestConfirmation(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      () => deleteFaction(id, name),
      'danger'
    )
  }

  const deleteFaction = async (id, name) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/factions/${id}`, {
        method: 'DELETE'
      })
      await fetchFactions()
      toastSuccess(`Faction "${name}" deleted successfully`)
    }
    catch (err) {
      error.value = err.message
      toastError(`Failed to delete faction: ${err.message}`)
      console.error('Failed to delete faction:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Watch game system change
  const onGameSystemChange = () => {
    fetchFactions()
  }

  onMounted(async () => {
    await fetchGameSystems()
    await fetchFactions()
  })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="">
        <h2 class="text-2xl font-bold text-white mb-2">Factions Management</h2>
        <p class="text-gray-400 text-sm">Manage factions for each game system</p>
      </div>
      <button
        @click="openAddForm"
        class="admin-btn-primary"
      >
        <Plus class="w-4 h-4" />
        Add Faction
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
          {{ filteredFactions.length }} factions
        </span>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="showModal"
      :title="editingId ? 'Edit Faction' : 'Add New Faction'"
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
          <label class="admin-label">Faction Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="admin-input"
            placeholder="Space Marines"
          >
        </div>

        <div>
          <label class="admin-label">Category</label>
          <input
            v-model="formData.category"
            type="text"
            class="admin-input"
            placeholder="Imperium, Chaos, Xenos, etc."
          >
          <p class="admin-hint">Optional: Faction category or alignment</p>
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
          @click="confirmSaveFaction"
          :disabled="loading"
          class="admin-btn-secondary"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
      </template>
    </AdminModal>

    <!-- Loading State -->
    <div v-if="loading && !filteredFactions.length" class="text-center py-8 text-gray-400">
      Loading factions...
    </div>

    <!-- Factions List -->
    <div v-else-if="filteredFactions.length" class="space-y-4">
      <div
        v-for="faction in filteredFactions"
        :key="faction.id"
        class="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-white">{{ faction.name }}</h3>
              <span class="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-300 rounded">
                ID: {{ faction.id }}
              </span>
              <span class="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                {{ getGameSystemName(faction.gameSystemId) }}
              </span>
              <span v-if="faction.category" class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                {{ faction.category }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="startEdit(faction)"
              class="admin-btn-info"
            >
              <Edit class="w-3 h-3" />
              Edit
            </button>
            <button
              @click="confirmDeleteFaction(faction.id, faction.name)"
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
        No factions found{{ selectedGameSystem ? ` for ${getGameSystemName(selectedGameSystem)}` : '' }}.
      </p>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Add First Faction
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
