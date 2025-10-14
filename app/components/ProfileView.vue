<script setup>
  import { ref, onMounted } from 'vue'
  import { Mail, Calendar, Save } from 'lucide-vue-next'
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
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="text-purple-400 text-xl">Loading profile...</div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile?.user" class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <img
              :src="profile.user.picture || getUserAvatar"
              :alt="profile.user.name"
              class="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
            >
            <div>
              <h1 class="text-3xl font-bold text-white">{{ profile.user.name }}</h1>
              <p class="text-gray-400">{{ profile.user.email }}</p>
            </div>
          </div>
          <button
            @click="toggleEditMode"
            class="btn-secondary"
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
            <Mail :size="20" class="text-purple-400" />
            <span>{{ profile.user.email }}</span>
          </div>

          <div class="flex items-center gap-3 text-gray-300">
            <Calendar :size="20" class="text-purple-400" />
            <span>Member since {{ formatDate(profile.user.createdAt) }}</span>
          </div>

          <div class="flex items-center gap-3 text-gray-300">
            <Calendar :size="20" class="text-purple-400" />
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
            class="bg-gray-800 border border-gray-600 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-white">{{ player.name }}</div>
                <div class="text-sm text-gray-400">{{ player.faction }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-400">Record</div>
                <div class="font-bold text-white">
                  {{ player.wins }}-{{ player.losses }}-{{ player.draws }}
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
