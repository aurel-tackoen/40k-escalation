<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Save, Plus, Trash2, Download, Upload, Settings as SettingsIcon, Share2, Copy, RefreshCw, Link, Globe, Lock, RotateCcw } from 'lucide-vue-next'
  import { useFormatting } from '~/composables/useFormatting'
  import { useLeaguesStore } from '~/stores/leagues'

  // Composables
  const { normalizeDates } = useFormatting()
  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)

  // Props
  const props = defineProps({
    league: {
      type: Object,
      required: true
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
  const fileInput = ref(null)
  const shareUrl = ref('')
  const isGeneratingUrl = ref(false)
  const urlCopied = ref(false)
  const inviteCodeCopied = ref(false)

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

  const exportData = () => {
    // Get all app data (you'd need to pass this from parent or use a store)
    const exportData = {
      league: editableLeague.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `wh40k-league-${editableLeague.value.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        if (importedData.league) {
          editableLeague.value = importedData.league
          alert('League data imported successfully!')
        } else {
          alert('Invalid file format. Please select a valid league export file.')
        }
      } catch (error) {
        console.log(error)
        alert('Error reading file. Please ensure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)

    // Reset file input
    event.target.value = ''
  }

  // Privacy and sharing methods
  const generateInviteCode = () => {
    // Generate a random 8-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const regenerateInviteCode = async () => {
    const newCode = generateInviteCode()
    editableLeague.value.inviteCode = newCode
    inviteCodeCopied.value = false
    // Note: This will be saved when the user saves the league
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(editableLeague.value.inviteCode)
      inviteCodeCopied.value = true
      setTimeout(() => {
        inviteCodeCopied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy invite code:', err)
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
  onMounted(() => {
    if (editableLeague.value?.shareToken) {
      const baseUrl = window.location.origin
      shareUrl.value = `${baseUrl}/join/${editableLeague.value.shareToken}`
    }

    // Generate invite code if league is private and doesn't have one
    if (editableLeague.value?.isPrivate && !editableLeague.value.inviteCode) {
      editableLeague.value.inviteCode = generateInviteCode()
    }
  })
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
                class="mt-0.5 text-yellow-600 bg-gray-700 border-gray-600 focus:ring-yellow-500"
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
                class="mt-0.5 text-yellow-600 bg-gray-700 border-gray-600 focus:ring-yellow-500"
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
                class="text-yellow-600 bg-gray-700 border-gray-600 focus:ring-yellow-500 rounded"
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

          <!-- Invite Code Section -->
          <div class="border-t border-gray-700 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-medium text-gray-200">Invite Code (Alternative)</h4>
              <button
                @click="regenerateInviteCode"
                class="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-md transition-colors"
              >
                <RotateCcw :size="16" />
                Regenerate
              </button>
            </div>

            <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm text-gray-400 mb-1">Manual entry code:</div>
                  <div class="text-xl font-mono font-bold text-yellow-400 tracking-wider">
                    {{ editableLeague.inviteCode || 'GENERATING...' }}
                  </div>
                </div>
                <button
                  @click="copyInviteCode"
                  class="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-medium rounded-md transition-colors"
                >
                  <Copy :size="16" />
                  {{ inviteCodeCopied ? 'Copied!' : 'Copy Code' }}
                </button>
              </div>

              <div class="text-xs text-gray-400">
                Players can manually enter this code in "Join Private League"
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

    <!-- Export/Import -->
    <div class="card">
      <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-6">Data Management</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Export League Data</h4>
          <p class="text-gray-300 mb-4">Download all league data as JSON for backup or sharing.</p>
          <button @click="exportData" class="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Download :size="18" class="flex-shrink-0" />
            <span>Export Data</span>
          </button>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Import League Data</h4>
          <p class="text-gray-300 mb-4">Upload a previously exported league data file.</p>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="importData"
            class="hidden"
          />
          <button @click="fileInput.click()" class="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Upload :size="18" class="flex-shrink-0" />
            <span>Import Data</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
