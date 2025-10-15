<script setup>
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { Plus, X, Calendar, Lock, Swords } from 'lucide-vue-next'

  const leaguesStore = useLeaguesStore()
  const authStore = useAuthStore()
  const { gameSystems } = storeToRefs(leaguesStore)

  const form = reactive({
    name: '',
    description: '',
    gameSystemId: null, // NEW: Required field for game system selection
    startDate: '',
    endDate: '',
    isPublic: true,
    joinPassword: '',
    maxPlayers: null,
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

  const error = ref('')
  const loading = ref(false)

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
    }
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

    if (!form.isPublic && !form.joinPassword.trim()) {
      error.value = 'Private leagues require a password'
      return false
    }

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
        startDate: form.startDate,
        endDate: form.endDate || null,
        isPublic: form.isPublic,
        joinPassword: form.isPublic ? null : form.joinPassword,
        maxPlayers: form.maxPlayers || null,
        rounds: sanitizedRounds
      })

      // Success - redirect to dashboard
      navigateTo('/dashboard')
    } catch (err) {
      error.value = err.message || 'Failed to create league'
      console.error('Error creating league:', err)
    } finally {
      loading.value = false
    }
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

        <!-- League Name -->
        <div>
          <label class="block text-gray-300 font-semibold mb-2">
            League Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input-field w-full"
            placeholder="e.g., Winter Escalation 2025"
            required
          />
        </div>

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
              class="input-field w-full"
              required
            />
          </div>
          <div>
            <label class="block text-gray-300 font-semibold mb-2">
              End Date <span class="text-gray-500">(optional)</span>
            </label>
            <input
              v-model="form.endDate"
              type="date"
              class="input-field w-full"
            />
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
              v-model="form.isPublic"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-gray-300 font-semibold">Public League</span>
          </label>
          <p class="text-gray-500 text-sm mt-1 ml-8">
            Public leagues can be discovered and joined by anyone. Private leagues require a password.
          </p>
        </div>

        <!-- Password (only for private leagues) -->
        <div v-if="!form.isPublic">
          <label class="block text-gray-300 font-semibold mb-2">
            Join Password <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.joinPassword"
            type="text"
            class="input-field w-full"
            placeholder="Enter password for joining"
            :required="!form.isPublic"
          />
          <p class="text-gray-500 text-sm mt-1">
            Players will need this password to join your league
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
        <div class="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 class="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Calendar :size="24" />
            Rounds
          </h2>
          <button
            type="button"
            @click="addRound"
            class="btn-primary text-sm flex items-center gap-2"
          >
            <Plus :size="16" />
            Add Round
          </button>
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
                  placeholder="e.g., 500 Points"
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
                  class="input-field w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-semibold mb-2">
                  End Date <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="round.endDate"
                  type="date"
                  class="input-field w-full"
                  required
                />
              </div>
            </div>
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
  </div>
</template>
