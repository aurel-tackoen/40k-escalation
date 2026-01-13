<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { TrendingUp, Shield, Users, Paintbrush, UserCheck, Swords, Trash2, Play, Pause } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePaintingStats } from '~/composables/usePaintingStats'
  import { usePlayerStats } from '~/composables/usePlayerStats'
  import { useFormManagement } from '~/composables/useFormManagement'
  import { useAuth } from '~/composables/useAuth'
  import { useGameSystems } from '~/composables/useGameSystems'
  import { usePlaceholders } from '~/composables/usePlaceholders'
  import { useToast } from '~/composables/useToast'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'

  // Props
  const props = defineProps({
    players: {
      type: Array,
      required: true
    },
    armies: {
      type: Array,
      default: () => []
    },
    currentRound: {
      type: Number,
      default: 1
    }
  })

  // Get dynamic factions from store
  const leaguesStore = useLeaguesStore()
  const { availableFactions, currentGameSystemName, gameSystems, isLeagueOwner, currentLeague, canManageLeague } = storeToRefs(leaguesStore)

  // Game systems composable
  const { getGameSystemBadgeClasses, getGameSystemTextClasses, getGameSystemHintClasses } = useGameSystems(gameSystems)

  // Helper to check if a player is the league owner
  const isPlayerLeagueOwner = (player) => {
    return currentLeague.value && player.userId === currentLeague.value.createdBy
  }

  // Placeholders composable
  const { placeholders } = usePlaceholders(currentLeague)

  // Emits
  const emit = defineEmits(['add-player', 'remove-player', 'update-player'])

  // Auth
  const { user, isAuthenticated } = useAuth()

  // Toasts
  const { toastSuccess, toastWarning } = useToast()

  // Check if current user can remove a specific player
  const canRemovePlayer = (player) => {
    if (!isAuthenticated.value || !user.value) return false
    if (player.membershipStatus === 'inactive') return false // Already inactive

    const isSelf = player.userId === user.value.id

    // Owner cannot remove themselves (must transfer ownership first)
    if (isLeagueOwner.value && isSelf) return false

    // Owner can remove anyone else, regular user can only remove themselves
    return isLeagueOwner.value || isSelf
  }

  // Check if current user is already a player in this league
  const isCurrentUserPlayer = computed(() => {
    if (!isAuthenticated.value || !user.value) return false
    return props.players.some(p => p.userId === user.value.id)
  })

  // Get current user's player record if exists
  const currentUserPlayer = computed(() => {
    if (!isAuthenticated.value || !user.value) return null
    return props.players.find(p => p.userId === user.value.id)
  })

  // Composables
  const {
    getPlayerPaintingStats,
    getPaintProgressClass,
    getPaintPercentageColor
  } = usePaintingStats()

  const { getWinPercentage } = usePlayerStats()

  // Player removal state
  const playerToRemove = ref(null)
  const showRemovalModal = ref(false)

  const confirmRemoval = (player) => {
    playerToRemove.value = player
    showRemovalModal.value = true
  }

  const removePlayer = () => {
    if (playerToRemove.value) {
      const isSelf = playerToRemove.value.userId === user.value?.id
      const playerName = playerToRemove.value.name
      emit('remove-player', playerToRemove.value.id, isSelf)
      toastSuccess(`${playerName} removed from league`)
      playerToRemove.value = null
      showRemovalModal.value = false
    }
  }

  const cancelRemoval = () => {
    playerToRemove.value = null
    showRemovalModal.value = false
  }

  // Player status toggle state
  const playerToToggle = ref(null)
  const showToggleModal = ref(false)

  const confirmToggleStatus = (player) => {
    playerToToggle.value = player
    showToggleModal.value = true
  }

  const togglePlayerStatus = async () => {
    if (!playerToToggle.value) return

    const player = playerToToggle.value
    const newStatus = !player.isActive

    try {
      await leaguesStore.togglePlayerActive(
        player.id,
        newStatus,
        props.currentRound
      )

      toastSuccess(
        newStatus
          ? `${player.name} activated for Round ${props.currentRound}+`
          : `${player.name} deactivated from Round ${props.currentRound}`
      )
    } catch (error) {
      console.error('Error toggling player status:', error)
      toastWarning('Failed to update player status')
    }

    playerToToggle.value = null
    showToggleModal.value = false
  }

  const cancelToggleStatus = () => {
    playerToToggle.value = null
    showToggleModal.value = false
  }

  // Form state
  const {
    formData: newPlayer,
    resetForm,
    isFormValid,
    updateField
  } = useFormManagement({
    name: '',
    faction: '',
    armyName: ''
  })

  // Pre-fill form with current player data when user is already a player
  watch(currentUserPlayer, (player) => {
    if (player) {
      updateField('name', player.name)
      updateField('faction', player.faction)
      updateField('armyName', player.armyName || '')
    }
  }, { immediate: true })

  // Methods
  const submitPlayer = async () => {
    if (!isAuthenticated.value || !user.value) {
      toastWarning('You must be logged in to join as a player')
      return
    }

    if (isFormValid(['name', 'faction'])) {
      if (isCurrentUserPlayer.value) {
        // Update existing player (single API call now includes armyName)
        emit('update-player', {
          id: currentUserPlayer.value.id,
          name: newPlayer.value.name,
          faction: newPlayer.value.faction,
          armyName: newPlayer.value.armyName || '' // ✅ Include armyName in single update
        })
        toastSuccess('Profile updated successfully!')
      } else {
        // Add new player
        emit('add-player', {
          name: newPlayer.value.name,
          faction: newPlayer.value.faction,
          armyName: newPlayer.value.armyName || '', // ✅ Include armyName
          userId: user.value.id
        })
        toastSuccess(`${newPlayer.value.name} joined the league!`)
        resetForm()
      }
    }
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Players List -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div class="flex items-center gap-3">
          <Users :size="32" class="text-yellow-500" />
          <div>
            <h2 class="text-2xl font-serif font-bold text-yellow-500">Registered Players</h2>
            <p class="text-gray-400 text-sm mt-1">Browse and manage all registered players in the league.</p>
          </div>
        </div>

        <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses()" class="whitespace-nowrap">
          <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="player in players"
          :key="player.id"
          :class="[
            'rounded-lg p-4 transition-all duration-300',
            player.userId === user?.id
              ? 'bg-yellow-900/20 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-500/30'
              : 'bg-gray-700 border border-gray-600 hover:border-yellow-500',
            player.membershipStatus === 'inactive' && 'opacity-50'
          ]"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-100">
                {{ player.name }}
                <span v-if="player.userId === user?.id" class="text-yellow-500 font-normal text-sm ml-1">(me)</span>
                <span v-if="player.membershipStatus === 'inactive'" class="text-red-400 font-normal text-xs ml-1">(inactive)</span>
              </h4>
              <div class="flex items-center gap-1 text-sm text-yellow-500">
                <Shield :size="14" />
                <p>{{ player.faction }}</p>
              </div>

              <!-- Army Name (View Only) -->
              <div v-if="player.armyName" class="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                <Swords :size="12" />
                <span>{{ player.armyName }}</span>
              </div>

              <!-- Inactive Status Badge -->
              <div
                v-if="!player.isActive"
                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-700 text-gray-400 text-xs mt-1"
              >
                <Pause :size="12" />
                <span>Inactive (Left Round {{ player.leftRound }})</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <!-- Owner Badge -->
              <span
                v-if="isPlayerLeagueOwner(player)"
                class="px-2 py-1 rounded text-xs font-bold uppercase bg-yellow-600 text-yellow-100"
                :title="player.userId === user?.id ? 'You are the league owner - Transfer ownership in League Setup to leave' : 'League owner'"
              >
                Owner
              </span>

              <!-- Toggle Active/Inactive Button (Organizer/Owner only) -->
              <button
                v-if="canManageLeague && !isPlayerLeagueOwner(player)"
                @click="confirmToggleStatus(player)"
                :class="[
                  'p-1.5 rounded transition-colors cursor-pointer',
                  player.isActive
                    ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-900/30 hover:bg-yellow-900/50'
                    : 'text-green-400 hover:text-green-300 bg-green-900/30 hover:bg-green-900/50'
                ]"
                :title="player.isActive ? 'Deactivate player' : 'Activate player'"
              >
                <Pause v-if="player.isActive" :size="18" />
                <Play v-else :size="18" />
              </button>

              <button
                v-if="canRemovePlayer(player)"
                @click="confirmRemoval(player)"
                class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 p-1.5 rounded transition-colors cursor-pointer"
                title="Remove Player"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Record:</span>
              <span class="text-gray-100">
                <span class="text-green-400">{{ player.wins }}W</span> -
                <span class="text-red-400">{{ player.losses }}L</span> -
                <span class="text-yellow-400">{{ player.draws }}D</span>
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Total Points:</span>
              <span class="text-yellow-500 font-bold">{{ player.totalPoints }}</span>
            </div>
          </div>

          <!-- Player Performance Chart -->
          <div class="mt-4 pt-3 border-t border-gray-600">
            <div class="flex items-center space-x-2 text-xs mb-3">
              <TrendingUp :size="14" class="text-gray-400" />
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  class="bg-yellow-500 rounded-full h-2 transition-all duration-300"
                  :style="{ width: getWinPercentage(player) + '%' }"
                ></div>
              </div>
              <span class="text-gray-400 min-w-max">{{ Math.round(getWinPercentage(player)) }}% wins</span>
            </div>

            <!-- Painting Progress -->
            <div v-if="getPlayerPaintingStats(player.id, currentRound, armies).totalModels > 0" class="flex items-center space-x-2 text-xs">
              <Paintbrush :size="14" class="text-gray-400" />
              <div class="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  class="rounded-full h-2 transition-all duration-300"
                  :class="getPaintProgressClass(getPlayerPaintingStats(player.id, currentRound, armies).percentage)"
                  :style="{ width: getPlayerPaintingStats(player.id, currentRound, armies).percentage + '%' }"
                ></div>
              </div>
              <span class="min-w-max" :class="getPaintPercentageColor(getPlayerPaintingStats(player.id, currentRound, armies).percentage)">
                {{ getPlayerPaintingStats(player.id, currentRound, armies).painted }}/{{ getPlayerPaintingStats(player.id, currentRound, armies).totalModels }}
              </span>
            </div>
            <div v-else class="flex items-center space-x-2 text-xs text-gray-500 italic">
              <Paintbrush :size="14" />
              <span>No army data for current round</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="players.length === 0" class="text-center py-8 text-gray-400">
        <p class="text-lg">No players registered yet.</p>
        <p class="text-sm">Add your first player above to get started!</p>
      </div>
    </div>

    <!-- Join as Player Form -->
    <div class="card">
      <div class="flex items-center gap-2 mb-6">
        <UserCheck :size="24" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">
          {{ isCurrentUserPlayer ? 'Update Your Profile' : 'Join as Player' }}
        </h3>
      </div>

      <!-- Already joined message -->
      <div v-if="isCurrentUserPlayer && currentUserPlayer?.membershipStatus === 'active'" class="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-4">
        <p class="text-green-400 flex items-center gap-2">
          <UserCheck :size="18" />
          You've already joined this league as {{ currentUserPlayer.name }}
        </p>
        <p class="text-gray-400 text-sm mt-2">
          You can update your display name, faction, and army name below.
        </p>
      </div>

      <!-- Inactive user message -->
      <div v-if="currentUserPlayer?.membershipStatus === 'inactive'" class="bg-gray-700 border border-gray-600 rounded-lg p-4">
        <p class="text-gray-300">
          You previously left this league. To rejoin, please use the league invite link or contact the league organizer.
        </p>
      </div>

      <!-- Not logged in message -->
      <div v-if="!isAuthenticated" class="bg-gray-700 border border-gray-600 rounded-lg p-4">
        <p class="text-gray-300">
          You must be logged in to join as a player.
        </p>
      </div>

      <!-- Join/Update form (show when authenticated and not inactive) -->
      <form v-if="isAuthenticated && currentUserPlayer?.membershipStatus !== 'inactive'" @submit.prevent="submitPlayer" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Display Name</label>
            <input
              v-model="newPlayer.name"
              type="text"
              required
              class="input-field"
              :placeholder="user?.name || 'Enter display name'"
            />
            <p class="text-xs text-gray-400 mt-1">This name will be shown in league standings</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">
              Faction
              <span v-if="currentGameSystemName" :class="getGameSystemHintClasses()">({{ currentGameSystemName }})</span>
            </label>
            <select v-model="newPlayer.faction" required class="input-field">
              <option value="">Select Faction</option>
              <option v-for="faction in availableFactions" :key="faction.id" :value="faction.name">
                {{ faction.name }}
                <span v-if="faction.category"> ({{ faction.category }})</span>
              </option>
            </select>
          </div>

          <!-- Army Name Field -->
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
              Army Name
            </label>
            <input
              v-model="newPlayer.armyName"
              type="text"
              class="input-field"
              :placeholder="placeholders.armyName"
              maxlength="255"
            />
            <p class="text-xs text-gray-400 mt-1">
              {{ placeholders.armyNameHint }}
            </p>
          </div>

        </div>
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex items-center gap-2 cursor-pointer">
            <UserCheck :size="18" />
            {{ isCurrentUserPlayer ? 'Update Profile' : 'Join League' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showRemovalModal"
      :title="playerToRemove?.userId === user?.id ? 'Leave League?' : 'Remove Player?'"
      variant="default"
      confirm-text="Confirm"
      cancel-text="Cancel"
      @confirm="removePlayer"
      @cancel="cancelRemoval"
    >
      <!-- Custom message based on self vs other -->
      <template #default>
        <p class="text-gray-300 mb-4">
          <template v-if="playerToRemove?.userId === user?.id">
            Are you sure you want to leave this league?
          </template>
          <template v-else>
            Are you sure you want to remove <strong>{{ playerToRemove?.name }}</strong> from this league?
          </template>
        </p>

        <!-- Info box -->
        <div class="bg-gray-700 border border-gray-600 rounded-lg p-4">
          <p class="text-sm text-gray-300 mb-2">
            <strong class="text-yellow-500">Note:</strong> {{ playerToRemove?.userId === user?.id ? 'Leaving' : 'Removing' }} the league will:
          </p>
          <ul class="text-sm text-gray-400 space-y-1 ml-4 list-disc">
            <li>Remove the player from the active roster</li>
            <li><strong class="text-green-400">Preserve</strong> all match history and battle records</li>
            <li><strong class="text-green-400">Preserve</strong> all army lists</li>
            <li>Allow the player to rejoin later if they wish</li>
          </ul>
        </div>
      </template>
    </ConfirmationModal>

    <!-- Toggle Status Confirmation Modal -->
    <ConfirmationModal
      v-if="showToggleModal"
      :title="playerToToggle?.isActive ? 'Deactivate Player' : 'Activate Player'"
      :message="playerToToggle?.isActive
        ? `Are you sure you want to deactivate ${playerToToggle?.name}? They will be excluded from future pairings but their history will be preserved.`
        : `Are you sure you want to activate ${playerToToggle?.name}? They will be included in future pairings.`"
      confirmText="Confirm"
      cancelText="Cancel"
      :confirmClass="playerToToggle?.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'"
      @confirm="togglePlayerStatus"
      @cancel="cancelToggleStatus"
    />
  </div>
</template>
