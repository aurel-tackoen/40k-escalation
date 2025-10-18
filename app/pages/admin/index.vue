<script setup>
  import { ref, onMounted } from 'vue'
  import { Shield, Database, Target, Boxes, Users, Trophy, Swords, Activity, CheckCircle } from 'lucide-vue-next'

  definePageMeta({
    layout: 'admin'
  })

  // Statistics
  const stats = ref({
    gameSystems: 0,
    factions: 0,
    missions: 0,
    unitTypes: 0,
    totalLeagues: 0,
    totalUsers: 0,
    activeLeagues: 0,
    totalMatches: 0
  })

  const systemStatus = ref({
    healthy: true,
    checks: {
      database: { status: 'unknown', message: '' },
      api: { status: 'unknown', message: '' }
    },
    uptime: 0,
    environment: 'Unknown',
    nodeVersion: 'Unknown',
    platform: 'Unknown',
    arch: 'Unknown',
    deployment: 'Unknown',
    memory: {
      total: 0,
      used: 0,
      rss: 0
    }
  })

  const loading = ref(false)
  const error = ref(null)

  // Confirmation modal state
  const showSeedConfirmation = ref(false)

  // Fetch admin statistics
  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      // Fetch all data in parallel
      const [gameSystemsRes, factionsRes, missionsRes, unitTypesRes, leaguesRes, usersRes, matchesRes, statusRes] = await Promise.all([
        $fetch('/api/game-systems').catch(() => ({ data: [] })),
        $fetch('/api/factions').catch(() => ({ data: [] })),
        $fetch('/api/missions').catch(() => ({ data: [] })),
        $fetch('/api/unit-types').catch(() => ({ data: [] })),
        $fetch('/api/leagues/public').catch(() => ({ data: [] })),
        $fetch('/api/admin/users').catch(() => ({ data: [] })),
        $fetch('/api/admin/matches').catch(() => ({ data: { total: 0 } })),
        $fetch('/api/admin/system-status').catch(() => ({ data: { healthy: false, checks: {}, uptime: 0 } }))
      ])

      stats.value = {
        gameSystems: gameSystemsRes?.data?.length || 0,
        factions: factionsRes?.data?.length || 0,
        missions: missionsRes?.data?.length || 0,
        unitTypes: unitTypesRes?.data?.length || 0,
        totalLeagues: leaguesRes?.data?.length || 0,
        totalUsers: usersRes?.data?.length || 0,
        activeLeagues: leaguesRes?.data?.filter(l => !l.endDate || new Date(l.endDate) > new Date()).length || 0,
        totalMatches: matchesRes?.data?.total || 0
      }

      systemStatus.value = statusRes?.data || systemStatus.value
    }
    catch (err) {
      error.value = 'Failed to load statistics'
      console.error('Error fetching admin stats:', err)
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchStats()
  })

  // Format uptime helper
  const formatUptime = (seconds) => {
    if (!seconds) return '—'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Quick action handlers
  const openSeedConfirmation = () => {
    showSeedConfirmation.value = true
  }

  const seedData = async () => {
    showSeedConfirmation.value = false
    loading.value = true
    try {
      await $fetch('/api/admin/seed-game-systems', { method: 'POST' })
      alert('Data seeded successfully!')
      await fetchStats()
    }
    catch (err) {
      alert('Failed to seed data: ' + err.message)
    }
    finally {
      loading.value = false
    }
  }
</script>

<template>
  <!-- Page Title -->
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-white mb-2">System Overview</h2>
    <p class="text-gray-400 text-sm">Monitor platform statistics and manage game data</p>
  </div>

  <!-- Statistics Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Game Content Stats -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Game Systems</h3>
        <Database class="w-5 h-5 text-blue-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.gameSystems }}</p>
      <p class="text-xs text-gray-500 mt-1">Active game systems</p>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Factions</h3>
        <Shield class="w-5 h-5 text-purple-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.factions }}</p>
      <p class="text-xs text-gray-500 mt-1">Across all systems</p>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Missions</h3>
        <Target class="w-5 h-5 text-green-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.missions }}</p>
      <p class="text-xs text-gray-500 mt-1">Available missions</p>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Unit Types</h3>
        <Boxes class="w-5 h-5 text-yellow-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.unitTypes }}</p>
      <p class="text-xs text-gray-500 mt-1">Army building options</p>
    </div>

    <!-- Platform Stats -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Total Users</h3>
        <Users class="w-5 h-5 text-indigo-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.totalUsers }}</p>
      <p class="text-xs text-gray-500 mt-1">Registered players</p>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Leagues</h3>
        <Swords class="w-5 h-5 text-orange-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.totalLeagues }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ stats.activeLeagues }} active</p>
    </div>

    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-400">Matches</h3>
        <Trophy class="w-5 h-5 text-red-400" />
      </div>
      <p class="text-3xl font-bold text-white">{{ stats.totalMatches }}</p>
      <p class="text-xs text-gray-500 mt-1">Games played</p>
    </div>

    <div
      class="rounded-lg p-6"
      :class="systemStatus.healthy
        ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50'
        : 'bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50'"
    >
      <div class="flex items-center justify-between mb-2">
        <h3
          class="text-sm font-medium"
          :class="systemStatus.healthy ? 'text-green-400' : 'text-red-400'"
        >
          System Status
        </h3>
        <CheckCircle
          class="w-5 h-5"
          :class="systemStatus.healthy ? 'text-green-400' : 'text-red-400'"
        />
      </div>
      <p
        class="text-2xl font-bold"
        :class="systemStatus.healthy ? 'text-green-300' : 'text-red-300'"
      >
        {{ systemStatus.healthy ? 'Operational' : 'Degraded' }}
      </p>
      <p
        class="text-xs mt-1"
        :class="systemStatus.healthy ? 'text-green-500' : 'text-red-500'"
      >
        {{ systemStatus.checks.database?.status === 'healthy' ? 'Database connected' : 'Check database connection' }}
      </p>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
    <h3 class="text-xl font-bold text-white mb-4">Quick Actions</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        @click="openSeedConfirmation"
        :disabled="loading"
        class="flex items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors text-left disabled:opacity-50 cursor-pointer"
      >
        <Database class="w-6 h-6 text-blue-400 flex-shrink-0" />
        <div>
          <p class="font-semibold text-white">Seed Game Data</p>
          <p class="text-xs text-gray-400">Import default game systems</p>
        </div>
      </button>

      <NuxtLink
        to="/admin/game-systems"
        class="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors text-left cursor-pointer"
      >
        <Database class="w-6 h-6 text-purple-400 flex-shrink-0" />
        <div>
          <p class="font-semibold text-white">Manage Game Systems</p>
          <p class="text-xs text-gray-400">Add or edit game systems</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/factions"
        class="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors text-left cursor-pointer"
      >
        <Shield class="w-6 h-6 text-green-400 flex-shrink-0" />
        <div>
          <p class="font-semibold text-white">Manage Factions</p>
          <p class="text-xs text-gray-400">Add or edit factions</p>
        </div>
      </NuxtLink>

      <button
        @click="fetchStats"
        :disabled="loading"
        class="flex items-center gap-3 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg transition-colors text-left disabled:opacity-50 cursor-pointer"
      >
        <Activity class="w-6 h-6 text-yellow-400 flex-shrink-0" />
        <div>
          <p class="font-semibold text-white">Refresh Stats</p>
          <p class="text-xs text-gray-400">Update dashboard data</p>
        </div>
      </button>
    </div>
  </div>

  <!-- System Information -->
  <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
    <h3 class="text-xl font-bold text-white mb-4">System Information</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left Column -->
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Database</span>
          <span class="flex items-center gap-2">
            <span class="text-white font-mono">PostgreSQL (Neon)</span>
            <span
              class="px-2 py-0.5 rounded text-xs font-semibold"
              :class="systemStatus.checks.database?.status === 'healthy'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'"
            >
              {{ systemStatus.checks.database?.status || 'unknown' }}
            </span>
          </span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Framework</span>
          <span class="text-white font-mono">Nuxt 4.1.2</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">ORM</span>
          <span class="text-white font-mono">Drizzle 0.44.6</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Node.js</span>
          <span class="text-white font-mono">{{ systemStatus.nodeVersion || 'Unknown' }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-400">Platform</span>
          <span class="text-white font-mono">{{ systemStatus.platform || 'Unknown' }} / {{ systemStatus.arch || 'Unknown' }}</span>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Environment</span>
          <span class="text-white font-mono">{{ systemStatus.environment || 'Unknown' }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Deployment</span>
          <span class="text-white font-mono">{{ systemStatus.deployment || 'Unknown' }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Uptime</span>
          <span class="text-white font-mono">{{ formatUptime(systemStatus.uptime) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
          <span class="text-gray-400">Memory Used</span>
          <span class="text-white font-mono">{{ systemStatus.memory?.used || 0 }} MB / {{ systemStatus.memory?.total || 0 }} MB</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-400">RSS Memory</span>
          <span class="text-white font-mono">{{ systemStatus.memory?.rss || 0 }} MB</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Seed Confirmation Modal -->
  <ConfirmationModal
    :show="showSeedConfirmation"
    title="Seed Game Systems Data"
    message="This will import all default game systems, factions, missions, and unit types. Existing data will be preserved. Are you sure you want to continue?"
    confirm-text="Seed Data"
    cancel-text="Cancel"
    variant="warning"
    @confirm="seedData"
    @cancel="showSeedConfirmation = false"
  />
</template>

