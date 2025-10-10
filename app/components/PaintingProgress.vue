<template>
  <div class="painting-progress">
    <h3>Painting Progress</h3>
    
    <div v-if="stats" class="progress-summary">
      <div class="stat-card">
        <div class="stat-label">Models Painted</div>
        <div class="stat-value">{{ stats.paintedModels }} / {{ stats.totalModels }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Completion</div>
        <div class="stat-value">
          <span :class="getPercentageClass(stats.paintedPercentage)">
            {{ stats.paintedPercentage }}%
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Painted Points</div>
        <div class="stat-value">{{ stats.paintedPoints }} / {{ stats.totalPoints }}</div>
      </div>
      
      <div v-if="stats.isFullyPainted" class="fully-painted-badge">
        🎨 Fully Painted!
      </div>
    </div>

    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: stats?.paintedPercentage + '%' }"
        :class="getPercentageClass(stats?.paintedPercentage || 0)"
      ></div>
    </div>

    <div v-if="stats?.units && stats.units.length > 0" class="units-list">
      <h4>Unit Details</h4>
      <div v-for="unit in stats.units" :key="unit.unitName" class="unit-item">
        <div class="unit-header">
          <span class="unit-name">{{ unit.unitName }}</span>
          <span class="unit-points">{{ unit.points }} pts</span>
        </div>
        <div class="unit-progress">
          <span class="models-count">
            {{ unit.paintedModels }} / {{ unit.totalModels }} models
          </span>
          <div class="unit-progress-bar">
            <div 
              class="unit-progress-fill" 
              :style="{ width: getUnitPercentage(unit) + '%' }"
              :class="getPercentageClass(getUnitPercentage(unit))"
            ></div>
          </div>
        </div>
        <button 
          v-if="editable" 
          @click="$emit('edit-unit', unit)"
          class="edit-btn"
        >
          Edit
        </button>
      </div>
    </div>

    <button 
      v-if="editable && !stats?.units?.length" 
      @click="$emit('add-unit')"
      class="add-unit-btn"
    >
      + Add Unit Progress
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    default: null
  },
  editable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit-unit', 'add-unit'])

const getUnitPercentage = (unit) => {
  if (!unit.totalModels) return 0
  return Math.round((unit.paintedModels / unit.totalModels) * 100)
}

const getPercentageClass = (percentage) => {
  if (percentage === 100) return 'complete'
  if (percentage >= 71) return 'high'
  if (percentage >= 31) return 'medium'
  return 'low'
}
</script>

<style scoped>
.painting-progress {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 1rem 0;
}

h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.progress-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.fully-painted-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 1.125rem;
  grid-column: 1 / -1;
}

.progress-bar {
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 15px;
}

.progress-fill.low,
.unit-progress-fill.low {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-fill.medium,
.unit-progress-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.high,
.unit-progress-fill.high {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.complete,
.unit-progress-fill.complete {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.stat-value .low { color: #ef4444; }
.stat-value .medium { color: #f59e0b; }
.stat-value .high { color: #10b981; }
.stat-value .complete { color: #8b5cf6; }

.units-list {
  margin-top: 1.5rem;
}

.units-list h4 {
  margin: 0 0 1rem 0;
  color: #555;
}

.unit-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.unit-name {
  font-weight: 600;
  color: #333;
}

.unit-points {
  color: #666;
  font-size: 0.875rem;
}

.unit-progress {
  margin-bottom: 0.5rem;
}

.models-count {
  font-size: 0.875rem;
  color: #666;
  display: block;
  margin-bottom: 0.25rem;
}

.unit-progress-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.unit-progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.edit-btn,
.add-unit-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.edit-btn:hover,
.add-unit-btn:hover {
  background: #2563eb;
}

.add-unit-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  background: #10b981;
}

.add-unit-btn:hover {
  background: #059669;
}
</style>
