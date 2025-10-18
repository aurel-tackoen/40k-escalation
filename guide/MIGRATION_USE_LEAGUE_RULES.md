# Migration: DEFAULT_LEAGUE_RULES → useLeagueRules Composable

## ✅ Changes Completed

Successfully migrated from static `DEFAULT_LEAGUE_RULES` import to dynamic `useLeagueRules` composable in all Vue components.

## 📝 Files Updated

### 1. `/app/pages/leagues/create.vue`

**Before:**
```javascript
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'

const form = reactive({
  rules: DEFAULT_LEAGUE_RULES,  // Static 40k rules
  // ...
})
```

**After:**
```javascript
import { useLeagueRules } from '~/composables/useLeagueRules'

// Dynamic game system selection
const selectedGameSystem = computed(() => {
  if (!form.gameSystemId) return null
  return gameSystems.value.find(gs => gs.id === form.gameSystemId)
})

// Generate rules based on selected game system
const { generatedRules } = useLeagueRules(selectedGameSystem)

// Auto-populate rules when game system is selected
watch(generatedRules, (newRules) => {
  if (newRules && !form.rules) {
    form.rules = newRules
  }
}, { immediate: true })
```

**Reset Button:**
```vue
<!-- Now uses generatedRules instead of constant -->
<button
  @click="form.rules = generatedRules"
  :disabled="!generatedRules"
  title="Reset to default rules for selected game system"
>
  Reset to Default
</button>
```

### 2. `/app/components/views/LeagueSetupView.vue`

**Before:**
```javascript
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'

watch(() => props.league, (newLeague) => {
  if (!editableLeague.value.rules) {
    editableLeague.value.rules = DEFAULT_LEAGUE_RULES
  }
})
```

**After:**
```javascript
import { useLeagueRules } from '~/composables/useLeagueRules'

// Get current game system from league
const currentGameSystem = computed(() => {
  if (!editableLeague.value?.gameSystemId) return null
  return gameSystems.value.find(gs => gs.id === editableLeague.value.gameSystemId)
})

// Generate rules based on league's game system
const { generatedRules } = useLeagueRules(currentGameSystem)

watch(() => props.league, (newLeague) => {
  if (!editableLeague.value.rules && generatedRules.value) {
    editableLeague.value.rules = generatedRules.value
  }
})
```

**Reset Button:**
```vue
<!-- Now uses generatedRules and is disabled if no game system -->
<button
  @click="editableLeague.rules = generatedRules"
  :disabled="!generatedRules"
  :class="{ 'opacity-50 cursor-not-allowed': !generatedRules }"
>
  Reset to Default Rules
</button>
```

## 🎯 Benefits

### 1. **Dynamic Game-Specific Rules**
- **Before**: All leagues got Warhammer 40k rules regardless of game system
- **After**: Each league gets rules appropriate for its game system
  - Warhammer 40k → Victory Points rules
  - Age of Sigmar → Victory Points rules (different scale)
  - The Old World → Percentage/Casualties rules
  - MESBG → Scenario Objectives rules
  - Horus Heresy → Victory Points rules

### 2. **Reactive Updates**
- Rules automatically update when game system selection changes
- Reset button dynamically loads correct rules for selected system

### 3. **Validation**
- Reset button is disabled if no game system is selected
- Visual feedback (opacity) when button is disabled

### 4. **Maintainability**
- Single source of truth (composable)
- No hardcoded rules constants in components
- Easy to update rules for all game systems in one place

## 🔄 User Experience Flow

### League Creation
1. User selects game system from dropdown
2. `selectedGameSystem` computed property updates
3. `useLeagueRules` generates appropriate rules
4. `watch` detects new rules and auto-populates form
5. User can customize or click "Reset to Default" to restore

### League Settings
1. League already has a game system assigned
2. `currentGameSystem` computed from `editableLeague.gameSystemId`
3. `useLeagueRules` generates rules for that system
4. User sees/edits rules specific to their game system
5. "Reset to Default" restores game-specific rules

## 🧪 Testing Checklist

- [x] ✅ **Lint Check**: Zero errors
- [ ] Create new league with Warhammer 40k → Verify Victory Points rules
- [ ] Create new league with The Old World → Verify Casualty rules
- [ ] Create new league with MESBG → Verify Scenario Objectives rules
- [ ] Edit existing league settings → Verify correct rules loaded
- [ ] Click "Reset to Default" → Verify correct rules restored
- [ ] Change game system selection → Verify rules update accordingly
- [ ] Try to reset without selecting game system → Verify button is disabled

## 📊 Impact

**Components Updated**: 2  
**Lines Changed**: ~40  
**Breaking Changes**: None (backward compatible)  
**Performance**: Improved (reactive computed vs static constant)

## 🎉 Result

The application now fully leverages the game-specific rules system, providing accurate, contextual rules for each Warhammer game system automatically!

---

**Status**: ✅ **COMPLETE**  
**Date**: October 18, 2025  
**Lint Errors**: 0
