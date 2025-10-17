<script setup>
  import { Swords, Trophy, Handshake, Flame, Trash2 } from 'lucide-vue-next'

  const props = defineProps({
    match: {
      type: Object,
      required: true
    },
    // Player lookup function
    getPlayerName: {
      type: Function,
      required: true
    },
    // Player faction lookup function
    getPlayerFaction: {
      type: Function,
      required: true
    },
    // Date formatting function
    formatDate: {
      type: Function,
      required: true
    },
    // Optional: Get match quality badge
    getMatchQualityBadge: {
      type: Function,
      default: null
    },
    // Optional: Get player win streak
    getPlayerStreak: {
      type: Function,
      default: null
    },
    // Show delete button
    showDelete: {
      type: Boolean,
      default: false
    },
    // Can delete this specific match
    canDelete: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['delete'])

  const handleDelete = () => {
    emit('delete', props.match)
  }
</script>

<template>
  <div class="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden hover:border-yellow-500 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10 flex flex-col h-full">
    <!-- Match Header -->
    <div class="p-4 bg-gray-700 border-b border-gray-600">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          <span class="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
            Round {{ match.round }}
          </span>
          <span class="text-xs text-gray-400">{{ formatDate(match.datePlayed) }}</span>
        </div>
        <button
          v-if="showDelete && canDelete"
          @click="handleDelete"
          class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 p-1.5 rounded transition-colors cursor-pointer"
          title="Delete match"
        >
          <Trash2 :size="16" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 px-2 py-1 rounded font-semibold">
          {{ match.mission }}
        </span>
        <!-- Match Quality Badge -->
        <span
          v-if="getMatchQualityBadge && getMatchQualityBadge(match)"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
          :class="getMatchQualityBadge(match).class"
        >
          <component :is="getMatchQualityBadge(match).icon" :size="12" class="flex-shrink-0" />
          {{ getMatchQualityBadge(match).text }}
        </span>
      </div>
    </div>

    <!-- Scoreboard -->
    <div class="flex-1 p-4">
      <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-center h-full">
        <!-- Player 1 -->
        <div class="bg-gray-800 rounded-lg border border-gray-600 p-3 text-right" :class="match.winnerId === match.player1Id ? 'border-green-500 bg-green-900/10' : ''">
          <div class="mb-2">
            <div class="font-semibold text-base text-gray-100 mb-1">{{ getPlayerName(match.player1Id) }}</div>
            <div class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player1Id) }}</div>
          </div>
          <div class="text-yellow-500 font-bold text-3xl mb-2">{{ match.player1Points }}</div>
          <!-- Win Streak Badge -->
          <div v-if="getPlayerStreak && getPlayerStreak(match.player1Id)" class="inline-flex items-center justify-end gap-1 bg-red-900/30 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/50">
            <Flame :size="12" class="flex-shrink-0" />
            <span>{{ getPlayerStreak(match.player1Id).count }} Win Streak</span>
          </div>
        </div>

        <!-- VS Divider -->
        <div class="flex flex-col items-center justify-center gap-2 px-2">
          <Swords :size="24" class="text-yellow-500 flex-shrink-0" />
          <!-- Winner/Draw badge -->
          <div v-if="match.winnerId" class="text-green-400 font-semibold flex items-center gap-1 text-xs bg-green-900/30 px-2 py-1 rounded border border-green-500/50">
            <Trophy :size="14" class="flex-shrink-0" />
          </div>
          <div v-else class="text-yellow-400 font-semibold flex items-center gap-1 text-xs bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/50">
            <Handshake :size="14" class="flex-shrink-0" />
          </div>
        </div>

        <!-- Player 2 -->
        <div class="bg-gray-800 rounded-lg border border-gray-600 p-3 text-left" :class="match.winnerId === match.player2Id ? 'border-green-500 bg-green-900/10' : ''">
          <div class="mb-2">
            <div class="font-semibold text-base text-gray-100 mb-1">{{ getPlayerName(match.player2Id) }}</div>
            <div class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player2Id) }}</div>
          </div>
          <div class="text-yellow-500 font-bold text-3xl mb-2">{{ match.player2Points }}</div>
          <!-- Win Streak Badge -->
          <div v-if="getPlayerStreak && getPlayerStreak(match.player2Id)" class="inline-flex items-center justify-start gap-1 bg-red-900/30 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/50">
            <Flame :size="12" class="flex-shrink-0" />
            <span>{{ getPlayerStreak(match.player2Id).count }} Win Streak</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: Notes -->
    <div v-if="match.notes" class="px-4 pb-4">
      <div class="p-3 bg-gray-800 rounded-lg border border-gray-600">
        <p class="text-xs text-gray-400 italic">
          "{{ match.notes }}"
        </p>
      </div>
    </div>
  </div>
</template>
