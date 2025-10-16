<script setup>
  import { computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { X, TrendingUp, Shield, Users, Paintbrush, UserCheck } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePaintingStats } from '~/composables/usePaintingStats'
  import { usePlayerStats } from '~/composables/usePlayerStats'
  import { useConfirmation } from '~/composables/useConfirmation'
  import { useFormManagement } from '~/composables/useFormManagement'
  import { useAuth } from '~/composables/useAuth'
  import { useGameSystems } from '~/composables/useGameSystems'

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
  const { availableFactions, currentGameSystemName, gameSystems } = storeToRefs(leaguesStore)

  // Game systems composable
  const { getGameSystemBadgeClasses, getGameSystemTextClasses, getGameSystemHintClasses } = useGameSystems(gameSystems)

  // Emits
  const emit = defineEmits(['add-player', 'remove-player', 'update-player'])

  // Auth
  const { user, isAuthenticated } = useAuth()

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

  const {
    item: playerToRemove,
    confirm: confirmRemoval,
    cancel: cancelRemoval,
    execute: executeRemoval
  } = useConfirmation()

  // Remove player handler
  const removePlayer = () => {
    executeRemoval((player) => {
      emit('remove-player', player.id)
    })
  }

  const {
    formData: newPlayer,
    resetForm,
    isFormValid,
    updateField
  } = useFormManagement({
    name: '',
    faction: ''
  })

  // Pre-fill form with current player data when user is already a player
  watch(currentUserPlayer, (player) => {
    if (player) {
      updateField('name', player.name)
      updateField('faction', player.faction)
    }
  }, { immediate: true })

  // Methods
  const submitPlayer = () => {
    if (!isAuthenticated.value || !user.value) {
      alert('You must be logged in to join as a player')
      return
    }

    if (isFormValid(['name', 'faction'])) {
      if (isCurrentUserPlayer.value) {
        // Update existing player
        emit('update-player', {
          id: currentUserPlayer.value.id,
          name: newPlayer.value.name,
          faction: newPlayer.value.faction
        })
      } else {
        // Add new player
        emit('add-player', {
          name: newPlayer.value.name,
          faction: newPlayer.value.faction,
          userId: user.value.id
        })
        resetForm()
      }
    }
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Players List -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-2">
          <Users :size="24" class="text-yellow-500" />
          <h2 class="text-2xl font-serif font-bold text-yellow-500">Registered Players</h2>
        </div>
        <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses()">
          <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="player in players"
          :key="player.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-yellow-500 transition-colors"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="text-lg font-semibold text-gray-100">{{ player.name }}</h4>
              <div class="flex items-center gap-1 text-sm text-yellow-500">
                <Shield :size="14" />
                <p>{{ player.faction }}</p>
              </div>
            </div>
            <button
              @click="confirmRemoval(player)"
              class="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Remove Player"
            >
              <X :size="20" />
            </button>
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
      <div v-if="isCurrentUserPlayer" class="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-4">
        <p class="text-green-400 flex items-center gap-2">
          <UserCheck :size="18" />
          You've already joined this league as {{ currentUserPlayer.name }}
        </p>
        <p class="text-gray-400 text-sm mt-2">
          You can update your display name and faction below.
        </p>
      </div>

      <!-- Not logged in message -->
      <div v-if="!isAuthenticated" class="bg-gray-700 border border-gray-600 rounded-lg p-4">
        <p class="text-gray-300">
          You must be logged in to join as a player.
        </p>
      </div>

      <!-- Join/Update form (show when authenticated) -->
      <form v-if="isAuthenticated" @submit.prevent="submitPlayer" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex items-center gap-2 cursor-pointer">
            <UserCheck :size="18" />
            {{ isCurrentUserPlayer ? 'Update Profile' : 'Join League' }}
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="playerToRemove" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h4 class="text-xl font-bold text-yellow-500 mb-4">Confirm Removal</h4>
        <p class="text-gray-300 mb-6">
          Are you sure you want to remove <strong>{{ playerToRemove.name }}</strong> from the league?
          This action cannot be undone and all their match history will be lost.
        </p>
        <div class="flex space-x-4">
          <button @click="removePlayer" class="btn-secondary flex-1">
            Remove Player
          </button>
          <button @click="cancelRemoval" class="btn-primary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
