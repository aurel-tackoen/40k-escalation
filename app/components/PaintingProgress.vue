<script setup>
  defineProps({
    leaderboard: {
      type: Array,
      required: true
    },
    currentRound: {
      type: Number,
      default: 1
    }
  })

  const getPercentageClass = (percentage) => {
    if (percentage === 100) return 'text-purple-400'
    if (percentage >= 71) return 'text-green-400'
    if (percentage >= 31) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getProgressBarClass = (percentage) => {
    if (percentage === 100) return 'bg-gradient-to-r from-purple-500 to-purple-600'
    if (percentage >= 71) return 'bg-gradient-to-r from-green-500 to-green-600'
    if (percentage >= 31) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }
</script>

<template>
  <div class="bg-gray-800 border border-gray-600 rounded-lg p-6">
    <h3 class="text-2xl font-serif font-bold text-yellow-500 mb-2">Painting Leaderboard</h3>
    <p class="text-gray-400 text-sm mb-4 m-0">Round {{ currentRound }}</p>

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
          <div class="flex justify-between items-center mb-2 text-xs">
            <span class="text-gray-400">{{ entry.painted }} / {{ entry.totalModels }} models</span>
            <span class="font-bold text-sm" :class="getPercentageClass(entry.percentage)">
              {{ entry.percentage }}%
            </span>
          </div>
          <div class="h-2 bg-gray-800 rounded overflow-hidden">
            <div
              class="h-full transition-all duration-500 rounded"
              :style="{ width: entry.percentage + '%' }"
              :class="getProgressBarClass(entry.percentage)"
            ></div>
          </div>
          <div v-if="entry.percentage === 100" class="mt-2 text-purple-400 text-xs font-semibold text-right">
            ✨ Fully Painted!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


