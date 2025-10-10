# Integration Example: Adding Painting Progress to Army Lists View

## Quick Integration Guide

### Step 1: Import Components in ArmyListsView.vue

Add these imports at the top of your script section:

```vue
<script setup>
import PaintingProgress from './PaintingProgress.vue'
import PaintingProgressModal from './PaintingProgressModal.vue'
import { ref, computed } from 'vue'
import { useLeagueStore } from '~/stores/league'

const store = useLeagueStore()

// Add these reactive variables
const showPaintingModal = ref(false)
const editingPaintingUnit = ref(null)
const paintingPlayerId = ref(null)
const paintingRound = ref(null)
</script>
```

### Step 2: Add Painting Progress Display to Army Cards

In your army card display section (around line 300-400), add:

```vue
<template>
  <div v-for="army in filteredArmies" :key="army.id" class="card">
    <!-- Existing army display code -->
    
    <div class="army-header">
      <h4>{{ army.name }}</h4>
      <span>{{ army.totalPoints }} points</span>
    </div>
    
    <!-- Add this section for painting progress -->
    <div class="mt-4 pt-4 border-t border-gray-700">
      <PaintingProgress 
        :stats="store.getPaintingStats(army.playerId, army.round)"
        :editable="true"
        @add-unit="openPaintingModal(army.playerId, army.round)"
        @edit-unit="editPaintingUnit"
      />
    </div>
  </div>
  
  <!-- Add the modal at the end of your template -->
  <PaintingProgressModal
    :show="showPaintingModal"
    :playerId="paintingPlayerId"
    :round="paintingRound"
    :editingUnit="editingPaintingUnit"
    @save="handlePaintingSave"
    @delete="handlePaintingDelete"
    @close="closePaintingModal"
  />
</template>
```

### Step 3: Add Handler Methods

Add these methods to your script section:

```javascript
const openPaintingModal = (playerId, round) => {
  paintingPlayerId.value = playerId
  paintingRound.value = round
  editingPaintingUnit.value = null
  showPaintingModal.value = true
}

const editPaintingUnit = (unit) => {
  paintingPlayerId.value = unit.playerId
  paintingRound.value = unit.round
  editingPaintingUnit.value = unit
  showPaintingModal.value = true
}

const handlePaintingSave = async (data) => {
  try {
    await store.updatePaintingProgress(data)
    showPaintingModal.value = false
    editingPaintingUnit.value = null
  } catch (error) {
    alert('Failed to save painting progress: ' + error.message)
  }
}

const handlePaintingDelete = async (data) => {
  try {
    await store.deletePaintingProgress(data.playerId, data.round, data.unitName)
    showPaintingModal.value = false
    editingPaintingUnit.value = null
  } catch (error) {
    alert('Failed to delete painting progress: ' + error.message)
  }
}

const closePaintingModal = () => {
  showPaintingModal.value = false
  editingPaintingUnit.value = null
}
```

## Alternative: Create a Dedicated Painting Page

You can also create a dedicated page for painting progress:

### Create `app/pages/painting.vue`:

```vue
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Painting Progress</h1>
    
    <div class="grid gap-6">
      <!-- Painting Leaderboard -->
      <div class="card">
        <h2 class="text-2xl font-bold mb-4">🏆 Painting Leaderboard</h2>
        <div v-for="entry in store.paintingLeaderboard" :key="entry.playerId" class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <div>
              <span class="font-bold">{{ entry.playerName }}</span>
              <span class="text-gray-400 ml-2">{{ entry.faction }}</span>
            </div>
            <span :class="getPercentageColorClass(entry.paintedPercentage)">
              {{ entry.paintedPercentage }}%
            </span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: entry.paintedPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Player Progress Cards -->
      <div v-for="player in store.players" :key="player.id" class="card">
        <h3 class="text-xl font-bold mb-4">
          {{ player.name }} - {{ player.faction }}
        </h3>
        
        <div v-for="round in rounds" :key="round">
          <h4 class="text-lg font-semibold mb-2">Round {{ round }}</h4>
          <PaintingProgress 
            :stats="store.getPaintingStats(player.id, round)"
            :editable="true"
            @add-unit="openModal(player.id, round)"
            @edit-unit="editUnit"
          />
        </div>
      </div>
    </div>
    
    <PaintingProgressModal
      :show="showModal"
      :playerId="selectedPlayerId"
      :round="selectedRound"
      :editingUnit="editingUnit"
      @save="handleSave"
      @delete="handleDelete"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeagueStore } from '~/stores/league'
import PaintingProgress from '~/components/PaintingProgress.vue'
import PaintingProgressModal from '~/components/PaintingProgressModal.vue'

const store = useLeagueStore()
const showModal = ref(false)
const selectedPlayerId = ref(null)
const selectedRound = ref(null)
const editingUnit = ref(null)

const rounds = [1, 2, 3, 4, 5] // Adjust based on your league

onMounted(async () => {
  await store.fetchAll()
})

const openModal = (playerId, round) => {
  selectedPlayerId.value = playerId
  selectedRound.value = round
  editingUnit.value = null
  showModal.value = true
}

const editUnit = (unit) => {
  selectedPlayerId.value = unit.playerId
  selectedRound.value = unit.round
  editingUnit.value = unit
  showModal.value = true
}

const handleSave = async (data) => {
  await store.updatePaintingProgress(data)
  showModal.value = false
}

const handleDelete = async (data) => {
  await store.deletePaintingProgress(data.playerId, data.round, data.unitName)
  showModal.value = false
}

const closeModal = () => {
  showModal.value = false
  editingUnit.value = null
}

const getPercentageColorClass = (percentage) => {
  if (percentage === 100) return 'text-purple-500'
  if (percentage >= 71) return 'text-green-500'
  if (percentage >= 31) return 'text-yellow-500'
  return 'text-red-500'
}
</script>
```

Then add a navigation link in your layout to access `/painting`.

## Quick Testing

1. Start your dev server: `npm run dev`
2. Navigate to the armies page
3. You should see painting progress sections on each army card
4. Click "Add Unit Progress" to track painting
5. View the progress bars and statistics

## Next: Apply Database Migration

When ready to deploy, run:
```bash
npm run db:migrate
```

This will create the `painting_progress` table in your database.
