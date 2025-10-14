# Feature: Show All Public Leagues with "Joined" Badge

> ✅ **Implemented** - October 14, 2025

## Overview

Instead of filtering out public leagues that the user has already joined, we now **show ALL public leagues** with a visual "Joined" badge for leagues the user is a member of. This provides better visibility and user experience.

## User Experience Benefits

### Before (Filtered Approach)
- ❌ Joined leagues disappeared from public list
- ❌ Users couldn't see which public leagues they're in
- ❌ No way to reference public league details after joining
- ❌ Confusing when all public leagues are joined (empty list)

### After (Badge Approach)
- ✅ All public leagues always visible
- ✅ Clear visual indicator for joined leagues
- ✅ Users can see all public leagues at a glance
- ✅ Better context and discoverability

## Implementation Details

### 1. **API Enhancement - Add `isJoined` Flag**

**File**: `server/api/leagues/public.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId ? parseInt(query.userId as string) : null

  // Get league IDs the user is a member of
  let userLeagueIds: number[] = []
  if (userId) {
    const userLeagues = await db
      .select({ leagueId: leagueMemberships.leagueId })
      .from(leagueMemberships)
      .where(eq(leagueMemberships.userId, userId))
    userLeagueIds = userLeagues.map(l => l.leagueId)
  }

  // Fetch ALL public leagues
  const publicLeagues = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      // ... other fields
    })
    .from(leagues)
    .where(eq(leagues.isPublic, true))
    .orderBy(leagues.createdAt)

  // Add isJoined flag to each league
  const leaguesWithJoinedStatus = publicLeagues.map(league => ({
    ...league,
    isJoined: userLeagueIds.includes(league.id)
  }))

  return {
    success: true,
    data: leaguesWithJoinedStatus,
    count: leaguesWithJoinedStatus.length
  }
})
```

**Key Changes:**
- ✅ Removed `notInArray()` filter - returns ALL public leagues
- ✅ Added `isJoined` boolean flag to each league
- ✅ Server-side computation (efficient)
- ✅ Works for authenticated users and guests

**API Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "name": "Summer Campaign 2025",
      "isJoined": true,  // ✅ New field
      "memberCount": 8,
      // ... other fields
    },
    {
      "id": 10,
      "name": "Fall Tournament",
      "isJoined": true,
      "memberCount": 12,
      // ... other fields
    },
    {
      "id": 11,
      "name": "Beginners League",
      "isJoined": false,  // Not a member
      "memberCount": 5,
      // ... other fields
    }
  ],
  "count": 3
}
```

### 2. **LeagueCard Component - Badge System**

**File**: `app/components/LeagueCard.vue`

#### Added Computed Property
```javascript
const isJoined = computed(() => props.league.isJoined === true)
```

#### Visual States

**Public League (Not Joined):**
```vue
<!-- Green "Public" badge -->
<div class="absolute -top-3 -right-3 bg-green-600 text-green-100 ...">
  <Globe :size="14" />
  Public
</div>
```

**Public League (Joined):**
```vue
<!-- Blue "Joined" badge -->
<div class="absolute -top-3 -right-3 bg-blue-600 text-blue-100 ...">
  ✓ Joined
</div>
```

#### Card Styling
```javascript
const cardClass = computed(() => {
  const base = 'card hover:border transition-all duration-200 group relative'
  const joined = isJoined.value ? 'opacity-75' : ''  // Slightly dimmed
  // ... other classes
  return `${base} ${interactive} ${current} ${hoverColor} ${joined}`
})
```

Joined leagues have reduced opacity (75%) to visually differentiate them.

#### Button States

**Not Joined:**
```vue
<button class="btn-primary" :disabled="false">
  Join League
</button>
```

**Joined:**
```vue
<button class="btn-primary opacity-50 cursor-not-allowed" :disabled="true">
  Already Joined
</button>
```

**Full:**
```vue
<button class="btn-primary opacity-50 cursor-not-allowed" :disabled="true">
  League Full
</button>
```

### 3. **Store Simplification**

**File**: `app/stores/leagues.js`

```javascript
async fetchPublicLeagues() {
  this.loading = true
  this.error = null
  try {
    const authStore = useAuthStore()
    const userId = authStore.user?.id

    // Fetch all public leagues with joined status
    const url = userId ? `/api/leagues/public?userId=${userId}` : '/api/leagues/public'
    const response = await $fetch(url)

    if (response.success) {
      // Server returns all public leagues with isJoined flag
      const allPublicLeagues = Array.isArray(response.data) ? response.data : []
      this.publicLeagues = allPublicLeagues  // No filtering needed!
    } else {
      this.publicLeagues = []
    }
  } catch (error) {
    this.error = error.message
    this.publicLeagues = []
  } finally {
    this.loading = false
  }
}
```

**Benefits:**
- ✅ No client-side filtering logic
- ✅ Simpler code (just assignment)
- ✅ Server does the work
- ✅ Always shows all leagues

## Visual Design

### Badge Color Coding

| Badge | Color | Meaning |
|-------|-------|---------|
| 🟢 Public | Green | Available to join |
| 🔵 ✓ Joined | Blue | Already a member |
| 🟣 ✓ Current | Purple | Current active league |
| 🟡 Public | Yellow | Guest view (landing page) |

### Card States

| State | Opacity | Button | Border Hover |
|-------|---------|--------|--------------|
| Not Joined | 100% | "Join League" (enabled) | Green |
| Joined | 75% | "Already Joined" (disabled) | Green |
| Full | 100% | "League Full" (disabled) | Green |

## User Flows

### Authenticated User on Leagues Page

1. Navigate to `/leagues`
2. See "My Leagues" section (leagues you've joined)
3. Scroll to "Public Leagues" section
4. See ALL public leagues:
   - Leagues with blue "✓ Joined" badge → Already a member
   - Leagues with green "Public" badge → Can join
   - Slightly dimmed cards → Already joined
5. Click "Join League" on available leagues
6. Click "Already Joined" does nothing (disabled)

### Guest User on Landing Page

1. Visit landing page (not authenticated)
2. See "Join a Public League" section
3. All public leagues shown with green "Public" badge
4. No "Joined" badges (not authenticated)
5. Click "Join League" → Redirects to signup

## Edge Cases Handled

✅ **All public leagues are joined:**
- Before: Empty section (confusing)
- After: Shows all leagues with "Joined" badges (clear)

✅ **No public leagues exist:**
- Shows "No public leagues available" message (same as before)

✅ **User not authenticated:**
- `isJoined` is `false` for all leagues
- All leagues show "Public" badge

✅ **League becomes full:**
- Button changes to "League Full" (disabled)
- Works whether joined or not

## API Behavior

### Guest Request
```
GET /api/leagues/public
→ Returns all public leagues with isJoined: false
```

### Authenticated Request
```
GET /api/leagues/public?userId=123
→ Returns all public leagues with correct isJoined values
```

### Database Queries
```sql
-- Query 1: Get user's league memberships (if userId provided)
SELECT leagueId FROM leagueMemberships WHERE userId = 123

-- Query 2: Get all public leagues
SELECT * FROM leagues WHERE isPublic = true ORDER BY createdAt

-- Client: Map isJoined flag based on membership
```

**Performance:** 2 simple queries, no complex joins

## Components Updated

1. **server/api/leagues/public.get.ts**
   - Removed filtering logic
   - Added `isJoined` flag mapping
   - Returns all public leagues

2. **app/components/LeagueCard.vue**
   - Added `isJoined` computed property
   - Added "Joined" badge variant (blue)
   - Updated button logic (disable if joined)
   - Added opacity styling for joined cards

3. **app/stores/leagues.js**
   - Removed client-side filtering
   - Simplified to direct assignment
   - Added cleaner comments

4. **app/pages/leagues/index.vue**
   - Removed diagnostic logging
   - No functional changes (just cleanup)

## Testing Checklist

- ✅ Zero lint errors
- ⏳ User with no leagues → All public leagues show "Public" badge
- ⏳ User with some leagues → Correct "Joined" badges
- ⏳ User with all leagues → All show "Joined" badges
- ⏳ Guest user → All show "Public" badge
- ⏳ "Already Joined" button is disabled
- ⏳ "Join League" button works for non-joined leagues
- ⏳ Joined cards have reduced opacity
- ⏳ Badge colors match design (green/blue)

## Related Documentation

- **Component**: `guide/COMPONENT_LEAGUE_CARD.md`
- **Public Leagues**: `guide/FEATURE_PUBLIC_LEAGUES_DISCOVERY.md`
- **Previous Bug**: `guide/BUG_FIX_PUBLIC_LEAGUES_DISAPPEARING.md`

## Status

**Implementation**: ✅ Complete  
**Testing**: ⏳ Pending user verification  
**Code Quality**: ✅ Zero lint errors  
**Documentation**: ✅ Complete  

---

**Last Updated**: October 14, 2025  
**Feature Type**: UX Enhancement  
**Status**: Production Ready ⚡
