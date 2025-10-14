<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { Swords, ChevronDown, Check, Plus, LogIn, Crown, Settings, Target } from 'lucide-vue-next'

  const leaguesStore = useLeaguesStore()
  const { myLeagues, currentLeague, currentLeagueId } = storeToRefs(leaguesStore)

  const isOpen = ref(false)

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
      class="btn-league"
      :class="{ 'active': isOpen }"
    >
      <Swords :size="20" class="text-purple-400" />
      <span class="font-semibold">{{ currentLeague?.name || 'No League' }}</span>
      <ChevronDown :size="16" :class="{ 'rotate-180': isOpen }" class="transition-transform" />
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
        class="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
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
            to="/leagues/join"
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
