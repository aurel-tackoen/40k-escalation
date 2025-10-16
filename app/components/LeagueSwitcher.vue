<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { Swords, ChevronDown, Check, Plus, LogIn, Crown, Settings, Target, Key } from 'lucide-vue-next'
  import { useGameSystems } from '~/composables/useGameSystems'

  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { myLeagues, currentLeague, currentLeagueId, gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemNameWithFallback } = useGameSystems(gameSystems)

  const isOpen = ref(false)
  const showJoinPrivate = ref(false)
  const inviteCode = ref('')
  const isJoining = ref(false)

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }

  const switchToLeague = async (leagueId) => {
    if (leagueId !== currentLeagueId.value) {
      await leaguesStore.switchLeague(leagueId)
    }
    isOpen.value = false
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return Crown
      case 'organizer': return Settings
      default: return Target
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-yellow-400'
      case 'organizer': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const joinWithInviteCode = async () => {
    if (!inviteCode.value.trim()) return

    // Check authentication before joining
    if (!authStore.isAuthenticated) {
      alert('You must be logged in to join a league')
      authStore.login()
      return
    }

    isJoining.value = true
    try {
      const response = await $fetch('/api/leagues/join-by-code', {
        method: 'POST',
        body: { inviteCode: inviteCode.value.trim().toUpperCase() }
      })

      // Refresh leagues and switch to new league
      await leaguesStore.fetchMyLeagues()
      await leaguesStore.switchLeague(response.data.id)

      // Reset form
      inviteCode.value = ''
      showJoinPrivate.value = false
      isOpen.value = false

      // Show success message
      alert(`Successfully joined "${response.data.name}"!`)
    } catch (error) {
      console.error('Failed to join league:', error)
      if (error.statusCode === 401) {
        alert('You must be logged in to join a league')
        authStore.login()
      } else {
        alert(error.data?.message || 'Failed to join league. Please check your invite code.')
      }
    } finally {
      isJoining.value = false
    }
  }

  // Close dropdown when clicking outside
  const dropdownRef = ref(null)
  onMounted(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false
      }
    }
    document.addEventListener('click', handleClickOutside)
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
  })
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      class="btn-league w-full"
      :class="{ 'active': isOpen }"
    >
      <Swords :size="20" class="text-purple-400 flex-shrink-0" />
      <span class="font-semibold truncate">{{ currentLeague?.name || 'No League' }}</span>
      <ChevronDown :size="16" :class="{ 'rotate-180': isOpen }" class="transition-transform ml-auto flex-shrink-0" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 lg:right-0 lg:left-auto mt-2 w-full lg:w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
      >
        <!-- My Leagues Section -->
        <div v-if="myLeagues && myLeagues.length > 0" class="max-h-96 overflow-y-auto">
          <div class="px-3 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-700">
            My Leagues
          </div>
          <button
            v-for="league in myLeagues"
            :key="league.id"
            @click="switchToLeague(league.id)"
            class="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-100 truncate">{{ league.name }}</span>
                <span v-if="league.id === currentLeagueId" class="text-green-400">
                  <Check :size="16" />
                </span>
              </div>
              <div class="text-xs text-gray-400 flex items-center gap-2">
                <component :is="getRoleIcon(league.role)" :size="14" :class="getRoleColor(league.role)" />
                <span class="capitalize">{{ league.role }}</span>
                <span>•</span>
                <span>Round {{ league.currentRound || 1 }}</span>
                <span v-if="league.gameSystemId">•</span>
                <span v-if="league.gameSystemId" class="text-purple-400 font-medium">{{ getGameSystemNameWithFallback(league.gameSystemId) }}</span>
              </div>
            </div>
          </button>
        </div>

        <!-- No Leagues Message -->
        <div v-else class="px-4 py-8 text-center text-gray-400 text-sm">
          You haven't joined any leagues yet
        </div>

        <!-- Actions Section -->
        <div class="border-t border-gray-700">
          <NuxtLink
            to="/leagues/create"
            class="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-purple-400"
            @click="isOpen = false"
          >
            <Plus :size="18" />
            <span class="font-semibold">Create League</span>
          </NuxtLink>
          <NuxtLink
            to="/leagues"
            class="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-blue-400"
            @click="isOpen = false"
          >
            <LogIn :size="18" />
            <span class="font-semibold">Join League</span>
          </NuxtLink>

          <!-- Join Private League Section -->
          <div class="border-t border-gray-700">
            <button
              @click="showJoinPrivate = !showJoinPrivate"
              class="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Key :size="18" />
              <span class="font-semibold">Join Private League</span>
              <ChevronDown
                :size="16"
                class="ml-auto transition-transform"
                :class="{ 'rotate-180': showJoinPrivate }"
              />
            </button>

            <div v-if="showJoinPrivate" class="px-4 pb-3 space-y-3 bg-gray-750">
              <input
                v-model="inviteCode"
                @keyup.enter="joinWithInviteCode"
                placeholder="Enter invite code (e.g., ABC123XY)"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm uppercase tracking-wider focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                maxlength="8"
              />
              <button
                @click="joinWithInviteCode"
                :disabled="!inviteCode.trim() || isJoining"
                class="w-full px-3 py-2 bg-yellow-600 disabled:bg-gray-600 text-gray-900 disabled:text-gray-400 rounded text-sm font-medium hover:bg-yellow-500 disabled:hover:bg-gray-600 transition-colors"
              >
                {{ isJoining ? 'Joining...' : 'Join League' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
