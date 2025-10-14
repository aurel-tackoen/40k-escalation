# Auth0 Role Implementation - Quick Summary

## Problem
## What You Need to Do in Auth0

### ⚠️ CRITICAL: Create the Auth0 Action First!

**Follow the complete guide in `AUTH0_ACTION_REQUIRED.md`**

Quick checklist:
1. ✅ Create roles in Auth0 Dashboard (admin, organizer, user)
2. ✅ Create Auth0 Action with the provided code
3. ✅ Deploy the Action
4. ✅ Add Action to Login Flow
5. ✅ Assign roles to users
6. ✅ Test by logging in

### Without the Action
- All users will default to `'user'` role
- Role badge will show blue "User" for everyone
- No errors, but roles won't work as expected Auth0 were not being retrieved properly. Roles are NOT included in tokens by default.

## Solution
**Use Auth0 Actions** to add roles as custom claims to the ID token during login.

## ⚠️ IMPORTANT: You Must Create an Auth0 Action

**See `AUTH0_ACTION_REQUIRED.md` for complete setup instructions.**

Without the Auth0 Action, all users will have role: `'user'` by default.

## Changes Made

### 1. Callback Endpoint (`server/api/auth/callback.get.ts`)
- Reads roles from custom claims in userinfo
- Custom claims namespace: `https://40k-escalation.app/role`
- Determines primary role (admin > organizer > user)
- Stores `role` and `roles` in session cookie

### 2. User Endpoint (`server/api/auth/user.get.ts`)
- Reads `role` directly from session data
- Updates database with current role on every login

## How It Works

```
1. User clicks "Login" 
   → Redirects to Auth0

2. User authenticates at Auth0
   → Auth0 executes your custom Action

3. Action adds roles to token
   → Reads user's assigned roles
   → Adds as custom claims: https://40k-escalation.app/role

4. Auth0 redirects back with authorization code

5. Callback endpoint exchanges code for tokens

6. Fetch user info from /userinfo
   → Gets profile INCLUDING custom role claims

7. Extract role from custom claims
   → user['https://40k-escalation.app/role']

8. Store role in session cookie
   → Session includes: { sub, email, name, picture, role, roles, ... }

9. User endpoint reads role from session
   → Updates database with current role on every login
```

## What You Need to Do in Auth0

### 1. Create Roles (if not already done)
- Go to **User Management** → **Roles**
- Create: `admin`, `organizer`, `user`

### 2. Assign Roles to Users
- Go to **User Management** → **Users**
- Click on user → **Roles** tab → **Assign Role**

### 3. Test the Implementation
1. Login to your app
2. Check server console logs for the session data
3. Should see: `role: "admin"` (or organizer/user)
4. Visit `/profile` to see role badge

## Troubleshooting

### If role is still "user" for everyone:

**Check 1**: Console logs during login
- Look for: `"Could not fetch user roles, defaulting to "user""`
- This means the Management API call failed

**Check 2**: Access token permissions
- The `read:current_user` scope might not work for all Auth0 setups
- Alternative: Use Auth0 Actions (see AUTH0_ROLES_SETUP.md)

**Check 3**: Verify roles are assigned in Auth0 Dashboard
- User Management → Users → [Select User] → Roles tab
- Should show assigned roles

## Alternative: Auth0 Actions (Recommended)

If Management API approach doesn't work, use Actions to add roles directly to tokens:

1. Go to **Actions** → **Flows** → **Login**
2. Create custom action (see AUTH0_ROLES_SETUP.md for code)
3. Add roles as namespaced custom claims
4. Roles will be in token automatically

## Files to Review

- `/guide/AUTH0_ROLES_SETUP.md` - Complete setup guide
- `/guide/ROLE_DISPLAY_IMPLEMENTATION.md` - UI implementation details
- `/server/api/auth/login.get.ts` - OAuth login with scopes
- `/server/api/auth/callback.get.ts` - Role fetching logic
- `/server/api/auth/user.get.ts` - Session role reading
- `/app/components/ProfileView.vue` - Role badge display

## Testing Checklist

- [ ] Roles created in Auth0 Dashboard (admin, organizer, user)
- [ ] Roles assigned to test users
- [ ] Login redirects properly
- [ ] Console logs show role in sessionData
- [ ] Profile page displays correct role badge
- [ ] Database stores correct role
- [ ] Zero lint errors (`npm run lint`)

---

**Implementation Date**: October 14, 2025  
**Status**: ✅ Ready to test
