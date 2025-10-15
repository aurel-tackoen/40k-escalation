<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { LayoutDashboard, Users, Shield, Settings, Trophy, Menu, X, Swords, HeartHandshake } from 'lucide-vue-next'
  import { useAuth } from '~/composables/useAuth'
  import { useAuthStore } from '~/stores/auth'
  import { useLeaguesStore } from '~/stores/leagues'
  import LoginButton from '~/components/LoginButton.vue'
  import UserMenu from '~/components/UserMenu.vue'
  import LeagueSwitcher from '~/components/LeagueSwitcher.vue'

  const { fetchUser } = useAuth()
  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { currentLeague, currentRole } = storeToRefs(leaguesStore)

  // Fetch user and initialize leagues on mount
  onMounted(async () => {
    await fetchUser()
    await leaguesStore.initialize()
  })

  const allTabs = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/players', name: 'Players', icon: Users },
    { path: '/armies', name: 'Army Lists', icon: Shield },
    { path: '/matches', name: 'Matches', icon: Trophy },
    { path: '/leagues', name: 'Leagues', icon: Swords },
    { path: '/setup', name: 'Settings', icon: Settings, requiresRole: ['owner', 'organizer'] }
  ]

  // Filter tabs based on user's role in current league
  const tabs = computed(() => {
    return allTabs.filter(tab => {
      // If tab doesn't require a role, show it
      if (!tab.requiresRole) return true

      // If no current league, hide role-restricted tabs
      if (!currentLeague.value) return false

      // Check if user has required role (use currentRole from store)
      return tab.requiresRole.includes(currentRole.value)
    })
  })

  const isMobileMenuOpen = ref(false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  // Close mobile menu when route changes
  const route = useRoute()
  watch(() => route.path, () => {
    closeMobileMenu()
  })
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Professional Warhammer 40k Header -->
    <header class="relative bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-b-2 border-yellow-600/40 shadow-xl">
      <!-- Subtle Background Pattern (with overflow-hidden only on this layer) -->
      <div class="absolute inset-0 opacity-5 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
      </div>

      <div class="relative container mx-auto px-3 sm:px-6 py-5">
        <div class="flex items-center justify-between gap-3">
          <!-- Professional Title Section -->
          <div class="flex items-center gap-3 flex-1 lg:flex-initial">
            <div class="text-3xl text-yellow-600 transition-colors hover:text-yellow-500">
              <Swords :size="32" :stroke-width="1.5" />
            </div>
            <div class="flex flex-col min-w-0">
              <NuxtLink to="/" class="group">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-100 hover:text-yellow-500 transition-colors duration-300 tracking-wide font-serif">
                  Warhammer 40K
                </h1>
                <!-- Subtle underline -->
              </NuxtLink>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 tracking-wider">
                  ESCALATION LEAGUE
                </span>
                <span class="hidden md:inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Button (only show when authenticated) -->
          <button
            v-if="authStore.isAuthenticated"
            @click="toggleMobileMenu"
            class="lg:hidden p-2 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-yellow-600 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu v-if="!isMobileMenuOpen" :size="24" :stroke-width="2.5" />
            <X v-else :size="24" :stroke-width="2.5" />
          </button>

          <!-- Login Button for Mobile (when logged out) -->
          <div v-else class="lg:hidden">
            <LoginButton />
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex flex-col gap-3 flex-1 justify-end items-end">
            <!-- Auth UI & League Switcher -->
            <div class="flex items-center gap-3">
              <LeagueSwitcher v-if="authStore.isAuthenticated" />
              <UserMenu v-if="authStore.isAuthenticated" />
              <LoginButton />
            </div>

            <!-- Navigation Links (only show when authenticated) -->
            <div v-if="authStore.isAuthenticated" class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tab in tabs"
                :key="tab.path"
                :to="tab.path"
                class="nav-button group relative px-5 py-2.5 font-semibold transition-all duration-300 rounded-md border overflow-hidden"
                active-class="nav-button-active bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 border-yellow-500 shadow-lg shadow-yellow-600/50"
                exact-active-class="nav-button-active bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 border-yellow-500 shadow-lg shadow-yellow-600/50"
                :class="{
                  'text-gray-300 border-gray-700 hover:text-yellow-400 hover:border-yellow-600 hover:bg-gray-700/50 hover:-translate-y-0.5 hover:shadow-lg': $route.path !== tab.path
                }"
              >
                <!-- Animated background gradient (only show on non-active) -->
                <span v-if="$route.path !== tab.path" class="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/20 to-yellow-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></span>

                <!-- Button text with icon -->
                <span class="relative z-10 flex items-center gap-2">
                  <component :is="tab.icon" :size="18" :stroke-width="2.5" />
                  <span>{{ tab.name }}</span>
                </span>

                <!-- Bottom border accent (only show on non-active) -->
                <span v-if="$route.path !== tab.path" class="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 -translate-x-1/2 group-hover:w-full transition-all duration-300 pointer-events-none"></span>
              </NuxtLink>
            </div>
          </nav>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <Transition name="fade">
        <div
          v-if="isMobileMenuOpen"
          @click="closeMobileMenu"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      </Transition>

      <!-- Mobile Menu Slide-out -->
      <Transition name="slide">
        <nav
          v-if="isMobileMenuOpen"
          class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-l-2 border-yellow-600/40 shadow-2xl z-50 lg:hidden overflow-y-auto"
        >
          <!-- Mobile Menu Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div class="flex items-center gap-3">
              <div class="text-2xl text-yellow-600">
                <Swords :size="28" :stroke-width="1.5" />
              </div>
              <h2 class="text-xl font-bold text-gray-100 font-serif">Navigation</h2>
            </div>
            <button
              @click="closeMobileMenu"
              class="p-2 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300"
              aria-label="Close menu"
            >
              <X :size="24" :stroke-width="2.5" />
            </button>
          </div>

          <!-- Mobile Menu Links -->
          <div class="p-4 space-y-2">
            <NuxtLink
              v-for="tab in tabs"
              :key="tab.path"
              :to="tab.path"
              class="mobile-nav-link group relative flex items-center gap-4 px-5 py-4 font-semibold transition-all duration-300 rounded-lg border overflow-hidden"
              active-class="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 border-yellow-500 shadow-lg shadow-yellow-600/30"
              exact-active-class="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 border-yellow-500 shadow-lg shadow-yellow-600/30"
              :class="{
                'text-gray-300 border-gray-700 hover:text-yellow-400 hover:border-yellow-600 hover:bg-gray-700/50 hover:translate-x-1': $route.path !== tab.path
              }"
            >
              <!-- Icon -->
              <component :is="tab.icon" :size="22" :stroke-width="2.5" class="flex-shrink-0" />

              <!-- Link Text -->
              <span class="relative z-10 flex-1">{{ tab.name }}</span>

              <!-- Active Indicator -->
              <div
                v-if="$route.path === tab.path"
                class="w-2 h-2 bg-gray-900 rounded-full"
              ></div>
            </NuxtLink>
          </div>

          <!-- Mobile Menu Footer -->
          <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50 bg-gray-900/50 space-y-4">
            <!-- Auth UI for mobile -->
            <div class="flex justify-center">
              <UserMenu />
              <LoginButton />
            </div>
            <p class="text-sm text-gray-400 text-center">
              Warhammer 40K Escalation League
            </p>
          </div>
        </nav>
      </Transition>

      <!-- Subtle accent line -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent"></div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 py-8">
      <div class="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2025 Manneken Dice <HeartHandshake :size="32" :stroke-width="1.5" /> OpenGraphy</p>
        <p class="mt-2 text-sm">Manage your campaigns with the Emperor's blessing</p>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

/* Professional serif font for the header */
.font-serif {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.02em;
}

/* Custom gray shade for subtle gradient */
.bg-gray-850 {
  background-color: #1a1d23;
}

/* Smooth, professional transitions */
a, button {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile Menu Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Prevent body scroll when mobile menu is open */
body.menu-open {
  overflow: hidden;
}

/* Enhanced nav button hover effects */
.nav-button {
  position: relative;
  transform-style: preserve-3d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-button:hover:not(.nav-button-active) {
  box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.3),
              0 4px 6px -2px rgba(217, 119, 6, 0.2);
}

/* Shine effect on hover */
.nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(251, 191, 36, 0.15),
    transparent);
  transition: left 0.6s ease;
  pointer-events: none;
}

.nav-button:hover:not(.nav-button-active)::before {
  left: 100%;
}

/* Disable hover animations for active buttons */
.nav-button-active {
  transform: none !important;
  cursor: default;
}

.nav-button-active .group-hover\:translate-x-\[100\%\] {
  transform: translateX(-100%) !important;
}

.nav-button-active .group-hover\:w-full {
  width: 0 !important;
}
</style>
