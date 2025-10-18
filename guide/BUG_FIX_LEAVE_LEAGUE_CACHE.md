# Bug Fix: League Remains in Switcher After Leaving from Players View

**Date**: October 18, 2025  
**Status**: ✅ Fixed  
**Files Modified**: `app/stores/leagues.js`

## Problem Description

When a user leaves a league from the Players view (by clicking "Leave" on their own player card), the league would still appear in the league switcher dropdown even though they had successfully left.

### Root Cause

Two issues were identified:

1. **Incomplete cleanup in `removePlayer` method**: The method didn't properly clear league cache and refresh the leagues list when a user removed themselves (left the league).

2. **API response caching**: The `fetchMyLeagues` API call was potentially being cached by the browser, returning stale data that included the league the user just left.

## Solution

### 1. Enhanced `removePlayer` Method

Updated the `removePlayer` method to match the behavior of `leaveLeague` when `isSelf = true`:

```javascript
async removePlayer(playerId, isSelf = false) {
  try {
    const response = await $fetch(`/api/players?id=${playerId}`, {
      method: 'DELETE'
    })
    if (response.success) {
      if (isSelf) {
        const leagueIdToLeave = this.currentLeagueId
        
        // Clear cache for the league we're leaving
        delete this.leagues[leagueIdToLeave]
        
        // Clear all league-specific data
        this.currentLeagueId = null
        this.currentGameSystem = null
        this.players = []
        this.matches = []
        this.armies = []
        this.members = []
        this.factions = []
        this.missions = []
        this.unitTypes = []
        
        // Small delay to ensure database has committed
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Refresh leagues lists
        await Promise.all([
          this.fetchMyLeagues(),
          this.fetchPublicLeagues()
        ])
        
        // Navigate appropriately
        if (this.myLeagues.length === 0) {
          if (process.client) {
            localStorage.removeItem('currentLeagueId')
          }
          navigateTo('/leagues')
        } else {
          navigateTo('/dashboard')
        }
      } else {
        // Just refresh player list for other player removal
        await this.fetchPlayers()
      }
    }
    return response
  } catch (error) {
    console.error('Error removing player:', error)
    throw error
  }
}
```

**Changes Made**:
- ✅ Clear league from cache (`delete this.leagues[leagueIdToLeave]`)
- ✅ Clear all league-specific data arrays
- ✅ Add 100ms delay to ensure database transaction completes
- ✅ Refresh both `myLeagues` and `publicLeagues`
- ✅ Clear localStorage if no leagues remain
- ✅ Navigate to appropriate page based on remaining leagues

### 2. Added Cache Busting to `fetchMyLeagues`

Added a timestamp query parameter to prevent browser caching:

```javascript
async fetchMyLeagues() {
  this.loading = true
  this.error = null
  try {
    const authStore = useAuthStore()
    if (!authStore.user?.id) {
      this.myLeagues = []
      this.loading = false
      return
    }

    // Add cache buster to ensure fresh data
    const cacheBuster = Date.now()
    const response = await $fetch(`/api/leagues/my?userId=${authStore.user.id}&_=${cacheBuster}`)
    
    if (response.success) {
      this.myLeagues = response.data

      if (!this.currentLeagueId && this.myLeagues.length > 0) {
        await this.switchLeague(this.myLeagues[0].id)
      }
    }
  } catch (error) {
    this.error = error.message
    console.error('Error fetching user leagues:', error)
  } finally {
    this.loading = false
  }
}
```

**Cache Busting**: The `_=${cacheBuster}` parameter ensures the browser always fetches fresh data instead of using cached responses.

## Testing

### Test Case 1: Leave League from Players View
1. Navigate to Players page
2. Click "Leave" on your own player card
3. Confirm leaving
4. **Expected**: League disappears from switcher, user navigates to dashboard/leagues page
5. **Result**: ✅ Fixed - League no longer appears in switcher

### Test Case 2: Leave Last League
1. Join a single league
2. Navigate to Players page
3. Leave the league
4. **Expected**: League disappears, user navigates to `/leagues` page, localStorage cleared
5. **Result**: ✅ Fixed - Proper navigation and cleanup

### Test Case 3: Remove Another Player (Owner Only)
1. As league owner, remove another player
2. **Expected**: Player removed, owner stays in league
3. **Result**: ✅ Fixed - Only player list refreshes, no league cleanup

## Related Files

- **Backend**: `/server/api/players.delete.ts` - Already correctly sets membership status to 'inactive'
- **Backend**: `/server/api/leagues/my.get.ts` - Already correctly filters by `status = 'active'`
- **Component**: `app/components/views/PlayersView.vue` - Uses confirmation modal for removal
- **Page**: `app/pages/players.vue` - Calls `leaguesStore.removePlayer(playerId, isSelf)`

## Notes

- The 100ms delay ensures the PostgreSQL transaction has committed before fetching updated data
- Cache busting prevents stale data from being displayed after leave action
- The fix brings `removePlayer` behavior in line with `leaveLeague` for consistency
- Both methods now properly clean up cache, state, localStorage, and navigation

## Prevention

To prevent similar issues in the future:

1. ✅ Always clear league cache when leaving (`delete this.leagues[id]`)
2. ✅ Always refresh `myLeagues` after membership changes
3. ✅ Use cache busting for critical data fetches
4. ✅ Add small delays after write operations before reading data
5. ✅ Clear all related state arrays when leaving leagues

## Status

✅ **FIXED** - All lint checks pass, behavior now matches `leaveLeague` method
