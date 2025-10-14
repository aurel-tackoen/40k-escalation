<script setup>
  import { Users, Calendar, Swords, Globe, Settings, LogOut, Trash2, LogIn } from 'lucide-vue-next'
  import { useFormatting } from '~/composables/useFormatting'

  const props = defineProps({
    league: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'my-league', // 'my-league', 'public', 'public-guest'
      validator: (value) => ['my-league', 'public', 'public-guest'].includes(value)
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['click', 'settings', 'leave', 'delete', 'join'])

  const { formatDate } = useFormatting()

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600 text-yellow-100'
      case 'organizer': return 'bg-blue-600 text-blue-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-400 border border-green-600/40'
      case 'completed': return 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
      default: return 'bg-gray-600/20 text-gray-400 border border-gray-600/40'
    }
  }

  const handleClick = () => {
    if (props.variant === 'my-league') {
      emit('click', props.league.id)
    }
  }

  const handleSettings = (e) => {
    e.stopPropagation()
    emit('settings', props.league.id)
  }

  const handleLeave = (e) => {
    e.stopPropagation()
    emit('leave', props.league.id, props.league.name)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    emit('delete', props.league.id, props.league.name)
  }

  const handleJoin = (e) => {
    e.stopPropagation()
    emit('join', props.league.id)
  }

  const isMyLeague = computed(() => props.variant === 'my-league')
  const isPublic = computed(() => props.variant === 'public')
  const isPublicGuest = computed(() => props.variant === 'public-guest')
  const isFull = computed(() => props.league.maxPlayers && props.league.memberCount >= props.league.maxPlayers)
  const isJoined = computed(() => props.league.isJoined === true)

  const cardClass = computed(() => {
    const base = 'card hover:border transition-all duration-200 group relative'
    const interactive = isMyLeague.value ? 'cursor-pointer' : ''
    const current = props.isCurrent ? 'ring-2 ring-purple-500 border-purple-500' : ''
    const joined = isJoined.value ? 'opacity-75' : ''
    const hoverColor = isMyLeague.value
      ? 'hover:border-purple-500'
      : isPublic.value
        ? 'hover:border-green-500'
        : 'hover:border-yellow-600'

    return `${base} ${interactive} ${current} ${hoverColor} ${joined}`
  })
</script>

<template>
  <div :class="cardClass" @click="handleClick">
    <!-- Current League Badge (My Leagues only) -->
    <div
      v-if="isCurrent"
      class="absolute -top-3 -right-3 bg-purple-600 text-purple-100 px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10"
    >
      ✓ Current
    </div>

    <!-- Public Badge (Public Leagues only) -->
    <div
      v-if="(isPublic || isPublicGuest) && !isJoined"
      class="absolute -top-3 -right-3 bg-green-600 text-green-100 px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-1"
    >
      <Globe :size="14" />
      Public
    </div>

    <!-- Joined Badge (Public Leagues when user is a member) -->
    <div
      v-if="(isPublic || isPublicGuest) && isJoined"
      class="absolute -top-3 -right-3 bg-blue-600 text-blue-100 px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-1"
    >
      ✓ Joined
    </div>

    <!-- League Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3
          class="text-xl font-bold text-gray-100 transition-colors"
          :class="isMyLeague ? 'group-hover:text-purple-400' : isPublic ? 'group-hover:text-green-400' : 'group-hover:text-yellow-400'"
        >
          {{ league.name }}
        </h3>
        <p v-if="league.description" class="text-gray-400 text-sm mt-1 line-clamp-2">
          {{ league.description }}
        </p>
      </div>

      <!-- Role Badge (My Leagues only) -->
      <span
        v-if="isMyLeague && league.role"
        class="px-2 py-1 rounded text-xs font-bold uppercase ml-2"
        :class="getRoleBadgeClass(league.role)"
      >
        {{ league.role }}
      </span>
    </div>

    <!-- League Stats -->
    <div class="space-y-2 mb-4">
      <!-- Member Count -->
      <div class="flex items-center gap-2 text-gray-300 text-sm">
        <Users :size="16" class="text-gray-500" />
        <span>
          {{ league.memberCount || 0 }}
          <template v-if="league.maxPlayers"> / {{ league.maxPlayers }}</template>
          {{ league.maxPlayers ? 'members' : `member${league.memberCount !== 1 ? 's' : ''}` }}
        </span>
      </div>

      <!-- Round Info (My Leagues) -->
      <div v-if="isMyLeague" class="flex items-center gap-2 text-gray-300 text-sm">
        <Calendar :size="16" class="text-gray-500" />
        <span>Round {{ league.currentRound || 1 }} of {{ league.rounds?.length || 0 }}</span>
      </div>

      <!-- Round Info (Public Leagues) -->
      <div v-else class="flex items-center gap-2 text-gray-300 text-sm">
        <Calendar :size="16" class="text-gray-500" />
        <span>Round {{ league.currentRound || 1 }}</span>
      </div>

      <!-- Point Limit (My Leagues) -->
      <div v-if="isMyLeague && league.rounds" class="flex items-center gap-2 text-gray-300 text-sm">
        <Swords :size="16" class="text-gray-500" />
        <span>{{ league.rounds?.[league.currentRound - 1]?.pointLimit || 0 }} points</span>
      </div>

      <!-- Status (Public Leagues) -->
      <div v-if="isPublic || isPublicGuest" class="flex items-center gap-2 text-gray-300 text-sm">
        <Swords :size="16" class="text-gray-500" />
        <span
          class="inline-block px-2 py-1 rounded text-xs font-bold uppercase"
          :class="getStatusBadgeClass(league.status)"
        >
          {{ league.status || 'active' }}
        </span>
      </div>
    </div>

    <!-- League Dates -->
    <div class="text-xs text-gray-500 mb-4">
      <div>Started: {{ formatDate(league.startDate) }}</div>
      <div v-if="league.endDate">Ends: {{ formatDate(league.endDate) }}</div>
      <div v-if="isMyLeague && league.joinedAt">Joined: {{ formatDate(league.joinedAt) }}</div>
    </div>

    <!-- Actions Section -->
    <!-- My Leagues Actions -->
    <div v-if="isMyLeague" class="flex gap-2 mt-4 pt-4 border-t border-gray-700" @click.stop>
      <button
        v-if="league.role === 'owner' || league.role === 'organizer'"
        @click="handleSettings"
        class="btn-secondary text-xs flex items-center gap-1 flex-1"
        title="League Settings"
      >
        <Settings :size="14" />
        Settings
      </button>
      <button
        v-if="league.role !== 'owner'"
        @click="handleLeave"
        class="btn-secondary text-xs flex items-center gap-1 flex-1 hover:bg-red-600 hover:border-red-600"
        title="Leave League"
      >
        <LogOut :size="14" />
        Leave
      </button>
      <button
        v-if="league.role === 'owner'"
        @click="handleDelete"
        class="btn-secondary text-xs flex items-center gap-1 flex-1 hover:bg-red-600 hover:border-red-600"
        title="Delete League"
      >
        <Trash2 :size="14" />
        Delete
      </button>
    </div>

    <!-- Public Leagues Actions (Authenticated) -->
    <button
      v-if="isPublic"
      @click="handleJoin"
      class="btn-primary w-full flex items-center justify-center gap-2 mt-4"
      :disabled="isFull || isJoined"
      :class="{ 'opacity-50 cursor-not-allowed': isFull || isJoined }"
    >
      <LogIn :size="16" />
      <template v-if="isJoined">Already Joined</template>
      <template v-else-if="isFull">League Full</template>
      <template v-else>Join League</template>
    </button>

    <!-- Public Leagues Actions (Guest) -->
    <button
      v-if="isPublicGuest"
      @click="handleJoin"
      class="w-full px-4 py-2 font-semibold rounded-lg transition-all duration-300 text-center mt-4"
      :class="(isFull || isJoined)
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 hover:shadow-lg hover:shadow-yellow-600/50'"
      :disabled="isFull || isJoined"
    >
      <template v-if="isJoined">Already Joined</template>
      <template v-else-if="isFull">League Full</template>
      <template v-else>Join League</template>
    </button>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
