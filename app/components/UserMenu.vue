<script setup>
  import { ref } from 'vue'
  import { User, ChevronDown } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  const { isAuthenticated, getUserName, getUserAvatar, logout } = useAuth()
  const isOpen = ref(false)

  const toggleMenu = () => {
    isOpen.value = !isOpen.value
  }

  const closeMenu = () => {
    isOpen.value = false
  }
</script>

<template>
  <div v-if="isAuthenticated" class="relative">
    <!-- User Avatar Button -->
    <button
      @click="toggleMenu"
      class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-lg transition-colors"
    >
      <img
        :src="getUserAvatar"
        :alt="getUserName"
        class="w-8 h-8 rounded-full object-cover"
      >
      <span class="hidden md:inline">{{ getUserName }}</span>
      <ChevronDown :size="16" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      @click="closeMenu"
      class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
    >
      <NuxtLink
        to="/profile"
        class="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 text-white transition-colors rounded-t-lg"
      >
        <User :size="18" />
        <span>My Profile</span>
      </NuxtLink>

      <div class="border-t border-gray-600" />

      <button
        @click="logout"
        class="w-full text-left px-4 py-3 hover:bg-gray-700 text-red-400 transition-colors rounded-b-lg"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure dropdown appears above other content */
.z-50 {
  z-index: 50;
}
</style>
