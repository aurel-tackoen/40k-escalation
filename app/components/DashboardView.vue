<script setup>
  import { computed } from 'vue'
  import { Trophy, Users, Shield, Swords, Calendar, Target } from 'lucide-vue-next'
  import PaintingProgress from './PaintingProgress.vue'

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

  // Computed properties
  const currentRound = computed(() => {
    if (!props.league || !props.league.rounds || props.league.rounds.length === 0) {
      return { name: 'N/A', pointLimit: 0 }
    }
    return props.league.rounds.find(r => r.number === props.league.currentRound) || props.league.rounds[0]
  })

  const sortedPlayers = computed(() => {
    return [...props.players].sort((a, b) => {
      // Sort by wins first, then by total points
      if (a.wins !== b.wins) {
        return b.wins - a.wins
      }
      return b.totalPoints - a.totalPoints
    })
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

  // Methods
  const getPlayerName = (playerId) => {
    const player = props.players.find(p => p.id === playerId)
    return player ? player.name : 'Unknown Player'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- League Overview -->
    <div class="card">
      <h2 class="text-3xl font-serif font-bold text-yellow-500">{{ league?.name || 'League' }}</h2>
      <p class="text-gray-300 mb-4">{{ league?.description || '' }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Calendar :size="20" class="text-yellow-500" />
            <h3 class="text-lg font-semibold text-yellow-500">Current Round</h3>
          </div>
          <p class="text-2xl font-bold">{{ currentRound.name }}</p>
          <p class="text-sm text-gray-400">{{ currentRound.pointLimit }} points</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Users :size="20" class="text-yellow-500" />
            <h3 class="text-lg font-semibold text-yellow-500">Players</h3>
          </div>
          <p class="text-2xl font-bold">{{ players.length }}</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Shield :size="20" class="text-yellow-500" />
            <h3 class="text-lg font-semibold text-yellow-500">Army Lists</h3>
          </div>
          <p class="text-2xl font-bold">{{ currentRoundArmies }}</p>
          <p class="text-sm text-gray-400">for current round</p>
        </div>
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Swords :size="20" class="text-yellow-500" />
            <h3 class="text-lg font-semibold text-yellow-500">Matches Played</h3>
          </div>
          <p class="text-2xl font-bold">{{ matches.length }}</p>
        </div>
      </div>
    </div>

    <!-- Two Column Layout for Standings and Painting -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Current Standings -->
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <Trophy :size="24" class="text-yellow-500" />
          <h3 class="text-2xl font-serif font-bold text-yellow-500">Current Standings</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="text-left py-3 px-4 text-yellow-500">Rank</th>
                <th class="text-left py-3 px-4 text-yellow-500">Player</th>
                <th class="text-center py-3 px-4 text-yellow-500">W-L-D</th>
                <th class="text-center py-3 px-4 text-yellow-500">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in sortedPlayers"
                :key="player.id"
                class="border-b border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <td class="py-3 px-4">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-gray-900 font-bold text-sm">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="font-semibold">{{ player.name }}</div>
                  <div class="text-xs text-gray-400">{{ player.faction }}</div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="text-green-400 font-bold">{{ player.wins }}</span>-<span class="text-red-400 font-bold">{{ player.losses }}</span>-<span class="text-yellow-400 font-bold">{{ player.draws }}</span>
                </td>
                <td class="py-3 px-4 text-center text-yellow-500 font-bold text-lg">{{ player.totalPoints }}</td>
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
      <div class="flex items-center gap-2 mb-6">
        <Target :size="24" class="text-yellow-500" />
        <h3 class="text-2xl font-serif font-bold text-yellow-500">Recent Matches</h3>
      </div>
      <div class="space-y-4">
        <div
          v-for="match in recentMatches"
          :key="match.id"
          class="bg-gray-700 p-4 rounded-lg"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-400">{{ formatDate(match.datePlayed) }}</span>
              <span class="text-sm bg-yellow-500 text-gray-900 px-2 py-1 rounded">{{ match.mission }}</span>
            </div>
            <span class="text-sm text-gray-400">Round {{ match.round }}</span>
          </div>
          <div class="mt-2 flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="font-semibold">{{ getPlayerName(match.player1Id) }}</span>
              <span class="text-yellow-500 font-bold">{{ match.player1Points }}</span>
              <span class="text-gray-400">vs</span>
              <span class="text-yellow-500 font-bold">{{ match.player2Points }}</span>
              <span class="font-semibold">{{ getPlayerName(match.player2Id) }}</span>
            </div>
            <div v-if="match.winnerId" class="text-green-400 font-semibold">
              🏆 {{ getPlayerName(match.winnerId) }}
            </div>
            <div v-else class="text-yellow-400 font-semibold">
              🤝 Draw
            </div>
          </div>
          <div v-if="match.notes" class="mt-2 text-sm text-gray-400 italic">
            "{{ match.notes }}"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
