<script setup>
  import { ref, watch, onMounted, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Save, Plus, Trash2, Settings as SettingsIcon, Share2, Copy, RefreshCw, Link, Globe, Lock, AlertTriangle, Crown } from 'lucide-vue-next'
  import { useFormatting } from '~/composables/useFormatting'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { useAuth } from '~/composables/useAuth'
  import { useLeagueRules } from '~/composables/useLeagueRules'
  import { usePlaceholders } from '~/composables/usePlaceholders'
  import { useToast } from '~/composables/useToast'
  import { getFormatsForGameSystem, getFormatDisplayName } from '~/data/format-registry'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'

  // Composables
  const { normalizeDates } = useFormatting()
  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)
  const { user } = useAuth()
  const { toastSuccess, toastError } = useToast()

  // Props
  const props = defineProps({
    league: {
      type: Object,
      required: true
    },
    players: {
      type: Array,
      default: () => []
    }
  })

  // Emits
  const emit = defineEmits(['update-league'])

  // Fetch game systems on mount
  onMounted(async () => {
    if (gameSystems.value.length === 0) {
      await leaguesStore.fetchGameSystems()
    }
  })

  // Reactive data
  const editableLeague = ref(normalizeDates(props.league))
  const shareUrl = ref('')
  const isGeneratingUrl = ref(false)
  const urlCopied = ref(false)

  // Delete confirmation modal
  const showDeleteModal = ref(false)
  const isDeletingLeague = ref(false)

  // Get current game system for rules generation
  const currentGameSystem = computed(() => {
    if (!editableLeague.value?.gameSystemId) return null
    return gameSystems.value.find(gs => gs.id === editableLeague.value.gameSystemId)
  })

  // Format immutability: check if matches exist for current league
  const hasMatches = computed(() => {
    return leaguesStore.matches && leaguesStore.matches.length > 0
  })

  // Available formats for current game system
  const availableFormats = computed(() => {
    if (!currentGameSystem.value?.shortName) return []
    return getFormatsForGameSystem(currentGameSystem.value.shortName)
  })

  // Current format display name
  const currentFormatName = computed(() => {
    return editableLeague.value?.format ? getFormatDisplayName(editableLeague.value.format) : 'Not set'
  })

  // Get game-specific placeholders
  const { placeholders } = usePlaceholders(currentGameSystem)

  // Get game-specific rules
  const { generatedRules } = useLeagueRules(currentGameSystem)

  // Watchers
  watch(() => props.league, (newLeague) => {
    editableLeague.value = normalizeDates(newLeague)
    // Set default rules if none exist
    if (!editableLeague.value.rules && generatedRules.value) {
      editableLeague.value.rules = generatedRules.value
    }
  }, { deep: true })

  // Clear format when game system changes (only if no matches -- format is still editable)
  watch(() => editableLeague.value?.gameSystemId, (newId, oldId) => {
    if (oldId && newId !== oldId && !hasMatches.value) {
      editableLeague.value.format = null
    }
  })

  // Initialize rules on mount
  onMounted(() => {
    if (!editableLeague.value.rules && generatedRules.value) {
      editableLeague.value.rules = generatedRules.value
    }
  })

  // Methods
  const saveLeague = () => {
    // Sort rounds by number
    editableLeague.value.rounds.sort((a, b) => a.number - b.number)
    emit('update-league', editableLeague.value)
    toastSuccess('League settings saved successfully!')
  }

  const addRound = () => {
    const newRoundNumber = Math.max(...editableLeague.value.rounds.map(r => r.number)) + 1
    const lastRound = editableLeague.value.rounds[editableLeague.value.rounds.length - 1]

    // Calculate next point limit (add 500-1000 points)
    const nextPointLimit = lastRound.pointLimit + (lastRound.pointLimit < 1000 ? 500 : 1000)

    // Set start date to day after last round ends
    const startDate = new Date(lastRound.endDate)
    startDate.setDate(startDate.getDate() + 1)

    // Set end date to 4 weeks later
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 28)

    editableLeague.value.rounds.push({
      number: newRoundNumber,
      name: `Phase ${newRoundNumber}`,
      pointLimit: nextPointLimit,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  }

  const removeRound = (index) => {
    if (editableLeague.value.rounds.length > 1) {
      editableLeague.value.rounds.splice(index, 1)

      // Renumber remaining rounds
      editableLeague.value.rounds.forEach((round, i) => {
        round.number = i + 1
      })

      // Ensure current phase is valid
      const maxRound = Math.max(...editableLeague.value.rounds.map(r => r.number))
      if (editableLeague.value.currentPhase > maxRound) {
        editableLeague.value.currentPhase = maxRound
      }
    }
  }

  const generateShareUrl = async () => {
    if (!editableLeague.value?.id) return

    isGeneratingUrl.value = true
    try {
      const response = await $fetch(`/api/leagues/${editableLeague.value.id}/share-url`, {
        method: 'POST'
      })

      shareUrl.value = response.data.shareUrl
      editableLeague.value.shareToken = response.data.shareToken
      toastSuccess('Share URL generated successfully!')
    } catch (error) {
      console.error('Failed to generate share URL:', error)
      toastError('Failed to generate share URL. Please try again.')
    } finally {
      isGeneratingUrl.value = false
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl.value)
      urlCopied.value = true
      toastSuccess('Share URL copied to clipboard!')
      setTimeout(() => {
        urlCopied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy share URL:', err)
      toastError('Failed to copy share URL')
    }
  }

  // Initialize share URL if league has token
  onMounted(async () => {
    if (editableLeague.value?.shareToken) {
      const baseUrl = window.location.origin
      shareUrl.value = `${baseUrl}/join/${editableLeague.value.shareToken}`
    }
  })

  // Ownership Transfer
  const selectedNewOwner = ref(null)
  const isTransferringOwnership = ref(false)
  const showTransferModal = ref(false)

  const activePlayers = computed(() => {
    return props.players.filter(p =>
      p.membershipStatus === 'active' && p.userId !== user.value?.id
    )
  })

  const initiateTransferOwnership = () => {
    if (!selectedNewOwner.value) return
    showTransferModal.value = true
  }

  const confirmTransferOwnership = async () => {
    if (!selectedNewOwner.value || !editableLeague.value?.id) return

    const newOwnerPlayer = activePlayers.value.find(p => p.id === selectedNewOwner.value)
    if (!newOwnerPlayer) return

    isTransferringOwnership.value = true
    try {
      await $fetch(`/api/leagues/${editableLeague.value.id}/transfer-ownership`, {
        method: 'POST',
        body: {
          newOwnerUserId: newOwnerPlayer.userId
        }
      })

      toastSuccess('Ownership transferred successfully! The new owner will now have full control.')
      selectedNewOwner.value = null

      // Refresh membership data to get updated roles
      await leaguesStore.fetchMembers()
      await leaguesStore.fetchMyLeagues()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      toastError('Failed to transfer ownership. Please try again.')
    } finally {
      isTransferringOwnership.value = false
      showTransferModal.value = false
    }
  }

  const cancelTransferOwnership = () => {
    showTransferModal.value = false
  }

  const deleteLeague = async () => {
    if (!editableLeague.value?.id) return

    // Show confirmation modal instead of browser confirm
    showDeleteModal.value = true
  }

  const confirmDeleteLeague = async () => {
    if (!editableLeague.value?.id) return

    const authStore = useAuthStore()
    if (!authStore.user?.id) {
      toastError('You must be logged in to delete the league')
      showDeleteModal.value = false
      return
    }

    isDeletingLeague.value = true

    try {
      await $fetch(`/api/leagues/${editableLeague.value.id}`, {
        method: 'DELETE',
        body: {
          userId: authStore.user.id
        }
      })

      toastSuccess('League deleted successfully')

      // Redirect to leagues page or home
      setTimeout(() => {
        window.location.href = '/leagues'
      }, 1000)
    } catch (error) {
      console.error('Failed to delete league:', error)
      toastError('Failed to delete league. Please try again.')
    } finally {
      isDeletingLeague.value = false
      showDeleteModal.value = false
    }
  }

  const cancelDeleteLeague = () => {
    showDeleteModal.value = false
  }
</script>

<template>
  <div class="space-y-8">
    <!-- League Settings -->
    <div class="card">
      <div class="flex items-center gap-2 mb-6">
        <SettingsIcon :size="28" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">League Configuration</h3>
      </div>
      <form @submit.prevent="saveLeague" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League Name</label>
            <input
              v-model="editableLeague.name"
              type="text"
              required
              class="input-field"
              placeholder="Enter league name"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Game System</label>
            <select
              v-model.number="editableLeague.gameSystemId"
              class="input-field"
              required
            >
              <option value="" disabled>Select a game system</option>
              <option
                v-for="system in gameSystems"
                :key="system.id"
                :value="system.id"
              >
                {{ system.name }}
              </option>
            </select>
            <p class="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <AlertTriangle :size="14" class="text-yellow-500 flex-shrink-0" />
              <span>Changing the game system will update available factions and missions</span>
            </p>
          </div>

          <!-- League Format -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League Format</label>

            <!-- Locked state: matches exist, format cannot be changed -->
            <div v-if="hasMatches" class="flex items-center gap-3 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg">
              <Lock :size="18" class="text-yellow-500 flex-shrink-0" />
              <div>
                <span class="text-gray-200 font-medium">{{ currentFormatName }}</span>
                <p class="text-xs text-gray-400 mt-0.5">Format locked -- matches have been recorded</p>
              </div>
            </div>

            <!-- Editable state: no matches, format can be changed -->
            <div v-else>
              <select
                v-model="editableLeague.format"
                class="input-field"
              >
                <option value="" disabled>Select a format</option>
                <option
                  v-for="fmt in availableFormats"
                  :key="fmt.key"
                  :value="fmt.key"
                >
                  {{ fmt.name }} -- {{ fmt.description }}
                </option>
              </select>
              <p v-if="availableFormats.length === 0 && currentGameSystem" class="text-xs text-gray-400 mt-1">
                No formats available for this game system
              </p>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Current Phase</label>
            <select v-model.number="editableLeague.currentPhase" class="input-field">
              <option v-for="round in editableLeague.rounds" :key="round.number" :value="round.number">
                Phase {{ round.number }} - {{ round.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-2">Description</label>
          <textarea
            v-model="editableLeague.description"
            class="input-field"
            rows="3"
            placeholder="Describe your escalation league..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League Start Date</label>
            <input
              v-model="editableLeague.startDate"
              type="date"
              required
              class="input-field cursor-pointer"
              @click="(e) => e.target.showPicker?.()"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League End Date (Optional)</label>
            <input
              v-model="editableLeague.endDate"
              type="date"
              class="input-field cursor-pointer"
              placeholder="Leave empty for ongoing leagues"
              @click="(e) => e.target.showPicker?.()"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
          <Save :size="18" class="flex-shrink-0" />
          <span>Save League Settings</span>
        </button>
      </form>
    </div>

    <!-- Privacy & Access Settings -->
    <div class="card">
      <div class="flex items-center gap-3 mb-6">
        <Share2 class="text-yellow-500" :size="28" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">Sharing & Access</h3>
      </div>

      <div class="space-y-8">
        <!-- League Visibility -->
        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-3">
            League Visibility
          </label>
          <div class="space-y-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="editableLeague.isPrivate"
                type="radio"
                :value="false"
                class="mt-1"
              />
              <div>
                <div class="flex items-center gap-2">
                  <Globe :size="18" class="text-green-400" />
                  <span class="font-medium text-gray-200">Public League</span>
                </div>
                <div class="text-sm text-gray-400 mt-1">
                  Visible in league directory, anyone can join
                </div>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="editableLeague.isPrivate"
                type="radio"
                :value="true"
                class="mt-1"
              />
              <div>
                <div class="flex items-center gap-2">
                  <Lock :size="18" class="text-yellow-400" />
                  <span class="font-medium text-gray-200">Private League</span>
                </div>
                <div class="text-sm text-gray-400 mt-1">
                  Hidden from directory, invite-only access
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Private League Settings -->
        <div v-if="editableLeague.isPrivate" class="space-y-6">
          <!-- Share URL Section -->
          <div class="space-y-4 border-t border-gray-700 pt-6">
            <!-- Generate/Display Share URL -->
            <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-medium text-gray-200 flex items-center gap-2">
                  <Link :size="20" />
                  Share Link
                </h4>
                <button
                  @click="generateShareUrl"
                  :disabled="isGeneratingUrl"
                  class="btn-login flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <RefreshCw :size="16" :class="{ 'animate-spin': isGeneratingUrl }" />
                  {{ shareUrl ? 'Regenerate' : 'Generate' }}
                </button>
              </div>

              <div v-if="shareUrl" class="space-y-3">
                <!-- URL Display -->
                <div class="flex items-center gap-2">
                  <input
                    :value="shareUrl"
                    readonly
                    class="flex-1 px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 font-mono"
                  />
                  <button
                    @click="copyShareUrl"
                    class="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Copy :size="16" />
                    {{ urlCopied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <div v-if="!shareUrl" class="text-center py-8 text-gray-400">
                <Link :size="48" class="mx-auto mb-3 opacity-50" />
                <p>Click "Generate" to create a shareable link</p>
              </div>
            </div>

            <!-- Share Instructions -->
            <div class="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div class="flex items-start gap-3">
                <Share2 class="text-blue-400 flex-shrink-0 mt-0.5" :size="20" />
                <div class="text-sm">
                  <div class="font-medium text-blue-300 mb-2">How to use share links:</div>
                  <div class="text-blue-200 space-y-1">
                    <p>• Generate a unique link that anyone can click to join instantly</p>
                    <p>• Share via email, messaging apps, or social media</p>
                    <p>• Users just click the link - no codes to type!</p>
                    <p>• Regenerate the link anytime to invalidate the old one</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Privacy Settings -->
        <div class="pt-6 border-t border-gray-700">
          <button
            @click="saveLeague"
            class="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Save :size="18" />
            Save Privacy Settings
          </button>
          <p class="text-xs text-gray-500 mt-2">
            Changes will be applied immediately to your league
          </p>
        </div>
      </div>
    </div>

    <!-- Round Configuration -->
    <div class="card">
      <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-6">Phase Configuration</h3>

      <div class="space-y-4">
        <div
          v-for="(round, index) in editableLeague.rounds"
          :key="round.number"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-yellow-500">Phase {{ round.number }}</h4>
            <button
              v-if="editableLeague.rounds.length > 1"
              @click="removeRound(index)"
              class="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Remove Phase"
            >
              <Trash2 :size="20" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Phase Name</label>
              <input
                v-model="round.name"
                type="text"
                required
                class="input-field"
                :placeholder="placeholders.roundName"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Point Limit</label>
              <input
                v-model.number="round.pointLimit"
                type="number"
                min="500"
                max="3000"
                step="250"
                required
                class="input-field"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Start Date</label>
              <input
                v-model="round.startDate"
                type="date"
                required
                class="input-field cursor-pointer"
                @click="(e) => e.target.showPicker?.()"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">End Date</label>
              <input
                v-model="round.endDate"
                type="date"
                required
                class="input-field cursor-pointer"
                @click="(e) => e.target.showPicker?.()"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <button @click="saveLeague" type="button" class="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Save :size="18" class="flex-shrink-0" />
          <span>Save Phase Settings</span>
        </button>

        <button @click="addRound" type="button" class="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus :size="18" class="flex-shrink-0" />
          <span>Add New Phase</span>
        </button>
      </div>
    </div>

    <!-- League Rules -->
    <form @submit.prevent="saveLeague" class="card">
      <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-6">League Rules</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-2">
            Custom League Rules
          </label>
          <p class="text-sm text-gray-400 mb-3">
            Define your league's rules and scoring system. Players will see these rules on the dashboard.
            <strong>Markdown formatting is supported!</strong>
          </p>
          <textarea
            v-model="editableLeague.rules"
            rows="20"
            class="input-field font-mono text-sm"
            placeholder="Enter league rules using markdown formatting..."
          ></textarea>
          <div class="text-xs text-gray-500 mt-2 space-y-1">
            <p class="font-semibold text-yellow-500">Markdown Tips:</p>
            <p>• Use <code class="bg-gray-700 px-1 rounded">**bold**</code> for bold text, <code class="bg-gray-700 px-1 rounded">*italic*</code> for italic</p>
            <p>• Start lines with <code class="bg-gray-700 px-1 rounded">##</code> for headers</p>
            <p>• Use <code class="bg-gray-700 px-1 rounded">-</code> or <code class="bg-gray-700 px-1 rounded">*</code> for bullet lists</p>
            <p>• Create links with <code class="bg-gray-700 px-1 rounded">[text](url)</code></p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button type="submit" class="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Save :size="18" class="flex-shrink-0" />
            <span>Save Rules</span>
          </button>

          <button
            type="button"
            @click="() => { editableLeague.rules = generatedRules; toastSuccess('Rules reset to default template!') }"
            :disabled="!generatedRules"
            class="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            :class="{ 'opacity-50 cursor-not-allowed': !generatedRules }"
            title="Reset to default rules for this game system"
          >
            <RefreshCw :size="16" class="flex-shrink-0" />
            <span>Reset to Default Rules</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Ownership Transfer (only for owner) -->
    <div v-if="leaguesStore.isLeagueOwner" class="card border-2 border-purple-600/50 bg-purple-950/20">
      <div class="flex items-center gap-3 mb-6">
        <Crown class="text-purple-500" :size="28" />
        <h3 class="text-2xl font-serif font-bold text-purple-500">Transfer Ownership</h3>
      </div>

      <div class="space-y-4">
        <div class="">
          <h4 class="text-lg font-semibold text-purple-400 mb-2">Assign a New Owner</h4>
          <p class="text-gray-300 mb-4">
            As league owner, you cannot leave unless you transfer ownership to another active player.
            Select a new owner from the list below to transfer all league management permissions.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-purple-400 mb-2">
                Select New Owner
              </label>
              <select
                v-model="selectedNewOwner"
                class="input-field"
                :disabled="activePlayers.length === 0"
              >
                <option :value="null">Choose a player...</option>
                <option
                  v-for="player in activePlayers"
                  :key="player.id"
                  :value="player.id"
                >
                  {{ player.name }} ({{ player.faction }})
                </option>
              </select>
              <p v-if="activePlayers.length === 0" class="text-sm text-gray-400 mt-2">
                No other active players available. At least one other player must join before you can transfer ownership.
              </p>
            </div>

            <button
              @click="initiateTransferOwnership"
              :disabled="!selectedNewOwner || isTransferringOwnership"
              class="btn-secondary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto bg-purple-600 hover:bg-purple-700 border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Crown :size="18" />
              <span>{{ isTransferringOwnership ? 'Transferring...' : 'Transfer Ownership' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card border-2 border-red-600/50 bg-red-950/20">
      <div class="flex items-center gap-3 mb-6">
        <AlertTriangle class="text-red-500" :size="28" />
        <h3 class="text-2xl font-serif font-bold text-red-500">Danger Zone</h3>
      </div>

      <div class="space-y-4">
        <div class="">
          <h4 class="text-lg font-semibold text-red-400 mb-2">Delete This League</h4>
          <p class="text-gray-300 mb-4">
            Once you delete a league, there is no going back. This will permanently delete all league data,
            player records, army lists, and match results.
          </p>
          <button
            @click="deleteLeague"
            class="btn-secondary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 border-red-500"
          >
            <Trash2 :size="18" />
            <span>Delete League</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete League"
      variant="danger"
      confirm-text="Delete League"
      cancel-text="Cancel"
      @confirm="confirmDeleteLeague"
      @cancel="cancelDeleteLeague"
      @close="cancelDeleteLeague"
    >
      <template #default>
        <div class="space-y-4">
          <p class="text-gray-200">
            Are you sure you want to delete <strong class="text-red-400">"{{ editableLeague.name }}"</strong>?
          </p>
          <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p class="text-red-300 font-semibold mb-2">This will permanently delete:</p>
            <ul class="text-red-200 space-y-1 text-sm">
              <li>• All league data</li>
              <li>• All player records</li>
              <li>• All army lists</li>
              <li>• All match results</li>
            </ul>
          </div>
          <p class="text-yellow-400 font-semibold">
            ⚠️ This action cannot be undone!
          </p>
        </div>
      </template>
    </ConfirmationModal>

    <!-- Transfer Ownership Confirmation Modal -->
    <ConfirmationModal
      :show="showTransferModal"
      title="Transfer Ownership"
      confirm-text="Transfer Ownership"
      cancel-text="Cancel"
      @confirm="confirmTransferOwnership"
      @cancel="cancelTransferOwnership"
      @close="cancelTransferOwnership"
    >
      <template #default>
        <div class="space-y-4">
          <p class="text-gray-200">
            Transfer ownership to <strong class="text-purple-400">{{ activePlayers.find(p => p.id === selectedNewOwner)?.name }}</strong>?
          </p>
          <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <p class="text-purple-300 font-semibold mb-2">This will:</p>
            <ul class="text-purple-200 space-y-1 text-sm">
              <li>• Make {{ activePlayers.find(p => p.id === selectedNewOwner)?.name }} the new league owner</li>
              <li>• Change your role to member</li>
              <li>• Allow you to leave the league</li>
            </ul>
          </div>
          <p class="text-yellow-400 font-semibold">
            ⚠️ This action cannot be undone!
          </p>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>
