# Composables

This folder contains reusable Vue 3 composition functions (composables) for the Warhammer 40k Escalation League Manager application.

## Available Composables

### `usePaintingStats`

A composable for calculating and displaying painting progress statistics across armies, units, and players.

#### Features

- Calculate painting percentages for individual units
- Calculate army-wide painting statistics
- Get player painting statistics for specific rounds
- Provide consistent color-coded styling for progress bars and text
- Reusable across multiple components

#### Usage

```vue
<script setup>
import { usePaintingStats } from '~/composables/usePaintingStats'

const {
  getUnitPaintPercentage,
  getArmyPaintingStats,
  getPlayerPaintingStats,
  getPaintProgressClass,
  getPaintPercentageColor
} = usePaintingStats()

// In your component logic
const army = { units: [...] }
const stats = getArmyPaintingStats(army)
console.log(stats) // { totalModels: 45, painted: 30, percentage: 67 }
</script>

<template>
  <div>
    <div 
      class="progress-bar" 
      :class="getPaintProgressClass(stats.percentage)"
      :style="{ width: stats.percentage + '%' }"
    />
    <span :class="getPaintPercentageColor(stats.percentage)">
      {{ stats.percentage }}%
    </span>
  </div>
</template>
```

#### API Reference

##### `getUnitPaintPercentage(unit)`

Calculate painting percentage for a single unit.

**Parameters:**
- `unit` (Object): Unit object with `totalModels` and `paintedModels` properties

**Returns:** `number` - Percentage (0-100) of painted models

**Example:**
```js
const unit = { totalModels: 10, paintedModels: 7 }
const percentage = getUnitPaintPercentage(unit) // 70
```

---

##### `getArmyPaintingStats(army)`

Calculate painting statistics for an entire army.

**Parameters:**
- `army` (Object): Army object with `units` array

**Returns:** `Object` with properties:
- `totalModels` (number): Total number of models in the army
- `painted` (number): Number of painted models
- `percentage` (number): Painting completion percentage (0-100)

**Example:**
```js
const army = {
  units: [
    { totalModels: 10, paintedModels: 10 },
    { totalModels: 5, paintedModels: 3 }
  ]
}
const stats = getArmyPaintingStats(army)
// { totalModels: 15, painted: 13, percentage: 87 }
```

---

##### `getPlayerPaintingStats(playerId, currentRound, armies)`

Calculate painting statistics for a player's army in a specific round.

**Parameters:**
- `playerId` (number|string): ID of the player
- `currentRound` (number): Round number to check
- `armies` (Array): Array of all army objects

**Returns:** `Object` - Same format as `getArmyPaintingStats`

**Example:**
```js
const stats = getPlayerPaintingStats(1, 2, armies)
// { totalModels: 30, painted: 22, percentage: 73 }
```

---

##### `getPaintProgressClass(percentage)`

Get Tailwind CSS gradient class for progress bars based on completion percentage.

**Parameters:**
- `percentage` (number): Completion percentage (0-100)

**Returns:** `string` - Tailwind CSS class name

**Color Scheme:**
- 🟣 **100%**: Purple gradient (fully painted)
- 🟢 **71-99%**: Green gradient (well painted)
- 🟡 **31-70%**: Yellow gradient (work in progress)
- 🔴 **0-30%**: Red gradient (needs work)

**Example:**
```js
getPaintProgressClass(100) // 'bg-gradient-to-r from-purple-500 to-purple-600'
getPaintProgressClass(85)  // 'bg-gradient-to-r from-green-500 to-green-600'
getPaintProgressClass(50)  // 'bg-gradient-to-r from-yellow-500 to-yellow-600'
getPaintProgressClass(20)  // 'bg-gradient-to-r from-red-500 to-red-600'
```

---

##### `getPaintPercentageColor(percentage)`

Get Tailwind CSS text color class based on completion percentage.

**Parameters:**
- `percentage` (number): Completion percentage (0-100)

**Returns:** `string` - Tailwind CSS class name

**Color Scheme:**
- 🟣 **100%**: Purple text (fully painted)
- 🟢 **71-99%**: Green text (well painted)
- 🟡 **31-70%**: Yellow text (work in progress)
- 🔴 **0-30%**: Red text (needs work)

**Example:**
```js
getPaintPercentageColor(100) // 'text-purple-400'
getPaintPercentageColor(85)  // 'text-green-400'
getPaintPercentageColor(50)  // 'text-yellow-400'
getPaintPercentageColor(20)  // 'text-red-400'
```

---

#### Components Using This Composable

- **PlayersView.vue** - Displays player painting progress for current round
- **ArmyListsView.vue** - Shows unit and army painting statistics

#### Data Structure Requirements

For this composable to work correctly, your data should follow this structure:

```js
// Unit structure
{
  id: 1,
  name: "Tactical Squad",
  totalModels: 10,
  paintedModels: 7
}

// Army structure
{
  id: 1,
  playerId: 1,
  round: 1,
  units: [
    { totalModels: 10, paintedModels: 10 },
    { totalModels: 5, paintedModels: 3 }
  ]
}
```

#### Best Practices

1. **Always validate data**: The composable handles null/undefined values gracefully
2. **Use in computed properties**: For reactive updates when data changes
3. **Cache results**: If calling multiple times with same data, store the result
4. **Consistent styling**: Always use the color functions together for cohesive UI

#### Example: Complete Component

```vue
<script setup>
import { computed } from 'vue'
import { usePaintingStats } from '~/composables/usePaintingStats'

const props = defineProps({
  army: Object
})

const {
  getArmyPaintingStats,
  getPaintProgressClass,
  getPaintPercentageColor
} = usePaintingStats()

const stats = computed(() => getArmyPaintingStats(props.army))
</script>

<template>
  <div v-if="stats.totalModels > 0" class="painting-progress">
    <div class="flex justify-between mb-2">
      <span class="text-sm text-gray-400">Painting Progress</span>
      <span 
        class="text-sm font-bold"
        :class="getPaintPercentageColor(stats.percentage)"
      >
        {{ stats.percentage }}%
      </span>
    </div>
    
    <div class="h-3 bg-gray-600 rounded-full overflow-hidden">
      <div
        class="h-full transition-all duration-500"
        :class="getPaintProgressClass(stats.percentage)"
        :style="{ width: stats.percentage + '%' }"
      />
    </div>
    
    <div class="flex justify-between text-xs text-gray-400 mt-1">
      <span>{{ stats.painted }} / {{ stats.totalModels }} models</span>
      <span v-if="stats.percentage === 100" class="text-purple-400">
        ✨ Fully Painted!
      </span>
    </div>
  </div>
</template>
```
