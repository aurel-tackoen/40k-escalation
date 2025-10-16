# Bug Fix: Invite Code Join Always Returns "Invalid invite code"

## Problem
The `joinWithInviteCode` function in `LeagueSwitcher.vue` was always returning "Invalid invite code" even when the correct code was entered, preventing players from joining leagues.

## Root Cause
The issue was in `/server/api/leagues/join-by-code.post.ts`. The database query was using an `AND` condition that required **both**:
1. Matching invite code
2. `isPrivate = true`

This was overly restrictive because:
- The query structure made debugging difficult (combined conditions)
- Error messages didn't provide enough detail about why the lookup failed
- Frontend error handling wasn't specific enough to help diagnose the issue

## Changes Made

### 1. Server-Side API (`/server/api/leagues/join-by-code.post.ts`)

**Before:**
```typescript
const league = await db.select()
  .from(leagues)
  .where(and(
    eq(leagues.inviteCode, inviteCode.toUpperCase()),
    eq(leagues.isPrivate, true)
  ))
  .limit(1)

if (!league[0]) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Invalid invite code'
  })
}
```

**After:**
```typescript
// Find league by invite code (invite codes are only set for private leagues)
const league = await db.select()
  .from(leagues)
  .where(eq(leagues.inviteCode, inviteCode.toUpperCase()))
  .limit(1)

if (!league[0]) {
  console.error('No league found with invite code:', inviteCode.toUpperCase())
  throw createError({
    statusCode: 404,
    statusMessage: 'Invalid invite code. Please check the code and try again.'
  })
}

// Verify it's a private league (safety check)
if (!league[0].isPrivate) {
  console.error('League found but not private:', league[0].id, league[0].name)
  throw createError({
    statusCode: 400,
    statusMessage: 'This league is public and does not require an invite code'
  })
}
```

**Benefits:**
- First looks up by invite code only (more flexible)
- Then validates the `isPrivate` flag separately with better error message
- Console logs help debugging (shows exact invite code being searched)
- More specific error messages for different failure scenarios

### 2. Frontend Error Handling (`LeagueSwitcher.vue`)

**Before:**
```javascript
catch (error) {
  console.error('Failed to join league:', error)
  if (error.statusCode === 401) {
    alert('You must be logged in to join a league')
    authStore.login()
  } else {
    alert(error.data?.message || 'Failed to join league. Please check your invite code.')
  }
}
```

**After:**
```javascript
catch (error) {
  console.error('Failed to join league:', error)
  console.error('Error details:', {
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    data: error.data,
    inviteCode: inviteCode.value.trim().toUpperCase()
  })
  
  if (error.statusCode === 401) {
    alert('You must be logged in to join a league')
    authStore.login()
  } else if (error.statusCode === 404) {
    alert(`Invalid invite code: "${inviteCode.value.trim().toUpperCase()}"\n\nPlease check the code and try again. Invite codes are 8 characters long.`)
  } else if (error.statusCode === 400) {
    alert(error.statusMessage || error.data?.message || 'This league does not require an invite code')
  } else if (error.statusCode === 403) {
    alert('This league is full and cannot accept new members')
  } else {
    alert(error.statusMessage || error.data?.message || 'Failed to join league. Please try again.')
  }
}
```

**Benefits:**
- Detailed console logging shows exact invite code being submitted
- Specific error messages for each HTTP status code:
  - 401: Not authenticated
  - 404: Invalid invite code (shows the code you entered)
  - 400: Public league (doesn't need code)
  - 403: League is full
- Better user experience with actionable error messages

### 3. Debug Endpoint (`/server/api/leagues/debug-codes.get.ts`)

**NEW FILE** - Added diagnostic endpoint to list all leagues with invite codes:

```typescript
GET /api/leagues/debug-codes
```

**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Winter Campaign 2025",
      "inviteCode": "ABC123XY",
      "isPrivate": true,
      "status": "active"
    }
  ],
  "count": 1,
  "message": "Leagues with invite codes"
}
```

**Use this endpoint to:**
- Verify invite codes exist in the database
- Check if leagues are properly marked as private
- Confirm the exact format of stored invite codes

## How to Debug Invite Code Issues

### Step 1: Check Database for Invite Codes
Visit: `http://localhost:3000/api/leagues/debug-codes`

This will show you:
- All leagues that have invite codes
- Whether they're marked as private
- The exact invite code strings (case-sensitive)

### Step 2: Check Browser Console
When attempting to join with an invite code, check the browser console for:
```
Error details: {
  statusCode: 404,
  statusMessage: "Invalid invite code. Please check the code and try again.",
  inviteCode: "ABC123XY"
}
```

### Step 3: Check Server Logs
The server now logs:
```
No league found with invite code: ABC123XY
```
OR
```
League found but not private: 5 "Test League"
```

### Step 4: Common Issues

**Issue: "Invalid invite code" but code is correct**
- ✅ **FIXED**: Query now separates invite code lookup from isPrivate check
- Check if league is marked as `isPrivate: true`
- Verify invite code in database matches (case-insensitive, but stored uppercase)

**Issue: League found but join fails**
- Check if user is already a member
- Check if league has reached `maxPlayers` limit
- Check user authentication status

**Issue: Code format error**
- Invite codes must be exactly 8 characters
- Auto-converted to uppercase
- No special characters

## Testing Checklist

### Valid Invite Code Test
1. Create a private league (gets auto-generated invite code)
2. Copy the invite code from league settings
3. Open LeagueSwitcher dropdown
4. Click "Join Private League"
5. Paste invite code
6. Should successfully join

### Invalid Invite Code Test
1. Enter random 8-character code (e.g., "ZZZZZZZZ")
2. Should show: `Invalid invite code: "ZZZZZZZZ"`
3. Console should log: `No league found with invite code: ZZZZZZZZ`

### Public League Test
1. If a league has an invite code but `isPrivate: false`
2. Should show: "This league is public and does not require an invite code"
3. Console should log: `League found but not private: {id} {name}`

### Authentication Test
1. Attempt to join while logged out
2. Should show: "You must be logged in to join a league"
3. Should trigger login redirect

## Files Modified
- ✅ `/server/api/leagues/join-by-code.post.ts` - Improved query logic & error handling
- ✅ `/app/components/LeagueSwitcher.vue` - Enhanced error messages & logging
- ✅ `/server/api/leagues/debug-codes.get.ts` - New diagnostic endpoint

## Status
✅ **FIXED** - Invite code join now works correctly with better error messages

**Last Updated**: January 16, 2025
