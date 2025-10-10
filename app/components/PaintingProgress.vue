<template>
  <div class="painting-leaderboard">
    <h3>🎨 Painting Leaderboard</h3>
    <p class="subtitle">Round {{ currentRound }}</p>
    
    <div v-if="leaderboard.length === 0" class="empty-state">
      No painting progress tracked yet. Add model counts to your army lists to track painting!
    </div>

    <div v-else class="leaderboard-list">
      <div 
        v-for="(entry, index) in leaderboard" 
        :key="entry.playerId"
        class="leaderboard-item"
      >
        <div class="rank-badge">
          <span v-if="index === 0">🥇</span>
          <span v-else-if="index === 1">🥈</span>
          <span v-else-if="index === 2">🥉</span>
          <span v-else class="rank-number">#{{ index + 1 }}</span>
        </div>
        
        <div class="player-info">
          <div class="player-name">{{ entry.playerName }}</div>
          <div class="player-faction">{{ entry.faction }}</div>
        </div>

        <div class="progress-section">
          <div class="progress-stats">
            <span class="models-count">{{ entry.painted }} / {{ entry.totalModels }} models</span>
            <span class="percentage" :class="getPercentageClass(entry.percentage)">
              {{ entry.percentage }}%
            </span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: entry.percentage + '%' }"
              :class="getPercentageClass(entry.percentage)"
            ></div>
          </div>
          <div v-if="entry.percentage === 100" class="fully-painted">
            ✨ Fully Painted!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
  if (percentage === 100) return 'complete'
  if (percentage >= 71) return 'high'
  if (percentage >= 31) return 'medium'
  return 'low'
}
</script>

<style scoped>
.painting-leaderboard {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

h3 {
  margin: 0 0 0.5rem 0;
  color: #fbbf24;
  font-size: 1.25rem;
  font-weight: bold;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.leaderboard-item {
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.2s;
}

.leaderboard-item:hover {
  border-color: #fbbf24;
}

.rank-badge {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.rank-number {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: bold;
}

.player-info {
  min-width: 120px;
}

.player-name {
  font-weight: 600;
  color: #f3f4f6;
  font-size: 0.9rem;
}

.player-faction {
  font-size: 0.75rem;
  color: #9ca3af;
}

.progress-section {
  flex: 1;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.models-count {
  color: #9ca3af;
}

.percentage {
  font-weight: bold;
  font-size: 0.875rem;
}

.percentage.low { color: #ef4444; }
.percentage.medium { color: #f59e0b; }
.percentage.high { color: #10b981; }
.percentage.complete { color: #a78bfa; }

.progress-bar {
  height: 8px;
  background: #1f2937;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 4px;
}

.progress-fill.low {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.high {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.complete {
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

.fully-painted {
  margin-top: 0.5rem;
  color: #a78bfa;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: right;
}
</style>
