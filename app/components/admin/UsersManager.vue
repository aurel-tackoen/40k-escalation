<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Edit, Trash2, Save, X, Filter, ChevronDown, Shield, ChevronRight, Users as UsersIcon, Trophy } from 'lucide-vue-next'
  import { useToast } from '~/composables/useToast'

  const users = ref([])
  const isLoading = ref(false)
  const selectedRole = ref(null) // null = "All Roles"
  const searchQuery = ref('')
  const loadError = ref(null)
  const expandedUsers = ref(new Set()) // Track which users are expanded

  // User edit modal state
  const showEditModal = ref(false)
  const editingUser = ref(null)
  const editForm = ref({
    id: null,
    name: '',
    email: '',
    role: 'player'
  })

  // Player edit modal state
  const showPlayerModal = ref(false)
  const editingPlayer = ref(null)
  const playerForm = ref({
    id: null,
    name: '',
    faction: '',
    armyName: '',
    gameSystemId: null
  })
  const playerFactions = ref([]) // Factions for current player's game system
  const loadingFactions = ref(false)

  // Membership edit modal state
  const showMembershipModal = ref(false)
  const editingMembership = ref(null)
  const membershipForm = ref({
    id: null,
    role: 'player',
    status: 'active'
  })

  // Confirmation state
  const showConfirmation = ref(false)
  const confirmationData = ref({
    title: '',
    message: '',
    onConfirm: null
  })

  const { toastSuccess, toastError } = useToast()

  // Available roles
  const roles = [
    { value: 'player', label: 'Player', color: 'green' },
    { value: 'organizer', label: 'Organizer', color: 'purple' },
    { value: 'admin', label: 'Admin', color: 'red' }
  ]

  // Fetch users
  const fetchUsers = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const response = await $fetch('/api/admin/users')
      // Ensure all users have a role (default to 'player' if missing)
      users.value = (response.data || []).map(user => ({
        ...user,
        role: user.role || 'player'
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      toastError(loadError.value)
    } finally {
      isLoading.value = false
    }
  }

  // Filtered users
  const filteredUsers = computed(() => {
    let filtered = users.value

    // Filter by role
    if (selectedRole.value) {
      filtered = filtered.filter(u => u.role === selectedRole.value)
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  // Role badge color
  const getRoleBadgeColor = (role) => {
    const roleObj = roles.find(r => r.value === role)
    return roleObj ? roleObj.color : 'gray'
  }

  // Toggle user expansion
  const toggleUserExpansion = (userId) => {
    if (expandedUsers.value.has(userId)) {
      expandedUsers.value.delete(userId)
    } else {
      expandedUsers.value.add(userId)
    }
    // Trigger reactivity
    expandedUsers.value = new Set(expandedUsers.value)
  }

  const isUserExpanded = (userId) => expandedUsers.value.has(userId)

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Open edit modal
  const openEditModal = (user) => {
    editingUser.value = user
    editForm.value = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    showEditModal.value = true
  }

  // Close edit modal
  const closeEditModal = () => {
    showEditModal.value = false
    editingUser.value = null
    editForm.value = {
      id: null,
      name: '',
      email: '',
      role: 'player'
    }
  }

  // Confirm save user
  const confirmSaveUser = () => {
    const action = editingUser.value ? 'Update' : 'Create'
    confirmationData.value = {
      title: `${action} User`,
      message: `Are you sure you want to ${action.toLowerCase()} this user?`,
      onConfirm: saveUser
    }
    showConfirmation.value = true
  }

  // Save user (update only for admin panel)
  const saveUser = async () => {
    try {
      const endpoint = `/api/admin/users/${editForm.value.id}`

      await $fetch(endpoint, {
        method: 'PUT',
        body: {
          name: editForm.value.name,
          role: editForm.value.role
        }
      })

      toastSuccess('User updated successfully')
      closeEditModal()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      toastError('Failed to save user')
    }
  }

  // Confirm delete user
  const confirmDeleteUser = (user) => {
    confirmationData.value = {
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone and will remove all associated data.`,
      onConfirm: () => deleteUser(user.id)
    }
    showConfirmation.value = true
  }

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await $fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      toastSuccess('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toastError('Failed to delete user')
    }
  }

  // Player modal functions
  const openPlayerModal = async (player) => {
    editingPlayer.value = player
    playerForm.value = {
      id: player.id,
      name: player.name,
      faction: player.faction || '',
      armyName: player.armyName || '',
      gameSystemId: player.gameSystemId
    }

    // Fetch factions for this player's game system
    if (player.gameSystemId) {
      loadingFactions.value = true
      try {
        const response = await $fetch(`/api/factions?gameSystemId=${player.gameSystemId}`)
        playerFactions.value = response.data || []
      } catch (error) {
        console.error('Error fetching factions:', error)
        toastError('Failed to load factions')
        playerFactions.value = []
      } finally {
        loadingFactions.value = false
      }
    }

    showPlayerModal.value = true
  }

  const closePlayerModal = () => {
    showPlayerModal.value = false
    editingPlayer.value = null
    playerForm.value = {
      id: null,
      name: '',
      faction: '',
      armyName: '',
      gameSystemId: null
    }
    playerFactions.value = []
  }

  const savePlayer = async () => {
    try {
      await $fetch(`/api/admin/players/${playerForm.value.id}`, {
        method: 'PUT',
        body: {
          name: playerForm.value.name,
          faction: playerForm.value.faction,
          armyName: playerForm.value.armyName
        }
      })

      toastSuccess('Player updated successfully')
      closePlayerModal()
      fetchUsers()
    } catch (error) {
      console.error('Error saving player:', error)
      toastError('Failed to save player')
    }
  }

  // Membership modal functions
  const openMembershipModal = (membership) => {
    editingMembership.value = membership
    membershipForm.value = {
      id: membership.id,
      role: membership.role,
      status: membership.status
    }
    showMembershipModal.value = true
  }

  const closeMembershipModal = () => {
    showMembershipModal.value = false
    editingMembership.value = null
    membershipForm.value = {
      id: null,
      role: 'player',
      status: 'active'
    }
  }

  const saveMembership = async () => {
    try {
      await $fetch(`/api/admin/league-memberships/${membershipForm.value.id}`, {
        method: 'PUT',
        body: {
          role: membershipForm.value.role,
          status: membershipForm.value.status
        }
      })

      toastSuccess('Membership updated successfully')
      closeMembershipModal()
      fetchUsers()
    } catch (error) {
      console.error('Error saving membership:', error)
      toastError('Failed to save membership')
    }
  }

  onMounted(() => {
    fetchUsers()
  })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Users Management</h2>
        <p class="text-gray-400 text-sm">Manage platform users and their roles</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
      {{ loadError }}
      <button @click="fetchUsers" class="ml-4 text-sm underline hover:text-red-400">
        Retry
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">Total Users</div>
        <div class="text-2xl font-bold text-white">{{ users.length }}</div>
      </div>
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">Admins</div>
        <div class="text-2xl font-bold text-red-500">
          {{ users.filter(u => u.role === 'admin').length }}
        </div>
      </div>
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">Organizers</div>
        <div class="text-2xl font-bold text-purple-500">
          {{ users.filter(u => u.role === 'organizer').length }}
        </div>
      </div>
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">Players</div>
        <div class="text-2xl font-bold text-green-500">
          {{ users.filter(u => u.role === 'player').length }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2 mb-3">
          <Filter class="w-5 h-5 text-yellow-500" />
          <h3 class="text-lg font-semibold text-white">Filters</h3>
        </div>
        <!-- Role Filter -->
        <div class="admin-select-wrapper w-48">
          <select
            v-model="selectedRole"
            class="admin-select"
          >
            <option :value="null">All Roles</option>
            <option
              v-for="role in roles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
          <ChevronDown class="chevron-icon w-4 h-4" />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="admin-input w-full"
          />
        </div>

        <span class="text-sm text-gray-400 flex-shrink-0">
          {{ filteredUsers.length }} users
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      <p class="text-gray-400 mt-4">Loading users...</p>
    </div>

    <!-- Users List -->
    <div v-else-if="filteredUsers.length > 0" class="space-y-3">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
      >
        <!-- Main User Info -->
        <div class="p-4">
          <div class="flex items-center justify-between gap-4">
            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-white font-semibold truncate">{{ user.name }}</h3>
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                    `bg-${getRoleBadgeColor(user.role)}-900/30 text-${getRoleBadgeColor(user.role)}-400 border border-${getRoleBadgeColor(user.role)}-700`
                  ]"
                >
                  <Shield :size="12" class="inline mr-1" />
                  {{ roles.find(r => r.value === user.role)?.label || user.role }}
                </span>
              </div>
              <div class="text-sm text-gray-400 space-y-1">
                <div>{{ user.email }}</div>
                <div class="flex gap-4 text-xs">
                  <span>Created: {{ formatDate(user.createdAt) }}</span>
                  <span>Last login: {{ formatDate(user.lastLoginAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <button
                @click="openEditModal(user)"
                class="admin-btn-info"
              >
                <Edit class="w-3 h-3" />
                Edit
              </button>
              <button
                @click="confirmDeleteUser(user)"
                class="admin-btn-danger"
              >
                <Trash2 class="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>

          <!-- Show Details Button -->
          <button
            v-if="user.players?.length > 0 || user.memberships?.length > 0"
            @click="toggleUserExpansion(user.id)"
            class="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
          >
            <ChevronRight
              :size="16"
              :class="['transition-transform', { 'rotate-90': isUserExpanded(user.id) }]"
            />
            <span>
              {{ isUserExpanded(user.id) ? 'Hide' : 'Show' }} Players ({{ user.players?.length || 0 }}) & Leagues ({{ user.memberships?.length || 0 }})
            </span>
          </button>
        </div>

        <!-- Expandable Details -->
        <div
          v-if="isUserExpanded(user.id)"
          class="border-t border-gray-700 bg-gray-800/50 p-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Players Section -->
            <div>
              <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <UsersIcon :size="16" class="text-green-500" />
                Players ({{ user.players?.length || 0 }})
              </h4>
              <div v-if="user.players?.length > 0" class="space-y-2">
                <button
                  v-for="player in user.players"
                  :key="player.id"
                  @click="openPlayerModal(player)"
                  class="w-full bg-gray-700 rounded p-3 text-sm text-left hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-white font-medium">{{ player.name }}</span>
                    <span class="text-xs text-gray-400">W: {{ player.wins }} L: {{ player.losses }} D: {{ player.draws }}</span>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div v-if="player.faction">Faction: {{ player.faction }}</div>
                    <div v-if="player.armyName">Army: {{ player.armyName }}</div>
                  </div>
                </button>
              </div>
              <div v-else class="text-sm text-gray-500 italic">No players yet</div>
            </div>

            <!-- League Memberships Section -->
            <div>
              <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy :size="16" class="text-yellow-500" />
                League Memberships ({{ user.memberships?.length || 0 }})
              </h4>
              <div v-if="user.memberships?.length > 0" class="space-y-2">
                <button
                  v-for="membership in user.memberships"
                  :key="membership.id"
                  @click="openMembershipModal(membership)"
                  class="w-full bg-gray-700 rounded p-3 text-sm text-left hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-white font-medium">{{ membership.leagueName }}</span>
                    <span
                      :class="[
                        'px-2 py-0.5 rounded text-xs font-medium',
                        membership.status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-600 text-gray-300'
                      ]"
                    >
                      {{ membership.status }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div>Role: {{ membership.role }}</div>
                    <div>Joined: {{ formatDate(membership.joinedAt) }}</div>
                  </div>
                </button>
              </div>
              <div v-else class="text-sm text-gray-500 italic">No league memberships</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0 && users.length === 0" class="text-center py-12">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
        <p class="text-gray-400 mb-4">No users found in the database.</p>
        <p class="text-gray-500 text-sm mb-4">
          Users are created automatically when they log in with Auth0.
        </p>
        <NuxtLink to="/admin" class="text-yellow-500 hover:text-yellow-400">
          ← Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Filtered Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
      <p class="text-gray-400 mb-4">No users match your filters</p>
      <button
        @click="() => { selectedRole = null; searchQuery = '' }"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Clear filters
      </button>
    </div>

    <!-- Edit Modal -->
    <AdminModal
      :isOpen="showEditModal"
      title="Edit User"
      @close="closeEditModal"
    >
      <form @submit.prevent="confirmSaveUser" class="space-y-4">
        <div>
          <label class="admin-label">Name</label>
          <input
            v-model="editForm.name"
            type="text"
            required
            class="admin-input"
            placeholder="Enter user name"
          />
        </div>

        <div>
          <label class="admin-label">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            disabled
            class="admin-input bg-gray-700 cursor-not-allowed"
            title="Email cannot be changed"
          />
          <p class="text-xs text-gray-400 mt-1">Email is managed by Auth0 and cannot be changed</p>
        </div>

        <div>
          <label class="admin-label">Role</label>
          <div class="admin-select-wrapper">
            <select
              v-model="editForm.role"
              required
              class="admin-select"
            >
              <option
                v-for="role in roles"
                :key="role.value"
                :value="role.value"
              >
                {{ role.label }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
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

    <!-- Player Edit Modal -->
    <AdminModal
      :isOpen="showPlayerModal"
      title="Edit Player"
      @close="closePlayerModal"
    >
      <!-- League Context Info -->
      <div v-if="editingPlayer" class="mb-4 p-3 bg-gray-700/50 rounded border border-gray-600">
        <div class="text-xs text-gray-400">League</div>
        <div class="text-sm text-white font-medium">{{ editingPlayer.leagueName || 'Unknown League' }}</div>
      </div>

      <form @submit.prevent="savePlayer" class="space-y-4">
        <div>
          <label class="admin-label">Player Name</label>
          <input
            v-model="playerForm.name"
            type="text"
            required
            class="admin-input"
            placeholder="Enter player name"
          />
        </div>

        <div>
          <label class="admin-label">Faction</label>
          <div v-if="loadingFactions" class="admin-input bg-gray-700 text-gray-400">
            Loading factions...
          </div>
          <div v-else-if="playerFactions.length === 0" class="admin-input bg-gray-700 text-gray-400">
            No factions available
          </div>
          <div v-else class="admin-select-wrapper">
            <select
              v-model="playerForm.faction"
              class="admin-select"
            >
              <option value="">Select a faction</option>
              <option
                v-for="faction in playerFactions"
                :key="faction.id"
                :value="faction.name"
              >
                {{ faction.name }}
              </option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <div>
          <label class="admin-label">Army Name</label>
          <input
            v-model="playerForm.armyName"
            type="text"
            class="admin-input"
            placeholder="Enter army name"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="closePlayerModal" class="admin-btn-neutral">
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

    <!-- Membership Edit Modal -->
    <AdminModal
      :isOpen="showMembershipModal"
      title="Edit League Membership"
      @close="closeMembershipModal"
    >
      <form @submit.prevent="saveMembership" class="space-y-4">
        <div>
          <label class="admin-label">Role</label>
          <div class="admin-select-wrapper">
            <select
              v-model="membershipForm.role"
              required
              class="admin-select"
            >
              <option value="player">Player</option>
              <option value="organizer">Organizer</option>
              <option value="owner">Owner</option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <div>
          <label class="admin-label">Status</label>
          <div class="admin-select-wrapper">
            <select
              v-model="membershipForm.status"
              required
              class="admin-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
              <option value="invited">Invited</option>
            </select>
            <ChevronDown class="chevron-icon w-4 h-4" />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="closeMembershipModal" class="admin-btn-neutral">
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
      @confirm="confirmationData.onConfirm(); showConfirmation = false"
      @cancel="showConfirmation = false"
    />
  </div>
</template>
