<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Edit, Trash2, Save, X, Filter, ChevronDown, Shield, Users as UsersIcon, Trophy, Calendar } from 'lucide-vue-next'
  import { useToast } from '~/composables/useToast'
  import { useFormatting } from '~/composables/useFormatting'

  const leagues = ref([])
  const gameSystems = ref([])
  const isLoading = ref(false)
  const selectedGameSystem = ref(null)
  const selectedStatus = ref(null)
  const searchQuery = ref('')
  const loadError = ref(null)

  // Edit modal state
  const showEditModal = ref(false)
  const editingLeague = ref(null)
  const editForm = ref({
    id: null,
    name: '',
    description: '',
    gameSystemId: null,
    status: 'active',
    isPrivate: false,
    currentRound: 1,
    maxPlayers: null
  })

  // Confirmation state
  const showConfirmation = ref(false)
  const confirmationData = ref({
    title: '',
    message: '',
    onConfirm: null
  })

  const { toastSuccess, toastError } = useToast()
  const { formatDate } = useFormatting()

  // Available statuses
  const statuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'blue' },
    { value: 'archived', label: 'Archived', color: 'yellow' }
  ]

  // Fetch game systems
  const fetchGameSystems = async () => {
    try {
      const response = await $fetch('/api/game-systems')
      gameSystems.value = response.data || []
    } catch (error) {
      console.error('Error fetching game systems:', error)
    }
  }

  // Fetch leagues
  const fetchLeagues = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const response = await $fetch('/api/admin/leagues')
      leagues.value = response.data || []
    } catch (error) {
      console.error('Error fetching leagues:', error)
      loadError.value = 'Failed to load leagues'
      toastError(loadError.value)
    } finally {
      isLoading.value = false
    }
  }

  // Filtered leagues
  const filteredLeagues = computed(() => {
    let filtered = leagues.value

    // Filter by game system
    if (selectedGameSystem.value) {
      filtered = filtered.filter(l => l.gameSystemId === selectedGameSystem.value)
    }

    // Filter by status
    if (selectedStatus.value) {
      filtered = filtered.filter(l => l.status === selectedStatus.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        l.creatorName?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  // Stats
  const stats = computed(() => ({
    total: leagues.value.length,
    active: leagues.value.filter(l => l.status === 'active').length,
    private: leagues.value.filter(l => l.isPrivate).length,
    public: leagues.value.filter(l => !l.isPrivate).length
  }))

  // Get status badge class
  const getStatusClass = (status) => {
    const statusObj = statuses.find(s => s.value === status)
    const color = statusObj?.color || 'gray'
    return `inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
  }

  // Get game system name
  const getGameSystemName = (id) => {
    const system = gameSystems.value.find(s => s.id === id)
    return system?.name || 'Unknown'
  }

  // Edit modal functions
  const openEditModal = (league) => {
    editingLeague.value = league
    editForm.value = {
      id: league.id,
      name: league.name,
      description: league.description || '',
      gameSystemId: league.gameSystemId,
      status: league.status,
      isPrivate: league.isPrivate,
      currentRound: league.currentRound,
      maxPlayers: league.maxPlayers
    }
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
    editingLeague.value = null
    editForm.value = {
      id: null,
      name: '',
      description: '',
      gameSystemId: null,
      status: 'active',
      isPrivate: false,
      currentRound: 1,
      maxPlayers: null
    }
  }

  const confirmSaveLeague = () => {
    showConfirmation.value = true
    confirmationData.value = {
      title: 'Update League',
      message: `Are you sure you want to update "${editForm.value.name}"?`,
      onConfirm: saveLeague
    }
  }

  const saveLeague = async () => {
    try {
      await $fetch(`/api/admin/leagues/${editForm.value.id}`, {
        method: 'PUT',
        body: {
          name: editForm.value.name,
          description: editForm.value.description,
          gameSystemId: editForm.value.gameSystemId,
          status: editForm.value.status,
          isPrivate: editForm.value.isPrivate,
          currentRound: editForm.value.currentRound,
          maxPlayers: editForm.value.maxPlayers || null
        }
      })

      toastSuccess('League updated successfully')
      closeEditModal()
      fetchLeagues()
    } catch (error) {
      console.error('Error saving league:', error)
      toastError('Failed to save league')
    }
  }

  const confirmDeleteLeague = (league) => {
    showConfirmation.value = true
    confirmationData.value = {
      title: 'Delete League',
      message: `Are you sure you want to delete "${league.name}"? This will also delete all associated players, armies, and matches. This action cannot be undone.`,
      onConfirm: () => deleteLeague(league.id)
    }
  }

  const deleteLeague = async (id) => {
    try {
      await $fetch(`/api/leagues/${id}`, {
        method: 'DELETE'
      })

      toastSuccess('League deleted successfully')
      fetchLeagues()
    } catch (error) {
      console.error('Error deleting league:', error)
      toastError('Failed to delete league')
    }
  }

  onMounted(() => {
    fetchGameSystems()
    fetchLeagues()
  })
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Leagues Management</h2>
        <p class="text-gray-400 text-sm">Manage all leagues across the platform</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Leagues</p>
            <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
          </div>
          <Trophy class="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Active</p>
            <p class="text-2xl font-bold text-green-400">{{ stats.active }}</p>
          </div>
          <Shield class="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Public</p>
            <p class="text-2xl font-bold text-blue-400">{{ stats.public }}</p>
          </div>
          <UsersIcon class="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Private</p>
            <p class="text-2xl font-bold text-purple-400">{{ stats.private }}</p>
          </div>
          <Shield class="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <div class="flex items-center gap-2 mb-3">
        <Filter class="w-5 h-5 text-yellow-500" />
        <h3 class="text-lg font-semibold text-white">Filters</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="admin-label">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, description, or creator..."
            class="admin-input"
          />
        </div>

        <!-- Game System Filter -->
        <div>
          <label class="admin-label">Game System</label>
          <div class="admin-select-wrapper">
            <select v-model="selectedGameSystem" class="admin-select">
              <option :value="null">All Game Systems</option>
              <option
                v-for="system in gameSystems"
                :key="system.id"
                :value="system.id"
              >
                {{ system.name }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="admin-label">Status</label>
          <div class="admin-select-wrapper">
            <select v-model="selectedStatus" class="admin-select">
              <option :value="null">All Statuses</option>
              <option
                v-for="status in statuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <div v-if="selectedGameSystem || selectedStatus || searchQuery" class="pt-2">
        <button
          @click="() => { selectedGameSystem = null; selectedStatus = null; searchQuery = '' }"
          class="text-sm text-yellow-500 hover:text-yellow-400"
        >
          Clear all filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-400">Loading leagues...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="text-red-400">{{ loadError }}</p>
    </div>

    <!-- Leagues List -->
    <div v-else-if="filteredLeagues.length > 0" class="space-y-4">
      <div
        v-for="league in filteredLeagues"
        :key="league.id"
        class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-500/50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- League Header -->
            <div class="flex items-start gap-3 mb-3">
              <Trophy class="w-6 h-6 text-yellow-500 mt-1" />
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">{{ league.name }}</h3>
                  <span :class="getStatusClass(league.status)">
                    {{ statuses.find(s => s.value === league.status)?.label || league.status }}
                  </span>
                  <span v-if="league.isPrivate" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Private
                  </span>
                </div>
                <p v-if="league.description" class="text-gray-400 text-sm">{{ league.description }}</p>
              </div>
            </div>

            <!-- League Info Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-400">Game System:</span>
                <span class="text-white ml-2">{{ getGameSystemName(league.gameSystemId) }}</span>
              </div>
              <div>
                <span class="text-gray-400">Members:</span>
                <span class="text-white ml-2">{{ league.memberCount || 0 }}</span>
                <span v-if="league.maxPlayers" class="text-gray-500">/ {{ league.maxPlayers }}</span>
              </div>
              <div>
                <span class="text-gray-400">Current Round:</span>
                <span class="text-white ml-2">{{ league.currentRound }}</span>
              </div>
              <div>
                <span class="text-gray-400">Created:</span>
                <span class="text-white ml-2">{{ formatDate(league.createdAt) }}</span>
              </div>
            </div>

            <!-- Creator Info -->
            <div class="mt-3 text-sm">
              <span class="text-gray-400">Owner:</span>
              <span class="text-white ml-2">{{ league.creatorName || 'Unknown' }}</span>
              <span v-if="league.creatorEmail" class="text-gray-500 ml-2">({{ league.creatorEmail }})</span>
            </div>

            <!-- Dates -->
            <div class="mt-2 flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-gray-400" />
                <span class="text-gray-400">Start:</span>
                <span class="text-white">{{ formatDate(league.startDate) }}</span>
              </div>
              <div v-if="league.endDate" class="flex items-center gap-2">
                <span class="text-gray-400">End:</span>
                <span class="text-white">{{ formatDate(league.endDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 ml-4">
            <button
              @click="openEditModal(league)"
              class="admin-btn-info"
              title="Edit league"
            >
              <Edit class="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              @click="confirmDeleteLeague(league)"
              class="admin-btn-danger"
              title="Delete league"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLeagues.length === 0 && !isLoading" class="text-center py-12">
      <p class="text-gray-400 mb-4">No leagues match your filters</p>
      <button
        @click="() => { selectedGameSystem = null; selectedStatus = null; searchQuery = '' }"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Clear filters
      </button>
    </div>

    <!-- Edit Modal -->
    <AdminModal
      :isOpen="showEditModal"
      title="Edit League"
      @close="closeEditModal"
    >
      <form @submit.prevent="confirmSaveLeague" class="space-y-4">
        <div>
          <label class="admin-label">League Name</label>
          <input
            v-model="editForm.name"
            type="text"
            required
            class="admin-input"
            placeholder="Enter league name"
          />
        </div>

        <div>
          <label class="admin-label">Description</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="admin-input"
            placeholder="Enter league description"
          />
        </div>

        <div>
          <label class="admin-label">Game System</label>
          <div class="admin-select-wrapper">
            <select
              v-model="editForm.gameSystemId"
              required
              class="admin-select"
            >
              <option :value="null">Select a game system</option>
              <option
                v-for="system in gameSystems"
                :key="system.id"
                :value="system.id"
              >
                {{ system.name }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Status</label>
            <div class="admin-select-wrapper">
              <select
                v-model="editForm.status"
                required
                class="admin-select"
              >
                <option
                  v-for="status in statuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
              <ChevronDown class="chevron-icon w-4 h-4" />
            </div>
          </div>

          <div>
            <label class="admin-label">Current Round</label>
            <input
              v-model.number="editForm.currentRound"
              type="number"
              min="1"
              required
              class="admin-input"
            />
          </div>
        </div>

        <div>
          <label class="admin-label">Max Players (optional)</label>
          <input
            v-model.number="editForm.maxPlayers"
            type="number"
            min="1"
            class="admin-input"
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="editForm.isPrivate"
            type="checkbox"
            id="isPrivate"
            class="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
          />
          <label for="isPrivate" class="text-sm text-gray-300">
            Private league (requires share link to join)
          </label>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="closeEditModal" class="admin-btn-neutral">
            <X class="w-4 h-4" />
            Cancel
          </button>
          <button type="submit" class="admin-btn-secondary">
            <Save class="w-4 h-4" />
            Update
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmation"
      :title="confirmationData.title"
      :message="confirmationData.message"
      @confirm="() => {
        confirmationData.onConfirm?.()
        showConfirmation = false
      }"
      @cancel="showConfirmation = false"
    />
  </div>
</template>

<style scoped>
/* Use global admin styles */
</style>
