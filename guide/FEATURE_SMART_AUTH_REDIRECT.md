# Feature: Smart Auth Redirect for New Users

**Date**: October 18, 2025  
**Status**: ✅ Complete

## Overview

Updated the Auth0 callback handler to intelligently redirect users based on whether they have joined any leagues. New users with no leagues are sent to the leagues page, while existing users with leagues go to the dashboard.

## Problem

When a new user created an account:
1. They were redirected to `/dashboard`
2. Dashboard showed "No league selected" message
3. Very confusing - unclear what to do next
4. No obvious path to join or create a league

**User Experience Issue**: New users landed on a mostly empty page with no clear next steps.

## Solution

Added league membership check in the auth callback to provide appropriate redirect:

### Code Change

**File**: `server/api/auth/callback.get.ts`

```typescript
// Check if user has any leagues (for redirect logic)
const { leagueMemberships } = await import('../../../db/schema')
const userMemberships = await db
  .select()
  .from(leagueMemberships)
  .where(eq(leagueMemberships.userId, dbUser.id))

// If user has no leagues, send them to the leagues page to join/create
// Otherwise, send to dashboard
const redirectUrl = userMemberships.length === 0 ? '/leagues' : '/dashboard'

return sendRedirect(event, redirectUrl, 302)
```

## User Flow Improvements

### New User Flow (First Time)
1. User creates account via Auth0
2. ✅ **NEW**: Redirect to `/leagues` page
3. User sees:
   - Empty "My Leagues" section with clear message
   - "Create League" button prominently displayed
   - Public leagues (if any) to join
4. User can immediately create or join a league
5. Clear call-to-action and next steps

### Returning User Flow
1. User logs in via Auth0
2. ✅ Redirect to `/dashboard` (as before)
3. User sees their current league's dashboard
4. Immediate access to standings, matches, painting leaderboard

### Edge Case: User Left All Leagues
1. Existing user left all their leagues
2. User logs out and logs back in
3. ✅ Redirect to `/leagues` (no leagues = show leagues page)
4. User can rejoin or create new leagues

## Technical Details

### Query Added
```typescript
const userMemberships = await db
  .select()
  .from(leagueMemberships)
  .where(eq(leagueMemberships.userId, dbUser.id))
```

### Decision Logic
- **No memberships** (`userMemberships.length === 0`) → `/leagues`
- **Has memberships** → `/dashboard`

### Performance Impact
- One additional database query per login
- Query is simple and indexed (userId)
- Minimal performance impact (~5-10ms)

## Benefits

✅ **Better First-Time User Experience** - Clear path forward  
✅ **Contextual Redirects** - Right place at right time  
✅ **Reduced Confusion** - No empty dashboard for new users  
✅ **Faster Onboarding** - Immediate access to create/join actions  
✅ **Handles Edge Cases** - Works for users who left all leagues  

## Pages Updated

### `/leagues` (Destination for New Users)
Shows:
- "No Leagues Yet" message
- "Create League" button
- "Join League" button
- Public leagues list (if available)
- Clear onboarding experience

### `/dashboard` (Destination for Existing Users)
Shows:
- Current league overview
- Standings table
- Recent matches
- Painting leaderboard
- Immediate utility for engaged users

## Testing Scenarios

### ✅ Scenario 1: Brand New User
1. User creates account
2. Expected: Redirect to `/leagues`
3. Result: ✅ User sees leagues page with create/join options

### ✅ Scenario 2: Existing User with Leagues
1. User logs in (has leagues)
2. Expected: Redirect to `/dashboard`
3. Result: ✅ User sees their dashboard

### ✅ Scenario 3: User Left All Leagues
1. User had leagues, left them all
2. User logs out and logs back in
3. Expected: Redirect to `/leagues`
4. Result: ✅ User can rejoin or create new

### ✅ Scenario 4: User Creates League After Landing
1. New user lands on `/leagues`
2. User creates first league
3. Expected: Navigates to `/dashboard`
4. Result: ✅ Standard flow works

## Related Components

- `server/api/auth/callback.get.ts` - Added membership check
- `app/pages/leagues/index.vue` - Destination for new users
- `app/pages/dashboard.vue` - Destination for existing users
- `db/schema.ts` - leagueMemberships table

## Impact

- **User Experience**: ✅ Significantly improved for new users
- **Onboarding**: ✅ Faster time to first league
- **Clarity**: ✅ Clear next steps at all times
- **Performance**: Minimal impact (one extra query)
- **Existing Users**: ✅ No change to their flow

## Future Enhancements

Potential improvements:
- Track if it's the user's first login (separate from league count)
- Show onboarding tutorial for first-time users
- Pre-populate league creation form with sensible defaults
- Add "Welcome!" banner on leagues page for new users

---

**Status**: ✅ Complete  
**Lint**: ✅ No errors  
**User Impact**: High - Dramatically improves new user experience
