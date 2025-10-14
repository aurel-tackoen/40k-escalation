# Bug Fix: League Selection Not Working (Bug #7)

**Date**: October 14, 2025  
**Status**: ✅ Fixed  
**Severity**: Critical (blocking core feature)

---

## Issue Description

When selecting a league from the LeagueSwitcher dropdown, the dashboard continued to display "No league selected. Choose a league" even though a league was selected in localStorage.

Additionally, multiple Vue render errors occurred:

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'currentLeague')
    at Proxy.paintingLeaderboard (leagues.js:50:20)
```

### User Impact
- League selection completely non-functional
- Dashboard never displayed league data
- Switching leagues had no effect
- Page reload was attempted but didn't help
- Users stuck on "Choose a league" message

---

## Root Causes

This bug had **THREE distinct issues** that needed to be fixed:

### Issue 1: Missing Data Fetch in `initialize()`
The `initialize()` method loaded the `currentLeagueId` from localStorage and called `fetchMyLeagues()`, but **never fetched the actual league data** (players, armies, matches, etc.).

**Before**:
```javascript
async initialize() {
  if (process.client) {
    const savedLeagueId = localStorage.getItem('currentLeagueId')
    if (savedLeagueId) {
      this.currentLeagueId = parseInt(savedLeagueId)
    }
  }
  
  await this.fetchMyLeagues()
  // ❌ Missing: fetchLeagueData() call
}
```

**Result**: `currentLeagueId` was set, but `currentLeague` getter returned null because `leagues[id]` was empty.

### Issue 2: Unnecessary Page Reload
The `LeagueSwitcher` component called `window.location.reload()` after switching leagues, which:
- Caused a full page refresh
- Reset all reactive state
- Triggered race conditions
- Prevented smooth state transitions

**Before**:
```javascript
const switchToLeague = async (leagueId) => {
  if (leagueId !== currentLeagueId.value) {
    await leaguesStore.switchLeague(leagueId)
    // ❌ Unnecessary page reload
    if (process.client) {
      window.location.reload()
    }
  }
  isOpen.value = false
}
```

### Issue 3: Incorrect Pinia Getter Syntax
Three getters used arrow functions with `(state, getters)` parameters to access other getters, which caused `getters` to be `undefined` in Pinia.

**Incorrect Pattern** (caused crashes):
```javascript
paintingLeaderboard: (state, getters) => {
  if (!getters.currentLeague) return []  // ❌ getters is undefined!
  // ...
}

isLeagueOwner: (state, getters) => {
  return getters.currentRole === 'owner'  // ❌ getters is undefined!
}

canManageLeague: (state, getters) => {
  const role = getters.currentRole  // ❌ getters is undefined!
  return role === 'owner' || role === 'organizer'
}
```

**Correct Pattern** (uses `this`):
```javascript
paintingLeaderboard(state) {
  if (!this.currentLeague) return []  // ✅ this works!
  // ...
}

isLeagueOwner() {
  return this.currentRole === 'owner'  // ✅ this works!
}

canManageLeague() {
  const role = this.currentRole  // ✅ this works!
  return role === 'owner' || role === 'organizer'
}
```

---

## Solutions Applied

### Fix 1: Enhanced `initialize()` Method

**File**: `app/stores/leagues.js`

Added league details fetch and data fetch after loading saved league ID:

```javascript
async initialize() {
  if (process.client) {
    const savedLeagueId = localStorage.getItem('currentLeagueId')
    if (savedLeagueId) {
      this.currentLeagueId = parseInt(savedLeagueId)
    }
  }

  await this.fetchMyLeagues()

  // ✅ NEW: Fetch league data if a league is selected
  if (this.currentLeagueId) {
    // Fetch league details if not cached
    if (!this.leagues[this.currentLeagueId]) {
      try {
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}`)
        if (response.success) {
          this.leagues[this.currentLeagueId] = response.data
        }
      } catch (error) {
        console.error('Error fetching league details:', error)
      }
    }
    
    // Fetch all league data
    await this.fetchLeagueData()
  }
}
```

**What this fixes**:
- Loads league details from API into cache
- Fetches all related data (players, armies, matches, members)
- Makes `currentLeague` getter return valid data
- Dashboard can now render properly

### Fix 2: Removed Page Reload

**File**: `app/components/LeagueSwitcher.vue`

Removed `window.location.reload()` call:

```javascript
// BEFORE (BROKEN)
const switchToLeague = async (leagueId) => {
  if (leagueId !== currentLeagueId.value) {
    await leaguesStore.switchLeague(leagueId)
    // ❌ Full page reload
    if (process.client) {
      window.location.reload()
    }
  }
  isOpen.value = false
}

// AFTER (FIXED)
const switchToLeague = async (leagueId) => {
  if (leagueId !== currentLeagueId.value) {
    await leaguesStore.switchLeague(leagueId)
    // ✅ No reload - let Vue reactivity handle it
  }
  isOpen.value = false
}
```

**What this fixes**:
- Smooth league switching
- No race conditions
- Proper reactive state updates
- Better UX (instant switch, no page flash)

### Fix 3: Corrected Getter Syntax

**File**: `app/stores/leagues.js`

Changed three getters from arrow functions with `getters` parameter to regular functions using `this`:

```javascript
// BEFORE (BROKEN)
paintingLeaderboard: (state, getters) => {
  if (!getters.currentLeague) return []
  const currentRound = getters.currentLeague.currentRound || 1
  // ...
}

isLeagueOwner: (state, getters) => {
  return getters.currentRole === 'owner'
}

canManageLeague: (state, getters) => {
  const role = getters.currentRole
  return role === 'owner' || role === 'organizer'
}

// AFTER (FIXED)
paintingLeaderboard(state) {
  if (!this.currentLeague) return []
  const currentRound = this.currentLeague.currentRound || 1
  // ...
}

isLeagueOwner() {
  return this.currentRole === 'owner'
}

canManageLeague() {
  const role = this.currentRole
  return role === 'owner' || role === 'organizer'
}
```

**What this fixes**:
- Getters can now access other getters via `this`
- No more "Cannot read properties of undefined" errors
- Painting leaderboard renders correctly
- Permission checks work properly

---

## Pinia Getter Patterns Explained

### ❌ Wrong Pattern (Causes Crashes)
```javascript
// Arrow function with getters parameter
someGetter: (state, getters) => {
  return getters.otherGetter  // getters is undefined!
}
```

### ✅ Correct Pattern #1 (Use `this`)
```javascript
// Regular function, access other getters with this
someGetter(state) {
  return this.otherGetter  // ✅ Works!
}
```

### ✅ Correct Pattern #2 (Arrow function, no other getters)
```javascript
// Arrow function OK if only accessing state
someGetter: (state) => {
  return state.someValue  // ✅ Works!
}
```

### 📝 Rule of Thumb
- **Need other getters?** → Use regular function with `this`
- **Only need state?** → Arrow function is fine
- **Need both?** → Use regular function with `this`

---

## Data Flow (Fixed)

### On App Load
```
App mounts
    ↓
Layout calls leaguesStore.initialize()
    ↓
initialize()
    ├─ Load currentLeagueId from localStorage ✅
    ├─ Fetch user's leagues (fetchMyLeagues) ✅
    └─ If league selected:
        ├─ Fetch league details if not cached ✅ NEW
        └─ Fetch league data (fetchLeagueData) ✅ NEW
            ├─ Fetch players
            ├─ Fetch matches
            ├─ Fetch armies
            └─ Fetch members
    ↓
Dashboard mounts
    ├─ currentLeague getter returns valid data ✅
    ├─ paintingLeaderboard getter works ✅
    └─ Renders dashboard with league data ✅
```

### On League Switch
```
User clicks league in LeagueSwitcher
    ↓
switchToLeague(leagueId)
    ↓
leaguesStore.switchLeague(leagueId)
    ├─ Set currentLeagueId ✅
    ├─ Fetch league details if not cached ✅
    ├─ Fetch all league data ✅
    └─ Save to localStorage ✅
    ↓
Vue reactivity triggers ✅ (no reload needed)
    ↓
Dashboard re-renders with new league data ✅
```

---

## Verification

### Testing Steps
1. ✅ Open app with no league selected
2. ✅ Create a new league
3. ✅ Dashboard displays league data
4. ✅ Open LeagueSwitcher dropdown
5. ✅ Select different league
6. ✅ Dashboard updates without reload
7. ✅ Painting leaderboard displays correctly
8. ✅ Reload page - league persists from localStorage
9. ✅ Dashboard displays persisted league

### Edge Cases Tested
- ✅ First time user (no leagues)
- ✅ User with one league
- ✅ User with multiple leagues
- ✅ Switch between leagues rapidly
- ✅ Reload page after switching
- ✅ League with no players/data (empty state)
- ✅ League with complete data

### Code Quality
- ✅ Lint check passes: `npm run lint` (0 errors)
- ✅ All getters use correct syntax
- ✅ No unnecessary page reloads
- ✅ Proper async/await patterns
- ✅ Guard clauses in place

---

## Related Components

### Files Changed
1. ✅ `app/stores/leagues.js` (2 changes)
   - Enhanced `initialize()` method
   - Fixed 3 getter syntaxes
   
2. ✅ `app/components/LeagueSwitcher.vue` (1 change)
   - Removed `window.location.reload()`

### API Endpoints Used
- `GET /api/leagues/my` - Fetch user's leagues
- `GET /api/leagues/:id` - Fetch league details
- `GET /api/players?leagueId=:id` - Fetch players
- `GET /api/matches?leagueId=:id` - Fetch matches
- `GET /api/armies?leagueId=:id` - Fetch armies
- `GET /api/leagues/:id/members` - Fetch members

---

## Related Issues

This is the **seventh runtime bug** discovered during manual testing:

1. ✅ **Bug #1**: `/api/leagues/my` 500 error
2. ✅ **Bug #2**: Create league 400 error (parameter mismatch)
3. ✅ **Bug #3**: Delete league 500 error (foreign key)
4. ✅ **Bug #4**: Create league DB error (invalid dates)
5. ✅ **Bug #5**: Create league crash (missing membership)
6. ✅ **Bug #6**: Dashboard crash (unguarded getter)
7. ✅ **Bug #7**: League selection not working (this document)

**Pattern**: This bug had multiple root causes that compounded each other. Fixing one issue revealed the next, requiring systematic debugging of the entire league selection flow.

---

## Prevention Strategies

### 1. Pinia Getter Linting Rule
Add ESLint rule to catch incorrect getter syntax:

```javascript
// .eslintrc.js
rules: {
  'pinia/no-arrow-function-getters': 'error'  // Hypothetical rule
}
```

### 2. Type Safety with TypeScript
Convert store to TypeScript to catch `undefined` access:

```typescript
interface LeaguesState {
  currentLeagueId: number | null
  leagues: Record<number, League>
}

interface LeaguesGetters {
  currentLeague: (state: LeaguesState) => League | null
  paintingLeaderboard: () => PaintingLeaderboardItem[]
}
```

### 3. Integration Tests
Add tests for league switching flow:

```javascript
describe('League Selection', () => {
  it('loads saved league on initialization', async () => {
    localStorage.setItem('currentLeagueId', '1')
    const store = useLeaguesStore()
    await store.initialize()
    expect(store.currentLeague).toBeDefined()
    expect(store.players.length).toBeGreaterThan(0)
  })
  
  it('switches leagues without reload', async () => {
    const store = useLeaguesStore()
    await store.switchLeague(2)
    expect(store.currentLeagueId).toBe(2)
    expect(store.currentLeague).toBeDefined()
  })
})
```

### 4. State Management Best Practices
- Always fetch related data when switching context
- Use `this` to access other getters in Pinia
- Avoid page reloads when Vue reactivity can handle it
- Add guard clauses to all conditional getters
- Test initialization path thoroughly

---

## Status

**RESOLVED** ✅

League selection now works correctly:
- ✅ Initialize loads persisted league
- ✅ LeagueSwitcher dropdown functional
- ✅ Dashboard displays selected league
- ✅ Smooth switching without reload
- ✅ All getters work properly
- ✅ No Vue render errors

The multi-league feature is now **fully functional** end-to-end.

---

## Timeline

- **Bug Discovered**: User reported "select a league doesn't work, dashboard still display choose a league"
- **Investigation**: Identified 3 separate issues
- **Fixed Issue 1**: Enhanced `initialize()` to fetch league data
- **Fixed Issue 2**: Removed unnecessary page reload
- **Fixed Issue 3**: Corrected Pinia getter syntax (3 getters)
- **Verified**: All lint checks passed, league selection works
- **Total Time**: ~20 minutes (multiple root causes required systematic fix)

---

**Last Updated**: October 14, 2025  
**Documentation**: Complete with Pinia patterns guide
