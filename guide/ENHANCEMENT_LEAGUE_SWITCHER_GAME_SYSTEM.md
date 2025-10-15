# Enhancement: Game System Display in League Switcher

**Date**: January 15, 2025  
**Status**: ✅ Complete  
**Priority**: Medium  
**Category**: UI Enhancement / Multi-Game System

---

## Problem

The league switcher dropdown showed league information but did not display which game system each league was using. With the app now supporting 4 different game systems (40k, Age of Sigmar, The Old World, MESBG), users needed to know which game system each league was for.

### User Request
> "add the game system in the switcher"

---

## Solution

### 1. Updated API Endpoint to Include Game System ID

**File**: `server/api/leagues/my.get.ts`

Added `gameSystemId` to the league data returned:

```typescript
userLeagues.push({
  id: league.id,
  name: league.name,
  description: league.description,
  startDate: league.startDate,
  endDate: league.endDate,
  currentRound: league.currentRound,
  gameSystemId: league.gameSystemId,  // NEW: Add game system ID
  isPublic: league.isPublic,
  maxPlayers: league.maxPlayers,
  status: league.status,
  memberCount,
  rounds: leagueRounds,
  role: membership.role,
  joinedAt: membership.joinedAt
})
```

### 2. Updated LeagueSwitcher Component

**File**: `app/components/LeagueSwitcher.vue`

#### Added Game Systems to Reactive State
```javascript
const { myLeagues, currentLeague, currentLeagueId, gameSystems } = storeToRefs(leaguesStore)
```

#### Created Helper Function
```javascript
const getGameSystemName = (gameSystemId) => {
  if (!gameSystemId) return 'Unknown'
  const system = gameSystems.value.find(gs => gs.id === gameSystemId)
  return system?.shortName || system?.name || 'Unknown'
}
```

This function:
- Returns the short name (40k, aos, tow, mesbg) if available
- Falls back to full name if short name not available
- Returns "Unknown" if game system not found

#### Updated Template
```vue
<div class="text-xs text-gray-400 flex items-center gap-2">
  <component :is="getRoleIcon(league.role)" :size="14" :class="getRoleColor(league.role)" />
  <span class="capitalize">{{ league.role }}</span>
  <span>•</span>
  <span>Round {{ league.currentRound || 1 }}</span>
  <span v-if="league.gameSystemId">•</span>
  <span v-if="league.gameSystemId" class="text-purple-400 font-medium">
    {{ getGameSystemName(league.gameSystemId) }}
  </span>
</div>
```

---

## Technical Details

### Data Flow

1. User clicks league switcher → Opens dropdown
2. Component displays `myLeagues` from store
3. For each league, calls `getGameSystemName(league.gameSystemId)`
4. Function looks up game system in `gameSystems` array
5. Returns short name (e.g., "40k") in purple text

### Visual Display

**Before:**
```
My Test League ✓
👑 Owner • Round 3
```

**After:**
```
My Test League ✓
👑 Owner • Round 3 • 40k
```

### Styling
- Game system displayed in **purple** (`text-purple-400`)
- **Medium font weight** for better readability
- Conditional rendering (only shows if `gameSystemId` exists)
- Bullet separator (`•`) between round and game system

---

## Game System Short Names

| Full Name | Short Name | Display |
|-----------|------------|---------|
| Warhammer 40,000 | 40k | 40k |
| Age of Sigmar | aos | aos |
| The Old World | tow | tow |
| Middle-Earth Strategy Battle Game | mesbg | mesbg |

---

## Edge Cases Handled

- ✅ **No game system ID**: Shows nothing (no error)
- ✅ **Invalid game system ID**: Shows "Unknown"
- ✅ **Missing short name**: Falls back to full name
- ✅ **Empty gameSystems array**: Shows "Unknown"
- ✅ **Legacy leagues without game system**: Gracefully hidden

---

## User Impact

### Benefits
- ✅ Users can quickly identify which game system each league uses
- ✅ Easier to distinguish between multiple leagues
- ✅ Consistent with dashboard game system badge
- ✅ No confusion when switching between game systems

### Visual Hierarchy
The game system is displayed:
1. **After** role and round number
2. **In purple** to match the app theme
3. **Medium weight** to stand out slightly
4. **With bullet separator** for clear segmentation

---

## Testing

### Manual Testing Steps
1. ✅ Open league switcher dropdown
2. ✅ Verify game system appears for each league
3. ✅ Check correct short names displayed (40k, aos, tow, mesbg)
4. ✅ Verify purple color styling
5. ✅ Test with leagues from different game systems
6. ✅ Test with league without game system (should show nothing)

### Browser Testing
- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Mobile browsers (responsive layout)
- ✅ Text overflow handling (long league names)

---

## Related Files

### Modified
- `server/api/leagues/my.get.ts` - Added `gameSystemId` to response
- `app/components/LeagueSwitcher.vue` - Added game system display

### Unchanged (Already Working)
- `server/api/leagues/public.get.ts` - Already returns all league fields including `gameSystemId`
- `app/stores/leagues.js` - Already has `gameSystems` state
- Database schema - Already has `gameSystemId` on leagues table

---

## Future Enhancements

### Consider Adding:
1. **Game System Icons** - Show game-specific icons instead of text
2. **Color Coding** - Different colors per game system
3. **Filter by Game System** - Filter dropdown by game system
4. **Game System Count** - Show count of leagues per game system
5. **Tooltips** - Hover over short name to see full game system name

---

## Documentation Updates

- ✅ Created this guide document
- ⏳ Update AGENTS.md with LeagueSwitcher enhancements

---

## Commit Message
```
feat: add game system display to league switcher

- Include gameSystemId in /api/leagues/my endpoint response
- Add getGameSystemName helper function to LeagueSwitcher
- Display game system short name after round number in purple
- Handle edge cases (no game system, invalid ID, missing data)

Closes: User requested "add the game system in the switcher"
Enhancement: Easier to identify league game systems at a glance
```

---

**Status**: ✅ Complete and tested  
**User Experience**: Clear visual indicator of game system per league
