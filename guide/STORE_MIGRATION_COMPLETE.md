# Multi-League Store Migration Guide

**Date**: October 14, 2025  
**Status**: Phase 3.1 COMPLETE ✅

---

## 🎯 Overview

The Pinia store has been refactored from single-league (`useLeagueStore`) to multi-league (`useLeaguesStore`) to support users participating in multiple leagues.

---

## 📦 Store Structure

### File Changes
- **Old**: `app/stores/league.js` → **New**: `app/stores/leagues.js`
- **Old Store Name**: `useLeagueStore` → **New Store Name**: `useLeaguesStore`

### State Structure

```javascript
{
  // Multi-league state
  myLeagues: [],              // User's leagues with roles
  currentLeagueId: null,      // Active league ID
  leagues: {},                // Cache: { [id]: leagueData }
  
  // Current league data
  players: [],
  matches: [],
  armies: [],
  members: [],                // NEW: League members
  
  // UI state
  loading: false,
  error: null
}
```

---

## 🔄 Migration Changes

### State Changes

| Old State | New State | Change |
|-----------|-----------|--------|
| `currentLeague` | `currentLeagueId` + `leagues[id]` | Split into ID + cache |
| - | `myLeagues` | NEW: User's leagues |
| - | `members` | NEW: League members |
| `players` | `players` | Filtered by current league |
| `matches` | `matches` | Filtered by current league |
| `armies` | `armies` | Filtered by current league |

### Getter Changes

| Old Getter | New Getter | Change |
|------------|------------|--------|
| `league` | `currentLeague` | Computed from `leagues[currentLeagueId]` |
| - | `currentRole` | NEW: User's role (owner/organizer/player) |
| - | `isLeagueOwner` | NEW: Check if owner |
| - | `canManageLeague` | NEW: Check if owner or organizer |
| - | `hasActiveLeague` | NEW: Check if league selected |
| `paintingLeaderboard` | `paintingLeaderboard` | Same logic, no changes |

### Action Changes

#### Removed Actions
- `fetchLeague()` - Replaced by `fetchMyLeagues()` + `switchLeague()`
- `fetchAll()` - Replaced by `initialize()` + `fetchLeagueData()`

#### New Actions
- `fetchMyLeagues()` - Get all user's leagues
- `switchLeague(leagueId)` - Change active league
- `createLeague(data)` - Create new league
- `joinLeague(leagueId, password)` - Join existing league
- `leaveLeague()` - Leave current league
- `deleteLeague()` - Delete current league (owner only)
- `fetchLeagueData()` - Fetch all data for current league
- `fetchMembers()` - Fetch league members
- `initialize()` - Initialize store (restore from localStorage)

#### Updated Actions
All CRUD actions now automatically include `leagueId`:
- `addPlayer(player)` - Auto-adds `leagueId`
- `addMatch(match)` - Auto-adds `leagueId`
- `saveArmy(army)` - Auto-adds `leagueId`
- `updateLeague(updates)` - Uses PATCH endpoint

---

## 📝 Component Migration Guide

### 1. Update Store Import

**Old:**
```javascript
import { useLeagueStore } from '~/stores/league'

const leagueStore = useLeagueStore()
```

**New:**
```javascript
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
```

### 2. Update State Access

**Old:**
```javascript
const league = leagueStore.league
const players = leagueStore.players
```

**New:**
```javascript
const league = leaguesStore.currentLeague
const players = leaguesStore.players
```

### 3. Update Initialization

**Old:**
```javascript
onMounted(async () => {
  await leagueStore.fetchAll()
})
```

**New:**
```javascript
onMounted(async () => {
  await leaguesStore.initialize()
})
```

### 4. Add League Selection Check

**New Pattern:**
```vue
<script setup>
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()

// Check if league is selected
if (!leaguesStore.hasActiveLeague) {
  navigateTo('/leagues')
}
</script>

<template>
  <div v-if="leaguesStore.hasActiveLeague">
    <!-- Your component content -->
  </div>
  <div v-else>
    <p>Please select a league first.</p>
  </div>
</template>
```

---

## 🎨 Component Examples

### Example 1: Dashboard Component

**Before:**
```vue
<script setup>
import { useLeagueStore } from '~/stores/league'

const leagueStore = useLeagueStore()

onMounted(async () => {
  await leagueStore.fetchAll()
})

const league = computed(() => leagueStore.league)
const players = computed(() => leagueStore.players)
</script>

<template>
  <div>
    <h1>{{ league?.name }}</h1>
    <div>{{ players.length }} players</div>
  </div>
</template>
```

**After:**
```vue
<script setup>
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()

onMounted(async () => {
  await leaguesStore.initialize()
})

const league = computed(() => leaguesStore.currentLeague)
const players = computed(() => leaguesStore.players)
const role = computed(() => leaguesStore.currentRole)
</script>

<template>
  <div v-if="leaguesStore.hasActiveLeague">
    <h1>{{ league?.name }}</h1>
    <div>{{ players.length }} players</div>
    <span class="badge">{{ role }}</span>
  </div>
  <div v-else>
    <p>No league selected. <NuxtLink to="/leagues">Choose a league</NuxtLink></p>
  </div>
</template>
```

### Example 2: Add Player Form

**Before:**
```vue
<script setup>
import { useLeagueStore } from '~/stores/league'

const leagueStore = useLeagueStore()

const addPlayer = async () => {
  await leagueStore.addPlayer({
    name: playerName.value,
    email: playerEmail.value,
    faction: selectedFaction.value
  })
}
</script>
```

**After:**
```vue
<script setup>
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()

const addPlayer = async () => {
  // No need to pass leagueId - automatically added
  await leaguesStore.addPlayer({
    name: playerName.value,
    email: playerEmail.value,
    faction: selectedFaction.value
  })
}
</script>
```

### Example 3: Permission-Based UI

**New Pattern:**
```vue
<script setup>
import { useLeaguesStore } from '~/stores/leagues'

const leaguesStore = useLeaguesStore()
</script>

<template>
  <div>
    <!-- Show for all members -->
    <button @click="viewStats">View Stats</button>
    
    <!-- Show only for owner/organizer -->
    <button v-if="leaguesStore.canManageLeague" @click="editSettings">
      Edit League Settings
    </button>
    
    <!-- Show only for owner -->
    <button v-if="leaguesStore.isLeagueOwner" @click="deleteLeague">
      Delete League
    </button>
  </div>
</template>
```

---

## 🔌 API Integration

### Automatic League Context

All CRUD operations now automatically include the current league context:

```javascript
// Player operations
await leaguesStore.addPlayer({ name, email, faction })
// Calls: POST /api/players with { name, email, faction, leagueId: currentLeagueId }

// Match operations
await leaguesStore.addMatch({ player1Id, player2Id, ... })
// Calls: POST /api/matches with { ..., leagueId: currentLeagueId }

// Army operations
await leaguesStore.saveArmy({ playerId, phase, units, ... })
// Calls: POST /api/armies with { ..., leagueId: currentLeagueId }
```

### League Management Operations

```javascript
// Get user's leagues
await leaguesStore.fetchMyLeagues()

// Switch to different league
await leaguesStore.switchLeague(leagueId)

// Create new league
await leaguesStore.createLeague({
  name: 'Winter Campaign',
  description: '8-week escalation',
  startDate: '2025-02-01',
  isPublic: true,
  joinPassword: 'secret123',
  phases: [
    { number: 1, name: '500 Points', pointLimit: 500, ... }
  ]
})

// Join existing league
await leaguesStore.joinLeague(leagueId, 'password')

// Leave current league
await leaguesStore.leaveLeague()

// Update league settings (owner/organizer)
await leaguesStore.updateLeague({
  name: 'Updated Name',
  currentPhase: 2
})

// Delete league (owner only)
await leaguesStore.deleteLeague()
```

---

## 💾 Persistence

### localStorage
The store automatically saves and restores `currentLeagueId`:

```javascript
// Saved on league switch
localStorage.setItem('currentLeagueId', leagueId)

// Restored on initialize()
const savedLeagueId = localStorage.getItem('currentLeagueId')
```

### Cache
League details are cached to reduce API calls:

```javascript
// First access - fetches from API
await leaguesStore.switchLeague(1)

// Subsequent access - uses cache
leaguesStore.leagues[1] // No API call
```

---

## 🛡️ Guards & Middleware

### Route Guard Pattern

Create `middleware/league.js`:

```javascript
export default defineNuxtRouteMiddleware((to, from) => {
  const leaguesStore = useLeaguesStore()

  // Skip check for league selection pages
  if (to.path === '/leagues' || to.path === '/leagues/create') {
    return
  }

  // Redirect if no league selected
  if (!leaguesStore.hasActiveLeague) {
    return navigateTo('/leagues')
  }
})
```

Apply to pages:

```vue
<script setup>
definePageMeta({
  middleware: 'league'
})
</script>
```

---

## 📋 Migration Checklist

### Store Setup
- [x] Create `app/stores/leagues.js`
- [x] Import `useAuthStore` for user context
- [x] Add multi-league state structure
- [x] Add new getters (currentRole, isLeagueOwner, etc.)
- [x] Add league management actions
- [x] Update all CRUD actions with leagueId
- [x] Add initialize() method
- [x] Zero lint errors

### Component Updates (Next Phase)
- [ ] Update all components to use `useLeaguesStore`
- [ ] Change `league` to `currentLeague`
- [ ] Add league selection checks
- [ ] Update initialization to `initialize()`
- [ ] Add permission-based UI elements
- [ ] Create league switcher component
- [ ] Create league list page
- [ ] Create league create/join pages

### Testing
- [ ] Test league switching
- [ ] Test league creation
- [ ] Test joining with password
- [ ] Test leaving league
- [ ] Test role-based permissions
- [ ] Test data isolation between leagues
- [ ] Test localStorage persistence

---

## 🎯 Key Benefits

1. **Multi-League Support**: Users can participate in multiple leagues
2. **Role-Based Access**: Owner/Organizer/Player permissions
3. **Data Isolation**: Each league's data completely separate
4. **Automatic Context**: No need to pass leagueId manually
5. **Smart Caching**: Reduces API calls for league details
6. **Persistence**: Remembers last selected league
7. **Type Safety**: Same composable patterns maintained

---

## 🚀 Next Steps

1. **Update Components**: Migrate all components to use new store
2. **Create League UI**: Build league selection/creation interface
3. **Add League Switcher**: Dropdown in navigation bar
4. **Test Migration**: Verify all functionality works with multi-league

---

**Migration Status**: Phase 3.1 COMPLETE ✅  
**Next Phase**: 3.2 - Component Updates

**Last Updated**: October 14, 2025
