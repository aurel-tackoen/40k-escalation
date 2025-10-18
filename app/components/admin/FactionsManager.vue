<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Plus, Edit, Trash2, Save, X, Filter } from 'lucide-vue-next'

  const factions = ref([])
  const gameSystems = ref([])
  const loading = ref(false)
  const error = ref(null)
  const editingId = ref(null)
  const showAddForm = ref(false)
  const selectedGameSystem = ref(null)

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
      if (gameSystems.value.length > 0 && !selectedGameSystem.value) {
        selectedGameSystem.value = gameSystems.value[0].id
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
    showAddForm.value = false
  }

  // Start editing
  const startEdit = (faction) => {
    editingId.value = faction.id
    formData.value = {
      gameSystemId: faction.gameSystemId,
      name: faction.name,
      category: faction.category || ''
    }
    showAddForm.value = false
  }

  // Save faction
  const saveFaction = async () => {
    if (!formData.value.name || !formData.value.gameSystemId) {
      alert('Name and Game System are required')
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
      }
      else {
        // Create
        await $fetch('/api/admin/factions', {
          method: 'POST',
          body: formData.value
        })
      }

      await fetchFactions()
      resetForm()
    }
    catch (err) {
      error.value = err.message
      console.error('Failed to save faction:', err)
    }
    finally {
      loading.value = false
    }
  }

  // Delete faction
  const deleteFaction = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/admin/factions/${id}`, {
        method: 'DELETE'
      })
      await fetchFactions()
    }
    catch (err) {
      error.value = err.message
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
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-white">Factions Management</h2>
      <button
        @click="showAddForm = true; editingId = null; resetForm()"
        class="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
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
        <select
          v-model="selectedGameSystem"
          @change="onGameSystemChange"
          class="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option v-for="system in gameSystems" :key="system.id" :value="system.id">
            {{ system.name }}
          </option>
        </select>
        <span class="text-sm text-gray-400">
          {{ filteredFactions.length }} factions
        </span>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm || editingId" class="mb-6 p-6 bg-gray-700 border border-gray-600 rounded-lg">
      <h3 class="text-xl font-bold text-white mb-4">
        {{ editingId ? 'Edit Faction' : 'Add New Faction' }}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Game System *</label>
          <select
            v-model="formData.gameSystemId"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option :value="null">Select a game system</option>
            <option v-for="system in gameSystems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Faction Name *</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Space Marines"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <input
            v-model="formData.category"
            type="text"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Imperium, Chaos, Xenos, etc."
          >
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="saveFaction"
          :disabled="loading"
          class="admin-btn-secondary"
        >
          <Save class="w-4 h-4" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
        <button
          @click="resetForm"
          class="admin-btn-neutral"
        >
          <X class="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !filteredFactions.length" class="text-center py-8 text-gray-400">
      Loading factions...
    </div>

    <!-- Factions List -->
    <div v-else-if="filteredFactions.length" class="space-y-2">
      <div
        v-for="faction in filteredFactions"
        :key="faction.id"
        class="p-4 bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors flex items-center justify-between"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-bold text-white">{{ faction.name }}</h3>
            <span class="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
              {{ getGameSystemName(faction.gameSystemId) }}
            </span>
            <span v-if="faction.category" class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
              {{ faction.category }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="startEdit(faction)"
            class="admin-btn-info"
          >
            <Edit class="w-3 h-3" />
            Edit
          </button>
          <button
            @click="deleteFaction(faction.id, faction.name)"
            class="admin-btn-danger"
          >
            <Trash2 class="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-400">
      <p class="mb-4">No factions found for {{ getGameSystemName(selectedGameSystem) }}.</p>
      <button
        @click="showAddForm = true; resetForm()"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Add First Faction
      </button>
    </div>
  </div>
</template>
