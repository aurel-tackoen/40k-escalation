<script setup>
  import { ref, watch, onMounted, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Save, Plus, Trash2, Settings as SettingsIcon, Share2, Copy, RefreshCw, Link, Globe, Lock, AlertTriangle, Crown } from 'lucide-vue-next'
  import { useFormatting } from '~/composables/useFormatting'
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { useAuth } from '~/composables/useAuth'

  // Composables
  const { normalizeDates } = useFormatting()
  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)
  const { user } = useAuth()

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

  // Watchers
  watch(() => props.league, (newLeague) => {
    editableLeague.value = normalizeDates(newLeague)
  }, { deep: true })

  // Methods
  const saveLeague = () => {
    // Sort rounds by number
    editableLeague.value.rounds.sort((a, b) => a.number - b.number)
    emit('update-league', editableLeague.value)

    // Show success message (you could use a toast notification library)
    alert('League settings saved successfully!')
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
      name: `Round ${newRoundNumber}`,
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

      // Ensure current round is valid
      const maxRound = Math.max(...editableLeague.value.rounds.map(r => r.number))
      if (editableLeague.value.currentRound > maxRound) {
        editableLeague.value.currentRound = maxRound
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
    } catch (error) {
      console.error('Failed to generate share URL:', error)
      alert('Failed to generate share URL. Please try again.')
    } finally {
      isGeneratingUrl.value = false
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl.value)
      urlCopied.value = true
      setTimeout(() => {
        urlCopied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy share URL:', err)
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

  const activePlayers = computed(() => {
    return props.players.filter(p =>
      p.membershipStatus === 'active' && p.userId !== user.value?.id
    )
  })

  const transferOwnership = async () => {
    if (!selectedNewOwner.value || !editableLeague.value?.id) return

    const newOwnerPlayer = activePlayers.value.find(p => p.id === selectedNewOwner.value)
    if (!newOwnerPlayer) return

    const confirmTransfer = confirm(
      `Transfer ownership to ${newOwnerPlayer.name}?\n\n` +
        `This will:\n` +
        `• Make ${newOwnerPlayer.name} the new league owner\n` +
        `• Change your role to member\n` +
        `• Allow you to leave the league\n\n` +
        `This action cannot be undone!`
    )

    if (!confirmTransfer) return

    isTransferringOwnership.value = true
    try {
      await $fetch(`/api/leagues/${editableLeague.value.id}/transfer-ownership`, {
        method: 'POST',
        body: {
          newOwnerUserId: newOwnerPlayer.userId
        }
      })

      alert('Ownership transferred successfully! The new owner will now have full control.')
      selectedNewOwner.value = null

      // Refresh membership data to get updated roles
      await leaguesStore.fetchMembers()
      await leaguesStore.fetchMyLeagues()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      alert('Failed to transfer ownership. Please try again.')
    } finally {
      isTransferringOwnership.value = false
    }
  }

  const deleteLeague = async () => {
    if (!editableLeague.value?.id) return

    const confirmDelete = confirm(
      `Are you sure you want to delete "${editableLeague.value.name}"?\n\n` +
        `This will permanently delete:\n` +
        `• All league data\n` +
        `• All player records\n` +
        `• All army lists\n` +
        `• All match results\n\n` +
        `This action cannot be undone!`
    )

    if (!confirmDelete) return

    const authStore = useAuthStore()
    if (!authStore.user?.id) {
      alert('You must be logged in to delete the league')
      return
    }

    try {
      await $fetch(`/api/leagues/${editableLeague.value.id}`, {
        method: 'DELETE',
        body: {
          userId: authStore.user.id
        }
      })

      alert('League deleted successfully')

      // Redirect to leagues page or home
      window.location.href = '/leagues'
    } catch (error) {
      console.error('Failed to delete league:', error)
      alert('Failed to delete league. Please try again.')
    }
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
            <p class="text-xs text-gray-400 mt-1">
              ⚠️ Changing the game system will update available factions and missions
            </p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Current Round</label>
            <select v-model.number="editableLeague.currentRound" class="input-field">
              <option v-for="round in editableLeague.rounds" :key="round.number" :value="round.number">
                Round {{ round.number }} - {{ round.name }}
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
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League End Date (Optional)</label>
            <input
              v-model="editableLeague.endDate"
              type="date"
              class="input-field"
              placeholder="Leave empty for ongoing leagues"
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
          <!-- Direct Join Setting -->
          <div class="border-t border-gray-700 pt-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="editableLeague.allowDirectJoin"
                type="checkbox"
              />
              <div>
                <div class="font-medium text-gray-200">Allow direct join via share link</div>
                <div class="text-sm text-gray-400">
                  Members can share a direct link for instant joining
                </div>
              </div>
            </label>
          </div>

          <!-- Share URL Section -->
          <div v-if="editableLeague.allowDirectJoin" class="space-y-4">
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
      <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-6">Round Configuration</h3>

      <div class="space-y-4">
        <div
          v-for="(round, index) in editableLeague.rounds"
          :key="round.number"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-yellow-500">Round {{ round.number }}</h4>
            <button
              v-if="editableLeague.rounds.length > 1"
              @click="removeRound(index)"
              class="text-red-400 hover:text-red-300 transition-colors"
              title="Remove Round"
            >
              <Trash2 :size="20" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Round Name</label>
              <input
                v-model="round.name"
                type="text"
                required
                class="input-field"
                placeholder="e.g., Combat Patrol"
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
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">End Date</label>
              <input
                v-model="round.endDate"
                type="date"
                required
                class="input-field"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <button type="submit" class="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Save :size="18" class="flex-shrink-0" />
          <span>Save Round Settings</span>
        </button>

        <button @click="addRound" class="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus :size="18" class="flex-shrink-0" />
          <span>Add New Round</span>
        </button>
      </div>
    </div>

    <!-- Scoring Rules -->
    <div class="card">
      <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-6">Scoring & Rules</h3>

      <div class="space-y-6">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Victory Points System</h4>
          <div class="text-gray-300 space-y-2">
            <p>• <strong>Primary Objectives:</strong> Up to 45 Victory Points</p>
            <p>• <strong>Secondary Objectives:</strong> Up to 15 Victory Points per objective (max 3)</p>
            <p>• <strong>Match Results:</strong> Win = 3 League Points, Draw = 1 League Point, Loss = 0 League Points</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Army Building Rules</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Players must stay within the point limit for each round</p>
            <p>• Army lists should be submitted before each round begins</p>
            <p>• Players may modify their army between rounds</p>
            <p>• All models must be WYSIWYG (What You See Is What You Get)</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Match Requirements</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Each player must play at least one match per round</p>
            <p>• Matches should be completed within the round timeframe</p>
            <p>• Results must be reported within 48 hours of completion</p>
            <p>• Disputes should be resolved by the league organizer</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">League Standings</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Ranked by total wins, then by total Victory Points scored</p>
            <p>• Ties broken by head-to-head record</p>
            <p>• Final standings determine league champion</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ownership Transfer (only for owner) -->
    <div v-if="leaguesStore.isLeagueOwner" class="card border-2 border-purple-600/50 bg-purple-950/20">
      <div class="flex items-center gap-3 mb-6">
        <Crown class="text-purple-500" :size="28" />
        <h3 class="text-2xl font-serif font-bold text-purple-500">Transfer Ownership</h3>
      </div>

      <div class="space-y-4">
        <div class="bg-purple-900/30 border border-purple-600/50 rounded-lg p-4">
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
              @click="transferOwnership"
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
        <div class="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
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
  </div>
</template>
