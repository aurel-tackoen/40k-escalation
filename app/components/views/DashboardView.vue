<script setup>
  import { computed, toRef } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Trophy, Users, Shield, Swords, Calendar, Medal, Settings as SettingsIcon } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { usePlayerStats } from '~/composables/usePlayerStats'
  import { useMatchResults } from '~/composables/useMatchResults'
  import MatchCard from '~/components/MatchCard.vue'

  // Get current game system
  const leaguesStore = useLeaguesStore()
  const { currentGameSystemName } = storeToRefs(leaguesStore)

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
  const { getPlayerName, getPlayerFaction } = usePlayerLookup(toRef(props, 'players'))
  const { formatDate } = useFormatting()
  const { sortPlayersByStandings } = usePlayerStats()

  const {
    getWinStreak
  } = useMatchResults(toRef(props, 'matches'))

  // Get match quality badge
  const getMatchQualityBadge = (match) => {
    const pointDiff = Math.abs(match.player1Points - match.player2Points)

    if (pointDiff <= 10) {
      return {
        text: 'Close Game',
        class: 'bg-orange-900/30 text-orange-400 border border-orange-700/50',
        icon: 'Handshake'
      }
    } else if (pointDiff >= 30) {
      return {
        text: 'Decisive Victory',
        class: 'bg-red-900/30 text-red-400 border border-red-700/50',
        icon: 'Trophy'
      }
    }
    return null
  }

  // Get player streak
  const getPlayerStreak = (playerId) => {
    const streak = getWinStreak(playerId, props.matches)
    if (streak >= 2) {
      return { count: streak }
    }
    return null
  }

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
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h2 class="text-2xl sm:text-3xl font-serif font-bold text-yellow-500">{{ league?.name || 'League' }}</h2>
          <p class="text-sm sm:text-base text-gray-300">{{ league?.description || '' }}</p>
        </div>
        <div v-if="currentGameSystemName" class="bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg whitespace-nowrap">
          <p class="text-base text-purple-300 font-semibold">{{ currentGameSystemName }}</p>
        </div>
      </div>
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

      <!-- No matches message -->
      <div v-if="recentMatches.length === 0" class="text-center py-8 text-gray-400">
        <Swords :size="48" class="mx-auto mb-4 text-gray-600" />
        <p class="text-lg mb-2">No matches played yet</p>
        <p class="text-sm mb-4">Start recording matches to see them here!</p>
        <NuxtLink to="/matches" class="btn-primary inline-flex items-center gap-2">
          <Swords :size="18" />
          <span>Record a Match</span>
        </NuxtLink>
      </div>

      <!-- Matches list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MatchCard
          v-for="match in recentMatches"
          :key="match.id"
          :match="match"
          :get-player-name="getPlayerName"
          :get-player-faction="getPlayerFaction"
          :format-date="formatDate"
          :get-match-quality-badge="getMatchQualityBadge"
          :get-player-streak="getPlayerStreak"
          :show-delete="false"
        />
      </div>
    </div>



    <!-- League Rules -->
    <div v-if="league?.rules" class="card">
      <div class="flex items-center gap-2 mb-4">
        <SettingsIcon :size="24" class="text-yellow-500" />
        <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">League Rules</h3>
      </div>
      <div class="bg-gray-700 p-6 rounded-lg">
        <pre class="text-gray-300 whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">{{ league.rules }}</pre>
      </div>
    </div>
  </div>
</template>
