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
  <div class="bg-gray-700 p-3 sm:p-4 rounded-lg">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs sm:text-sm text-gray-200 font-bold">Round {{ match.round }}</span>
        <span class="text-xs sm:text-sm text-gray-400">{{ formatDate(match.datePlayed) }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs sm:text-sm bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 px-2 py-1 rounded font-semibold whitespace-nowrap">{{ match.mission }}</span>
        <!-- Match Quality Badge -->
        <span
          v-if="getMatchQualityBadge && getMatchQualityBadge(match)"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap"
          :class="getMatchQualityBadge(match).class"
        >
          <component :is="getMatchQualityBadge(match).icon" :size="12" class="flex-shrink-0" />
          {{ getMatchQualityBadge(match).text }}
        </span>
        <!-- Delete Button -->
        <button
          v-if="showDelete && canDelete"
          @click="handleDelete"
          class="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
          title="Delete match"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <div class="mt-3">
      <!-- Match Score - Responsive Design -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Mobile Scoreboard -->
        <div class="sm:hidden bg-gray-800 rounded-lg border border-gray-600 overflow-hidden flex-1">
          <div class="grid grid-cols-[1fr_auto_1fr] items-stretch">
            <!-- Player 1 -->
            <div class="p-3 text-right flex flex-col justify-center" :class="match.winnerId === match.player1Id ? 'bg-green-900/20' : ''">
              <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player1Id) }}</div>
              <div class="text-xs text-gray-400 mb-2 truncate">{{ getPlayerFaction(match.player1Id) }}</div>
              <div class="text-yellow-500 font-bold text-2xl">{{ match.player1Points }}</div>
              <!-- Win Streak Badge -->
              <div v-if="getPlayerStreak && getPlayerStreak(match.player1Id)" class="mt-2 inline-flex items-center justify-end gap-1 text-red-400 text-xs font-bold">
                <Flame :size="12" class="flex-shrink-0" />
                <span>{{ getPlayerStreak(match.player1Id).count }}W</span>
              </div>
            </div>

            <!-- VS Divider -->
            <div class="px-3 bg-gray-900/50 border-x border-gray-600 flex items-center justify-center">
              <Swords :size="18" class="text-gray-400" />
            </div>

            <!-- Player 2 -->
            <div class="p-3 text-left flex flex-col justify-center" :class="match.winnerId === match.player2Id ? 'bg-green-900/20' : ''">
              <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player2Id) }}</div>
              <div class="text-xs text-gray-400 mb-2 truncate">{{ getPlayerFaction(match.player2Id) }}</div>
              <div class="text-yellow-500 font-bold text-2xl">{{ match.player2Points }}</div>
              <!-- Win Streak Badge -->
              <div v-if="getPlayerStreak && getPlayerStreak(match.player2Id)" class="mt-2 inline-flex items-center justify-start gap-1 text-red-400 text-xs font-bold">
                <Flame :size="12" class="flex-shrink-0" />
                <span>{{ getPlayerStreak(match.player2Id).count }}W</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Scoreboard -->
        <div class="hidden sm:flex items-center justify-between gap-6">
          <!-- Players Container - Centered and Compact -->
          <div class="flex items-center gap-3 bg-gray-800 rounded-lg border border-gray-600 px-4 py-3">
            <!-- Player 1 -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-sm sm:text-base whitespace-nowrap">{{ getPlayerName(match.player1Id) }}</span>
                <span class="text-yellow-500 font-bold text-xl flex-shrink-0">{{ match.player1Points }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ getPlayerFaction(match.player1Id) }}</span>
                <!-- Win Streak Badge -->
                <span v-if="getPlayerStreak && getPlayerStreak(match.player1Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold flex-shrink-0">
                  <Flame :size="12" class="flex-shrink-0" />
                  {{ getPlayerStreak(match.player1Id).count }}W
                </span>
              </div>
            </div>

            <!-- VS separator -->
            <div class="flex items-center justify-center px-3">
              <Swords :size="20" class="text-gray-400" />
            </div>

            <!-- Player 2 -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-yellow-500 font-bold text-xl flex-shrink-0">{{ match.player2Points }}</span>
                <span class="font-semibold text-sm sm:text-base whitespace-nowrap">{{ getPlayerName(match.player2Id) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <!-- Win Streak Badge -->
                <span v-if="getPlayerStreak && getPlayerStreak(match.player2Id)" class="inline-flex items-center gap-1 text-red-400 text-xs font-bold flex-shrink-0">
                  <Flame :size="12" class="flex-shrink-0" />
                  {{ getPlayerStreak(match.player2Id).count }}W
                </span>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ getPlayerFaction(match.player2Id) }}</span>
              </div>
            </div>
          </div>

          <!-- Winner/Draw badge -->
          <div class="flex items-center flex-shrink-0">
            <div v-if="match.winnerId" class="text-green-400 font-semibold flex items-center gap-2 text-sm bg-green-900/30 px-4 py-2.5 rounded-lg border border-green-700/50 whitespace-nowrap">
              <Trophy :size="16" class="flex-shrink-0" />
              <span>{{ getPlayerName(match.winnerId) }} Wins!</span>
            </div>
            <div v-else class="text-yellow-400 font-semibold flex items-center gap-2 text-sm bg-yellow-900/30 px-4 py-2.5 rounded-lg border border-yellow-700/50 whitespace-nowrap">
              <Handshake :size="16" class="flex-shrink-0" />
              <span>Draw</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="match.notes" class="text-center sm:text-left mt-2 text-xs sm:text-sm text-gray-400 italic">
      "{{ match.notes }}"
    </div>
  </div>
</template>
