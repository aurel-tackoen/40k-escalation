<script setup>
  import { ref, onMounted } from 'vue'
  import { Mail, Calendar, Save, Shield, Trophy, Users, Target, Flame, Swords, TrendingUp } from 'lucide-vue-next'
  import { useUser } from '~/composables/useUser'
  import { useAuth } from '~/composables/useAuth'
  import { useFormatting } from '~/composables/useFormatting'

  const { profile, isLoading, fetchUserProfile, updateUserProfile } = useUser()
  const { getUserAvatar } = useAuth()
  const { formatDate } = useFormatting()

  const editMode = ref(false)
  const editName = ref('')
  const editPicture = ref('')
  const saveError = ref(null)
  const saveSuccess = ref(false)

  onMounted(async () => {
    await fetchUserProfile()
    if (profile.value?.user) {
      editName.value = profile.value.user.name
      editPicture.value = profile.value.user.picture || ''
    }
  })

  const toggleEditMode = () => {
    editMode.value = !editMode.value
    if (editMode.value && profile.value?.user) {
      editName.value = profile.value.user.name
      editPicture.value = profile.value.user.picture || ''
    }
  }

  const saveProfile = async () => {
    saveError.value = null
    saveSuccess.value = false

    try {
      await updateUserProfile({
        name: editName.value,
        picture: editPicture.value
      })
      editMode.value = false
      saveSuccess.value = true
      setTimeout(() => { saveSuccess.value = false }, 3000)
    } catch {
      saveError.value = 'Failed to update profile. Please try again.'
    }
  }

  // Tooltip for performance explanation
  const getPerformanceTooltip = (player) => {
    const winRate = (player.wins / Math.max(1, player.wins + player.losses + player.draws)) * 100
    if (winRate >= 60) {
      return `Strong Performance: ${Math.round(winRate)}% win rate (60%+ is considered strong)`
    } else if (winRate >= 40) {
      return `Competitive Performance: ${Math.round(winRate)}% win rate (40-59% is competitive)`
    } else {
      return `Developing Performance: ${Math.round(winRate)}% win rate (under 40% shows room for growth)`
    }
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="py-12">
      <LoadingSpinner message="Loading Your Profile" />
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile?.user" class="space-y-6">
      <!-- User Info Header -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              :src="profile.user.picture || getUserAvatar"
              :alt="profile.user.name"
              class="w-20 h-20 rounded-lg object-cover border-2 border-yellow-500"
            >
            <div>
              <h2 class="text-xl sm:text-3xl font-bold text-white break-all sm:break-normal">{{ profile.user.name }}</h2>
              <p class="text-gray-400 break-all sm:break-normal flex items-center gap-2 mt-2">
                <Mail :size="20" class="text-yellow-400" />
                {{ profile.user.email }}
              </p>
            </div>
          </div>
          <button
            @click="toggleEditMode"
            class="btn-secondary w-full sm:w-auto"
          >
            {{ editMode ? 'Cancel' : 'Edit Profile' }}
          </button>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-if="editMode" class="card">
        <h2 class="text-xl font-bold text-white mb-4">Edit Profile</h2>

        <div class="space-y-4">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              v-model="editName"
              type="text"
              class="input-field"
              placeholder="Enter your name"
            >
          </div>

          <!-- Picture URL Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Avatar URL (optional)
            </label>
            <input
              v-model="editPicture"
              type="url"
              class="input-field"
              placeholder="https://example.com/avatar.jpg"
            >
          </div>

          <!-- Save Button -->
          <div class="flex items-center gap-3">
            <button
              @click="saveProfile"
              class="btn-primary flex items-center gap-2"
            >
              <Save :size="18" />
              <span>Save Changes</span>
            </button>

            <!-- Success Message -->
            <div v-if="saveSuccess" class="text-green-400">
              ✓ Profile updated successfully!
            </div>

            <!-- Error Message -->
            <div v-if="saveError" class="text-red-400">
              {{ saveError }}
            </div>
          </div>
        </div>
      </div>

      <!-- Account Info -->
      <div class="card">
        <h2 class="text-xl font-bold text-white mb-4">Account Information</h2>

        <div class="space-y-3">

          <div class="flex items-center gap-3 text-gray-300">
            <Calendar :size="20" class="text-yellow-400" />
            <span>Member since {{ formatDate(profile.user.createdAt) }}</span>
          </div>

          <div class="flex items-center gap-3 text-gray-300">
            <Calendar :size="20" class="text-yellow-400" />
            <span>Last login: {{ formatDate(profile.user.lastLoginAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Linked Players -->
      <div class="card">
        <h2 class="text-xl font-bold text-white mb-4">
          Linked Players ({{ profile.players?.length || 0 }})
        </h2>

        <div v-if="profile.players && profile.players.length > 0" class="space-y-3">
          <div
            v-for="player in profile.players"
            :key="player.id"
            class="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-yellow-500 transition-colors"
          >
            <!-- Mobile List Layout -->
            <div class="sm:hidden space-y-3">
              <!-- Player Header -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Shield :size="20" class="text-white" />
                </div>
                <div class="flex-1">
                  <div class="font-bold text-white">{{ player.name }}</div>
                  <div class="text-xs text-gray-400">{{ player.faction }}</div>
                  <div class="text-xs text-purple-400">{{ player.leagueName || 'Unknown League' }}</div>

                  <!-- Army Name (View Only) -->
                  <div class="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                    <Swords :size="12" />
                    <span>{{ player.armyName || 'No army name set' }}</span>
                  </div>
                </div>
              </div>

              <!-- Compact Stats List -->
              <div class="space-y-1">
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <Swords :size="14" />
                    <span>Record</span>
                  </div>
                  <span class="font-semibold text-white text-sm">{{ player.wins }}-{{ player.losses }}-{{ player.draws }}</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <TrendingUp :size="14" />
                    <span>Win Rate</span>
                  </div>
                  <span class="font-semibold text-yellow-500 text-sm">
                    {{ Math.round(((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) * 100) }}%
                  </span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <Users :size="14" />
                    <span>Games</span>
                  </div>
                  <span class="font-semibold text-blue-400 text-sm">{{ player.wins + player.losses + player.draws }}</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <Target :size="14" />
                    <span>Points</span>
                  </div>
                  <span class="font-semibold text-green-400 text-sm">{{ player.totalPoints || 0 }}</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar :size="14" />
                    <span>Joined</span>
                  </div>
                  <span class="text-gray-300 text-sm">{{ formatDate(player.createdAt, { month: 'short', year: 'numeric' }) }}</span>
                </div>
              </div>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden sm:flex sm:items-center sm:justify-between gap-4">
              <!-- Player Basic Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Shield :size="24" class="text-white" />
                </div>
                <div>
                  <div class="font-bold text-white text-lg">{{ player.name }}</div>
                  <div class="text-sm text-gray-400">{{ player.faction }}</div>

                  <!-- Army Name (View Only - Desktop) -->
                  <div class="text-sm text-yellow-500 flex items-center gap-1 mt-1">
                    <Swords :size="14" />
                    <span>{{ player.armyName || 'No army name set' }}</span>
                  </div>

                  <div class="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar :size="12" />
                    Joined {{ formatDate(player.createdAt, { month: 'short', year: 'numeric' }) }}
                  </div>
                </div>
              </div>

              <!-- Player Stats -->
              <div class="grid grid-cols-4 gap-4 text-center">
                <!-- Record -->
                <div>
                  <div class="text-xs text-gray-400 uppercase tracking-wide">Record</div>
                  <div class="font-bold text-white">
                    {{ player.wins }}-{{ player.losses }}-{{ player.draws }}
                  </div>
                </div>

                <!-- Win Percentage -->
                <div>
                  <div class="text-xs text-gray-400 uppercase tracking-wide">Win %</div>
                  <div class="font-bold text-yellow-500">
                    {{ Math.round(((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) * 100) }}%
                  </div>
                </div>

                <!-- Total Games -->
                <div>
                  <div class="text-xs text-gray-400 uppercase tracking-wide">Games</div>
                  <div class="font-bold text-blue-400">
                    {{ player.wins + player.losses + player.draws }}
                  </div>
                </div>

                <!-- Battle Points -->
                <div>
                  <div class="text-xs text-gray-400 uppercase tracking-wide">Points</div>
                  <div class="font-bold text-green-400">
                    {{ player.totalPoints || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Badge -->
            <div v-if="player.wins + player.losses + player.draws > 0" class="mt-3 pt-3 border-t border-gray-700">
              <div
                class="flex items-center justify-between text-xs cursor-help"
                :title="getPerformanceTooltip(player)"
              >
                <div class="flex items-center gap-1 text-gray-400">
                  <Trophy :size="12" />
                  <span>Performance</span>
                </div>
                <div
                  :class="{
                    'text-green-400': ((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.6,
                    'text-yellow-400': ((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.4,
                    'text-red-400': ((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) < 0.4
                  }"
                  class="font-semibold flex items-center gap-1"
                >
                  <Flame
                    v-if="((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.6"
                    :size="12"
                  />
                  <Swords
                    v-else-if="((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.4"
                    :size="12"
                  />
                  <TrendingUp
                    v-else
                    :size="12"
                  />
                  <span>
                    {{
                      ((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.6 ? 'Strong' :
                      ((player.wins) / Math.max(1, player.wins + player.losses + player.draws)) >= 0.4 ? 'Competitive' :
                      'Developing'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-400 text-center py-8">
          No players linked to this account yet.
        </div>
      </div>
    </div>

    <!-- Not Authenticated -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 text-xl">Please login to view your profile.</div>
    </div>
  </div>
</template>
