# Role Display Implementation

**Date**: October 14, 2025  
**Status**: ✅ Complete

## Overview
Added role display functionality to show user roles from Auth0 on the profile page with color-coded badges.

## Changes Made

### 1. Database Schema (`db/schema.ts`)
Added `role` field to the users table:
```typescript
role: varchar({ length: 50 }).default('user').notNull()
```

**Migration**: `0005_noisy_iron_fist.sql`

### 2. API Endpoint (`server/api/auth/user.get.ts`)
Enhanced to capture role from Auth0 session data:
- Checks multiple Auth0 metadata locations:
  - Custom namespace: `https://40k-escalation/role`
  - App metadata: `app_metadata.role`
  - User metadata: `user_metadata.role`
  - Direct field: `role`
- Falls back to `'user'` if no role is found
- Updates role on every login (syncs with Auth0)

### 3. Auth Store (`app/stores/auth.js`)
Added role-related getters:
- `userRole` - Returns user role string
- `isAdmin` - Check if user has admin role
- `isOrganizer` - Check if user is organizer or admin

### 4. Profile Component (`app/components/ProfileView.vue`)
Added role display with badges:

**Imports**:
- Added `Shield` icon from Lucide
- Added `computed` from Vue

**Computed Properties**:
- `roleBadgeClass` - Dynamic badge styling based on role
- `roleDisplayName` - Capitalized role name

**Badge Colors**:
- 🔴 **Admin**: Red badge (`bg-red-500/20 text-red-400 border-red-500`)
- 🟣 **Organizer**: Purple badge (`bg-purple-500/20 text-purple-400 border-purple-500`)
- 🔵 **User**: Blue badge (`bg-blue-500/20 text-blue-400 border-blue-500`)

**UI Placement**: Account Information section (first item)

## Usage

### Setting Role in Auth0

1. **Via Auth0 Dashboard**:
   - Go to User Management → Users
   - Select a user
   - Add to `app_metadata`:
     ```json
     {
       "role": "admin"
     }
     ```

2. **Via Auth0 Rule** (recommended for custom claims):
   ```javascript
   function addRoleToToken(user, context, callback) {
     const namespace = 'https://40k-escalation/';
     context.idToken[namespace + 'role'] = user.app_metadata.role || 'user';
     callback(null, user, context);
   }
   ```

### Accessing Role in Components

**Via Auth Store**:
```vue
<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const isOrganizer = computed(() => authStore.isOrganizer)
const userRole = computed(() => authStore.userRole)
</script>
```

**Via Profile API**:
```javascript
const { profile } = useUser()
const role = profile.value?.user?.role
```

## Role Types
- **user**: Default role, standard user access
- **organizer**: Can manage leagues and matches
- **admin**: Full system access

## Future Enhancements
- [ ] Role-based route guards
- [ ] Conditional UI elements based on role
- [ ] Admin panel for role management
- [ ] Organizer-specific features (league creation, match approval)
- [ ] Role change notifications

## Testing Checklist
- ✅ Database migration applied
- ✅ API captures role from Auth0
- ✅ Profile page displays role badge
- ✅ Auth store getters work correctly
- ✅ Zero lint errors
- ✅ Badge colors display correctly

## Technical Notes
- Role defaults to 'user' if not set in Auth0
- Role syncs on every login (always reflects Auth0 state)
- Badge uses Tailwind v4 color utilities with opacity
- Shield icon provides visual consistency with other account info

---

**Last Updated**: October 14, 2025  
**Implementation Time**: ~10 minutes  
**Files Modified**: 4
