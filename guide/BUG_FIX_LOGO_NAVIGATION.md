# Logo Navigation Fix

**Status**: ✅ Fixed  
**Date**: October 14, 2025

## Issue

When clicking on the logo/title in the header menu, authenticated users were always redirected to `/dashboard` instead of being able to navigate to the home page (`/`).

## Root Cause

The index.vue page (`/`) has a redirect logic that automatically sends authenticated users to the dashboard:

```javascript
// app/pages/index.vue
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await navigateTo('/dashboard')
    return
  }
  // ... fetch public leagues for non-authenticated users
})
```

This means authenticated users could never view the landing page, even if they explicitly clicked the logo.

## Solution

Made the logo link context-aware based on authentication state:

```vue
<!-- app/layouts/default.vue -->
<NuxtLink :to="authStore.isAuthenticated ? '/leagues' : '/'" class="group">
  <h1 class="text-2xl md:text-3xl font-bold text-gray-100 hover:text-yellow-500 transition-colors duration-300 tracking-wide font-serif">
    Warhammer 40K
  </h1>
</NuxtLink>
```

### Behavior

**Before**:
- Logged out: Logo → `/` (landing page) ✓
- Logged in: Logo → `/` → auto-redirect to `/dashboard` ✗

**After**:
- Logged out: Logo → `/` (landing page) ✓
- Logged in: Logo → `/leagues` (leagues page) ✓

## Why `/leagues`?

The `/leagues` page is the most appropriate "home" page for authenticated users because:

1. **League Management Hub** - Central place to view and manage all leagues
2. **Shows Both** - Displays "My Leagues" and "Public Leagues" in one view
3. **Contextual** - User can switch between leagues or discover new ones
4. **Consistent** - Aligns with the app's multi-league architecture
5. **Better UX** - More useful than just going to current league's dashboard

## Alternative Solutions Considered

### Option 1: Remove Auto-Redirect from `/`
```javascript
// Allow authenticated users to view landing page
// DON'T auto-redirect to dashboard
```
**Pros**: Logo works as expected  
**Cons**: Landing page is designed for marketing/onboarding, not useful for active users

### Option 2: Logo → `/dashboard`
```javascript
:to="authStore.isAuthenticated ? '/dashboard' : '/'"
```
**Pros**: Direct access to current league  
**Cons**: User can already click "Dashboard" tab, logo becomes redundant

### Option 3: Logo → Current League (Selected) ✅
```javascript
:to="authStore.isAuthenticated ? '/leagues' : '/'"
```
**Pros**: 
- Access to league switcher and management
- Can discover public leagues
- Central hub for all league operations
**Cons**: None identified

## User Experience

### Navigation Flow for Logged-In Users
```
Logo Click → /leagues
  ├─ View "My Leagues" (purple cards)
  ├─ View "Public Leagues" (green cards)
  ├─ Switch between leagues
  ├─ Create new league
  └─ Join public leagues
```

### Navigation Flow for Logged-Out Users
```
Logo Click → /
  ├─ View landing page
  ├─ See public leagues
  ├─ Create account button
  └─ Login button
```

## Testing

### ✅ Logged Out User
1. Visit any page
2. Click logo/title in header
3. **Expected**: Navigate to `/` (landing page)
4. **Result**: ✓ Correct

### ✅ Logged In User
1. Visit any page (dashboard, players, etc.)
2. Click logo/title in header
3. **Expected**: Navigate to `/leagues` (leagues page)
4. **Result**: ✓ Correct

### ✅ Mobile Menu
1. Open mobile menu
2. Logo still visible and clickable
3. **Expected**: Same behavior as desktop
4. **Result**: ✓ Correct

## Files Modified

1. `app/layouts/default.vue` - Made logo link dynamic based on auth state

## Related Features

- Multi-league architecture
- League switching
- Public leagues discovery
- Authentication flow

---

**Impact**: Improved navigation UX for authenticated users  
**Breaking Changes**: None  
**Backward Compatible**: Yes
