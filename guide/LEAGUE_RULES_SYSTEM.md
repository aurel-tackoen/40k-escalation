# League Rules System - Multi-Game Support

## Overview

The league rules system has been refactored to support **game-specific scoring systems** while maintaining common rules across all game systems. This ensures that each Warhammer game (40k, AoS, The Old World, MESBG, Horus Heresy) has appropriate rules that match its unique gameplay mechanics.

## Architecture

### 1. **Common Rules** (`COMMON_RULES`)
Shared sections that apply to all game systems:
- Introduction
- Army Building (point limits, list submission, composition, painting)
- Match Scheduling (playing matches, scheduling, disputes)
- League Standings (championship, rankings)
- Sportsmanship & Community
- Questions & Support

### 2. **Game-Specific Rules** (`GAME_SPECIFIC_RULES`)
Unique scoring and reporting rules for each match type:

#### Victory Points (`victory_points`)
Used by: Warhammer 40k, Age of Sigmar, The Horus Heresy
- Standard VP-based scoring (0-100 VP for 40k/HH, 0-30 VP for AoS)
- League Points: Win=3, Draw=1, Loss=0
- Tiebreakers based on total VP scored

#### Percentage/Casualties (`percentage`)
Used by: The Old World
- Casualty-based victory with margin calculation
- Victory levels: Draw (<10%), Minor (10-24%), Major (25-49%), Massacre (≥50%)
- League Points: Massacre=5, Major=4, Minor=3, Draw=1, Loss=0
- Tiebreakers based on total casualties inflicted

#### Scenario Objectives (`scenario`)
Used by: Middle-Earth Strategy Battle Game
- Objective completion determines winner
- Casualties used as tiebreaker
- League Points: Win=3, Draw=1, Loss=0
- Tiebreakers based on objectives completed, then casualties

## Usage

### In Components

```vue
<script setup>
import { toRef } from 'vue'
import { useLeagueRules } from '~/composables/useLeagueRules'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const { currentGameSystem } = storeToRefs(leaguesStore)

// Get game-specific rules
const {
  generatedRules,
  scoringRules,
  armyBuildingRules,
  matchTypeLabel,
  leaguePointsSystem,
  hasRules
} = useLeagueRules(currentGameSystem)
</script>

<template>
  <div v-if="hasRules">
    <h2>{{ matchTypeLabel }} System</h2>
    
    <!-- Full rules -->
    <div v-html="generatedRules" class="prose" />
    
    <!-- Or specific sections -->
    <div v-html="scoringRules" class="prose" />
  </div>
</template>
```

### Direct Function Call

```javascript
import { generateLeagueRules } from '~/data/default-rules'
import { gameSystems } from '~/data/game-systems'

// Generate rules for Warhammer 40k
const fortyKRules = generateLeagueRules(gameSystems[0])

// Generate rules for The Old World
const towRules = generateLeagueRules(gameSystems[2])

// Generate rules for any game system
const gameSystem = {
  name: 'My Custom Game',
  matchType: 'victory_points',
  matchConfig: {
    pointsLabel: 'Victory Points',
    pointsRange: { min: 0, max: 100 }
  }
}
const customRules = generateLeagueRules(gameSystem)
```

### In API Routes

```javascript
// server/api/leagues/[id]/rules.get.ts
import { generateLeagueRules } from '~/data/default-rules'
import { db } from '~/db'
import { leagues, gameSystems as gameSystemsTable } from '~/db/schema'

export default defineEventHandler(async (event) => {
  const leagueId = getRouterParam(event, 'id')
  
  // Fetch league with game system
  const league = await db
    .select()
    .from(leagues)
    .leftJoin(gameSystemsTable, eq(leagues.gameSystemId, gameSystemsTable.id))
    .where(eq(leagues.id, leagueId))
    .get()
  
  // Generate rules for this league's game system
  const rules = generateLeagueRules({
    name: league.gameSystems.name,
    matchType: league.gameSystems.matchType,
    matchConfig: JSON.parse(league.gameSystems.matchConfig)
  })
  
  return { success: true, data: rules }
})
```

## Composable API Reference

### `useLeagueRules(gameSystem)`

**Parameters:**
- `gameSystem` (Ref<Object>): Reactive game system object

**Returns:**

#### `generatedRules` (ComputedRef<string>)
Complete markdown-formatted rules for the game system

#### `rulesSummary` (ComputedRef<string>)
First few sections for preview (up to Army Building)

#### `scoringRules` (ComputedRef<string>)
Scoring System section only

#### `armyBuildingRules` (ComputedRef<string>)
Army Building section only

#### `matchRequirementsRules` (ComputedRef<string>)
Match Requirements section only

#### `hasRules` (ComputedRef<boolean>)
Whether rules are available

#### `matchTypeLabel` (ComputedRef<string>)
Human-readable match type label

#### `leaguePointsSystem` (ComputedRef<Object>)
League points awarded for different results

## Testing

Run the test script to verify all game systems generate valid rules:

```bash
node test-rules-generation.js
```

This will:
- Generate rules for all 5 game systems
- Verify all required sections are present
- Check for game-specific content
- Display preview and character count

## Database Integration

When creating a new league, the rules can be generated automatically:

```javascript
// Generate default rules based on selected game system
const gameSystem = await db
  .select()
  .from(gameSystems)
  .where(eq(gameSystems.id, selectedGameSystemId))
  .get()

const defaultRules = generateLeagueRules({
  name: gameSystem.name,
  matchType: gameSystem.matchType,
  matchConfig: JSON.parse(gameSystem.matchConfig)
})

// Store in league
await db.insert(leagues).values({
  name: 'My League',
  gameSystemId: selectedGameSystemId,
  rules: defaultRules, // Store generated rules
  // ... other fields
})
```

## Customization

League organizers can:
1. Start with generated default rules
2. Edit the markdown to customize sections
3. Save customized rules in the league record
4. Players see the customized rules specific to their league

## Migration Guide

### From Old System
The old `DEFAULT_LEAGUE_RULES` constant is still available for backward compatibility and uses Warhammer 40k rules as default:

```javascript
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'
// This is equivalent to:
// generateLeagueRules({ name: 'Warhammer 40,000', matchType: 'victory_points', ... })
```

### To New System
Update components to use the composable:

**Before:**
```vue
<script setup>
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'
</script>

<template>
  <div v-html="DEFAULT_LEAGUE_RULES" />
</template>
```

**After:**
```vue
<script setup>
import { toRef } from 'vue'
import { useLeagueRules } from '~/composables/useLeagueRules'
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
const { currentGameSystem } = storeToRefs(leaguesStore)
const { generatedRules } = useLeagueRules(currentGameSystem)
</script>

<template>
  <div v-html="generatedRules" />
</template>
```

## Examples by Game System

### Warhammer 40,000
- **Match Type**: Victory Points
- **Scoring**: 0-100 VP per mission
- **League Points**: Win=3, Draw=1, Loss=0
- **Tiebreaker**: Total VP scored

### Age of Sigmar
- **Match Type**: Victory Points
- **Scoring**: 0-30 VP per battleplan
- **League Points**: Win=3, Draw=1, Loss=0
- **Tiebreaker**: Total VP scored

### The Old World
- **Match Type**: Percentage/Casualties
- **Scoring**: Army value vs casualties
- **Victory Levels**: Draw/Minor/Major/Massacre
- **League Points**: 5/4/3/1/0
- **Tiebreaker**: Total casualties inflicted

### Middle-Earth SBG
- **Match Type**: Scenario Objectives
- **Scoring**: Objective completion + casualties
- **League Points**: Win=3, Draw=1, Loss=0
- **Tiebreaker**: Objectives completed, then casualties

### The Horus Heresy
- **Match Type**: Victory Points
- **Scoring**: 0-100 VP per mission
- **League Points**: Win=3, Draw=1, Loss=0
- **Tiebreaker**: Total VP scored

## Benefits

✅ **Accurate Rules**: Each game system has rules that match its gameplay mechanics  
✅ **Maintainable**: Common rules are defined once, game-specific rules are isolated  
✅ **Extensible**: Easy to add new game systems or match types  
✅ **Flexible**: Organizers can still customize rules per league  
✅ **Type-Safe**: Function validates game system structure  
✅ **Testable**: Automated tests verify all game systems generate valid rules
