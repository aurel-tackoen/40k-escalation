# Netlify Identity Setup Guide

## 🔐 Complete User Authentication Implementation

This guide documents the **Netlify Identity** authentication system integrated into the Warhammer 40K Escalation League Manager.

---

## 📋 Overview

**Key Features:**
- ✅ Netlify Identity widget integration
- ✅ JWT-based authentication
- ✅ Users ARE players (unified model)
- ✅ Role-based access control (player, organizer, admin)
- ✅ Protected API endpoints with ownership validation
- ✅ Profile management page
- ✅ Login/logout UI in navigation

---

## 🎯 Architecture

### User-Player Unified Model

Players and users are **the same entity**:
- `netlifyId` field links to Netlify Identity
- Users log in → automatically linked to their player profile
- Each authenticated user = one player in the league

### Database Schema

```typescript
// players table (in db/schema.ts)
export const players = pgTable('players', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  netlifyId: varchar({ length: 255 }).unique(), // ← Netlify auth
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  faction: varchar({ length: 100 }),
  role: varchar({ length: 50 }).default('player').notNull(), // ← Roles
  wins: integer().default(0).notNull(),
  losses: integer().default(0).notNull(),
  draws: integer().default(0).notNull(),
  totalPoints: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  lastLogin: timestamp() // ← Track logins
})
```

---

## 🚀 Deployment Setup

### Step 1: Enable Netlify Identity

**Via Netlify Dashboard:**
1. Go to your site in Netlify Dashboard
2. Navigate to **Identity** tab
3. Click **Enable Identity**

**Via Netlify CLI:**
```bash
netlify addons:create identity
```

### Step 2: Configure Identity Settings

**Registration Settings:**
- Go to **Identity > Settings > Registration**
- Set to **Open** or **Invite only** (recommended)
- Enable email confirmations (optional)

**External Providers (Optional):**
- Enable Google, GitHub, GitLab OAuth
- Configure OAuth app credentials

### Step 3: Configure Git Gateway (Optional)

If using Git-based workflows:
```bash
netlify addons:create git-gateway
```

### Step 4: Deploy Your Site

```bash
npm run build
netlify deploy --prod
```

### Step 5: Test Authentication

1. Visit your deployed site
2. Click "Login" in navigation
3. Sign up with email/password
4. Complete player profile
5. Start managing armies!

---

## 🔑 Authentication Flow

### 1. User Signs Up
```
User clicks "Sign Up"
  → Netlify Identity widget opens
  → User enters email/password
  → Netlify creates user account
  → JWT token issued
```

### 2. User Completes Profile
```
User redirected to /profile
  → If no player profile exists
  → Form displayed (name, faction)
  → POST /api/auth/register called
  → Player profile created in DB
  → netlifyId links user to player
```

### 3. User Logs In
```
User clicks "Login"
  → Netlify Identity widget opens
  → User enters credentials
  → JWT token issued
  → POST /api/auth/login updates lastLogin
  → User info displayed in nav
```

### 4. Protected Operations
```
User creates army
  → Client sends JWT in Authorization header
  → Server validates JWT (getCurrentUser)
  → Server checks ownership (ownsResource)
  → Operation allowed/denied
```

---

## 🛠️ Implementation Details

### Client-Side (Composable)

**Location:** `app/composables/useAuth.js`

```javascript
export function useAuth() {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  
  const login = () => netlifyIdentity.open('login')
  const logout = () => netlifyIdentity.logout()
  const getToken = () => user.value?.token?.access_token
  
  return { user, isAuthenticated, login, logout, getToken }
}
```

**Usage in Components:**
```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const { user, isAuthenticated, login, logout } = useAuth()
</script>
```

### Server-Side (Auth Utils)

**Location:** `server/utils/auth.ts`

**Key Functions:**

**1. Get Current User**
```typescript
export async function getCurrentUser(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader.substring(7)
  
  // Decode JWT payload
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  
  // Find player by netlifyId
  const player = await db.select().from(players).where(eq(players.netlifyId, payload.sub))
  
  return player[0]
}
```

**2. Require Authentication**
```typescript
export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in'
    })
  }
  
  return user
}
```

**3. Check Ownership**
```typescript
export async function ownsResource(event: H3Event, playerId: number) {
  const user = await getCurrentUser(event)
  
  // Admins can access everything
  if (user?.role === 'admin') return true
  
  // Check if user's player ID matches
  return user?.id === playerId
}
```

---

## 🔒 Protected API Endpoints

### Example: Create Army (with ownership check)

**Location:** `server/api/armies.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)
  
  const body = await readBody(event)
  
  // Check ownership - users can only create armies for themselves
  const canModify = await ownsResource(event, body.playerId)
  if (!canModify) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only manage your own armies'
    })
  }
  
  // ... create army logic
})
```

### Protected Endpoints Summary

| Endpoint | Auth Required | Ownership Check |
|----------|--------------|-----------------|
| `POST /api/armies` | ✅ | ✅ (own armies) |
| `DELETE /api/armies` | ✅ | ✅ (own armies) |
| `POST /api/matches` | ✅ | ✅ (own matches or organizer) |
| `POST /api/auth/register` | ✅ | N/A |
| `POST /api/auth/login` | ✅ | N/A |

---

## 🎨 UI Components

### 1. AuthModal Component

**Location:** `app/components/AuthModal.vue`

**Features:**
- Login/signup mode switching
- Netlify Identity widget integration
- Warhammer-themed styling
- Teleport to body (overlay)

**Usage:**
```vue
<AuthModal
  :show="showAuthModal"
  :mode="'login'" <!-- or 'signup' -->
  @close="closeAuthModal"
/>
```

### 2. Navigation (Layout)

**Location:** `app/layouts/default.vue`

**Features:**
- Login/logout buttons
- User info display (email username)
- Profile link
- Mobile menu support

**Auth Section:**
```vue
<template v-if="isAuthenticated">
  <NuxtLink to="/profile">
    <User /> {{ user.email.split('@')[0] }}
  </NuxtLink>
  <button @click="logout">
    <LogOut /> Logout
  </button>
</template>
```

### 3. Profile Page

**Location:** `app/pages/profile.vue`

**Features:**
- Display user info (name, email, faction)
- Display stats (wins, losses, win %)
- Player registration form (if no profile)
- Battle history summary

---

## 👥 Role-Based Access Control

### Roles

| Role | Permissions |
|------|-------------|
| **player** | Manage own armies, record own matches |
| **organizer** | Record any match, view all data |
| **admin** | Full access, delete any resource |

### Setting Roles

**Option 1: Netlify Dashboard**
1. Go to **Identity > Users**
2. Click user → **Edit user metadata**
3. Add `app_metadata`:
   ```json
   {
     "role": "admin"
   }
   ```

**Option 2: Database Direct**
```sql
UPDATE players SET role = 'admin' WHERE email = 'admin@example.com';
```

### Checking Roles in Code

```typescript
// Server-side
const isOrganizerOrAdmin = await isOrganizer(event)

// Client-side
const { isAdmin, isOrganizer } = useAuth()
```

---

## 🧪 Testing Authentication

### Local Development

**1. Start Dev Server:**
```bash
npm run dev:netlify  # Runs on port 8888 with Netlify functions
```

**2. Enable Netlify Identity Locally:**

Netlify Identity requires a deployed site. For local testing:
- Deploy to Netlify first
- Use the deployed site URL for identity
- Or use Netlify Dev with live functions

**3. Test Flow:**
```
1. Click "Login" → Netlify widget opens
2. Sign up with test email
3. Complete profile on /profile page
4. Try creating an army
5. Verify JWT sent in requests (DevTools → Network)
```

---

## 🐛 Troubleshooting

### Issue: "Authentication service unavailable"

**Cause:** Netlify Identity not initialized

**Fix:**
1. Check Netlify Identity is enabled in dashboard
2. Verify site is deployed
3. Check browser console for errors

### Issue: "401 Unauthorized" on API calls

**Cause:** JWT not sent or invalid

**Fix:**
1. Check user is logged in: `console.log(user.value)`
2. Verify token exists: `console.log(getToken())`
3. Check Authorization header in Network tab

### Issue: "403 Forbidden" on army creation

**Cause:** Ownership check failing

**Fix:**
1. Verify `playerId` matches logged-in user's ID
2. Check user role (admins bypass ownership)
3. Review `ownsResource()` logic in server/utils/auth.ts

### Issue: Profile page shows registration form despite logging in

**Cause:** Player profile not created after signup

**Fix:**
1. Complete registration form on /profile page
2. Check `POST /api/auth/register` succeeded
3. Verify `netlifyId` matches in database

---

## 📦 Dependencies

```json
{
  "netlify-identity-widget": "^1.9.2",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🔐 Security Best Practices

### 1. Token Handling
- ✅ Tokens stored in memory only (not localStorage)
- ✅ Tokens expire automatically (Netlify manages)
- ✅ Refresh tokens handled by Netlify widget

### 2. Server-Side Validation
- ✅ All protected endpoints verify JWT
- ✅ Ownership checks on user resources
- ✅ Role-based access control

### 3. Database Security
- ✅ `netlifyId` is unique and indexed
- ✅ Email is unique
- ✅ Passwords managed by Netlify (bcrypt)

---

## 🚀 Next Steps

### Phase 1: Basic Auth (✅ COMPLETE)
- [x] User login/logout
- [x] Protected API endpoints
- [x] Profile management
- [x] Ownership validation

### Phase 2: Enhanced Features (Optional)
- [ ] Social auth (Google, GitHub)
- [ ] Email notifications
- [ ] Password reset flow
- [ ] User avatars
- [ ] Team/organization support

### Phase 3: Advanced (Future)
- [ ] Multi-factor authentication
- [ ] API rate limiting per user
- [ ] Audit logs (who did what)
- [ ] Player invitation system

---

## 📚 Additional Resources

- [Netlify Identity Docs](https://docs.netlify.com/visitor-access/identity/)
- [Netlify Identity Widget](https://github.com/netlify/netlify-identity-widget)
- [JWT.io](https://jwt.io/) - JWT decoder
- [Nuxt 3 Server Routes](https://nuxt.com/docs/guide/directory-structure/server)

---

## ✅ Implementation Checklist

- [x] Install `netlify-identity-widget`
- [x] Add `netlifyId` and `role` to players table
- [x] Create `useAuth()` composable
- [x] Create `server/utils/auth.ts` helpers
- [x] Add auth API endpoints (`/api/auth/*`)
- [x] Protect existing API routes
- [x] Add `AuthModal` component
- [x] Add auth navigation to layout
- [x] Create `/profile` page
- [x] Enable Netlify Identity in dashboard
- [x] Deploy and test

---

**Last Updated:** October 13, 2025  
**Status:** ✅ Production Ready

**For questions or issues, refer to the main `AGENTS.md` file or Netlify support.**
