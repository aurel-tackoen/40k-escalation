<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Edit, Trash2, Save, X, Filter, ChevronDown, Shield, Users as UsersIcon, Trophy, Calendar, ChevronRight, Target, Copy, Check } from 'lucide-vue-next'
  import { useToast } from '~/composables/useToast'
  import { useFormatting } from '~/composables/useFormatting'

  const leagues = ref([])
  const gameSystems = ref([])
  const isLoading = ref(false)
  const selectedGameSystem = ref(null)
  const selectedStatus = ref(null)
  const selectedPrivacy = ref(null) // null = all, true = private, false = public
  const searchQuery = ref('')
  const loadError = ref(null)
  const expandedLeagues = ref(new Set()) // Track which leagues are expanded

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
    maxPlayers: null,
    rules: ''
  })

  // Round edit modal state
  const showRoundModal = ref(false)
  const editingRound = ref(null)
  const roundForm = ref({
    id: null,
    number: 1,
    name: '',
    pointLimit: 500,
    startDate: '',
    endDate: ''
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

    // Filter by privacy
    if (selectedPrivacy.value !== null) {
      filtered = filtered.filter(l => l.isPrivate === selectedPrivacy.value)
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
      maxPlayers: league.maxPlayers,
      rules: league.rules || ''
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
      maxPlayers: null,
      rules: ''
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

  // Expandable league functions
  const toggleLeagueExpansion = (leagueId) => {
    if (expandedLeagues.value.has(leagueId)) {
      expandedLeagues.value.delete(leagueId)
    } else {
      expandedLeagues.value.add(leagueId)
    }
  }

  const isLeagueExpanded = (leagueId) => {
    return expandedLeagues.value.has(leagueId)
  }

  // Copy to clipboard function
  const copiedToken = ref(null)
  const copyShareToken = async (token, leagueId) => {
    try {
      await navigator.clipboard.writeText(token)
      copiedToken.value = leagueId
      toastSuccess('Share token copied to clipboard!')
      setTimeout(() => {
        copiedToken.value = null
      }, 2000)
    } catch (error) {
      console.error('Failed to copy token:', error)
      toastError('Failed to copy token')
    }
  }

  // Round modal functions
  const openRoundModal = (round) => {
    editingRound.value = round
    roundForm.value = {
      id: round.id,
      number: round.number,
      name: round.name,
      pointLimit: round.pointLimit,
      startDate: round.startDate,
      endDate: round.endDate
    }
    showRoundModal.value = true
  }

  const closeRoundModal = () => {
    showRoundModal.value = false
    editingRound.value = null
    roundForm.value = {
      id: null,
      number: 1,
      name: '',
      pointLimit: 500,
      startDate: '',
      endDate: ''
    }
  }

  const saveRound = async () => {
    try {
      await $fetch(`/api/admin/rounds/${roundForm.value.id}`, {
        method: 'PUT',
        body: {
          number: roundForm.value.number,
          name: roundForm.value.name,
          pointLimit: roundForm.value.pointLimit,
          startDate: roundForm.value.startDate,
          endDate: roundForm.value.endDate
        }
      })

      toastSuccess('Round updated successfully')
      closeRoundModal()
      fetchLeagues()
    } catch (error) {
      console.error('Error saving round:', error)
      toastError('Failed to save round')
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
            <p class="text-gray-400 text-sm mb-1">Total Leagues</p>
            <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
          </div>
          <Trophy class="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">Active</p>
            <p class="text-2xl font-bold text-green-400">{{ stats.active }}</p>
          </div>
          <Shield class="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">Public</p>
            <p class="text-2xl font-bold text-blue-400">{{ stats.public }}</p>
          </div>
          <UsersIcon class="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">Private</p>
            <p class="text-2xl font-bold text-purple-400">{{ stats.private }}</p>
          </div>
          <Shield class="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-700 border border-gray-600 rounded-lg p-4 space-y-4">
      <div class="flex items-center gap-2 mb-3">
        <Filter class="w-5 h-5 text-yellow-500" />
        <h3 class="text-lg font-semibold text-white">Filters</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <!-- Privacy Filter -->
        <div>
          <label class="admin-label">Privacy</label>
          <div class="admin-select-wrapper">
            <select v-model="selectedPrivacy" class="admin-select">
              <option :value="null">All Leagues</option>
              <option :value="false">Public Only</option>
              <option :value="true">Private Only</option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <div v-if="selectedGameSystem || selectedStatus || selectedPrivacy !== null || searchQuery" class="pt-2">
        <button
          @click="() => { selectedGameSystem = null; selectedStatus = null; selectedPrivacy = null; searchQuery = '' }"
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
        class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-colors"
      >
        <!-- Header Section -->
        <div class="bg-gray-750 border-b border-gray-700 px-6 py-4">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3 flex-1">
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

            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <button
                @click="openEditModal(league)"
                class="admin-btn-info"
                title="Edit league"
              >
                <Edit class="w-3 h-3" />
                Edit
              </button>
              <button
                @click="confirmDeleteLeague(league)"
                class="admin-btn-danger"
                title="Delete league"
              >
                <Trash2 class="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Game & Status Info -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Game System</div>
              <div class="flex items-center gap-2">
                <Shield class="w-4 h-4 text-yellow-500" />
                <span class="text-white font-medium">{{ getGameSystemName(league.gameSystemId) }}</span>
              </div>
              <div class="mt-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Progress</div>
                <div class="text-white">
                  Round <span class="text-yellow-500 font-bold">{{ league.currentRound }}</span>
                </div>
              </div>
            </div>

            <!-- Members & Limits -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</div>
              <div class="flex items-center gap-2">
                <UsersIcon class="w-4 h-4 text-blue-500" />
                <span class="text-white font-medium">
                  {{ league.memberCount || 0 }}
                  <span v-if="league.maxPlayers" class="text-gray-400">/ {{ league.maxPlayers }}</span>
                  <span v-else class="text-gray-400">/ Unlimited</span>
                </span>
              </div>
              <div class="mt-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Owner</div>
                <div class="text-white text-sm">{{ league.creatorName || 'Unknown' }}</div>
                <div v-if="league.creatorEmail" class="text-gray-500 text-xs">{{ league.creatorEmail }}</div>
              </div>
            </div>

            <!-- Dates -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</div>
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <Calendar class="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div class="text-xs text-gray-400">Start Date</div>
                    <div class="text-white text-sm">{{ formatDate(league.startDate) }}</div>
                  </div>
                </div>
                <div v-if="league.endDate" class="flex items-start gap-2">
                  <Calendar class="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <div class="text-xs text-gray-400">End Date</div>
                    <div class="text-white text-sm">{{ formatDate(league.endDate) }}</div>
                  </div>
                </div>
                <div v-else class="flex items-start gap-2">
                  <Calendar class="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <div class="text-xs text-gray-400">End Date</div>
                    <div class="text-gray-500 text-sm italic">Not set</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Info Section (if rules, shareToken, or createdAt exist) -->
          <div v-if="league.rules || league.shareToken || league.createdAt" class="mt-6 pt-6 border-t border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Rules -->
              <div v-if="league.rules" class="md:col-span-2">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">League Rules</div>
                <div class="text-white text-sm whitespace-pre-wrap bg-gray-700/30 rounded p-3 max-h-40 overflow-y-auto">
                  {{ league.rules }}
                </div>
              </div>

              <!-- Share Settings -->
              <div v-if="league.shareToken">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Access Settings</div>
                <div class="space-y-2">
                  <div class="space-y-1">
                    <span class="text-gray-400 text-sm">Share Token:</span>
                    <div class="flex items-center gap-2">
                      <code class="text-yellow-500 text-sm font-mono bg-gray-700 px-2 py-1 rounded flex-1">{{ league.shareToken }}</code>
                      <button
                        @click="copyShareToken(league.shareToken, league.id)"
                        class="p-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-yellow-500 transition-colors cursor-pointer"
                        :title="copiedToken === league.id ? 'Copied!' : 'Copy to clipboard'"
                      >
                        <Check v-if="copiedToken === league.id" class="w-4 h-4 text-green-500" />
                        <Copy v-else class="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Created Date -->
              <div v-if="league.createdAt">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Created</div>
                <div class="flex items-start gap-2">
                  <Calendar class="w-4 h-4 text-gray-500 mt-0.5" />
                  <div class="text-white text-sm">{{ formatDate(league.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Show Rounds Button -->
          <button
            v-if="league.rounds?.length > 0"
            @click="toggleLeagueExpansion(league.id)"
            class="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
          >
            <ChevronRight
              :size="16"
              :class="['transition-transform', { 'rotate-90': isLeagueExpanded(league.id) }]"
            />
            <span>
              {{ isLeagueExpanded(league.id) ? 'Hide' : 'Show' }} Rounds ({{ league.rounds?.length || 0 }})
            </span>
          </button>
        </div>

        <!-- Expandable Rounds Section -->
        <div
          v-if="isLeagueExpanded(league.id) && league.rounds?.length > 0"
          class="border-t border-gray-700 bg-gray-800/50 px-6 py-4"
        >
          <div class="space-y-2">
            <button
              v-for="round in league.rounds"
              :key="round.id"
              @click="openRoundModal(round)"
              class="w-full bg-gray-700 rounded p-4 text-left hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <Target class="w-5 h-5 text-yellow-500" />
                  <span class="text-white font-semibold">Round {{ round.number }}: {{ round.name }}</span>
                </div>
                <span class="text-yellow-500 font-bold">{{ round.pointLimit }} pts</span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span class="text-gray-400">Start:</span>
                  <span class="text-white ml-2">{{ formatDate(round.startDate) }}</span>
                </div>
                <div>
                  <span class="text-gray-400">End:</span>
                  <span class="text-white ml-2">{{ formatDate(round.endDate) }}</span>
                </div>
              </div>
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
          <label class="admin-label">League Rules (optional)</label>
          <textarea
            v-model="editForm.rules"
            rows="5"
            class="admin-input"
            placeholder="Enter custom league rules, restrictions, or guidelines"
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

    <!-- Round Edit Modal -->
    <AdminModal
      :isOpen="showRoundModal"
      title="Edit Round"
      @close="closeRoundModal"
    >
      <form @submit.prevent="saveRound" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Round Number</label>
            <input
              v-model.number="roundForm.number"
              type="number"
              min="1"
              required
              class="admin-input"
            />
          </div>

          <div>
            <label class="admin-label">Point Limit</label>
            <input
              v-model.number="roundForm.pointLimit"
              type="number"
              min="1"
              required
              class="admin-input"
            />
          </div>
        </div>

        <div>
          <label class="admin-label">Round Name</label>
          <input
            v-model="roundForm.name"
            type="text"
            required
            class="admin-input"
            placeholder="e.g., 500 Points, Combat Patrol"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Start Date</label>
            <input
              v-model="roundForm.startDate"
              type="date"
              required
              class="admin-input"
            />
          </div>

          <div>
            <label class="admin-label">End Date</label>
            <input
              v-model="roundForm.endDate"
              type="date"
              required
              class="admin-input"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="closeRoundModal" class="admin-btn-neutral">
            <X class="w-4 h-4" />
            Cancel
          </button>
          <button type="submit" class="admin-btn-secondary">
            <Save class="w-4 h-4" />
            Update Round
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
