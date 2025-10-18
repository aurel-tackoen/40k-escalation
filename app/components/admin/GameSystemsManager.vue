<script setup>
  import { ref, onMounted } from 'vue'
  import { Plus, Edit, Trash2, Save, X } from 'lucide-vue-next'

  const gameSystems = ref([])
  const loading = ref(false)
  const error = ref(null)
  const editingId = ref(null)
  const showAddForm = ref(false)

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
    showAddForm.value = false
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
    showAddForm.value = false
  }

  // Cancel editing
  const cancelEdit = () => {
    resetForm()
  }

  // Save game system (create or update)
  const saveGameSystem = async () => {
    if (!formData.value.name || !formData.value.shortName) {
      alert('Name and Short Name are required')
      return
    }

    loading.value = true
    error.value = null

    try {
      // Parse matchConfig if it's a string
      let matchConfig = formData.value.matchConfig
      if (typeof matchConfig === 'string' && matchConfig.trim()) {
        try {
          matchConfig = JSON.parse(matchConfig)
        }
        catch {
          alert('Invalid JSON in Match Config')
          loading.value = false
          return
        }
      }

      const payload = {
        ...formData.value,
        matchConfig
      }

      if (editingId.value) {
        // Update existing
        await $fetch(`/api/admin/game-systems/${editingId.value}`, {
          method: 'PUT',
          body: payload
        })
      }
      else {
        // Create new
        await $fetch('/api/admin/game-systems', {
          method: 'POST',
          body: payload
        })
      }

      await fetchGameSystems()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to save game system:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete game system
  const deleteGameSystem = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated factions, missions, and unit types.`)) {
      return
    }

    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/game-systems/${id}`, {
        method: 'DELETE'
      })
      await fetchGameSystems()
    }
    catch (err) {
      error.value = err.message
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
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-white">Game Systems Management</h2>
      <button
        @click="showAddForm = true; editingId = null; resetForm()"
        class="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4" />
        Add Game System
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
      {{ error }}
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm || editingId" class="mb-6 p-6 bg-gray-700 border border-gray-600 rounded-lg">
      <h3 class="text-xl font-bold text-white mb-4">
        {{ editingId ? 'Edit Game System' : 'Add New Game System' }}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Warhammer 40,000"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Short Name *</label>
          <input
            v-model="formData.shortName"
            type="text"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="40k"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="The grim darkness of the far future..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Match Type</label>
          <select
            v-model="formData.matchType"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option v-for="type in matchTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Match Config (JSON)</label>
          <textarea
            v-model="formData.matchConfig"
            rows="5"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder='{"pointsLabel": "Victory Points", "pointsRange": {"min": 0, "max": 100}}'
          />
          <p class="mt-1 text-xs text-gray-400">Optional: Game-specific configuration as JSON</p>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="saveGameSystem"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
        <button
          @click="cancelEdit"
          class="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          <X class="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>

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
              {{ typeof system.matchConfig === 'object' ? JSON.stringify(system.matchConfig) : system.matchConfig }}
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="startEdit(system)"
              class="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              <Edit class="w-3 h-3" />
              Edit
            </button>
            <button
              @click="deleteGameSystem(system.id, system.name)"
              class="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
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
  </div>
</template>

