<script setup>
  import { Swords, Trophy, Flame, Trash2, CheckCircle, XCircle, Shield } from 'lucide-vue-next'
  import { computed } from 'vue'

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

  // Determine match type (default to victory_points for backward compatibility)
  const matchType = computed(() => props.match.matchType || 'victory_points')

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
      <!-- Main Battle Display -->
      <div class="bg-gray-800 rounded-lg border border-gray-600 p-4">
        <div class="grid grid-cols-5 items-stretch gap-0">
          <!-- Player 1 (2 columns) -->
          <div class="col-span-2 text-right pr-4">
            <div class="mb-2">
              <div class="flex items-center justify-end gap-2 mb-1">
                <h4 class="font-bold text-sm text-gray-100 truncate">
                  {{ getPlayerName(match.player1Id) }}
                </h4>
                <Trophy v-if="match.winnerId === match.player1Id" :size="14" class="text-green-400 flex-shrink-0" />
              </div>
              <p class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player1Id) }}</p>
            </div>

            <!-- Score Display - Conditional based on match type -->
            <div class="mb-2">
              <!-- Victory Points (40k, AoS, HH) -->
              <template v-if="matchType === 'victory_points'">
                <div class="text-4xl font-black leading-none"
                     :class="match.winnerId === match.player1Id ? 'text-yellow-400' : 'text-gray-500'">
                  {{ match.player1Points }}
                </div>
                <div class="text-[10px] text-gray-400 mt-1">VP</div>
              </template>

              <!-- Percentage (ToW) -->
              <template v-else-if="matchType === 'percentage'">
                <div class="text-2xl font-black leading-none"
                     :class="match.winnerId === match.player1Id ? 'text-yellow-400' : 'text-gray-500'">
                  {{ match.player1CasualtiesValue || 0 }}
                </div>
                <div class="text-[10px] text-gray-400 mt-1">
                  of {{ match.player2ArmyValue || 0 }}pts
                </div>
              </template>

              <!-- Scenario (MESBG) -->
              <template v-else-if="matchType === 'scenario'">
                <div class="flex items-center justify-end gap-1 mb-1">
                  <CheckCircle
                    v-if="match.player1ObjectiveCompleted"
                    :size="24"
                    class="text-green-400"
                  />
                  <XCircle
                    v-else
                    :size="24"
                    class="text-red-400"
                  />
                </div>
                <div class="text-[10px] text-gray-400">
                  {{ match.player1ObjectiveCompleted ? 'Objective ✓' : 'Failed' }}
                </div>
              </template>
            </div>

            <!-- Win Streak -->
            <div v-if="getPlayerStreak && getPlayerStreak(match.player1Id)" class="flex justify-end">
              <div class="inline-flex items-center gap-1 bg-red-900/30 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/50">
                <Flame :size="10" />
                <span>{{ getPlayerStreak(match.player1Id).count }}W</span>
              </div>
            </div>
          </div>

          <!-- VS Divider (1 column) -->
          <div class="col-span-1 flex flex-col items-center justify-center border-x border-gray-600">
            <Swords :size="32" class="text-yellow-500 mb-2" />
            <span class="text-sm font-bold text-gray-400">VS</span>
          </div>

          <!-- Player 2 (2 columns) -->
          <div class="col-span-2 text-left pl-4">
            <div class="mb-2">
              <div class="flex items-center justify-start gap-2 mb-1">
                <Trophy v-if="match.winnerId === match.player2Id" :size="14" class="text-green-400 flex-shrink-0" />
                <h4 class="font-bold text-sm text-gray-100 truncate">
                  {{ getPlayerName(match.player2Id) }}
                </h4>
              </div>
              <p class="text-xs text-gray-400 truncate">{{ getPlayerFaction(match.player2Id) }}</p>
            </div>

            <!-- Score Display - Conditional based on match type -->
            <div class="mb-2">
              <!-- Victory Points (40k, AoS, HH) -->
              <template v-if="matchType === 'victory_points'">
                <div class="text-4xl font-black leading-none"
                     :class="match.winnerId === match.player2Id ? 'text-yellow-400' : 'text-gray-500'">
                  {{ match.player2Points }}
                </div>
                <div class="text-[10px] text-gray-400 mt-1">VP</div>
              </template>

              <!-- Percentage (ToW) -->
              <template v-else-if="matchType === 'percentage'">
                <div class="text-2xl font-black leading-none"
                     :class="match.winnerId === match.player2Id ? 'text-yellow-400' : 'text-gray-500'">
                  {{ match.player2CasualtiesValue || 0 }}
                </div>
                <div class="text-[10px] text-gray-400 mt-1">
                  of {{ match.player1ArmyValue || 0 }}pts
                </div>
              </template>

              <!-- Scenario (MESBG) -->
              <template v-else-if="matchType === 'scenario'">
                <div class="flex items-center justify-start gap-1 mb-1">
                  <CheckCircle
                    v-if="match.player2ObjectiveCompleted"
                    :size="24"
                    class="text-green-400"
                  />
                  <XCircle
                    v-else
                    :size="24"
                    class="text-red-400"
                  />
                </div>
                <div class="text-[10px] text-gray-400">
                  {{ match.player2ObjectiveCompleted ? 'Objective ✓' : 'Failed' }}
                </div>
              </template>
            </div>

            <!-- Win Streak -->
            <div v-if="getPlayerStreak && getPlayerStreak(match.player2Id)" class="flex justify-start">
              <div class="inline-flex items-center gap-1 bg-red-900/30 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/50">
                <Flame :size="10" />
                <span>{{ getPlayerStreak(match.player2Id).count }}W</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: ToW Margin or Notes -->
    <div class="px-4 pb-4">
      <!-- The Old World Margin of Victory -->
      <div v-if="matchType === 'percentage' && match.marginOfVictory" class="mb-3">
        <div class="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div class="flex items-center gap-2">
            <Shield :size="16" class="text-purple-400" />
            <span class="text-sm font-semibold text-purple-300">
              {{ match.marginOfVictory }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="match.notes" class="p-3 bg-gray-800 rounded-lg border border-gray-600">
        <p class="text-xs text-gray-400 italic">
          "{{ match.notes }}"
        </p>
      </div>
    </div>
  </div>
</template>
