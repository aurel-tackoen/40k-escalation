<script setup>
  import { Brush, TrendingUp, Star } from 'lucide-vue-next'
  import { usePaintingStats } from '~/composables/usePaintingStats'

  defineProps({
    leaderboard: {
      type: Array,
      required: true
    },
    currentPhase: {
      type: Number,
      default: 1
    }
  })

  const { getPaintPercentageColor, getPaintProgressClass } = usePaintingStats()

  // Green color for painted points progress bars
  const getPointsProgressBarClass = () => {
    return 'bg-gradient-to-r from-green-500 to-green-600'
  }
</script>

<template>
  <div class="card">
    <div class="flex items-center gap-2 mb-4">
      <Brush :size="24" class="text-yellow-500" />
      <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">Painting Leaderboard</h3>
    </div>

    <div v-if="leaderboard.length === 0" class="text-center py-8 text-gray-400 text-sm">
      No painting progress tracked yet. Add model counts to your army lists to track painting!
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="(entry, index) in leaderboard"
        :key="entry.playerId"
        class="bg-gray-700 border border-gray-600 rounded-lg p-4 flex items-center gap-4 transition-colors hover:border-yellow-500"
      >
        <div class="flex items-center justify-center min-w-8">
          <span
            class="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
            :class="[
              index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-gray-900' :
              index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-900' :
              index === 2 ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white' :
              'bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-gray-900'
            ]"
          >
            {{ index + 1 }}
          </span>
        </div>

        <div class="min-w-30">
          <div class="font-semibold text-gray-100 text-sm">{{ entry.playerName }}</div>
          <div class="text-xs text-gray-400">{{ entry.faction }}</div>
        </div>

        <div class="flex-1">
          <!-- Models Progress -->
          <div class="mb-3">
            <div class="flex justify-between items-center mb-2 text-xs">
              <span class="text-gray-400 flex items-center gap-1">
                <Brush :size="14" />
                {{ entry.painted }} / {{ entry.totalModels }} models
              </span>
              <span class="font-bold text-sm" :class="getPaintPercentageColor(entry.percentage)">
                {{ entry.percentage }}%
              </span>
            </div>
            <div class="h-2 bg-gray-800 rounded overflow-hidden">
              <div
                class="h-full transition-all duration-500 rounded"
                :style="{ width: entry.percentage + '%' }"
                :class="getPaintProgressClass(entry.percentage)"
              ></div>
            </div>
          </div>

          <!-- Points Progress -->
          <div v-if="entry.totalPoints > 0">
            <div class="flex justify-between items-center mb-2 text-xs">
              <span class="text-gray-400 flex items-center gap-1">
                <TrendingUp :size="14" />
                {{ entry.paintedPoints || 0 }} / {{ entry.totalPoints }} pts
              </span>
              <span class="font-bold text-sm text-green-400">
                {{ entry.pointsPercentage || 0 }}%
              </span>
            </div>
            <div class="h-2 bg-gray-800 rounded overflow-hidden">
              <div
                class="h-full transition-all duration-500 rounded"
                :style="{ width: (entry.pointsPercentage || 0) + '%' }"
                :class="getPointsProgressBarClass()"
              ></div>
            </div>
          </div>

          <div v-if="entry.percentage === 100" class="mt-2 text-purple-400 text-xs font-semibold text-right flex items-center justify-end gap-1">
            <Star :size="14" />
            Fully Painted!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


