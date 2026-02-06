# Bug Fix: API /leagues/my Endpoint

**Date**: October 14, 2025  
**Issue**: 500 error when calling `/api/leagues/my`

---

## 🐛 Problem

The `/api/leagues/my` endpoint was throwing a 500 error with the message:
```
Failed to load resource: the server responded with a status of 500 (Failed to fetch leagues)
```

## 🔍 Root Causes

### Issue 1: Missing userId Parameter
**Problem**: The store was calling the endpoint without the required `userId` parameter.

**Location**: `app/stores/leagues.js` - `fetchMyLeagues()` action

**Before**:
```javascript
const response = await $fetch('/api/leagues/my')
```

**After**:
```javascript
const authStore = useAuthStore()
if (!authStore.user?.id) {
  this.myLeagues = []
  this.loading = false
  return
}
const response = await $fetch(`/api/leagues/my?userId=${authStore.user.id}`)
```

### Issue 2: Incorrect Response Field Name
**Problem**: The API was returning `userRole` but the store expected `role`.

**Location**: `server/api/leagues/my.get.ts`

**Before**:
```javascript
userLeagues.push({
  ...league,
  phases: leaguePhases,
  userRole: membership.role,  // ❌ Wrong field name
  joinedAt: membership.joinedAt
})
```

**After**:
```javascript
userLeagues.push({
  id: league.id,
  name: league.name,
  description: league.description,
  startDate: league.startDate,
  endDate: league.endDate,
  currentPhase: league.currentPhase,
  isPublic: league.isPublic,
  maxPlayers: league.maxPlayers,
  status: league.status,
  phases: leaguePhases,
  role: membership.role,  // ✅ Correct field name
  joinedAt: membership.joinedAt
})
```

### Issue 3: Non-existent Field Reference
**Problem**: The API was trying to return `league.memberCount` which doesn't exist in the database schema.

**Fix**: Removed reference to `memberCount` (will default to 0 in UI with `|| 0`).

---

## ✅ Changes Made

### File: `app/stores/leagues.js`
**Function**: `fetchMyLeagues()`

**Changes**:
1. ✅ Added check for authenticated user
2. ✅ Return early with empty array if no user logged in
3. ✅ Pass `userId` query parameter to API

**Impact**: 
- Prevents 400 "userId required" errors
- Handles unauthenticated state gracefully
- Proper user context for API calls

### File: `server/api/leagues/my.get.ts`
**Endpoint**: `GET /api/leagues/my?userId=123`

**Changes**:
1. ✅ Changed `userRole` to `role` in response
2. ✅ Removed non-existent `memberCount` field
3. ✅ Explicitly defined response shape (no spread operator)

**Impact**:
- Matches expected frontend data structure
- No database errors from missing fields
- Cleaner, more maintainable code

---

## 🧪 Testing

### Manual Tests Needed
- [ ] Visit `/leagues` page - should load without 500 error
- [ ] Check browser console - no API errors
- [ ] Verify leagues display with correct role badges
- [ ] Test league switcher dropdown
- [ ] Verify authentication flow works

### Expected Behavior

**When Logged In**:
1. Store calls `/api/leagues/my?userId=123`
2. API returns user's leagues with `role` field
3. UI displays leagues with correct role badges
4. No console errors

**When Not Logged In**:
1. Store detects no user
2. Returns empty leagues array
3. UI shows "No Leagues" message
4. No API calls made

---

## 📊 Response Format

### Correct API Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Autumn Escalation 2025",
      "description": "8-week campaign",
      "startDate": "2025-01-15",
      "endDate": "2025-03-15",
      "currentPhase": 1,
      "isPublic": true,
      "maxPlayers": 20,
      "status": "active",
      "phases": [
        {
          "id": 1,
          "leagueId": 1,
          "number": 1,
          "name": "500 Points",
          "pointLimit": 500,
          "startDate": "2025-01-15",
          "endDate": "2025-01-31"
        }
      ],
      "role": "owner",  // ✅ Correct field name
      "joinedAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 🔧 Future Improvements

### memberCount Field
Currently, `memberCount` is displayed as `0` in the UI. To show actual member counts:

**Option 1**: Calculate on API side (recommended for /leagues/my)
```typescript
// Count memberships for each league
const memberCount = await db
  .select()
  .from(leagueMemberships)
  .where(eq(leagueMemberships.leagueId, league.id))
  .then(results => results.length)
```

**Option 2**: Calculate in frontend
```javascript
// Store action to fetch member count
async fetchLeagueMemberCount(leagueId) {
  const response = await $fetch(`/api/leagues/${leagueId}/members`)
  return response.count
}
```

**Recommendation**: Implement Option 1 in the `/api/leagues/my` endpoint for better UX.

---

## ✅ Status

- ✅ Bug identified
- ✅ Root causes found
- ✅ Fixes implemented
- ✅ Lint checks passing
- ⏳ Manual testing needed
- ⏳ Server restart required

---

**Next Steps**:
1. Restart dev server (`npm run dev:netlify`)
2. Clear browser cache
3. Test `/leagues` page
4. Verify no console errors
5. Test league switching functionality

**Last Updated**: October 14, 2025
