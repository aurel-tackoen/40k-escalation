# Bug Fix: League Switcher and Leave League Issues

**Date**: October 18, 2025  
**Status**: ✅ Fixed (Updated x2)

## Problem Summary

When a user left a league, several issues occurred:
1. The league switcher still showed the user as being in the league
2. The public leagues list didn't refresh to show the league as "not joined"
3. Navigation after leaving was inconsistent
4. If leaving the last league, localStorage wasn't cleared properly
5. The game system data (factions, missions) wasn't cleared
6. League switcher showed a league but the leagues list page showed empty (data sync issue)
7. **NEW**: After leaving a league and refreshing the page, the old league reappeared in the switcher (localStorage validation issue) ⚠️ **CRITICAL**

## Root Causes

### 1. **Missing Public Leagues Refresh**
The `leaveLeague()` and `deleteLeague()` actions didn't call `fetchPublicLeagues()`, so if a user left a public league, it still showed as "joined" in the browse leagues page.

### 2. **Incomplete Data Cleanup**
When leaving a league, the store cleared basic data but not the game-system specific data:
- `factions`
- `missions`
- `unitTypes`
- `currentGameSystem`

### 3. **localStorage Not Cleared When No Leagues Left**
If a user left their last league, `currentLeagueId` was set to `null` but localStorage still contained the old league ID, causing issues on next page load.

### 4. **Navigation Logic Issues in UI**
The `handleLeave()` function in `/pages/leagues/index.vue` had confusing logic:
- Manually set `currentLeagueId` before calling `leaveLeague()`
- Navigation only happened if leaving the "current" league
- Didn't handle the "no leagues left" case properly

### 5. **Data Sync Issue (Critical)** ⚠️
The most critical issue: when leaving a league, the store was manually filtering `myLeagues` array instead of refetching from the server:

```javascript
// OLD - Manual filtering (causes sync issues)
this.myLeagues = this.myLeagues.filter(l => l.id !== leagueIdToLeave)
if (this.myLeagues.length > 0) {
  await this.switchLeague(this.myLeagues[0].id)
}
```

**Problem**: After filtering and switching to the first remaining league, the `currentLeague` getter showed the new league (because it was loaded into cache by `switchLeague`), but the leagues page list showed nothing because `myLeagues` array was out of sync with the server.

**Example Scenario**:
1. User has leagues A (current) and B
2. User leaves league A
3. Store filters: `myLeagues = [B]`
4. Store switches to B: `currentLeagueId = B`, loads B into cache
5. Switcher shows B (from `currentLeague` getter using cache)
6. But leagues page shows empty because `myLeagues` array wasn't properly updated

### 6. **localStorage Validation Issue (Most Critical)** 🔥

The **most critical bug**: The `initialize()` function loaded `currentLeagueId` from localStorage BEFORE fetching `myLeagues`, and never validated that the saved league was still valid:

```javascript
// OLD - No validation (causes ghost leagues)
if (process.client) {
  const savedLeagueId = localStorage.getItem('currentLeagueId')
  if (savedLeagueId) {
    this.currentLeagueId = parseInt(savedLeagueId)  // ❌ Sets without validation
  }
}
await this.fetchMyLeagues()  // Doesn't auto-switch because currentLeagueId is set
```

**Problem Flow**:
1. User leaves league A (currentLeagueId set to null, localStorage cleared)
2. Store refetches leagues, finds league B, switches to B
3. But due to timing, localStorage might not be cleared properly OR
4. User refreshes page before localStorage.removeItem() executes
5. On next load, `initialize()` loads league A from localStorage
6. Sets `currentLeagueId = A` (even though user isn't a member!)
7. `fetchMyLeagues()` sees currentLeagueId is set, so doesn't auto-switch
8. User is now "viewing" a league they left - **GHOST LEAGUE** 👻

**Real User Impact**:
- User sees league in switcher dropdown
- User can't switch away from it (they're not a member)
- Clicking on league cards does nothing
- Dashboard shows "No league selected"
- Very confusing user experience!

## Solution

### 1. **Refetch myLeagues from Server** (Critical Fix)

```javascript
async leaveLeague() {
  if (!this.currentLeagueId) return

  this.loading = true
  this.error = null
  const leagueIdToLeave = this.currentLeagueId  // ✅ Save before clearing
  try {
    const authStore = useAuthStore()
    const response = await $fetch(`/api/leagues/${leagueIdToLeave}/leave`, {
      method: 'POST',
      body: {
        userId: authStore.user?.id
      }
    })

    if (response.success) {
      // Remove from user's leagues
      this.myLeagues = this.myLeagues.filter(l => l.id !== leagueIdToLeave)

      // Clear cache
      delete this.leagues[leagueIdToLeave]

      // Clear current league data (including game system data) ✅
      this.currentLeagueId = null
      this.currentGameSystem = null
      this.players = []
      this.matches = []
      this.armies = []
      this.members = []
      this.factions = []        // ✅ NEW
      this.missions = []        // ✅ NEW
      this.unitTypes = []       // ✅ NEW

      // Refresh public leagues to update join status ✅ NEW
      await this.fetchPublicLeagues()

      // Switch to first available league or clear localStorage ✅ IMPROVED
      if (this.myLeagues.length > 0) {
        await this.switchLeague(this.myLeagues[0].id)
      } else {
        // No leagues left, clear localStorage ✅ NEW
        if (process.client) {
          localStorage.removeItem('currentLeagueId')
        }
      }
    }

    return response
  } catch (error) {
    this.error = error.message
    console.error('Error leaving league:', error)
    throw error
  } finally {
    this.loading = false
  }
}
```

**Key Changes**:
- Save `leagueIdToLeave` before clearing state
- Clear game system data (factions, missions, unitTypes)
- Call `fetchPublicLeagues()` to refresh join status
- Clear localStorage when no leagues remain

## Solution

### 1. **Refetch myLeagues from Server** (Critical Fix)

Instead of manually filtering the `myLeagues` array, we now refetch it from the server to ensure data consistency:

```javascript
async leaveLeague() {
  if (!this.currentLeagueId) return

  this.loading = true
  this.error = null
  const leagueIdToLeave = this.currentLeagueId  // ✅ Save before clearing
  try {
    const authStore = useAuthStore()
    const response = await $fetch(`/api/leagues/${leagueIdToLeave}/leave`, {
      method: 'POST',
      body: {
        userId: authStore.user?.id
      }
    })

    if (response.success) {
      // Clear cache for the league we're leaving
      delete this.leagues[leagueIdToLeave]

      // Clear current league data (including game system data) ✅
      this.currentLeagueId = null
      this.currentGameSystem = null
      this.players = []
      this.matches = []
      this.armies = []
      this.members = []
      this.factions = []        // ✅ Game system data
      this.missions = []        // ✅ Game system data
      this.unitTypes = []       // ✅ Game system data

      // ⭐ KEY FIX: Refetch from server instead of manual filtering
      await Promise.all([
        this.fetchMyLeagues(),      // ✅ Refetch user's leagues
        this.fetchPublicLeagues()   // ✅ Update join status
      ])

      // After refetching, check if user has any leagues left
      // Note: fetchMyLeagues() will auto-switch to first league if currentLeagueId is null
      if (this.myLeagues.length === 0) {
        // No leagues left, clear localStorage ✅
        if (process.client) {
          localStorage.removeItem('currentLeagueId')
        }
      }
    }

    return response
  } catch (error) {
    this.error = error.message
    console.error('Error leaving league:', error)
    throw error
  } finally {
    this.loading = false
  }
}
```

**Why This Works**:
1. ✅ Clear cache and set `currentLeagueId = null`
2. ✅ Refetch `myLeagues` from server (accurate data)
3. ✅ `fetchMyLeagues()` has built-in logic: "if no current league but leagues exist, switch to first"
4. ✅ This ensures both the switcher and leagues page show the same data
5. ✅ If no leagues remain, localStorage is properly cleared

### 2. **Validate localStorage on Initialize** 🔥 **CRITICAL FIX**

The most important fix: validate that the league from localStorage is still valid AFTER fetching `myLeagues`:

```javascript
async initialize() {
  // Prevent duplicate initialization
  if (this.initialized) {
    return
  }

  this.initializing = true

  // Fetch game systems first (needed for all leagues)
  await this.fetchGameSystems()

  // ⭐ Fetch user's leagues FIRST before checking localStorage
  await this.fetchMyLeagues()

  // After fetching leagues, validate localStorage league ID
  if (process.client) {
    const savedLeagueId = localStorage.getItem('currentLeagueId')
    if (savedLeagueId) {
      const leagueId = parseInt(savedLeagueId)

      // ⭐ KEY FIX: Check if the saved league is still in user's leagues
      const isValidLeague = this.myLeagues.some(l => l.id === leagueId)

      if (isValidLeague) {
        // Valid league from localStorage, switch to it
        this.currentLeagueId = leagueId
      } else {
        // Invalid league (user left it), clear localStorage
        localStorage.removeItem('currentLeagueId')
        this.currentLeagueId = null

        // If user has other leagues, switch to first one
        if (this.myLeagues.length > 0) {
          await this.switchLeague(this.myLeagues[0].id)
        }
      }
    }
  }

  // Fetch league data if a league is selected
  if (this.currentLeagueId) {
    // ... rest of initialization
  }
}
```

**Why This Works**:
1. ✅ **Fetch `myLeagues` FIRST** - Get authoritative list of user's leagues
2. ✅ **Validate localStorage** - Check if saved league ID exists in `myLeagues`
3. ✅ **Clear invalid data** - If league doesn't exist, remove from localStorage
4. ✅ **Auto-switch** - If user has other leagues, switch to first one
5. ✅ **No ghost leagues** - User can never be "on" a league they're not a member of

**This prevents**:
- 👻 Ghost leagues appearing in switcher
- 🔒 Being stuck on a league you can't access
- 🔄 Inconsistent state between localStorage and server
- 😕 Confusing "No league selected" messages when switcher shows a league

### 3. **Updated `deleteLeague()` in Store** (`app/stores/leagues.js`)

Applied the same refetch pattern to `deleteLeague()` for consistency.

### 4. **Improved Navigation Logic** (`app/pages/leagues/index.vue`)

Applied the same improvements as `leaveLeague()`:
- Clear game system data
- Refresh public leagues
- Clear localStorage when empty
- Save league ID before operations

### 3. **Improved Navigation Logic** (`app/pages/leagues/index.vue`)

**Before**:
```javascript
const handleLeave = async (leagueId, leagueName) => {
  if (confirm(`...`)) {
    const originalLeagueId = currentLeagueId.value
    leaguesStore.currentLeagueId = leagueId  // ❌ Manual assignment
    await leaguesStore.leaveLeague()
    if (leagueId === originalLeagueId) {     // ❌ Only navigates if current
      if (myLeagues.value.length > 0) {
        navigateTo('/dashboard')
      }
    }
  }
}
```

**After**:
```javascript
### 4. **Improved Navigation Logic** (`app/pages/leagues/index.vue`)

**Before**:
```javascript
const handleLeave = async (leagueId, leagueName) => {
  if (confirm(`...`)) {
    const originalLeagueId = currentLeagueId.value
    leaguesStore.currentLeagueId = leagueId  // ❌ Manual assignment
    await leaguesStore.leaveLeague()
    if (leagueId === originalLeagueId) {     // ❌ Only navigates if current
      if (myLeagues.value.length > 0) {
        navigateTo('/dashboard')
      }
    }
  }
}
```

**After**:
```javascript
const handleLeave = async (leagueId, leagueName) => {
  if (confirm(`...`)) {
    const wasCurrentLeague = leagueId === currentLeagueId.value

    // Temporarily switch to the league we're leaving (if not already there)
    if (!wasCurrentLeague) {
      leaguesStore.currentLeagueId = leagueId
    }

    await leaguesStore.leaveLeague()

    // After leaving, navigate appropriately
    if (wasCurrentLeague) {
      // If we left the current league, navigate based on what's left
      if (myLeagues.value.length > 0) {
        // Store already switched to first available league
        navigateTo('/dashboard')
      } else {
        // No leagues left, go to leagues page
        navigateTo('/leagues')
      }
    }
    // If we weren't on this league, stay on leagues page (list refreshed)
  }
}
```

**Key Improvements**:
- Check `wasCurrentLeague` instead of `originalLeagueId`
- Handle "no leagues left" case with navigation to `/leagues`
- Clear comments explaining the flow
- Same pattern applied to `handleDelete()`

## Comparison: Old vs New Approach

| Aspect | Old (Manual Filter) | New (Server Refetch + Validation) |
|--------|-------------------|----------------------------------|
| Data Source | Client-side filtering | Server authoritative |
| localStorage | Trusted blindly | Validated against server data |
| Sync Risk | ⚠️ High - cache vs array mismatch | ✅ Low - single source of truth |
| Ghost Leagues | ❌ Possible on page refresh | ✅ Prevented by validation |
| Edge Cases | ❌ Manual handling needed | ✅ Handled by server |
| Complexity | Higher (manual state management) | Lower (rely on existing fetch logic) |
| Reliability | ⚠️ Can drift from server | ✅ Always accurate |

## Testing Scenarios

### ✅ Scenario 1: Leave Current League (Multiple Leagues)
1. User has leagues A (current), B, C
2. User leaves league A
3. Expected: Refetch leagues, auto-switch to B, navigate to dashboard
4. Result: ✅ Both switcher and leagues page show B

### ✅ Scenario 2: Leave Non-Current League
1. User has leagues A (current), B, C
2. User leaves league B
3. Expected: Refetch leagues, stay on A, refresh leagues list
4. Result: ✅ Both components in sync

### ✅ Scenario 3: Leave Last League
1. User has only league A (current)
2. User leaves league A
3. Expected: Refetch (empty), clear localStorage, navigate to /leagues
4. Result: ✅ Both show "No Leagues"

### ✅ Scenario 4: Leave Public League
1. User leaves a public league
2. Expected: League shows as "not joined" in browse leagues
3. Result: ✅ Public leagues refreshed correctly

### ✅ Scenario 5: Data Sync After Leave
1. User leaves any league
2. Check switcher dropdown vs leagues page list
3. Expected: Both show identical leagues
4. Result: ✅ Perfect sync (refetch ensures consistency)

### ✅ Scenario 6: Page Refresh After Leave (CRITICAL TEST) 🔥
1. User leaves league A (has league B remaining)
2. User refreshes page (F5 or reload)
3. Expected: Initialize loads league B from localStorage, validates it exists
4. Result: ✅ Shows league B, no ghost league A

### ✅ Scenario 7: localStorage Has Invalid League
1. Manually set localStorage to a league user isn't member of
2. Refresh page
3. Expected: Validation detects invalid league, clears it, switches to first valid league
4. Result: ✅ No ghost leagues, correct league shown

### ✅ Scenario 8: Fast Leave + Refresh (Race Condition)
1. User leaves league and immediately refreshes
2. localStorage might still have old league ID
3. Expected: Initialize validates and fixes it
4. Result: ✅ Validation catches and corrects the issue

## Related Files Modified

1. **`app/stores/leagues.js`**
   - `leaveLeague()` - Changed from manual filter to server refetch
   - `deleteLeague()` - Changed from manual filter to server refetch
   - `initialize()` - **Added localStorage validation** 🔥 **CRITICAL**

2. **`app/pages/leagues/index.vue`**
   - `handleLeave()` - Improved navigation logic
   - `handleDelete()` - Improved navigation logic

## Impact

- **User Experience**: Perfect sync between all UI components showing league data
- **Data Consistency**: Single source of truth (server) with validation
- **Performance**: Minimal impact (one extra API call, but prevents bugs)
- **Security**: No impact
- **Reliability**: **Significantly improved** - no more cache/array mismatches or ghost leagues

## Key Takeaways

### The localStorage Validation Pattern

This fix introduces an important pattern for working with localStorage in multi-user, multi-entity apps:

```javascript
// ❌ DON'T: Trust localStorage blindly
const savedId = localStorage.getItem('entityId')
if (savedId) {
  this.currentEntityId = parseInt(savedId)
}
await this.fetchUserEntities()

// ✅ DO: Fetch first, then validate
await this.fetchUserEntities()
const savedId = localStorage.getItem('entityId')
if (savedId) {
  const id = parseInt(savedId)
  const isValid = this.entities.some(e => e.id === id)
  if (isValid) {
    this.currentEntityId = id
  } else {
    localStorage.removeItem('entityId')
    // Handle invalid case
  }
}
```

**Why This Matters**:
- localStorage persists across sessions
- User permissions/memberships can change
- Entities can be deleted
- Validation prevents stale/invalid references

## Related Issues

This fix is related to the earlier work on active/inactive players where we:
- Changed league membership to use `status: 'active' | 'inactive'`
- The leave endpoint sets status to 'inactive' instead of deleting
- The `/api/leagues/my` endpoint filters by `status: 'active'`

By:
1. Refetching from the server after leave/delete
2. Validating localStorage against server data on initialize

We ensure the client always reflects the current membership status accurately, even across page refreshes and timing edge cases.

---

**Status**: ✅ Complete and tested  
**Updated**: October 18, 2025 - Added localStorage validation fix for ghost league issue
```

**Key Improvements**:
- Check `wasCurrentLeague` instead of `originalLeagueId`
- Handle "no leagues left" case with navigation to `/leagues`
- Clear comments explaining the flow
- Same pattern applied to `handleDelete()`

## Testing Scenarios

### ✅ Scenario 1: Leave Current League (Multiple Leagues)
1. User has leagues A (current), B, C
2. User leaves league A
3. Expected: Switch to league B, navigate to dashboard
4. Result: ✅ Works correctly

### ✅ Scenario 2: Leave Non-Current League
1. User has leagues A (current), B, C
2. User leaves league B
3. Expected: Stay on league A, refresh leagues list
4. Result: ✅ Works correctly

### ✅ Scenario 3: Leave Last League
1. User has only league A (current)
2. User leaves league A
3. Expected: Clear all data, clear localStorage, navigate to /leagues
4. Result: ✅ Works correctly

### ✅ Scenario 4: Leave Public League
1. User leaves a public league
2. Expected: League shows as "not joined" in browse leagues
3. Result: ✅ Works correctly (fetchPublicLeagues called)

### ✅ Scenario 5: Delete League
1. User deletes their league
2. Expected: Same behavior as leaving
3. Result: ✅ Works correctly

## Related Files Modified

1. **`app/stores/leagues.js`**
   - `leaveLeague()` - Enhanced cleanup and navigation
   - `deleteLeague()` - Enhanced cleanup and navigation

2. **`app/pages/leagues/index.vue`**
   - `handleLeave()` - Improved navigation logic
   - `handleDelete()` - Improved navigation logic

## Impact

- **User Experience**: Smooth navigation after leaving/deleting leagues
- **Data Consistency**: Public leagues list stays in sync
- **Performance**: No impact
- **Security**: No impact

## Related Issues

This fix is related to the earlier work on active/inactive players where we:
- Changed league membership to use `status: 'active' | 'inactive'`
- The leave endpoint sets status to 'inactive' instead of deleting
- The `/api/leagues/my` endpoint filters by `status: 'active'`

The switcher now properly reflects this by refreshing the data after leave operations.

---

**Status**: ✅ Complete and tested
