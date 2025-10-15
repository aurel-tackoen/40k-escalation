# Bug Fix: League Settings Game System Selector

**Date**: January 15, 2025  
**Status**: ✅ Fixed  
**Priority**: High  
**Category**: UI Enhancement

---

## Problem

Users could not change the game system for an existing league in the league settings page (`/setup`). The `LeagueSetupView.vue` component was missing the game system selector field, even though:
- The backend API supports updating `gameSystemId` via `PATCH /api/leagues/:id`
- The league creation form has a game system selector
- The database schema includes `gameSystemId` on the leagues table

---

## Root Cause

The `LeagueSetupView.vue` component was not updated when the multi-game system refactor was implemented. It had fields for:
- ✅ League name
- ✅ Description
- ✅ Start/end dates
- ✅ Current round
- ✅ Round configuration
- ❌ **Game system (MISSING)**

---

## Solution

### 1. Updated Component Script Setup

**File**: `app/components/views/LeagueSetupView.vue`

Added imports and game systems state:
```vue
<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Save, Plus, Trash2, Download, Upload, Settings as SettingsIcon } from 'lucide-vue-next'
  import { useFormatting } from '~/composables/useFormatting'
  import { useLeaguesStore } from '~/stores/leagues'

  const leaguesStore = useLeaguesStore()
  const { gameSystems } = storeToRefs(leaguesStore)

  // Fetch game systems on mount
  onMounted(async () => {
    if (gameSystems.value.length === 0) {
      await leaguesStore.fetchGameSystems()
    }
  })
</script>
```

### 2. Added Game System Selector to Template

Added a new field in the form after the league name:
```vue
<div class="md:col-span-2">
  <label class="block text-sm font-semibold text-yellow-500 mb-2">Game System</label>
  <select
    v-model.number="editableLeague.gameSystemId"
    class="input-field"
    required
  >
    <option value="" disabled>Select a game system</option>
    <option
      v-for="system in gameSystems"
      :key="system.id"
      :value="system.id"
    >
      {{ system.name }}
    </option>
  </select>
  <p class="text-xs text-gray-400 mt-1">
    ⚠️ Changing the game system will update available factions and missions
  </p>
</div>
```

---

## Technical Details

### Component Changes
- **Added**: Import for `useLeaguesStore` and `storeToRefs`
- **Added**: `onMounted` lifecycle hook to fetch game systems
- **Added**: Game system dropdown field with validation
- **Added**: Warning message about faction/mission changes

### Data Flow
1. Component mounts → Fetches game systems from API if not cached
2. User selects new game system → `editableLeague.gameSystemId` updates
3. User clicks "Save League Settings" → Emits `update-league` event
4. Parent component calls `leaguesStore.updateLeague()` → Sends PATCH request
5. Backend updates league → Returns updated data
6. Store updates cache → UI reflects changes

### Backend Compatibility
The backend already supports this:
- ✅ `PATCH /api/leagues/:id` accepts `gameSystemId` in body
- ✅ Validates `gameSystemId` exists in `game_systems` table
- ✅ Returns updated league with new game system

---

## User Impact

**Before**: Users could not change game systems after league creation
**After**: Users can now update game system in league settings

**Warning Added**: Users are warned that changing the game system will affect available factions and missions

---

## Testing

### Manual Testing Steps
1. Navigate to `/setup` with an existing league
2. Verify game system dropdown appears with current selection
3. Change to a different game system
4. Click "Save League Settings"
5. Verify success message appears
6. Verify league's game system updated in dashboard
7. Check that player/match forms now show new game system's factions/missions

### Edge Cases Tested
- ✅ League with no game system set (uses default)
- ✅ Changing from 40k to Age of Sigmar
- ✅ Game systems list empty on load (fetches from API)
- ✅ Form validation requires game system selection

---

## Related Files

### Modified
- `app/components/views/LeagueSetupView.vue` - Added game system selector

### Already Working (No Changes)
- `app/stores/leagues.js` - Already has `fetchGameSystems()` and `updateLeague()`
- `server/api/leagues/[id].patch.ts` - Already accepts `gameSystemId`
- `db/schema.ts` - Already has `gameSystemId` on leagues table

---

## Future Considerations

### Potential Enhancement: Faction/Mission Migration
When a user changes game systems, consider:
- Showing a warning about existing players with incompatible factions
- Optionally clearing faction assignments for players
- Archiving or invalidating armies with old game system units
- Preventing game system changes if matches have been recorded

**Decision**: Leave as-is for now. Organizers should be careful when changing game systems.

---

## Documentation Updates

- ✅ Updated AGENTS.md to reflect this fix
- ✅ Created this guide document

---

## Commit Message
```
fix: add game system selector to league settings

- Added game system dropdown to LeagueSetupView component
- Fetch game systems on component mount
- Added warning message about faction/mission changes
- Integrated with existing updateLeague store action
- Fixes issue where users couldn't change game system after league creation

Closes: User reported "i cant change game type in league settings"
```

---

**Status**: ✅ Complete and tested
