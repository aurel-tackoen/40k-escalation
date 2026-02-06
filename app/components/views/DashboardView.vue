<script setup>
  import { computed, toRef } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Trophy, Users, Shield, Swords, Calendar, Medal, Settings as SettingsIcon } from 'lucide-vue-next'
  import { useLeaguesStore } from '~/stores/leagues'
  import { usePlayerLookup } from '~/composables/usePlayerLookup'
  import { useFormatting } from '~/composables/useFormatting'
  import { usePlayerStats } from '~/composables/usePlayerStats'
  import { useMatchResults } from '~/composables/useMatchResults'
  import { useMarkdown } from '~/composables/useMarkdown'
  import MatchCard from '~/components/MatchCard.vue'

  // Get current game system
  const leaguesStore = useLeaguesStore()
  const { currentGameSystemName } = storeToRefs(leaguesStore)

  // Markdown rendering
  const { renderMarkdown } = useMarkdown()

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
  const currentPhase = computed(() => {
    if (!props.league || !props.league.rounds || props.league.rounds.length === 0) {
      return { name: 'N/A', pointLimit: 0 }
    }
    return props.league.rounds.find(r => r.number === props.league.currentPhase) || props.league.rounds[0]
  })

  const sortedPlayers = computed(() => {
    return sortPlayersByStandings(props.players)
  })

  const recentMatches = computed(() => {
    return [...props.matches]
      .sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed))
      .slice(0, 5)
  })

  const currentPhaseArmies = computed(() => {
    if (!props.league) return 0
    return props.armies.filter(army => army.round === props.league.currentPhase).length
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
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500">Current Phase</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ currentPhase.name }}</p>
          <p class="text-xs sm:text-sm text-gray-400">{{ currentPhase.pointLimit }} points</p>
        </div>
        <NuxtLink
          to="/players"
          class="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 hover:border-yellow-500 border border-gray-600 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-2 mb-2">
            <Users :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500 group-hover:text-yellow-400">Players</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ players.length }}</p>
          <p class="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">Click to manage →</p>
        </NuxtLink>
        <NuxtLink
          to="/armies"
          class="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 hover:border-yellow-500 border border-gray-600 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-2 mb-2">
            <Shield :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500 group-hover:text-yellow-400">Army Lists</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ currentPhaseArmies }}</p>
          <p class="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">for current phase · Click to view →</p>
        </NuxtLink>
        <NuxtLink
          to="/matches"
          class="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 hover:border-yellow-500 border border-gray-600 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-2 mb-2">
            <Swords :size="20" class="text-yellow-500 flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-semibold text-yellow-500 group-hover:text-yellow-400">Matches Played</h3>
          </div>
          <p class="text-xl sm:text-2xl font-bold">{{ matches.length }}</p>
          <p class="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300">Click to record →</p>
        </NuxtLink>
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

        <!-- No players message -->
        <div v-if="sortedPlayers.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No players yet. Invite players to join the league to see standings!
        </div>

        <!-- Standings table -->
        <div v-else class="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 custom-scrollbar">
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
          :currentPhase="league?.currentPhase || 1"
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



    <!-- Rounds Information -->
    <div v-if="league?.rounds && league.rounds.length > 0" class="card">
      <div class="flex items-center gap-2 mb-4">
        <Calendar :size="24" class="text-yellow-500" />
        <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Phases Schedule</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="round in league.rounds"
          :key="round.id"
          class="bg-gray-700 p-4 rounded-lg border-2 transition-all"
          :class="round.number === league.currentPhase ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-600'"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-lg font-bold" :class="round.number === league.currentPhase ? 'text-yellow-500' : 'text-white'">
              {{ round.name }}
            </h4>
            <span
              v-if="round.number === league.currentPhase"
              class="px-2 py-1 text-xs font-bold bg-yellow-500 text-gray-900 rounded"
            >
              ACTIVE
            </span>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <Shield :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="text-gray-300">
                <span class="font-semibold text-yellow-500">{{ round.pointLimit }}</span> points
              </span>
            </div>

            <div v-if="round.startDate" class="flex items-center gap-2">
              <Calendar :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="text-gray-300">
                Start: <span class="font-semibold">{{ formatDate(round.startDate) }}</span>
              </span>
            </div>

            <div v-if="round.endDate" class="flex items-center gap-2">
              <Calendar :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="text-gray-300">
                End: <span class="font-semibold">{{ formatDate(round.endDate) }}</span>
              </span>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-gray-600">
              <Shield :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="text-gray-300">
                <span class="font-semibold">{{ armies.filter(a => a.round === round.number).length }}</span> armies submitted
              </span>
            </div>

            <div class="flex items-center gap-2">
              <Swords :size="16" class="text-gray-400 flex-shrink-0" />
              <span class="text-gray-300">
                <span class="font-semibold">{{ matches.filter(m => m.round === round.number).length }}</span> matches played
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- League Rules -->
    <div v-if="league?.rules" class="card">
      <div class="flex items-center gap-2 mb-4">
        <SettingsIcon :size="24" class="text-yellow-500" />
        <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">League Rules</h3>
      </div>
      <div class="bg-gray-700 p-6 rounded-lg">
        <div class="prose prose-sm sm:prose-base max-w-none" v-html="renderMarkdown(league.rules)"></div>
      </div>
    </div>
  </div>
</template>
