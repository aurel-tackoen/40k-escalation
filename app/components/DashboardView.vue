<script setup>
  import { computed, toRef } from 'vue'
  import { Handshake, Trophy, Users, Shield, Swords, Calendar, Medal } from 'lucide-vue-next'
  import PaintingProgress from './PaintingProgress.vue'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { usePlayerStats } from '~/composables/usePlayerStats'

  // Props
  const props = defineProps({
    league: {
      type: Object,
      required: true
    },
    players: {
      type: Array,
      required: true
    },
    matches: {
      type: Array,
      required: true
    },
    armies: {
      type: Array,
      default: () => []
    },
    paintingLeaderboard: {
      type: Array,
      default: () => []
    }
  })

  // Composables
  const { getPlayerName } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()
  const { sortPlayersByStandings } = usePlayerStats()

  // Computed properties
  const currentRound = computed(() => {
    if (!props.league || !props.league.rounds || props.league.rounds.length === 0) {
      return { name: 'N/A', pointLimit: 0 }
    }
    return props.league.rounds.find(r => r.number === props.league.currentRound) || props.league.rounds[0]
  })

  const sortedPlayers = computed(() => {
    return sortPlayersByStandings(props.players)
  })

  const recentMatches = computed(() => {
    return [...props.matches]
      .sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed))
      .slice(0, 5)
  })

  const currentRoundArmies = computed(() => {
    if (!props.league) return 0
    return props.armies.filter(army => army.round === props.league.currentRound).length
  })
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- League Overview -->
    <div class="card">
      <h2 class="text-2xl sm:text-3xl font-serif font-bold text-yellow-500">{{ league?.name || 'League' }}</h2>
      <p class="text-sm sm:text-base text-gray-300 mb-4">{{ league?.description || '' }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Calendar :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500">Current Round</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ currentRound.name }}</p>
          <p class="text-xs sm:text-sm text-gray-400">{{ currentRound.pointLimit }} points</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Users :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500">Players</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ players.length }}</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Shield :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500">Army Lists</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ currentRoundArmies }}</p>
          <p class="text-xs sm:text-sm text-gray-400">for current round</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Swords :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500">Matches Played</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ matches.length }}</p>
        </div>
      </div>
    </div>

    <!-- Two Column Layout for Standings and Painting -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Current Standings -->
      <div class="card overflow-hidden">
        <div class="flex items-center gap-2 mb-4">
          <Medal :size="24" class="text-yellow-500 flex-shrink-0" />
          <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Current Standings</h3>
        </div>
        <div class="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 custom-scrollbar">
          <table class="w-full min-w-[500px] sm:min-w-0">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-yellow-500 text-sm sm:text-base">Rank</th>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-yellow-500 text-sm sm:text-base">Player</th>
                <th class="text-center py-2 sm:py-3 px-2 sm:px-4 text-yellow-500 text-sm sm:text-base">W-L-D</th>
                <th class="text-center py-2 sm:py-3 px-2 sm:px-4 text-yellow-500 text-sm sm:text-base">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in sortedPlayers"
                :key="player.id"
                class="border-b border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <td class="py-2 sm:py-3 px-2 sm:px-4">
                  <span
                    class="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm"
                    :class="[
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-gray-900' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white' :
                      'bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900'
                    ]"
                  >
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-2 sm:py-3 px-2 sm:px-4">
                  <div class="font-semibold text-sm sm:text-base">{{ player.name }}</div>
                  <div class="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{{ player.faction }}</div>
                </td>
                <td class="py-2 sm:py-3 px-2 sm:px-4 text-center text-sm sm:text-base whitespace-nowrap">
                  <span class="text-green-400 font-bold">{{ player.wins }}</span>-<span class="text-red-400 font-bold">{{ player.losses }}</span>-<span class="text-yellow-400 font-bold">{{ player.draws }}</span>
                </td>
                <td class="py-2 sm:py-3 px-2 sm:px-4 text-center text-yellow-500 font-bold text-base sm:text-lg">{{ player.totalPoints }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Painting Leaderboard -->
      <div>
        <PaintingProgress
          :leaderboard="paintingLeaderboard"
          :currentRound="league?.currentRound || 1"
        />
      </div>
    </div>

    <!-- Recent Matches -->
    <div class="card">
      <div class="flex items-center gap-2 mb-4">
        <Trophy :size="24" class="text-yellow-500" />
        <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Recent Matches</h3>
      </div>
      <div class="space-y-4">
        <div
          v-for="match in recentMatches"
          :key="match.id"
          class="bg-gray-700 p-3 sm:p-4 rounded-lg"
        >
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm text-gray-200 font-bold">Round {{ match.round }}</span>
              <span class="text-xs sm:text-sm text-gray-400">{{ formatDate(match.datePlayed) }}</span>
            </div>
            <span class="text-xs sm:text-sm bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900 px-2 py-1 rounded font-semibold whitespace-nowrap">{{ match.mission }}</span>
          </div>
          <div class="mt-3">
            <!-- Match Score - Responsive Design -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <!-- Scoreboard -->
              <div class="sm:hidden bg-gray-800 rounded-lg border border-gray-600 overflow-hidden flex-1 sm:max-w-md">
                <div class="grid grid-cols-[1fr_auto_1fr] items-stretch">
                  <!-- Player 1 -->
                  <div class="p-3 text-right flex flex-col justify-center" :class="match.winnerId === match.player1Id ? 'bg-green-900/20' : ''">
                    <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player1Id) }}</div>
                    <div class="text-yellow-500 font-bold text-2xl">{{ match.player1Points }}</div>
                  </div>

                  <!-- VS Divider -->
                  <div class="px-3 bg-gray-900/50 border-x border-gray-600 flex items-center justify-center">
                    <Swords :size="18" class="text-gray-400" />
                  </div>

                  <!-- Player 2 -->
                  <div class="p-3 text-left flex flex-col justify-center" :class="match.winnerId === match.player2Id ? 'bg-green-900/20' : ''">
                    <div class="font-semibold text-sm mb-1">{{ getPlayerName(match.player2Id) }}</div>
                    <div class="text-yellow-500 font-bold text-2xl">{{ match.player2Points }}</div>
                  </div>
                </div>
              </div>
              <div class="hidden sm:flex items-center justify-start gap-3 sm:gap-4 min-w-0 flex-1">
                <!-- Player 1 -->
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold text-sm sm:text-base truncate">{{ getPlayerName(match.player1Id) }}</span>
                  <span class="text-yellow-500 font-bold text-base sm:text-lg flex-shrink-0">{{ match.player1Points }}</span>
                </div>

                <!-- VS separator -->
                <span class="text-gray-400 text-xs sm:text-sm font-semibold flex-shrink-0 px-1">VS</span>

                <!-- Player 2 -->
                <div class="flex items-center gap-2 min-w-0 flex-1 justify-end sm:justify-start">
                  <span class="text-yellow-500 font-bold text-base sm:text-lg flex-shrink-0">{{ match.player2Points }}</span>
                  <span class="font-semibold text-sm sm:text-base truncate">{{ getPlayerName(match.player2Id) }}</span>
                </div>
              </div>


              <!-- Winner/Draw badge -->
              <div class="flex items-center justify-center sm:justify-end flex-shrink-0">
                <div v-if="match.winnerId" class="text-green-400 font-semibold flex items-center gap-2 text-sm bg-green-900/30 px-4 py-2.5 rounded-lg border border-green-700/50">
                  <Trophy :size="16" class="flex-shrink-0" />
                  <span>{{ getPlayerName(match.winnerId) }} Wins!</span>
                </div>
                <div v-else class="text-yellow-400 font-semibold flex items-center gap-2 text-sm bg-yellow-900/30 px-4 py-2.5 rounded-lg border border-yellow-700/50">
                  <Handshake :size="16" class="flex-shrink-0" />
                  <span>Draw</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="match.notes" class="text-center sm:text-left mt-2 text-xs sm:text-sm text-gray-400 italic">
            "{{ match.notes }}"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
