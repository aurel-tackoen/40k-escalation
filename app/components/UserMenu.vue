<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { User, ChevronDown, LogOut } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'

  const { isAuthenticated, getUserName, getUserAvatar, logout } = useAuth()
  const isOpen = ref(false)
  const menuRef = ref(null)

  const toggleMenu = () => {
    isOpen.value = !isOpen.value
  }

  const closeMenu = () => {
    isOpen.value = false
  }

  // Close menu when clicking outside
  const handleClickOutside = (event) => {
    if (menuRef.value && !menuRef.value.contains(event.target)) {
      closeMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<template>
  <div v-if="isAuthenticated" ref="menuRef" class="relative">
    <!-- User Avatar Button -->
    <button
      @click.stop="toggleMenu"
      class="btn-login flex items-center gap-2 !py-0.5 pl-0.5 w-full"
    >
      <img
        :src="getUserAvatar"
        :alt="getUserName"
        class="w-[34px] h-[34px] rounded-lg object-cover border border-gray-400"
      >
      <span>{{ getUserName }}</span>
      <ChevronDown :size="16" class="ml-auto" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[100]"
    >
      <NuxtLink
        to="/profile"
        @click="closeMenu"
        class="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 text-white transition-colors rounded-t-lg"
      >
        <User :size="18" />
        <span>My Profile</span>
      </NuxtLink>

      <div class="border-t border-gray-600" />

      <button
        @click="logout"
        class="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors rounded-b-lg cursor-pointer"
      >
        <LogOut :size="18" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>
