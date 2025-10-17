# Refactor: Default Rules Moved to Data File

**Status**: ✅ Complete  
**Date**: October 17, 2025  
**Related**: IMPROVED_DEFAULT_RULES.md, FEATURE_MARKDOWN_RULES.md

## Overview

The default league rules markdown template has been extracted from the component into a separate data file for better organization, reusability, and maintainability.

## Changes Made

### 1. Created New Data File

**File**: `app/data/default-rules.js`

```javascript
export const DEFAULT_LEAGUE_RULES = `# League Rules & Guidelines
...
[4,200+ characters of comprehensive markdown rules]
...`
```

**Benefits**:
- Single source of truth
- Easy to update without touching component code
- Can be imported by multiple components if needed
- Better separation of concerns (data vs. logic)

### 2. Updated LeagueSetupView Component

**File**: `app/components/views/LeagueSetupView.vue`

#### Added Import
```javascript
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'
```

#### Removed Inline Template
- Deleted ~130 lines of inline markdown string
- Component is now cleaner and more focused

#### Updated References
Changed all occurrences from `DEFAULT_RULES` to `DEFAULT_LEAGUE_RULES`:

1. **Watcher initialization**:
```javascript
if (!editableLeague.value.rules) {
  editableLeague.value.rules = DEFAULT_LEAGUE_RULES
}
```

2. **onMounted initialization**:
```javascript
onMounted(() => {
  if (!editableLeague.value.rules) {
    editableLeague.value.rules = DEFAULT_LEAGUE_RULES
  }
})
```

3. **Reset button**:
```vue
<button @click="editableLeague.rules = DEFAULT_LEAGUE_RULES">
  Reset to Default Rules
</button>
```

## Benefits of Refactor

### Code Organization
✅ **Separation of Concerns** - Data separated from component logic  
✅ **Cleaner Component** - 130 fewer lines in component file  
✅ **Single Source** - One place to update default rules  
✅ **Better Maintainability** - Easier to find and edit rules

### Reusability
✅ **Can be imported anywhere** - Other components can use same defaults  
✅ **Consistent defaults** - All components use same template  
✅ **Easy testing** - Can import for tests without component  
✅ **Documentation** - Rules documented in dedicated file

### Developer Experience
✅ **Better IDE support** - File-level documentation  
✅ **Easier diffs** - Changes to rules don't clutter component history  
✅ **Clear structure** - `app/data/` clearly holds static data  
✅ **Version control** - Rules changes tracked separately

## File Structure

```
app/
├── components/
│   └── views/
│       └── LeagueSetupView.vue  (imports DEFAULT_LEAGUE_RULES)
└── data/
    ├── default-rules.js         (NEW - exports DEFAULT_LEAGUE_RULES)
    ├── factions-by-system.js
    ├── game-systems.js
    └── missions-by-system.js
```

### Data Directory Pattern
The `app/data/` directory now follows a consistent pattern:
- `game-systems.js` - Game system definitions
- `factions-by-system.js` - Faction data per system
- `missions-by-system.js` - Mission data per system
- `default-rules.js` - Default league rules template ⭐ NEW

## Future Possibilities

### Multiple Templates
Could add different rule templates:

```javascript
// app/data/default-rules.js
export const DEFAULT_LEAGUE_RULES = `...`
export const CASUAL_LEAGUE_RULES = `...`
export const COMPETITIVE_LEAGUE_RULES = `...`
export const NARRATIVE_LEAGUE_RULES = `...`
```

Then in component:
```vue
<select v-model="selectedTemplate">
  <option value="default">Default Rules</option>
  <option value="casual">Casual League</option>
  <option value="competitive">Competitive League</option>
  <option value="narrative">Narrative Campaign</option>
</select>
```

### Game System Specific Rules
Could create rules per game system:

```javascript
// app/data/default-rules.js
export const DEFAULT_RULES_40K = `...`
export const DEFAULT_RULES_AOS = `...`
export const DEFAULT_RULES_TOW = `...`
export const DEFAULT_RULES_MESBG = `...`
```

### Localization
Could add translated versions:

```javascript
// app/data/default-rules.js
export const DEFAULT_LEAGUE_RULES_EN = `...`
export const DEFAULT_LEAGUE_RULES_FR = `...`
export const DEFAULT_LEAGUE_RULES_ES = `...`
```

## Testing

### Component Still Works
- ✅ Default rules initialize on mount
- ✅ Rules populate for new leagues
- ✅ Reset button restores defaults
- ✅ Watch triggers on league change

### Import Works Correctly
- ✅ Named export from data file
- ✅ Proper path resolution (`~/data/`)
- ✅ Auto-import via Nuxt
- ✅ Zero lint errors

## Code Comparison

### Before (In Component)
```javascript
// 130+ lines of inline markdown in component
const DEFAULT_RULES = `# League Rules...
...
...`
```

### After (Imported)
```javascript
// 1 line import
import { DEFAULT_LEAGUE_RULES } from '~/data/default-rules'
```

**Result**: Component is 129 lines shorter! 📉

## Files Modified

1. **Created**: `app/data/default-rules.js`
2. **Modified**: `app/components/views/LeagueSetupView.vue`
   - Added import statement
   - Removed inline template
   - Updated all references

## Summary

This refactor improves code organization by moving the default league rules template to a dedicated data file. The component is now cleaner, the rules are more maintainable, and the architecture supports future enhancements like multiple templates or game-system-specific rules.

**Key Achievement**: Better separation of concerns with zero functional changes - everything works exactly as before! ✨
