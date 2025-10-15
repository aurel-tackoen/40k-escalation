# useGameSystems Composable - Quick Reference

> **Purpose**: Centralized game system utilities for name lookups, badge styling, and display logic
> **File**: `app/composables/useGameSystems.js`
> **Status**: ✅ Production Ready

## Overview

The `useGameSystems` composable provides a single source of truth for all game system-related operations, eliminating code duplication across components and ensuring consistent styling for game system badges and hints.

## Usage Pattern

```javascript
import { useGameSystems } from '~/composables/useGameSystems'
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const { gameSystems } = storeToRefs(leaguesStore)

// Initialize composable
const { 
  getGameSystemName, 
  getGameSystemBadgeClasses, 
  getGameSystemTextClasses 
} = useGameSystems(gameSystems)

// Use in computed
const gameSystemName = computed(() => {
  return getGameSystemName(league.gameSystemId)
})
```

## Functions

### 1. `getGameSystemName(gameSystemId)`
Get game system name by ID (prefers shortName)

**Parameters:**
- `gameSystemId` (number) - Game system ID

**Returns:** 
- `string | null` - Game system short name ("40k", "aos") or full name, null if not found

**Example:**
```javascript
const name = getGameSystemName(1) // "40k"
const name = getGameSystemName(999) // null
```

---

### 2. `getGameSystemNameWithFallback(gameSystemId)`
Get game system name with 'Unknown' fallback

**Parameters:**
- `gameSystemId` (number) - Game system ID

**Returns:** 
- `string` - Game system name or "Unknown"

**Example:**
```javascript
const name = getGameSystemNameWithFallback(1) // "40k"
const name = getGameSystemNameWithFallback(999) // "Unknown"
```

---

### 3. `getGameSystemById(gameSystemId)`
Get full game system object

**Parameters:**
- `gameSystemId` (number) - Game system ID

**Returns:** 
- `Object | null` - Full game system object with id, name, shortName, etc.

**Example:**
```javascript
const system = getGameSystemById(1)
// { id: 1, name: "Warhammer 40,000", shortName: "40k", isActive: true }
```

---

### 4. `hasGameSystems()`
Check if game systems are loaded

**Returns:** 
- `boolean` - True if game systems array has items

**Example:**
```javascript
if (hasGameSystems()) {
  // Proceed with rendering
}
```

---

### 5. `getGameSystemBadgeClasses()`
Get CSS classes for game system badge (purple theme)

**Returns:** 
- `string` - Tailwind CSS classes

**Example:**
```vue
<div v-if="gameSystemName" :class="getGameSystemBadgeClasses()">
  <p :class="getGameSystemTextClasses()">{{ gameSystemName }}</p>
</div>
```

**Output:**
```html
<div class="bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg">
  <p class="text-base text-purple-300 font-semibold">40k</p>
</div>
```

---

### 6. `getGameSystemTextClasses()`
Get CSS classes for game system text

**Returns:** 
- `string` - Tailwind CSS classes: `text-base text-purple-300 font-semibold`

---

### 7. `getGameSystemHintClasses()`
Get CSS classes for inline game system hint text

**Returns:** 
- `string` - Tailwind CSS classes: `text-xs text-gray-400 ml-2`

**Example:**
```vue
<label>
  Faction
  <span v-if="currentGameSystemName" :class="getGameSystemHintClasses()">
    ({{ currentGameSystemName }})
  </span>
</label>
```

## Component Integration Examples

### Example 1: LeagueCard.vue
```vue
<script setup>
  import { useGameSystems } from '~/composables/useGameSystems'
  import { storeToRefs } from 'pinia'
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemName } = useGameSystems(gameSystems)

  const gameSystemName = computed(() => {
    return getGameSystemName(props.league.gameSystemId)
  })
</script>

<template>
  <div v-if="gameSystemName" class="flex items-center gap-2">
    <Swords :size="16" />
    <span class="text-purple-300 font-semibold">{{ gameSystemName }}</span>
  </div>
</template>
```

### Example 2: ArmyListsView.vue (Badge Display)
```vue
<script setup>
  import { useGameSystems } from '~/composables/useGameSystems'

  const { currentGameSystemName, gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemBadgeClasses, getGameSystemTextClasses } = useGameSystems(gameSystems)
</script>

<template>
  <div class="flex justify-between items-center">
    <h3>Army List Manager</h3>
    <div v-if="currentGameSystemName" :class="getGameSystemBadgeClasses()">
      <p :class="getGameSystemTextClasses()">{{ currentGameSystemName }}</p>
    </div>
  </div>
</template>
```

### Example 3: PlayersView.vue (Inline Hint)
```vue
<script setup>
  import { useGameSystems } from '~/composables/useGameSystems'

  const { currentGameSystemName, gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemHintClasses } = useGameSystems(gameSystems)
</script>

<template>
  <label>
    Faction
    <span v-if="currentGameSystemName" :class="getGameSystemHintClasses()">
      ({{ currentGameSystemName }})
    </span>
  </label>
  <select v-model="newPlayer.faction" required class="input-field">
    <option v-for="faction in availableFactions" :key="faction.id" :value="faction.name">
      {{ faction.name }}
    </option>
  </select>
</template>
```

### Example 4: LeagueSwitcher.vue (Dropdown Display)
```vue
<script setup>
  import { useGameSystems } from '~/composables/useGameSystems'

  const { gameSystems } = storeToRefs(leaguesStore)
  const { getGameSystemNameWithFallback } = useGameSystems(gameSystems)
</script>

<template>
  <div v-for="league in myLeagues" :key="league.id">
    <span>{{ league.name }}</span>
    <span v-if="league.gameSystemId" class="text-purple-400">
      {{ getGameSystemNameWithFallback(league.gameSystemId) }}
    </span>
  </div>
</template>
```

## Benefits

### 1. **DRY Principle**
Eliminates duplicate game system lookup logic across 5+ components:
- `LeagueCard.vue`
- `LeagueSwitcher.vue`
- `ArmyListsView.vue`
- `PlayersView.vue`
- `MatchesView.vue`

### 2. **Consistent Styling**
All game system badges use identical purple theme:
- Badge: `bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg`
- Text: `text-base text-purple-300 font-semibold`
- Hints: `text-xs text-gray-400 ml-2`

### 3. **Single Source of Truth**
If styling needs to change, update once in the composable instead of 15+ locations

### 4. **Type Safety**
Centralized null handling and fallback logic prevents runtime errors

## Migration Guide

### Before (Manual Lookup)
```javascript
const gameSystemName = computed(() => {
  if (!props.league.gameSystemId) return null
  const gameSystem = gameSystems.value.find(gs => gs.id === props.league.gameSystemId)
  return gameSystem?.shortName || gameSystem?.name || null
})
```

### After (Composable)
```javascript
const { getGameSystemName } = useGameSystems(gameSystems)
const gameSystemName = computed(() => {
  return getGameSystemName(props.league.gameSystemId)
})
```

### Before (Hardcoded Classes)
```vue
<div class="bg-purple-900/30 border border-purple-500 px-3 py-1 rounded-lg">
  <p class="text-base text-purple-300 font-semibold">{{ gameSystemName }}</p>
</div>
```

### After (Dynamic Classes)
```vue
<div :class="getGameSystemBadgeClasses()">
  <p :class="getGameSystemTextClasses()">{{ gameSystemName }}</p>
</div>
```

## Testing

```javascript
// Test with valid ID
const name = getGameSystemName(1)
expect(name).toBe('40k')

// Test with invalid ID
const name = getGameSystemName(999)
expect(name).toBeNull()

// Test fallback
const name = getGameSystemNameWithFallback(999)
expect(name).toBe('Unknown')

// Test styling classes
const classes = getGameSystemBadgeClasses()
expect(classes).toContain('bg-purple-900/30')
expect(classes).toContain('border-purple-500')
```

## Related Files

- **Composable**: `app/composables/useGameSystems.js`
- **Store**: `app/stores/leagues.js` (provides `gameSystems` array)
- **Components Using**:
  - `app/components/LeagueCard.vue`
  - `app/components/LeagueSwitcher.vue`
  - `app/components/views/ArmyListsView.vue`
  - `app/components/views/PlayersView.vue`
  - `app/components/views/MatchesView.vue`

## Status

✅ **Production Ready**
- Fully implemented across all components
- Zero lint errors
- Consistent styling enforced
- Documentation complete

---

**Created**: January 2025  
**Last Updated**: January 2025
