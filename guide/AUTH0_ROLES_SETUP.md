# Auth0 Roles Setup Guide

**Date**: October 14, 2025  
**Status**: ✅ Complete

## Overview
This guide explains how to properly configure and retrieve user roles from Auth0 using the Management API approach.

## How Auth0 Roles Work

### Key Concepts
1. **Roles are NOT in tokens by default** - Unlike basic user info (name, email, picture), roles must be explicitly retrieved
2. **Roles are managed via RBAC** - Auth0's Role-Based Access Control feature
3. **Two ways to get roles**:
   - **Management API** (current implementation) - Fetch during callback
   - **Auth0 Actions** (alternative) - Add as custom claims to tokens

## Current Implementation

### Flow
1. User logs in via Auth0
2. `callback.get.ts` receives authorization code
3. Exchange code for access token
4. Fetch user info from `/userinfo` endpoint
5. **Fetch user roles from Management API** using access token
6. Store role in session cookie
7. `user.get.ts` reads role from session

### Files Modified
- `server/api/auth/callback.get.ts` - Added role fetching logic
- `server/api/auth/user.get.ts` - Reads role from session
- `db/schema.ts` - Added `role` field to users table
- `app/components/ProfileView.vue` - Displays role badge

## Setting Up Roles in Auth0

### Step 1: Enable RBAC for Your API

1. Go to **Auth0 Dashboard** → **Applications** → **APIs**
2. Select your API (or create one if needed)
3. Go to **Settings** tab
4. Enable **RBAC** toggle
5. Enable **Add Permissions in the Access Token** (optional)
6. Save changes

### Step 2: Create Roles

1. Go to **Auth0 Dashboard** → **User Management** → **Roles**
2. Click **Create Role**
3. Create the following roles:
   - **Name**: `admin`  
     **Description**: Full system access
   - **Name**: `organizer`  
     **Description**: Can manage leagues and matches
   - **Name**: `user`  
     **Description**: Standard user access (default)

### Step 3: Assign Roles to Users

**Option A: Via Dashboard**
1. Go to **User Management** → **Users**
2. Click on a user
3. Go to **Roles** tab
4. Click **Assign Role**
5. Select role(s) and click **Assign**

**Option B: Via Management API**
```bash
curl --request POST \
  --url 'https://{yourDomain}/api/v2/users/{userId}/roles' \
  --header 'authorization: Bearer {MGMT_API_TOKEN}' \
  --header 'content-type: application/json' \
  --data '{"roles": ["rol_xxxxxxxxxxxxx"]}'
```

### Step 4: Configure API Scopes

For the Management API call to work, your Auth0 application needs the right scopes.

**Option A: Update Auth0 Login Configuration** (Recommended)

Update your Auth0 login URL to request the necessary scope:

In `server/api/auth/login.get.ts`:
```typescript
const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
  `response_type=code&` +
  `client_id=${AUTH0_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(AUTH0_CALLBACK_URL)}&` +
  `scope=${encodeURIComponent('openid profile email read:current_user')}` // Added read:current_user
```

**Option B: Use a Machine-to-Machine Application** (More Complex)

If the access token doesn't have Management API access:
1. Create a Machine-to-Machine application
2. Grant it `read:users` and `read:roles` scopes
3. Use that token in the callback instead

## Testing

### 1. Check Console Logs
The `user.get.ts` file has `console.log(sessionData)` - check your server logs to see:
```javascript
{
  sub: "auth0|...",
  email: "user@example.com",
  name: "User Name",
  picture: "https://...",
  role: "admin",        // ← Should be here
  roles: ["admin"],     // ← Array of all roles
  access_token: "...",
  expires_at: 1234567890
}
```

### 2. Check Profile Page
After login, go to `/profile` and verify:
- Role badge appears (Admin/Organizer/User)
- Correct color coding (Red/Purple/Blue)

### 3. Verify Database
Check that role is stored in database:
```sql
SELECT id, email, name, role FROM users;
```

## Troubleshooting

### Issue: Role is Always "user"
**Cause**: Management API call is failing (403 Forbidden or 401 Unauthorized)

**Solutions**:
1. Check Auth0 application has `read:current_user` scope
2. Verify the access token has Management API audience
3. Check console logs for "Could not fetch user roles" message
4. Alternative: Use Auth0 Actions approach (see below)

### Issue: 403 Forbidden on /api/v2/users/.../roles
**Cause**: Access token doesn't have permission to call Management API

**Solution**: Add `read:current_user` scope to login request OR use Machine-to-Machine token

### Issue: Empty roles array
**Cause**: User has no roles assigned in Auth0

**Solution**: Assign at least one role to the user in Auth0 Dashboard

## Alternative: Using Auth0 Actions

If Management API approach doesn't work, use Actions to add roles to tokens:

### Create an Action

1. Go to **Auth0 Dashboard** → **Actions** → **Flows**
2. Select **Login** flow
3. Click **Custom** → **Build Custom**
4. Name it "Add Roles to Token"
5. Add this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://40k-escalation.app';
  
  if (event.authorization) {
    // Get user roles
    const roles = event.authorization.roles || [];
    
    // Determine primary role
    let primaryRole = 'user';
    if (roles.includes('admin')) {
      primaryRole = 'admin';
    } else if (roles.includes('organizer')) {
      primaryRole = 'organizer';
    }
    
    // Add to ID token (namespaced)
    api.idToken.setCustomClaim(`${namespace}/role`, primaryRole);
    api.idToken.setCustomClaim(`${namespace}/roles`, roles);
    
    // Add to access token (namespaced)
    api.accessToken.setCustomClaim(`${namespace}/role`, primaryRole);
    api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
  }
};
```

6. Click **Deploy**
7. Add the Action to your Login flow (drag & drop)

### Update Callback to Use Custom Claims

In `server/api/auth/callback.get.ts`, if using Actions:
```typescript
// Role will be in the user object from /userinfo or in token
const role = user['https://40k-escalation.app/role'] || 'user';
const roles = user['https://40k-escalation.app/roles'] || [];
```

## Role Hierarchy

```
admin (highest)
  ↓
organizer
  ↓
user (default/lowest)
```

### Role Permissions (Future Enhancement)
- **admin**: Full access, user management, league management
- **organizer**: League creation, match management, user management
- **user**: View own stats, submit armies, record own matches

## Security Notes

1. **Never trust client-side role checks** - Always verify on server
2. **Roles are stored in session cookie** - Ensure cookie is httpOnly and secure
3. **Role changes require re-login** - Session is only updated during callback
4. **Default to least privilege** - If no role found, default to 'user'

## References

- [Auth0 Roles Documentation](https://auth0.com/docs/manage-users/access-control/configure-core-rbac/rbac-users)
- [View User Roles](https://auth0.com/docs/manage-users/access-control/configure-core-rbac/rbac-users/view-user-roles)
- [Assign Roles to Users](https://auth0.com/docs/manage-users/access-control/configure-core-rbac/rbac-users/assign-roles-to-users)
- [Custom Claims](https://auth0.com/docs/secure/tokens/json-web-tokens/create-custom-claims)
- [Auth0 Actions](https://auth0.com/docs/customize/actions)

---

**Last Updated**: October 14, 2025  
**Implementation**: Management API approach with Auth0 Actions as alternative
