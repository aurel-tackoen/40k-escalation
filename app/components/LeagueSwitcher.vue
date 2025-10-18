<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'
  import { Swords, ChevronDown, Check, Plus, LogIn, Crown, Settings, Target, Globe, Lock } from 'lucide-vue-next'
  import { useGameSystems } from '~/composables/useGameSystems'

  const emit = defineEmits(['league-switched'])

  const leaguesStore = useLeaguesStore()
  const { myLeagues, currentLeague, currentLeagueId, gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemNameWithFallback } = useGameSystems(gameSystems)

  const isOpen = ref(false)

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }

  const switchToLeague = async (leagueId) => {
    if (leagueId !== currentLeagueId.value) {
      await leaguesStore.switchLeague(leagueId)
    }
    isOpen.value = false
    emit('league-switched')
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
      <span class="font-semibold truncate flex-1 max-w-36">{{ currentLeague?.name || 'No League' }}</span>
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
                <component
                  :is="league.isPrivate ? Lock : Globe"
                  :size="14"
                  :class="league.isPrivate ? 'text-yellow-400' : 'text-green-400'"
                  class="flex-shrink-0"
                />
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
        </div>
      </div>
    </Transition>
  </div>
</template>
