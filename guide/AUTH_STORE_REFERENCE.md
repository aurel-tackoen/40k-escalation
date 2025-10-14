# Auth Store Reference Guide

> **Pinia Store for Auth0 Authentication** - Global state management for user authentication

## 📦 Store Location

**File**: `app/stores/auth.js`

## 🎯 Purpose

Centralized authentication state management using Pinia. Handles user login, logout, session management, and provides reactive access to user data across all components.

---

## 📊 State

```javascript
{
  user: null,        // User object from Auth0 (or null if not logged in)
  isLoading: false,  // Loading state during API calls
  error: null        // Error object if authentication fails
}
```

### User Object Structure
```javascript
{
  id: 1,
  auth0Id: "auth0|...",
  email: "user@example.com",
  name: "John Doe",
  picture: "https://...",
  createdAt: "2025-10-14T...",
  lastLoginAt: "2025-10-14T..."
}
```

---

## 🔍 Getters

### `isAuthenticated`
Check if user is currently logged in

```javascript
const authStore = useAuthStore()
if (authStore.isAuthenticated) {
  console.log('User is logged in')
}
```

**Returns**: `boolean` - `true` if user exists, `false` otherwise

---

### `userName`
Get user's display name

```javascript
const authStore = useAuthStore()
console.log(authStore.userName) // "John Doe" or "Guest"
```

**Returns**: `string` - User name or "Guest" if not logged in

---

### `userEmail`
Get user's email address

```javascript
const authStore = useAuthStore()
console.log(authStore.userEmail) // "user@example.com" or ""
```

**Returns**: `string` - User email or empty string

---

### `userAvatar`
Get user's avatar URL

```javascript
const authStore = useAuthStore()
console.log(authStore.userAvatar) // URL to avatar image
```

**Returns**: `string` - Auth0 picture URL or UI Avatars fallback

---

## ⚡ Actions

### `fetchUser()`
Fetch current user from session cookie

```javascript
const authStore = useAuthStore()

await authStore.fetchUser()

if (authStore.isAuthenticated) {
  console.log('Logged in as:', authStore.userName)
}
```

**API Call**: `GET /api/auth/user`

**Updates**: `user`, `isLoading`, `error` state

**Use Cases**:
- On app mount (in layout)
- After page refresh
- To check current session status

---

### `login()`
Redirect to Auth0 login page

```javascript
const authStore = useAuthStore()

authStore.login()
// User redirects to Auth0, then back to /dashboard after login
```

**Redirects**: `/api/auth/login` → Auth0 → `/api/auth/callback` → `/dashboard`

**Note**: This is a redirect, not an async function

---

### `logout()`
Clear session and logout from Auth0

```javascript
const authStore = useAuthStore()

authStore.logout()
// User redirects to Auth0 logout, then back to home
```

**Redirects**: `/api/auth/logout` → Auth0 logout → `/`

**Note**: This is a redirect, clears session cookie

---

### `clearUser()`
Clear user state locally (for manual session cleanup)

```javascript
const authStore = useAuthStore()

authStore.clearUser()
// Clears user from store (doesn't affect server session)
```

**Use Cases**:
- Manual session cleanup
- Error recovery
- Testing

---

## 🧩 Usage Patterns

### In Components (Direct Store Access)

```vue
<script setup>
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, isAuthenticated, userName, userAvatar } = storeToRefs(authStore)

// Actions don't need storeToRefs
const { fetchUser, login, logout } = authStore

onMounted(async () => {
  await fetchUser()
})
</script>

<template>
  <div>
    <div v-if="isAuthenticated">
      <img :src="userAvatar" :alt="userName">
      <p>Welcome, {{ userName }}!</p>
      <button @click="logout">Logout</button>
    </div>
    <button v-else @click="login">Login</button>
  </div>
</template>
```

---

### Using the Composable Wrapper

For backward compatibility and convenience, use `useAuth()`:

```vue
<script setup>
import { useAuth } from '~/composables/useAuth'

const {
  user,
  isAuthenticated,
  getUserName,
  getUserAvatar,
  fetchUser,
  login,
  logout
} = useAuth()

onMounted(async () => {
  await fetchUser()
})
</script>

<template>
  <div v-if="isAuthenticated">
    <p>{{ getUserName }}</p>
    <button @click="logout">Logout</button>
  </div>
  <button v-else @click="login">Login</button>
</template>
```

---

### In Layout (Global Initialization)

```vue
<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Fetch user on app mount
onMounted(async () => {
  await authStore.fetchUser()
})
</script>
```

---

### In Pinia Actions (Cross-Store)

```javascript
// In another store
export const useLeagueStore = defineStore('league', {
  actions: {
    async createLeague(leagueData) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Must be logged in')
      }
      
      // Create league with user info
      const response = await $fetch('/api/leagues', {
        method: 'POST',
        body: {
          ...leagueData,
          createdBy: authStore.user.id
        }
      })
      
      return response
    }
  }
})
```

---

## 🔒 Protected Routes

### Using Navigation Guards

```javascript
// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

```vue
<!-- pages/protected.vue -->
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

---

## 🛠️ DevTools

### Vue DevTools Integration

1. Open Vue DevTools
2. Click "Pinia" tab
3. Select "auth" store
4. View real-time state:
   - `user` object
   - `isAuthenticated` status
   - `isLoading` state
   - `error` messages

### Debugging Actions

```javascript
// In component
const authStore = useAuthStore()

console.log('Before login:', authStore.$state)
authStore.login()

// After callback
console.log('After login:', authStore.$state)
```

---

## 🆚 Store vs Composable

**When to use Store directly:**
- ✅ In Pinia actions (cross-store access)
- ✅ When you need DevTools debugging
- ✅ For maximum performance (no wrapper overhead)
- ✅ When building new features

**When to use Composable:**
- ✅ For backward compatibility
- ✅ When migrating old code
- ✅ If you prefer composable-style API
- ✅ For consistency with existing codebase

**Best Practice**: Use the store directly for new code! 🚀

---

## 📚 Related Files

- **Store**: `app/stores/auth.js`
- **Composable Wrapper**: `app/composables/useAuth.js`
- **User Composable**: `app/composables/useUser.js`
- **API Routes**:
  - `server/api/auth/login.get.ts`
  - `server/api/auth/callback.get.ts`
  - `server/api/auth/logout.get.ts`
  - `server/api/auth/user.get.ts`
- **Components**:
  - `app/components/LoginButton.vue`
  - `app/components/UserMenu.vue`
  - `app/components/ProfileView.vue`

---

## 🎯 Common Patterns

### Check Auth Before API Call

```javascript
const authStore = useAuthStore()

const createPlayer = async (playerData) => {
  if (!authStore.isAuthenticated) {
    alert('Please login first')
    return
  }
  
  const response = await $fetch('/api/players', {
    method: 'POST',
    body: playerData
  })
  
  return response
}
```

---

### Loading States

```vue
<script setup>
const authStore = useAuthStore()
const { isLoading, isAuthenticated } = storeToRefs(authStore)

onMounted(() => authStore.fetchUser())
</script>

<template>
  <div v-if="isLoading">
    Loading...
  </div>
  <div v-else-if="isAuthenticated">
    <!-- Authenticated content -->
  </div>
  <div v-else>
    <button @click="authStore.login">Login</button>
  </div>
</template>
```

---

### Error Handling

```vue
<script setup>
const authStore = useAuthStore()
const { error, isAuthenticated } = storeToRefs(authStore)

onMounted(async () => {
  await authStore.fetchUser()
  
  if (authStore.error) {
    console.error('Auth error:', authStore.error)
  }
})
</script>

<template>
  <div v-if="error" class="error">
    Authentication failed: {{ error.message }}
  </div>
</template>
```

---

## 🚀 Future Enhancements

Potential additions to the auth store:

1. **Persistence**: Use `pinia-plugin-persistedstate` for localStorage
2. **Token Refresh**: Auto-refresh expired tokens
3. **Roles/Permissions**: Add user role checking
4. **Multi-tenancy**: Support multiple organizations
5. **2FA**: Two-factor authentication state

---

**Last Updated**: October 14, 2025  
**Status**: Production Ready ✅
