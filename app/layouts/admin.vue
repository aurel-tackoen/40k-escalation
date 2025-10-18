<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '~/stores/auth'
  import { Shield, Database, Target, Boxes, Activity, Menu, X } from 'lucide-vue-next'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  // Check admin access
  const hasAdminAccess = computed(() => {
    return authStore.isAuthenticated && authStore.user?.role === 'admin'
  })

  // Local loading state
  const isCheckingAccess = ref(true)

  // Initialize and check access
  onMounted(async () => {
    // Ensure user is loaded
    if (!authStore.user && !authStore.isLoading) {
      await authStore.fetchUser()
    }

    // Wait for any ongoing loading to complete
    while (authStore.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Check access
    isCheckingAccess.value = false
    if (!hasAdminAccess.value) {
      router.push('/dashboard')
    }
  })

  // Active route
  const currentPath = computed(() => route.path)

  // Navigation items
  const navItems = [
    { path: '/admin', label: 'Overview', icon: Activity, exact: true },
    { path: '/admin/game-systems', label: 'Game Systems', icon: Database },
    { path: '/admin/factions', label: 'Factions', icon: Shield },
    { path: '/admin/missions', label: 'Missions', icon: Target },
    { path: '/admin/unit-types', label: 'Unit Types', icon: Boxes }
  ]

  // Mobile menu state
  const isMobileMenuOpen = ref(false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  // Check if nav item is active
  const isActive = (item) => {
    if (item.exact) {
      return currentPath.value === item.path
    }
    return currentPath.value.startsWith(item.path)
  }
</script>

<template>
  <div v-if="hasAdminAccess" class="min-h-screen bg-gray-900">
    <!-- Admin Header -->
    <header class="bg-gradient-to-r from-gray-800 to-gray-850 border-b-2 border-yellow-600/40">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo/Title -->
          <div class="flex items-center gap-3">
            <Shield class="w-8 h-8 text-yellow-500" />
            <div>
              <h1 class="text-2xl font-bold text-yellow-500">Admin Dashboard</h1>
              <p class="text-xs text-gray-400 hidden sm:block">System Management & Configuration</p>
            </div>
          </div>

          <!-- Desktop Actions -->
          <div class="hidden md:flex items-center gap-3">
            <NuxtLink
              to="/dashboard"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              Back to App
            </NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <Menu v-if="!isMobileMenuOpen" :size="24" />
            <X v-else :size="24" />
          </button>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-2 mt-4 border-t border-gray-700 pt-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all',
              isActive(item)
                ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <Transition name="slide">
      <nav
        v-if="isMobileMenuOpen"
        class="fixed top-[73px] right-0 bottom-0 w-64 bg-gray-800 border-l border-gray-700 shadow-2xl z-50 md:hidden overflow-y-auto"
      >
        <div class="p-4 space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="closeMobileMenu"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all',
              isActive(item)
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <div class="pt-4 border-t border-gray-700 mt-4">
            <NuxtLink
              to="/dashboard"
              @click="closeMobileMenu"
              class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            >
              <span>← Back to App</span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </Transition>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden top-[73px]"
      />
    </Transition>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>

  <!-- Loading State -->
  <div v-else-if="isCheckingAccess || authStore.isLoading" class="min-h-screen bg-gray-900 flex items-center justify-center">
    <LoadingSpinner message="Verifying Admin Access" />
  </div>

  <!-- Access Denied -->
  <div v-else class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <Shield class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-white mb-2">Access Denied</h2>
      <p class="text-gray-400 mb-4">You need admin privileges to access this page.</p>
      <button
        @click="router.push('/dashboard')"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-enter-from {
    transform: translateX(100%);
  }

  .slide-leave-to {
    transform: translateX(100%);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
