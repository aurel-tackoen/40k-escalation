<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <h2>{{ editingUnit ? 'Edit' : 'Add' }} Painting Progress</h2>
      
      <form @submit.prevent="save">
        <div class="form-group">
          <label for="unitName">Unit Name</label>
          <input
            id="unitName"
            v-model="formData.unitName"
            type="text"
            required
            placeholder="e.g., Intercessors Squad"
            :disabled="editingUnit !== null"
          />
        </div>

        <div class="form-group">
          <label for="points">Unit Points</label>
          <input
            id="points"
            v-model.number="formData.points"
            type="number"
            required
            min="1"
            placeholder="e.g., 100"
          />
        </div>

        <div class="form-group">
          <label for="totalModels">Total Models</label>
          <input
            id="totalModels"
            v-model.number="formData.totalModels"
            type="number"
            required
            min="1"
            placeholder="e.g., 10"
          />
        </div>

        <div class="form-group">
          <label for="paintedModels">Painted Models</label>
          <input
            id="paintedModels"
            v-model.number="formData.paintedModels"
            type="number"
            required
            min="0"
            :max="formData.totalModels"
            placeholder="e.g., 7"
          />
        </div>

        <div v-if="formData.totalModels > 0" class="preview">
          <div class="preview-label">Progress Preview</div>
          <div class="preview-stats">
            {{ formData.paintedModels }} / {{ formData.totalModels }} models
            ({{ getPercentage() }}%)
          </div>
          <div class="preview-bar">
            <div 
              class="preview-fill" 
              :style="{ width: getPercentage() + '%' }"
              :class="getPercentageClass()"
            ></div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="close" class="btn-cancel">
            Cancel
          </button>
          <button 
            v-if="editingUnit" 
            type="button" 
            @click="deleteUnit" 
            class="btn-delete"
          >
            Delete
          </button>
          <button type="submit" class="btn-save">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerId: {
    type: Number,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  editingUnit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const formData = ref({
  unitName: '',
  points: null,
  totalModels: null,
  paintedModels: 0
})

watch(() => props.editingUnit, (unit) => {
  if (unit) {
    formData.value = {
      unitName: unit.unitName,
      points: unit.points,
      totalModels: unit.totalModels,
      paintedModels: unit.paintedModels
    }
  } else {
    formData.value = {
      unitName: '',
      points: null,
      totalModels: null,
      paintedModels: 0
    }
  }
}, { immediate: true })

const getPercentage = () => {
  if (!formData.value.totalModels) return 0
  return Math.round((formData.value.paintedModels / formData.value.totalModels) * 100)
}

const getPercentageClass = () => {
  const percentage = getPercentage()
  if (percentage === 100) return 'complete'
  if (percentage >= 71) return 'high'
  if (percentage >= 31) return 'medium'
  return 'low'
}

const save = () => {
  if (formData.value.paintedModels > formData.value.totalModels) {
    alert('Painted models cannot exceed total models!')
    return
  }

  emit('save', {
    playerId: props.playerId,
    round: props.round,
    ...formData.value
  })
}

const deleteUnit = () => {
  if (confirm(`Delete painting progress for ${formData.value.unitName}?`)) {
    emit('delete', {
      playerId: props.playerId,
      round: props.round,
      unitName: formData.value.unitName
    })
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.preview {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
}

.preview-stats {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.preview-bar {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.preview-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 12px;
}

.preview-fill.low {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.preview-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.preview-fill.high {
  background: linear-gradient(90deg, #10b981, #059669);
}

.preview-fill.complete {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-delete {
  background: #ef4444;
  color: white;
  margin-right: auto;
}

.btn-delete:hover {
  background: #dc2626;
}

.btn-save {
  background: #3b82f6;
  color: white;
}

.btn-save:hover {
  background: #2563eb;
}
</style>
