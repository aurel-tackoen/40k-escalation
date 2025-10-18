<script setup>
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { useLeagueRules } from '~/composables/useLeagueRules'
  import { usePlaceholders } from '~/composables/usePlaceholders'
  import { Plus, X, Calendar, Lock, Swords, RefreshCw, FileText, Sparkles } from 'lucide-vue-next'
  import CreatePlayerModal from '~/components/CreatePlayerModal.vue'

  const leaguesStore = useLeaguesStore()
  const authStore = useAuthStore()
  const { gameSystems } = storeToRefs(leaguesStore)

  const form = reactive({
    name: '',
    description: '',
    gameSystemId: null, // NEW: Required field for game system selection
    startDate: '',
    endDate: '',
    isPrivate: false,
    allowDirectJoin: true,
    maxPlayers: null,
    rules: '', // Will be populated when game system is selected
    rounds: [
      {
        number: 1,
        name: '500 Points',
        pointLimit: 500,
        startDate: '',
        endDate: ''
      }
    ]
  })

  // Get selected game system for rules generation
  const selectedGameSystem = computed(() => {
    if (!form.gameSystemId) return null
    return gameSystems.value.find(gs => gs.id === form.gameSystemId)
  })

  // Get game-specific rules
  const { generatedRules } = useLeagueRules(selectedGameSystem)

  // Get game-specific placeholders
  const { placeholders } = usePlaceholders(selectedGameSystem)

  // Initialize form.rules when game system is selected or changes
  watch(generatedRules, (newRules) => {
    if (newRules && !form.rules) {
      // Only auto-populate if rules are empty
      form.rules = newRules
    }
  }, { immediate: true })

  const error = ref('')
  const loading = ref(false)
  const showAutoRoundModal = ref(false)

  // Create Player Modal state
  const showCreatePlayerModal = ref(false)
  const createdLeagueName = ref('')
  const creatingPlayer = ref(false)

  // Auto-round configuration
  const autoConfig = reactive({
    startingPoints: 500,
    pointsStep: 500,
    numberOfRounds: 4,
    weeksPerRound: 4
  })

  const addRound = () => {
    const lastRound = form.rounds[form.rounds.length - 1]
    const nextNumber = lastRound.number + 1
    const nextLimit = lastRound.pointLimit + 500

    form.rounds.push({
      number: nextNumber,
      name: `${nextLimit} Points`,
      pointLimit: nextLimit,
      startDate: '',
      endDate: ''
    })
  }

  const removeRound = (index) => {
    if (form.rounds.length > 1) {
      form.rounds.splice(index, 1)
      // Renumber remaining rounds
      form.rounds.forEach((round, idx) => {
        round.number = idx + 1
      })
      // Update league end date
      updateLeagueEndDate()
    }
  }

  // Auto-update league end date based on rounds
  const updateLeagueEndDate = () => {
    if (form.rounds.length > 0) {
      const roundsWithDates = form.rounds.filter(r => r.endDate)
      if (roundsWithDates.length > 0) {
        // Find the latest end date
        const latestEndDate = roundsWithDates.reduce((latest, round) => {
          return round.endDate > latest ? round.endDate : latest
        }, roundsWithDates[0].endDate)
        form.endDate = latestEndDate
      }
    }
  }

  // Watch for changes in round dates to auto-update league end date
  watch(() => form.rounds.map(r => r.endDate), () => {
    updateLeagueEndDate()
  }, { deep: true })

  const generateAutoRounds = () => {
    if (!form.startDate || form.startDate === '') {
      error.value = 'Please set a league start date first'
      showAutoRoundModal.value = false
      return
    }

    const startDate = new Date(form.startDate)
    const generatedRounds = []
    let currentDate = new Date(startDate)
    let currentPoints = autoConfig.startingPoints

    for (let i = 0; i < autoConfig.numberOfRounds; i++) {
      const roundStartDate = new Date(currentDate)
      const roundEndDate = new Date(currentDate)
      roundEndDate.setDate(roundEndDate.getDate() + (autoConfig.weeksPerRound * 7))

      generatedRounds.push({
        number: i + 1,
        name: `${currentPoints} Points`,
        pointLimit: currentPoints,
        startDate: roundStartDate.toISOString().split('T')[0],
        endDate: roundEndDate.toISOString().split('T')[0]
      })

      // Next round starts day after current ends
      currentDate = new Date(roundEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
      currentPoints += autoConfig.pointsStep
    }

    // Set league end date to last round's end
    const lastRound = generatedRounds[generatedRounds.length - 1]
    form.endDate = lastRound.endDate

    // Update form rounds
    form.rounds = generatedRounds

    // Close modal
    showAutoRoundModal.value = false
    error.value = ''
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      error.value = 'League name is required'
      return false
    }

    if (!form.gameSystemId) {
      error.value = 'Game system selection is required'
      return false
    }

    if (!form.startDate) {
      error.value = 'Start date is required'
      return false
    }

    // No additional validation needed for private leagues - invite codes are auto-generated

    if (form.rounds.length === 0) {
      error.value = 'At least one round is required'
      return false
    }

    // Validate rounds
    for (const round of form.rounds) {
      if (!round.name.trim()) {
        error.value = `Round ${round.number} name is required`
        return false
      }
      if (!round.pointLimit || round.pointLimit <= 0) {
        error.value = `Round ${round.number} must have a valid point limit`
        return false
      }
      if (!round.startDate) {
        error.value = `Round ${round.number} start date is required`
        return false
      }
      if (!round.endDate) {
        error.value = `Round ${round.number} end date is required`
        return false
      }
    }

    error.value = ''
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true
    error.value = ''

    try {
      // Sanitize rounds data - convert empty strings to null
      const sanitizedRounds = form.rounds.map(round => ({
        ...round,
        startDate: round.startDate || null,
        endDate: round.endDate || null
      }))

      // Create league
      await leaguesStore.createLeague({
        createdBy: authStore.user.id,
        name: form.name,
        description: form.description,
        gameSystemId: form.gameSystemId,
        startDate: form.startDate,
        endDate: form.endDate || null,
        isPrivate: form.isPrivate,
        allowDirectJoin: form.allowDirectJoin,
        maxPlayers: form.maxPlayers || null,
        rules: form.rules,
        rounds: sanitizedRounds
      })

      // Success - show create player modal
      createdLeagueName.value = form.name
      showCreatePlayerModal.value = true
    } catch (err) {
      error.value = err.message || 'Failed to create league'
      console.error('Error creating league:', err)
    } finally {
      loading.value = false
    }
  }

  // Handle player creation from modal
  const handleCreatePlayer = async (playerData) => {
    creatingPlayer.value = true
    try {
      // Get current league ID
      const currentLeague = leaguesStore.currentLeague
      if (!currentLeague) {
        throw new Error('No league selected')
      }

      // Create player with league ID and user ID
      const playerResponse = await $fetch('/api/players', {
        method: 'POST',
        body: {
          leagueId: currentLeague.id,
          userId: authStore.user.id,
          name: playerData.name,
          faction: playerData.faction
        }
      })

      if (playerResponse.success) {
        // Update league membership with player ID and army name
        const membershipResponse = await $fetch(`/api/leagues/${currentLeague.id}/members/${authStore.user.id}`, {
          method: 'PUT',
          body: {
            playerId: playerResponse.data.id,
            armyName: playerData.armyName
          }
        })

        if (membershipResponse.success) {
          // Refresh league data to get the new player
          await leaguesStore.fetchLeagueData()

          // Close modal and redirect to dashboard
          showCreatePlayerModal.value = false
          navigateTo('/dashboard')
        }
      }
    } catch (err) {
      console.error('Error creating player:', err)
      alert('Failed to create player profile: ' + (err.message || 'Unknown error'))
    } finally {
      creatingPlayer.value = false
    }
  }

  // Handle skip player creation
  const handleSkipPlayer = () => {
    showCreatePlayerModal.value = false
    navigateTo('/dashboard')
  }
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-gray-100 flex items-center gap-3">
        <Swords :size="40" class="text-purple-400" />
        Create New League
      </h1>
      <p class="text-gray-400 mt-2">Set up your escalation league campaign</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- Basic Info Section -->
      <div class="card space-y-6">
        <h2 class="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3">
          Basic Information
        </h2>

        <!-- Game System Selection -->
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            Game System <span class="text-red-400">*</span>
          </label>
          <select
            v-model="form.gameSystemId"
            class="input-field w-full"
            required
          >
            <option value="">Select a game system...</option>
            <option v-for="system in gameSystems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
          <p class="text-sm text-gray-400 mt-1">
            This determines which factions and missions are available for your league
          </p>
        </div>

        <!-- League Name -->
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            League Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input-field w-full"
            :placeholder="placeholders.leagueName"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            Description
          </label>
          <textarea
            v-model="form.description"
            class="input-field w-full"
            rows="3"
            placeholder="Brief description of your league..."
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-300 font-semibold mb-2">
              Start Date <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.startDate"
              type="date"
              class="input-field w-full cursor-pointer"
              required
              @click="(e) => e.target.showPicker?.()"
            />
          </div>
          <div>
            <label class="block text-gray-300 font-semibold mb-2">
              End Date <span class="text-gray-500">(auto-set from rounds)</span>
            </label>
            <input
              v-model="form.endDate"
              type="date"
              class="input-field w-full"
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">
              Will be automatically set to the last round's end date
            </p>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="card space-y-6">
        <h2 class="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3 flex items-center gap-2">
          <Lock :size="24" />
          Privacy Settings
        </h2>

        <!-- Public/Private Toggle -->
        <div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isPrivate"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-gray-300 font-semibold">Private League</span>
          </label>
          <p class="text-gray-500 text-sm mt-1 ml-8">
            Private leagues require invite codes or share links to join. Public leagues can be discovered by anyone.
          </p>
        </div>

        <!-- Direct Join Settings (only for private leagues) -->
        <div v-if="form.isPrivate">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.allowDirectJoin"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-gray-300 font-semibold">Allow Direct Join via Share Links</span>
          </label>
          <p class="text-gray-500 text-sm mt-1 ml-8">
            If enabled, anyone with the share link can join immediately. If disabled, you must manually approve join requests.
          </p>
        </div>

        <!-- Max Players -->
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            Maximum Players <span class="text-gray-500">(optional)</span>
          </label>
          <input
            v-model.number="form.maxPlayers"
            type="number"
            min="2"
            class="input-field w-full"
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <!-- Rounds Section -->
      <div class="card space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-700 pb-3">
          <h2 class="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Calendar :size="24" />
            Rounds
          </h2>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="showAutoRoundModal = true"
              class="btn-primary text-sm flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Sparkles :size="16" />
              Auto Generate
            </button>
            <button
              type="button"
              @click="addRound"
              class="btn-login text-sm flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Plus :size="16" />
              Add Round
            </button>
          </div>
        </div>

        <!-- Rounds List -->
        <div class="space-y-4">
          <div
            v-for="(round, index) in form.rounds"
            :key="index"
            class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4"
          >
            <!-- Round Header -->
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-100">Round {{ round.number }}</h3>
              <button
                v-if="form.rounds.length > 1"
                type="button"
                @click="removeRound(index)"
                class="text-red-400 hover:text-red-300 p-2"
                title="Remove Round"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Round Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-300 text-sm font-semibold mb-2">
                  Round Name <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="round.name"
                  type="text"
                  class="input-field w-full"
                  :placeholder="placeholders.roundName"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-semibold mb-2">
                  Point Limit <span class="text-red-400">*</span>
                </label>
                <input
                  v-model.number="round.pointLimit"
                  type="number"
                  min="1"
                  class="input-field w-full"
                  placeholder="500"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-semibold mb-2">
                  Start Date <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="round.startDate"
                  type="date"
                  class="input-field w-full cursor-pointer"
                  required
                  @click="(e) => e.target.showPicker?.()"
                />
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-semibold mb-2">
                  End Date <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="round.endDate"
                  type="date"
                  class="input-field w-full cursor-pointer"
                  required
                  @click="(e) => e.target.showPicker?.()"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- League Rules -->
      <div class="card space-y-6">
        <div class="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 class="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileText :size="24" />
            League Rules
          </h2>
          <button
            type="button"
            @click="form.rules = generatedRules"
            :disabled="!generatedRules"
            class="btn-secondary text-sm flex items-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': !generatedRules }"
            title="Reset to default rules for selected game system"
          >
            <RefreshCw :size="16" />
            Reset to Default
          </button>
        </div>

        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            Custom League Rules
          </label>
          <p class="text-sm text-gray-400 mb-3">
            Define your league's rules and scoring system. Players will see these rules on the dashboard.
            <strong>Markdown formatting is supported!</strong>
          </p>
          <textarea
            v-model="form.rules"
            rows="20"
            class="input-field font-mono text-sm"
            placeholder="Enter league rules using markdown formatting..."
          ></textarea>
          <div class="text-xs text-gray-500 mt-2 space-y-1">
            <p class="font-semibold text-gray-400">Markdown Tips:</p>
            <p>• Use <code class="bg-gray-700 px-1 rounded">**bold**</code> for bold text, <code class="bg-gray-700 px-1 rounded">*italic*</code> for italic</p>
            <p>• Start lines with <code class="bg-gray-700 px-1 rounded">##</code> for headers</p>
            <p>• Use <code class="bg-gray-700 px-1 rounded">-</code> or <code class="bg-gray-700 px-1 rounded">*</code> for bullet lists</p>
            <p>• Create links with <code class="bg-gray-700 px-1 rounded">[text](url)</code></p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 justify-end">
        <NuxtLink to="/leagues" class="btn-secondary">
          Cancel
        </NuxtLink>
        <button
          type="submit"
          class="btn-primary flex items-center gap-2"
          :disabled="loading"
        >
          <Swords v-if="!loading" :size="20" />
          <span v-if="loading">Creating...</span>
          <span v-else>Create League</span>
        </button>
      </div>
    </form>

    <!-- Auto-Generate Rounds Modal -->
    <div
      v-if="showAutoRoundModal"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click.self="showAutoRoundModal = false"
    >
      <div class="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
        <!-- Modal Header -->
        <div class="flex justify-between items-center border-b border-gray-700 p-6">
          <h3 class="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Sparkles :size="24" class="text-purple-400" />
            Auto-Generate Rounds
          </h3>
          <button
            @click="showAutoRoundModal = false"
            class="text-gray-400 hover:text-gray-300"
          >
            <X :size="24" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Warning if no start date -->
          <div v-if="!form.startDate" class="bg-yellow-900/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded text-sm">
            ⚠️ Please set a league start date in the Basic Information section before generating rounds.
          </div>

          <p class="text-gray-400 text-sm">
            Set the basic parameters and we'll create the rounds for you. You can edit them afterwards.
          </p>

          <!-- Configuration Grid (2x2) -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Starting Points -->
            <div>
              <label class="block text-gray-300 font-semibold mb-2">
                Starting Points
              </label>
              <input
                v-model.number="autoConfig.startingPoints"
                type="number"
                min="100"
                step="100"
                class="input-field w-full"
              />
            </div>

            <!-- Points Step -->
            <div>
              <label class="block text-gray-300 font-semibold mb-2">
                Points Step
              </label>
              <input
                v-model.number="autoConfig.pointsStep"
                type="number"
                min="100"
                step="100"
                class="input-field w-full"
              />
            </div>

            <!-- Number of Rounds -->
            <div>
              <label class="block text-gray-300 font-semibold mb-2">
                Number of Rounds
              </label>
              <input
                v-model.number="autoConfig.numberOfRounds"
                type="number"
                min="1"
                max="10"
                class="input-field w-full"
              />
            </div>

            <!-- Weeks per Round -->
            <div>
              <label class="block text-gray-300 font-semibold mb-2">
                Weeks per Round
              </label>
              <input
                v-model.number="autoConfig.weeksPerRound"
                type="number"
                min="1"
                max="8"
                class="input-field w-full"
              />
            </div>
          </div>

          <!-- Helper Text -->
          <p class="text-xs text-gray-500">
            Example: 500 starting, 500 step → 500pts, 1000pts, 1500pts, 2000pts...
          </p>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-3 border-t border-gray-700 p-6">
          <button
            type="button"
            @click="showAutoRoundModal = false"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="generateAutoRounds"
            class="btn-primary flex items-center gap-2"
            :disabled="!form.startDate"
            :class="{ 'opacity-50 cursor-not-allowed': !form.startDate }"
          >
            <Sparkles :size="16" />
            Generate Rounds
          </button>
        </div>
      </div>
    </div>

    <!-- Create Player Modal -->
    <CreatePlayerModal
      :show="showCreatePlayerModal"
      :league-name="createdLeagueName"
      :user-name="authStore.user?.name || ''"
      :available-factions="leaguesStore.factions"
      @create-player="handleCreatePlayer"
      @skip="handleSkipPlayer"
      @close="handleSkipPlayer"
    />
  </div>
</template>
