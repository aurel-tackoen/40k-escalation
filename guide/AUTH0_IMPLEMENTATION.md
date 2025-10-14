# Auth0 Authentication Implementation Guide

> **Status**: 🚧 Phase 3-6 Complete - Ready for Auth0 Configuration  
> **Last Updated**: October 14, 2025  
> **Implementation Time**: ~4-6 hours

## 📋 Implementation Checklist

### ✅ Phase 1: Auth0 Setup (External)
- [x] Create Auth0 account at https://auth0.com
- [ ] Create new Auth0 Application (Single Page Application type)
- [ ] Configure Allowed Callback URLs:
  - `http://localhost:8888/callback`
  - `https://your-app.netlify.app/callback`
- [ ] Configure Allowed Logout URLs:
  - `http://localhost:8888`
  - `https://your-app.netlify.app`
- [ ] Configure Allowed Web Origins:
  - `http://localhost:8888`
  - `https://your-app.netlify.app`
- [ ] Copy Auth0 Domain, Client ID, Client Secret

### Phase 2: Netlify Configuration
- [ ] Verify Auth0 integration in Netlify dashboard (Site Settings → Integrations)
- [ ] Add environment variables in Netlify:
  - `AUTH0_DOMAIN`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
  - `AUTH0_AUDIENCE` (optional, for API access)
  - `AUTH0_CALLBACK_URL`
- [ ] Create `.env` file locally with same variables (copy from `.env.example`)
- [x] Add `.env` to `.gitignore`

### ✅ Phase 3: Database Schema Changes
- [x] Create `users` table (separate from `players`)
  - `id` - Primary key (auto-increment)
  - `auth0Id` - Auth0 user ID (unique, indexed)
  - `email` - User email (unique)
  - `name` - Display name
  - `picture` - Avatar URL from Auth0
  - `createdAt` - Account creation timestamp
  - `lastLoginAt` - Last login timestamp
- [x] Add `userId` foreign key to `players` table (nullable for now)
- [x] Generate migration: `npm run db:generate`
- [x] Apply migration: `npm run db:migrate`

### ✅ Phase 4: API Endpoints
- [x] `GET /api/auth/user` - Get current authenticated user from session
- [ ] `POST /api/auth/login` - Initiate Auth0 login (redirect) - **Using Netlify functions**
- [ ] `GET /api/auth/callback` - Handle Auth0 callback - **Using Netlify functions**
- [ ] `POST /api/auth/logout` - Logout user and clear session - **Using Netlify functions**
- [x] `GET /api/users/me` - Get current user's profile
- [x] `PUT /api/users/me` - Update current user's profile

### ✅ Phase 5: Composables
- [x] Create `useAuth.js` composable:
  - `login()` - Redirect to Auth0 login
  - `logout()` - Clear session and logout
  - `user` - Reactive user object
  - `isAuthenticated` - Computed auth status
  - `isLoading` - Loading state
- [x] Create `useUser.js` composable:
  - `fetchUserProfile()` - Get user profile
  - `updateUserProfile(data)` - Update profile
  - `linkPlayerToUser(playerId)` - Link player to user (TODO)

### ✅ Phase 6: Frontend Components
- [x] Create `LoginButton.vue` - Simple login/logout button
- [x] Create `UserMenu.vue` - Avatar dropdown with profile link
- [x] Create `ProfileView.vue` - User profile editor component
- [x] Update `app/layouts/default.vue` - Add auth UI to navigation

### ✅ Phase 7: Pages
- [x] Create `pages/profile.vue` - Profile page route
- [x] Update navigation to show profile link when authenticated

### Phase 8: Testing
- [ ] Test login flow locally with `netlify dev`
- [ ] Test logout flow
- [ ] Test user creation in database on first login
- [ ] Test profile page display
- [ ] Test profile updates
- [ ] Deploy to Netlify
- [ ] Test on production

### Phase 9: Documentation
- [x] Update guide with implementation progress
- [ ] Document Auth0 setup process
- [ ] Document environment variables
- [ ] Add troubleshooting section

---

## 🏗️ Architecture Overview

### User Flow
```
1. User clicks "Login" button
   ↓
2. Redirect to Auth0 hosted login page
   ↓
3. User authenticates (email/password, social, etc.)
   ↓
4. Auth0 redirects back to /api/auth/callback with code
   ↓
5. API exchanges code for tokens
   ↓
6. API creates/updates user in database
   ↓
7. API sets secure HTTP-only cookie
   ↓
8. Redirect to dashboard
   ↓
9. Frontend reads user from API
```

### Database Schema

#### New: `users` Table
```typescript
{
  id: integer (PK, auto-increment)
  auth0Id: varchar(255) - Auth0 user ID (unique, indexed)
  email: varchar(255) - User email (unique)
  name: varchar(255) - Display name
  picture: text - Avatar URL
  createdAt: timestamp - Account creation
  lastLoginAt: timestamp - Last login
}
```

#### Modified: `players` Table
```typescript
{
  // ... existing fields
  userId: integer (FK -> users.id, nullable)
  // This links a player to a user account
}
```

### User vs Player Distinction

**User (Global)**
- One account per person
- Handles authentication via Auth0
- Stores profile information
- Can participate in multiple leagues
- Persists across all leagues

**Player (League-Specific)**
- Multiple per user (one per league)
- Stores league-specific stats (W-L-D)
- Represents user's participation in a specific league
- Can be created/linked to user account

**Example:**
- John Smith (User) can have:
  - Player "John" in Summer League
  - Player "SmithJ" in Winter League
  - Player "JohnnyS" in Tournament League

---

## 🔑 Environment Variables

### Local `.env` File
```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_CALLBACK_URL=http://localhost:8888/api/auth/callback
AUTH0_LOGOUT_URL=http://localhost:8888

# Database (existing)
DATABASE_URL=your-neon-db-url

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-random-secret-key
```

### Netlify Environment Variables
Add the same variables in Netlify dashboard, but update URLs:
```bash
AUTH0_CALLBACK_URL=https://your-app.netlify.app/api/auth/callback
AUTH0_LOGOUT_URL=https://your-app.netlify.app
```

---

## 🎯 Implementation Strategy

### Keep It Simple
1. **No middleware protection yet** - Just implement login/profile
2. **No role-based access** - All authenticated users have same access
3. **No API protection** - We'll add this in Phase 2 (future)
4. **Basic profile only** - Name, email, avatar

### What We're Building
- Login button in navigation
- User menu with avatar
- Profile page showing:
  - User info from Auth0
  - List of linked players
  - Basic profile editing (name, avatar)
- Database sync on login

### What We're NOT Building (Yet)
- Route protection/guards
- API endpoint authentication
- Role-based permissions
- Player creation during onboarding
- Email verification
- Password reset flows (Auth0 handles this)

---

## 📂 File Structure After Implementation

```
app/
├── app.vue                  # MODIFIED: Add auth UI
├── components/
│   ├── LoginButton.vue      # NEW: Login/logout button
│   ├── UserMenu.vue         # NEW: User dropdown menu
│   └── ProfileView.vue      # NEW: User profile editor
├── composables/
│   ├── useAuth.js          # NEW: Authentication helpers
│   └── useUser.js          # NEW: User profile management
└── pages/
    ├── profile.vue         # NEW: Profile page route
    └── login.vue           # NEW: Login page (optional)

server/api/
├── auth/
│   ├── user.get.ts         # NEW: Get current user
│   ├── login.post.ts       # NEW: Initiate Auth0 login
│   ├── callback.get.ts     # NEW: Auth0 callback handler
│   └── logout.post.ts      # NEW: Logout endpoint
└── users/
    ├── me.get.ts           # NEW: Get user profile
    └── me.put.ts           # NEW: Update user profile

db/
└── schema.ts               # MODIFIED: Add users table

migrations/
└── 0004_add_users_auth.sql # NEW: Users table migration

guide/
└── AUTH0_IMPLEMENTATION.md # NEW: This file
```

---

## 🔐 Security Considerations

### Session Management
- Use HTTP-only cookies (not localStorage)
- Set Secure flag in production
- Set SameSite=Lax
- Short expiration (24 hours)

### Token Storage
- Never expose tokens to client JavaScript
- Store in server-side session only
- Use Auth0 SDK for token management

### API Security
- Validate session on every request
- Check user exists in database
- Rate limit auth endpoints

---

## 🧪 Testing Checklist

### Local Testing (`netlify dev`)
- [ ] Can access login page
- [ ] Login redirects to Auth0
- [ ] Auth0 redirects back to callback
- [ ] User created in database on first login
- [ ] Session persists across page reloads
- [ ] User info displays correctly
- [ ] Profile page loads
- [ ] Profile updates save
- [ ] Logout clears session
- [ ] Cannot access profile when logged out (graceful)

### Production Testing (Netlify)
- [ ] All local tests pass
- [ ] Environment variables set correctly
- [ ] Callback URL works
- [ ] HTTPS enforced
- [ ] Session cookies secure

---

## 📚 Reference Links

- [Auth0 Dashboard](https://manage.auth0.com/)
- [Auth0 Vue.js Quickstart](https://auth0.com/docs/quickstart/spa/vuejs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/rqb)

---

## 🐛 Troubleshooting

### Login Redirect Fails
- Check callback URL matches Auth0 settings exactly
- Verify environment variables loaded
- Check Netlify function logs

### User Not Created in Database
- Check database connection
- Verify schema migration applied
- Check API logs for errors

### Session Not Persisting
- Check cookie settings (Secure, SameSite)
- Verify SESSION_SECRET is set
- Check cookie domain matches

### Auth0 Errors
- Verify Client ID/Secret correct
- Check allowed URLs in Auth0 dashboard
- Review Auth0 logs in dashboard

---

## ✅ Definition of Done

Implementation is complete when:
1. ✅ User can login via Auth0
2. ✅ User record created in database on first login
3. ✅ User info displays in navigation
4. ✅ Profile page shows user info + linked players
5. ✅ User can update name/avatar
6. ✅ User can logout
7. ✅ Works locally with `netlify dev`
8. ✅ Works on Netlify deployment
9. ✅ Zero lint errors
10. ✅ Documentation updated

---

**Ready to implement!** 🚀  
**Next Step**: Phase 2 - Netlify Configuration
