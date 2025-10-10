<script setup>
  import { LayoutDashboard, Users, Shield, Swords, Settings } from 'lucide-vue-next'

  const tabs = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/players', name: 'Players', icon: Users },
    { path: '/armies', name: 'Army Lists', icon: Shield },
    { path: '/matches', name: 'Matches', icon: Swords },
    { path: '/setup', name: 'League Setup', icon: Settings }
  ]
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Professional Warhammer 40k Header -->
    <header class="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-b-2 border-yellow-600/40 shadow-xl">
      <!-- Subtle Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
      </div>

      <div class="relative container mx-auto px-6 py-5">
        <div class="flex items-center justify-between flex-wrap gap-6">
          <!-- Professional Title Section -->
          <div class="flex items-center space-x-4 gap-4">
            <div class="text-3xl text-yellow-600 transition-colors hover:text-yellow-500">⚔️</div>
            <div class="flex flex-col">
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

          <!-- Clean Navigation -->
          <nav class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="tab in tabs"
              :key="tab.path"
              :to="tab.path"
              class="nav-button group relative px-5 py-2.5 font-semibold transition-all duration-300 rounded-md border overflow-hidden"
              active-class="nav-button-active bg-yellow-600 text-gray-900 border-yellow-600 shadow-lg shadow-yellow-600/50"
              exact-active-class="nav-button-active bg-yellow-600 text-gray-900 border-yellow-600 shadow-lg shadow-yellow-600/50"
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
          </nav>
        </div>
      </div>

      <!-- Subtle accent line -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent"></div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
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
