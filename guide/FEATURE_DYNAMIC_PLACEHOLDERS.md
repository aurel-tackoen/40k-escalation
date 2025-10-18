# Dynamic Placeholders Implementation - Complete

## Overview
Successfully implemented game-system-specific placeholder text throughout the application to replace hardcoded Warhammer 40k references. The solution provides contextually appropriate examples based on the selected game system.

## Solution Architecture

### 1. Data Layer: `/app/data/placeholders.js`
Created a centralized placeholder data file containing:
- **5 game-specific placeholder sets** (40k, AoS, ToW, MESBG, HH)
- **Generic fallback** for when no game system is selected
- **Helper functions** for easy access

#### Placeholder Categories
Each game system has unique placeholders for:
- `leagueName` - League naming examples
- `armyName` - Army naming examples  
- `armyNameHint` - Contextual hints for army naming conventions
- `armyExamples` - Multiple army name examples
- `unitName` - Unit naming examples
- `roundName` - Round/battle size naming
- `scenarioObjective` - Game-appropriate scenario descriptions

#### Example Placeholders by Game System

**Warhammer 40,000:**
- Army: "Emperor's Fist", "The Crimson Crusade"
- Units: "Tactical Squad, Intercessor Squad"
- Rounds: "Combat Patrol (500pts)"

**Age of Sigmar:**
- Army: "The Bloodbound Reavers", "The Golden Legion"
- Units: "Blood Warriors, Liberators"
- Rounds: "Vanguard (500pts)"

**The Old World:**
- Army: "The Iron Legion", "Skaven Horde"
- Units: "Spearmen Regiment, Black Knights"
- Rounds: "Border Patrol (500pts)"

**Middle-Earth SBG:**
- Army: "Rangers of the North", "Moria Goblins"
- Units: "Warriors of Minas Tirith, Uruk-hai Scouts"
- Scenarios: "Control the Ring", "Defend the Village"

**The Horus Heresy:**
- Army: "Sons of Horus 7th Company", "Death Guard Plague Marines"
- Units: "Legion Tactical Squad, Cataphractii Terminators"
- Rounds: "Zone Mortalis (500pts)"

### 2. Composable Layer: `/app/composables/usePlaceholders.js`
Created a reactive composable that:
- Accepts a game system object (reactive ref)
- Automatically updates placeholders when game system changes
- Falls back to generic placeholders when no system selected
- **Zero lint errors** - production ready

#### Usage Pattern
```javascript
import { usePlaceholders } from '~/composables/usePlaceholders'

// Pass reactive game system ref
const { placeholders } = usePlaceholders(selectedGameSystem)

// In template
:placeholder="placeholders.armyName"
```

### 3. Component Integration
Updated **6 components** to use dynamic placeholders:

#### Pages
1. **`/app/pages/leagues/create.vue`** ✅
   - League name placeholder
   - Round name placeholder
   - Uses `selectedGameSystem` computed ref

2. **`/app/pages/leagues/join.vue`** ✅
   - Army name placeholder
   - Army examples text
   - Uses `league` ref

#### View Components
3. **`/app/components/views/ArmyListsView.vue`** ✅
   - Army name placeholder
   - Unit name placeholder
   - Uses `selectedLeague` from store

4. **`/app/components/views/PlayersView.vue`** ✅
   - Army name placeholder
   - Army name hint text
   - Uses `selectedLeague` from store

5. **`/app/components/views/MatchesView.vue`** ✅
   - Scenario objective placeholder (MESBG)
   - Uses `selectedLeague` from store

6. **`/app/components/views/LeagueSetupView.vue`** ✅
   - Round name placeholder
   - Uses `currentGameSystem` computed ref

## Before & After Examples

### Army Name Input (40k)
**Before:** `placeholder="e.g., Emperor's Fist"`
**After:** `:placeholder="placeholders.armyName"` → "e.g., Emperor's Fist"

### Army Name Input (MESBG)
**Before:** `placeholder="e.g., Emperor's Fist"`
**After:** `:placeholder="placeholders.armyName"` → "e.g., Rangers of the North"

### Unit Name Input (AoS)
**Before:** `placeholder="e.g., Tactical Squad"`
**After:** `:placeholder="placeholders.unitName"` → "e.g., Blood Warriors, Liberators"

### Scenario Objective (ToW)
**Before:** Hard-coded generic text
**After:** `:placeholder="placeholders.scenarioObjective"` → "e.g., Pitched Battle, Border Dispute"

## Technical Details

### Reactivity Strategy
- All placeholders are **computed properties** that react to game system changes
- When user selects different game system, placeholders update automatically
- No manual watching or event handling required

### Store Integration
Components pull game system data from:
- `selectedLeague` (store ref) - for components in active league context
- `selectedGameSystem` (computed) - for league creation page
- `currentGameSystem` (computed) - for league settings page
- `league` (ref) - for join page

### Fallback Behavior
- If no game system selected → Generic placeholders shown
- If game system not found → Generic placeholders shown
- Prevents empty/broken placeholders in all scenarios

## Testing Checklist

✅ **Create League Page**
- League name updates when game system changes
- Round name updates when game system changes

✅ **Join League Page**
- Army name/examples match league's game system
- Shows correct examples in hint text

✅ **Army Lists View**
- Army name matches current league's game system
- Unit name matches current league's game system

✅ **Players View**
- Army name matches current league's game system
- Hint text matches current league's game system

✅ **Matches View**
- Scenario objective matches current league's game system
- Special handling for MESBG scenario-based matches

✅ **League Setup View**
- Round name matches league's game system
- Updates when game system changed

## Code Quality

### ESLint Status
✅ **Zero lint errors** across all files
- Proper trailing space removal
- No unused variables
- Proper import ordering

### Files Created
- `/app/data/placeholders.js` (68 lines)
- `/app/composables/usePlaceholders.js` (25 lines)

### Files Modified
- `/app/pages/leagues/create.vue`
- `/app/pages/leagues/join.vue`
- `/app/components/views/ArmyListsView.vue`
- `/app/components/views/PlayersView.vue`
- `/app/components/views/MatchesView.vue`
- `/app/components/views/LeagueSetupView.vue`

## Benefits

### User Experience
- **Contextually relevant examples** - Players see examples from their game system
- **Reduced confusion** - No more "Emperor's Fist" in Age of Sigmar leagues
- **Better onboarding** - New users get system-appropriate guidance

### Developer Experience
- **Single source of truth** - All placeholders in one file
- **Easy maintenance** - Update once, reflects everywhere
- **Type-safe** - All placeholder keys defined centrally
- **Extensible** - Add new game systems by adding to data file

### Future-Proof
- **New game systems** - Just add to `placeholders.js`
- **Localization ready** - Easy to extend for translations
- **Consistent patterns** - All components use same composable

## Usage for Future Development

### Adding New Placeholder Type
1. Add key to all game systems in `placeholders.js`
2. Add key to `genericPlaceholders` object
3. Use in component: `:placeholder="placeholders.newKey"`

### Adding New Game System
1. Add system to `placeholders.js`:
```javascript
'new-system': {
  leagueName: 'e.g., New System League',
  armyName: 'e.g., My Army',
  // ... etc
}
```
2. All components automatically support it

### Component Integration Pattern
```vue
<script setup>
import { usePlaceholders } from '~/composables/usePlaceholders'

// Get game system from appropriate source
const { placeholders } = usePlaceholders(gameSystemRef)
</script>

<template>
  <input :placeholder="placeholders.someKey" />
</template>
```

## Documentation Updates Needed

Update `AGENTS.md` to include:
- `usePlaceholders` in composables list (15th composable)
- Reference to `/app/data/placeholders.js` in data section
- Integration pattern for future components

## Summary

✨ **Mission Accomplished!**
- ✅ All 40k-specific placeholders replaced
- ✅ 5 game systems fully supported
- ✅ 6 components updated
- ✅ Zero technical debt
- ✅ Production ready
- ✅ Zero lint errors

The application now provides a truly **multi-game-system experience** from the very first input field! 🎮
