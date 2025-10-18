<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Edit, Trash2, Save, X, Filter, ChevronDown, Swords, Trophy, Target, Users as UsersIcon } from 'lucide-vue-next'
  import { useToast } from '~/composables/useToast'
  import { useFormatting } from '~/composables/useFormatting'

  const matches = ref([])
  const gameSystems = ref([])
  const isLoading = ref(false)
  const selectedGameSystem = ref(null)
  const selectedMatchType = ref(null)
  const selectedLeague = ref(null)
  const searchQuery = ref('')
  const loadError = ref(null)

  // Edit modal state
  const showEditModal = ref(false)
  const editingMatch = ref(null)
  const editForm = ref({
    id: null,
    round: 1,
    player1Points: 0,
    player2Points: 0,
    winnerId: null,
    mission: '',
    datePlayed: '',
    notes: ''
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

  // Available match types
  const matchTypes = [
    { value: 'victory_points', label: 'Victory Points', color: 'blue' },
    { value: 'percentage', label: 'Percentage/Casualties', color: 'purple' },
    { value: 'scenario', label: 'Scenario Objectives', color: 'green' }
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

  // Fetch matches
  const fetchMatches = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const response = await $fetch('/api/admin/matches/all')
      matches.value = response.data || []
    } catch (error) {
      console.error('Error fetching matches:', error)
      loadError.value = 'Failed to load matches'
      toastError(loadError.value)
    } finally {
      isLoading.value = false
    }
  }

  // Get unique leagues for filter
  const uniqueLeagues = computed(() => {
    const leagues = new Map()
    matches.value.forEach(match => {
      if (match.leagueId && match.leagueName) {
        leagues.set(match.leagueId, match.leagueName)
      }
    })
    return Array.from(leagues.entries()).map(([id, name]) => ({ id, name }))
  })

  // Filtered matches
  const filteredMatches = computed(() => {
    let filtered = matches.value

    // Filter by game system
    if (selectedGameSystem.value) {
      filtered = filtered.filter(m => m.gameSystemId === selectedGameSystem.value)
    }

    // Filter by match type
    if (selectedMatchType.value) {
      filtered = filtered.filter(m => m.matchType === selectedMatchType.value)
    }

    // Filter by league
    if (selectedLeague.value) {
      filtered = filtered.filter(m => m.leagueId === selectedLeague.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(m =>
        m.player1Name.toLowerCase().includes(query) ||
        m.player2Name.toLowerCase().includes(query) ||
        m.mission?.toLowerCase().includes(query) ||
        m.leagueName?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  // Stats
  const stats = computed(() => ({
    total: matches.value.length,
    victoryPoints: matches.value.filter(m => m.matchType === 'victory_points').length,
    percentage: matches.value.filter(m => m.matchType === 'percentage').length,
    scenario: matches.value.filter(m => m.matchType === 'scenario').length
  }))

  // Get match type badge class
  const getMatchTypeBadgeClass = (matchType) => {
    const type = matchTypes.find(t => t.value === matchType)
    const color = type?.color || 'gray'
    return `inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
  }

  // Get match type label
  const getMatchTypeLabel = (matchType) => {
    return matchTypes.find(t => t.value === matchType)?.label || matchType
  }

  // Get winner display
  const getWinnerDisplay = (match) => {
    if (match.winnerName) {
      return match.winnerName
    }
    if (match.player1Points === match.player2Points) {
      return 'Draw'
    }
    return 'Unknown'
  }

  // Get result summary
  const getResultSummary = (match) => {
    if (match.matchType === 'victory_points') {
      return `${match.player1Points} - ${match.player2Points}`
    } else if (match.matchType === 'percentage') {
      return match.marginOfVictory || 'N/A'
    } else if (match.matchType === 'scenario') {
      const p1 = match.player1ObjectiveCompleted ? '✓' : '✗'
      const p2 = match.player2ObjectiveCompleted ? '✓' : '✗'
      return `${p1} vs ${p2}`
    }
    return 'N/A'
  }

  // Edit modal functions
  const openEditModal = (match) => {
    editingMatch.value = match
    editForm.value = {
      id: match.id,
      round: match.round,
      player1Points: match.player1Points,
      player2Points: match.player2Points,
      winnerId: match.winnerId,
      mission: match.mission || '',
      datePlayed: match.datePlayed || '',
      notes: match.notes || ''
    }
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
    editingMatch.value = null
    editForm.value = {
      id: null,
      round: 1,
      player1Points: 0,
      player2Points: 0,
      winnerId: null,
      mission: '',
      datePlayed: '',
      notes: ''
    }
  }

  const confirmSaveMatch = () => {
    showConfirmation.value = true
    confirmationData.value = {
      title: 'Update Match',
      message: 'Are you sure you want to update this match?',
      onConfirm: saveMatch
    }
  }

  const saveMatch = async () => {
    try {
      await $fetch(`/api/admin/matches/${editForm.value.id}`, {
        method: 'PUT',
        body: {
          round: editForm.value.round,
          player1Points: editForm.value.player1Points,
          player2Points: editForm.value.player2Points,
          winnerId: editForm.value.winnerId,
          mission: editForm.value.mission,
          datePlayed: editForm.value.datePlayed,
          notes: editForm.value.notes
        }
      })

      toastSuccess('Match updated successfully')
      closeEditModal()
      fetchMatches()
    } catch (error) {
      console.error('Error saving match:', error)
      toastError('Failed to save match')
    }
  }

  const confirmDeleteMatch = (match) => {
    showConfirmation.value = true
    confirmationData.value = {
      title: 'Delete Match',
      message: `Are you sure you want to delete the match between "${match.player1Name}" and "${match.player2Name}"? This action cannot be undone.`,
      onConfirm: () => deleteMatch(match.id)
    }
  }

  const deleteMatch = async (id) => {
    try {
      await $fetch(`/api/matches.delete`, {
        method: 'DELETE',
        body: { matchId: id }
      })

      toastSuccess('Match deleted successfully')
      fetchMatches()
    } catch (error) {
      console.error('Error deleting match:', error)
      toastError('Failed to delete match')
    }
  }

  onMounted(() => {
    fetchGameSystems()
    fetchMatches()
  })
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-white mb-2">Matches Management</h2>
      <p class="text-gray-400">Manage all matches across the platform</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Matches</p>
            <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
          </div>
          <Swords class="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Victory Points</p>
            <p class="text-2xl font-bold text-blue-400">{{ stats.victoryPoints }}</p>
          </div>
          <Target class="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Percentage</p>
            <p class="text-2xl font-bold text-purple-400">{{ stats.percentage }}</p>
          </div>
          <Trophy class="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Scenario</p>
            <p class="text-2xl font-bold text-green-400">{{ stats.scenario }}</p>
          </div>
          <UsersIcon class="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
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
            placeholder="Search by players, mission, or league..."
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

        <!-- Match Type Filter -->
        <div>
          <label class="admin-label">Match Type</label>
          <div class="admin-select-wrapper">
            <select v-model="selectedMatchType" class="admin-select">
              <option :value="null">All Match Types</option>
              <option
                v-for="type in matchTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <!-- League Filter -->
        <div>
          <label class="admin-label">League</label>
          <div class="admin-select-wrapper">
            <select v-model="selectedLeague" class="admin-select">
              <option :value="null">All Leagues</option>
              <option
                v-for="league in uniqueLeagues"
                :key="league.id"
                :value="league.id"
              >
                {{ league.name }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <div v-if="selectedGameSystem || selectedMatchType || selectedLeague || searchQuery" class="pt-2">
        <button
          @click="() => { selectedGameSystem = null; selectedMatchType = null; selectedLeague = null; searchQuery = '' }"
          class="text-sm text-yellow-500 hover:text-yellow-400"
        >
          Clear all filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-400">Loading matches...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="text-red-400">{{ loadError }}</p>
    </div>

    <!-- Matches List -->
    <div v-else-if="filteredMatches.length > 0" class="space-y-4">
      <div
        v-for="match in filteredMatches"
        :key="match.id"
        class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-colors"
      >
        <!-- Header Section -->
        <div class="bg-gray-750 border-b border-gray-700 px-6 py-4">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3 flex-1">
              <Swords class="w-6 h-6 text-yellow-500 mt-1" />
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">
                    {{ match.player1Name }} vs {{ match.player2Name }}
                  </h3>
                  <span :class="getMatchTypeBadgeClass(match.matchType)">
                    {{ getMatchTypeLabel(match.matchType) }}
                  </span>
                </div>
                <div v-if="match.mission" class="text-gray-400 text-sm">
                  Mission: {{ match.mission }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <button
                @click="openEditModal(match)"
                class="admin-btn-info"
                title="Edit match"
              >
                <Edit class="w-3 h-3" />
                Edit
              </button>
              <button
                @click="confirmDeleteMatch(match)"
                class="admin-btn-danger"
                title="Delete match"
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
            <!-- League & Round Info -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">League</div>
              <div class="flex items-center gap-2">
                <Trophy class="w-4 h-4 text-yellow-500" />
                <span class="text-white font-medium">{{ match.leagueName || 'N/A' }}</span>
              </div>
              <div class="mt-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Round</div>
                <div class="text-white">
                  Round <span class="text-yellow-500 font-bold">{{ match.round }}</span>
                </div>
              </div>
            </div>

            <!-- Result Info -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</div>
              <div class="flex items-center gap-2">
                <Target class="w-4 h-4 text-blue-500" />
                <span class="text-white font-medium">{{ getResultSummary(match) }}</span>
              </div>
              <div class="mt-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Winner</div>
                <div class="text-yellow-500 font-bold">{{ getWinnerDisplay(match) }}</div>
              </div>
            </div>

            <!-- Date Info -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Played</div>
              <div class="text-white text-sm">{{ formatDate(match.datePlayed) }}</div>
              <div v-if="match.notes" class="mt-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</div>
                <div class="text-gray-400 text-sm">{{ match.notes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMatches.length === 0 && !isLoading" class="text-center py-12">
      <p class="text-gray-400 mb-4">No matches match your filters</p>
      <button
        @click="() => { selectedGameSystem = null; selectedMatchType = null; selectedLeague = null; searchQuery = '' }"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Clear filters
      </button>
    </div>

    <!-- Edit Modal -->
    <AdminModal
      :isOpen="showEditModal"
      title="Edit Match"
      @close="closeEditModal"
    >
      <form @submit.prevent="confirmSaveMatch" class="space-y-4">
        <div v-if="editingMatch" class="mb-4 p-3 bg-gray-700/50 rounded border border-gray-600">
          <div class="text-xs text-gray-400">Match</div>
          <div class="text-sm text-white font-medium">
            {{ editingMatch.player1Name }} vs {{ editingMatch.player2Name }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            League: {{ editingMatch.leagueName }} | {{ getMatchTypeLabel(editingMatch.matchType) }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Round</label>
            <input
              v-model.number="editForm.round"
              type="number"
              min="1"
              required
              class="admin-input"
            />
          </div>

          <div>
            <label class="admin-label">Date Played</label>
            <input
              v-model="editForm.datePlayed"
              type="date"
              class="admin-input"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">{{ editingMatch?.player1Name }} Points</label>
            <input
              v-model.number="editForm.player1Points"
              type="number"
              min="0"
              required
              class="admin-input"
            />
          </div>

          <div>
            <label class="admin-label">{{ editingMatch?.player2Name }} Points</label>
            <input
              v-model.number="editForm.player2Points"
              type="number"
              min="0"
              required
              class="admin-input"
            />
          </div>
        </div>

        <div>
          <label class="admin-label">Mission</label>
          <input
            v-model="editForm.mission"
            type="text"
            class="admin-input"
            placeholder="Enter mission name"
          />
        </div>

        <div>
          <label class="admin-label">Notes</label>
          <textarea
            v-model="editForm.notes"
            rows="3"
            class="admin-input"
            placeholder="Match notes..."
          />
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
