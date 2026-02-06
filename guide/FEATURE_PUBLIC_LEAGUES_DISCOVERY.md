# Public Leagues Discovery Section

**Status**: ✅ Complete  
**Date**: October 14, 2025

## Overview

Added a new "Public Leagues" section to the leagues index page that displays all public leagues available to join. This allows users to discover and join leagues created by other players.

## Changes Made

### 1. Store Enhancement (`app/stores/leagues.js`)

#### Added State
```javascript
state: () => ({
  // ... existing state
  publicLeagues: [],  // Public leagues available to join
})
```

#### Added Action
```javascript
/**
 * Fetch all public leagues available to join
 */
async fetchPublicLeagues() {
  this.loading = true
  this.error = null
  try {
    const response = await $fetch('/api/leagues/public')
    if (response.success) {
      // Filter out leagues the user is already a member of
      const myLeagueIds = this.myLeagues.map(l => l.id)
      this.publicLeagues = response.data.filter(league => !myLeagueIds.includes(league.id))
    }
  } catch (error) {
    this.error = error.message
    console.error('Error fetching public leagues:', error)
  } finally {
    this.loading = false
  }
}
```

**Key Features**:
- Fetches from existing `/api/leagues/public` endpoint
- Automatically filters out leagues user is already a member of
- Prevents duplicate league display

### 2. UI Enhancement (`app/pages/leagues/index.vue`)

#### Added Import
```javascript
import { Globe } from 'lucide-vue-next'
const { publicLeagues } = storeToRefs(leaguesStore)
```

#### Added Section
New "Public Leagues" section displays:
- **Green theme** - Distinct from "My Leagues" (purple)
- **Grid layout** - Same responsive grid as My Leagues
- **Public badge** - Green "Public" badge in top-right corner
- **League cards** with:
  - League name and description
  - Member count (with max players if set)
  - Current phase
  - Status (active/completed/archived)
  - Start/end dates
  - **Join button** - Links to join flow
  - **Full state** - Disabled button if league is at max capacity

## User Experience

### Visual Hierarchy
```
┌─────────────────────────────────────┐
│  My Leagues (Purple theme)          │
│  [Your leagues with role badges]    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Public Leagues (Green theme)       │
│  [Discoverable public leagues]      │
└─────────────────────────────────────┘
```

### League Card Differences

**My Leagues Card**:
- Role badge (Owner/Organizer/Player)
- "Current" badge if active league
- Settings/Leave/Delete buttons
- Click card to switch league

**Public Leagues Card**:
- "Public" badge (green)
- Member count with capacity
- Status indicator
- "Join League" button
- Disabled if league is full

### Smart Filtering

The system automatically:
1. Fetches all public leagues from database
2. Filters out leagues user is already a member of
3. Displays only leagues available to join
4. Updates when user joins a new league

## API Endpoint Used

### GET `/api/leagues/public`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Global Crusade 2025",
      "description": "Open league for all players",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "currentPhase": 3,
      "status": "active",
      "maxPlayers": 50,
      "memberCount": 23
    }
  ],
  "count": 1
}
```

**Features**:
- Returns only leagues where `isPublic = true`
- Includes member count via SQL subquery
- Ordered by creation date

## User Flow

### Discovery Flow
1. User navigates to `/leagues`
2. Page loads "My Leagues" at top
3. Page loads "Public Leagues" below
4. User sees leagues they can join
5. User clicks "Join League" button
6. Redirected to `/leagues/join?leagueId=X`
7. Join flow handles league joining
8. After joining, league moves to "My Leagues"

### Capacity Handling
- If `maxPlayers` is set and `memberCount >= maxPlayers`:
  - Button shows "Full"
  - Button is disabled
  - User cannot join

### Empty States

**No Public Leagues**:
- Section is hidden (v-if condition)
- Only shows if there are public leagues available

**All Public Leagues Already Joined**:
- Section is hidden
- Smart filtering removes leagues user is already in

## Technical Details

### State Management
```javascript
// Store state
{
  myLeagues: [],       // User's current leagues
  publicLeagues: [],   // Filtered public leagues (excluding myLeagues)
  currentLeagueId: 1   // Active league
}
```

### Filtering Logic
```javascript
// Filter out leagues user is already a member of
const myLeagueIds = this.myLeagues.map(l => l.id)
this.publicLeagues = response.data.filter(league => !myLeagueIds.includes(league.id))
```

### Performance
- **Single API call** - Fetches all public leagues once on mount
- **Client-side filtering** - Fast filtering without additional API calls
- **Cached data** - Store maintains publicLeagues state

## Testing Scenarios

### ✅ User with No Leagues
1. Login as new user
2. Navigate to `/leagues`
3. **Expected**: See public leagues section
4. **Expected**: All public leagues are shown

### ✅ User with Some Leagues
1. Login as user with 2 leagues
2. Navigate to `/leagues`
3. **Expected**: See "My Leagues" (2 cards)
4. **Expected**: See "Public Leagues" (excluding those 2)

### ✅ User in All Public Leagues
1. Login as user who joined all public leagues
2. Navigate to `/leagues`
3. **Expected**: Only "My Leagues" section visible
4. **Expected**: No "Public Leagues" section

### ✅ League at Capacity
1. Create public league with maxPlayers=5
2. Add 5 members
3. Login as different user
4. Navigate to `/leagues`
5. **Expected**: League shows "Full" button (disabled)

### ✅ Joining Flow
1. View public league
2. Click "Join League"
3. Complete join flow
4. Return to `/leagues`
5. **Expected**: League moved to "My Leagues"
6. **Expected**: League removed from "Public Leagues"

## Future Enhancements

### Possible Improvements
- [ ] Search/filter public leagues by name
- [ ] Sort options (by members, date, status)
- [ ] League tags/categories (competitive, casual, etc.)
- [ ] Featured leagues section
- [ ] League preview modal (view details before joining)
- [ ] Join request system for private leagues
- [ ] "Recommended for you" based on user preferences

### Related Features
- League search functionality
- League recommendations algorithm
- Social features (league reviews, ratings)
- League discovery feed

## Files Modified

1. `app/stores/leagues.js` - Added `publicLeagues` state and `fetchPublicLeagues()` action
2. `app/pages/leagues/index.vue` - Added "Public Leagues" section with grid layout
3. `app/pages/index.vue` - Updated to use store for public leagues, enhanced UI with status badges

## Implementation Details

### Landing Page (`app/pages/index.vue`)
The landing page now uses the same store logic as the leagues page:

```javascript
import { useLeaguesStore } from '~/stores/leagues'
import { useFormatting } from '~/composables/useFormatting'

const leaguesStore = useLeaguesStore()
const { publicLeagues, loading } = storeToRefs(leaguesStore)
const { formatDate } = useFormatting()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await navigateTo('/dashboard')
    return
  }
  await leaguesStore.fetchPublicLeagues()
})
```

**Key Features**:
- Uses shared store for consistency
- **Uses `useFormatting` composable** for date formatting
- Shows enhanced league cards with status badges
- Displays start date with Calendar icon
- Shows capacity (X / Y members)
- "League Full" state for at-capacity leagues
- Color-coded status badges (active = green, completed = blue)

### Leagues Management Page (`app/pages/leagues/index.vue`)
For authenticated users viewing their leagues:

```javascript
import { useFormatting } from '~/composables/useFormatting'

const { formatDate } = useFormatting()

onMounted(async () => {
  await leaguesStore.fetchMyLeagues()
  await leaguesStore.fetchPublicLeagues()
})
```

**Key Features**:
- Shows "My Leagues" section (purple theme)
- Shows "Public Leagues" section below (green theme)
- **Uses `useFormatting` composable** for consistent date formatting
- Join button redirects to join flow with leagueId
- Smart filtering excludes already-joined leagues

## Code Quality Improvements

### Composable Usage
Both pages now use the `useFormatting` composable instead of local date formatting functions:

**Before**:
```javascript
// Local function in each component
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { ... })
}
```

**After**:
```javascript
// Shared composable
import { useFormatting } from '~/composables/useFormatting'
const { formatDate } = useFormatting()
```

**Benefits**:
- ✅ **Consistency** - Same date format across all pages
- ✅ **Maintainability** - Single source of truth for date formatting
- ✅ **Reusability** - No code duplication
- ✅ **Type Safety** - TypeScript types from composable
- ✅ **Testability** - Easier to test formatting logic

## Dependencies

- Existing `/api/leagues/public` endpoint (already implemented)
- `leagues.isPublic` field in database schema
- `leagueMemberships` table for member counts
- `lucide-vue-next` for Globe icon

## API Endpoints Used

- `GET /api/leagues/public` - Fetch all public leagues
- `GET /api/leagues/my` - Fetch user's leagues (for filtering)

---

**Impact**: Improved league discovery, easier onboarding  
**Breaking Changes**: None  
**Backward Compatible**: Yes  
**Performance**: Minimal (single API call on page load)
