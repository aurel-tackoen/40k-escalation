# Integration Example: Showing Painting Progress (Model Counts)

## Overview
Painting progress is tracked directly on your army lists by storing model counts per unit:
- `units[].totalModels`
- `units[].paintedModels`

The league store calculates a **painting leaderboard for the current phase** from the current phase armies.

## Option A: Use the Existing Dashboard Implementation
The dashboard already renders the leaderboard via the store getter and the `PaintingProgress` component.

Reference implementation:
- Component usage: `PaintingProgress` in `DashboardView.vue`
- Data source: `useLeaguesStore().paintingLeaderboard`

## Option B: Add the Leaderboard to Another View

### Step 1: Import what you need
```vue
<script setup>
import { computed } from 'vue'
import { useLeaguesStore } from '~/stores/leagues'
import PaintingProgress from '~/components/PaintingProgress.vue'

const leaguesStore = useLeaguesStore()

const league = computed(() => leaguesStore.currentLeague)
const paintingLeaderboard = computed(() => leaguesStore.paintingLeaderboard)
const currentPhase = computed(() => league.value?.currentPhase || 1)
</script>
```

### Step 2: Render the component
```vue
<template>
  <PaintingProgress
    :leaderboard="paintingLeaderboard"
    :currentPhase="currentPhase"
  />
</template>
```

## How players update painting progress
There is no separate painting API or modal. Players update progress by editing their army list units for the current phase and setting:
- total models in the unit
- painted models in the unit

The leaderboard will reflect those values automatically.
