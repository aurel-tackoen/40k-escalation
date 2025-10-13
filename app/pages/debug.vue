<script setup>
  import { ref, onMounted } from 'vue'
  import { useAuth } from '~/composables/useAuth'

  const { user, isAuthenticated, isLoading, forceClose } = useAuth()
  const widgetState = ref('Unknown')
  const widgetClasses = ref([])

  const checkWidget = () => {
    const widget = document.querySelector('.netlify-identity-widget')
    if (widget) {
      widgetState.value = widget.classList.contains('netlify-identity-open') ? 'OPEN ⚠️' : 'CLOSED ✅'
      widgetClasses.value = Array.from(widget.classList)
    } else {
      widgetState.value = 'Not Found'
      widgetClasses.value = []
    }
  }

  const handleForceClose = () => {
    forceClose()
    setTimeout(checkWidget, 100)
  }

  const emergencyFix = () => {
    // Nuclear option - manually destroy the widget
    const widget = document.querySelector('.netlify-identity-widget')
    if (widget) {
      widget.remove()
      widgetState.value = 'REMOVED ✅'
      alert('Widget removed! Refresh page and it should work.')
    } else {
      alert('No widget found - page should be clickable now!')
    }
  }

  const refreshPage = () => {
    window.location.reload()
  }

  onMounted(() => {
    checkWidget()
    // Auto-check every 2 seconds
    setInterval(checkWidget, 2000)
  })
</script>

<template>
  <div class="max-w-4xl mx-auto" style="position: relative; z-index: 99999;">
    <div class="card">
      <h1 class="text-3xl font-bold text-amber-500 mb-6">🔍 Authentication Debug</h1>

      <div class="space-y-6">
        <!-- Auth State -->
        <div class="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 class="text-xl font-bold text-amber-500 mb-3">Auth State</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Loading:</span>
              <span :class="isLoading ? 'text-yellow-400' : 'text-green-400'">
                {{ isLoading ? '⏳ Yes' : '✅ No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Authenticated:</span>
              <span :class="isAuthenticated ? 'text-green-400' : 'text-red-400'">
                {{ isAuthenticated ? '✅ Yes' : '❌ No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">User Email:</span>
              <span class="text-white font-mono">{{ user?.email || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Widget State -->
        <div class="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 class="text-xl font-bold text-amber-500 mb-3">Widget State</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Widget Status:</span>
              <span class="text-white font-bold">{{ widgetState }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-gray-400">Widget Classes:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="cls in widgetClasses"
                  :key="cls"
                  class="px-2 py-1 bg-gray-700 rounded text-xs font-mono"
                  :class="cls.includes('open') ? 'text-red-400' : 'text-green-400'"
                >
                  {{ cls }}
                </span>
                <span v-if="widgetClasses.length === 0" class="text-gray-500">None</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 class="text-xl font-bold text-amber-500 mb-3">Actions</h2>
          <div class="flex flex-wrap gap-3">
            <button
              @click="handleForceClose"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
              style="z-index: 99999 !important; position: relative;"
            >
              🔒 Force Close Widget
            </button>
            <button
              @click="emergencyFix"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
              style="z-index: 99999 !important; position: relative;"
            >
              💥 EMERGENCY: Delete Widget
            </button>
            <button
              @click="checkWidget"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              style="z-index: 99999 !important; position: relative;"
            >
              🔄 Check Widget State
            </button>
            <button
              @click="refreshPage"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              style="z-index: 99999 !important; position: relative;"
            >
              🔄 Refresh Page
            </button>
            <NuxtLink
              to="/dashboard"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors inline-block"
              style="z-index: 99999 !important; position: relative;"
            >
              ← Back to Dashboard
            </NuxtLink>
          </div>
        </div>

        <!-- Instructions -->
        <div class="p-4 bg-amber-900/20 rounded-lg border border-amber-700">
          <h2 class="text-xl font-bold text-amber-500 mb-3">📋 Instructions</h2>
          <ul class="space-y-2 text-sm text-gray-300">
            <li class="font-bold text-red-400">• If you CANNOT CLICK anything: Press "EMERGENCY: Delete Widget" button</li>
            <li>• If Widget Status shows "OPEN ⚠️", click "Force Close Widget"</li>
            <li>• After emergency fix, click "Refresh Page" to reload</li>
            <li>• The widget state is auto-checked every 2 seconds</li>
            <li>• If authenticated, you should see your email above</li>
            <li>• Green indicators = good, Red/Yellow = potential issues</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: rgb(17 24 39);
  border: 1px solid rgb(55 65 81);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
</style>
