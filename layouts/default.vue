<template>
  <div id="app" class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-yellow-500 shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors">
              ⚔️ Warhammer 40K Escalation League
            </NuxtLink>
          </div>
          <nav class="flex flex-wrap space-x-2 md:space-x-6">
            <NuxtLink 
              v-for="tab in tabs" 
              :key="tab.path"
              :to="tab.path"
              class="px-4 py-2 rounded-lg font-semibold transition-colors"
              active-class="bg-yellow-500 text-gray-900"
              exact-active-class="bg-yellow-500 text-gray-900"
              :class="{
                'text-gray-100 hover:bg-gray-700': $route.path !== tab.path
              }"
            >
              {{ tab.name }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute()

const tabs = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/players', name: 'Players' },
  { path: '/armies', name: 'Army Lists' },
  { path: '/matches', name: 'Matches' },
  { path: '/setup', name: 'League Setup' }
]
</script>
