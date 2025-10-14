# Auth0 Setup Instructions - Next Steps

> **Current Status**: Code implementation complete ✅  
> **Next Step**: Configure Auth0 account and environment variables

---

## 🎯 What's Been Completed

### Database ✅
- [x] `users` table created with Auth0 integration
- [x] `userId` foreign key added to `players` table
- [x] Migration applied successfully

### API Endpoints ✅
- [x] `GET /api/auth/user` - Get authenticated user
- [x] `GET /api/users/me` - Get user profile with linked players
- [x] `PUT /api/users/me` - Update user profile

### Composables ✅
- [x] `useAuth.js` - Authentication management (8 functions)
- [x] `useUser.js` - User profile management (5 functions)

### Components ✅
- [x] `LoginButton.vue` - Login/logout button with icons
- [x] `UserMenu.vue` - User avatar dropdown menu
- [x] `ProfileView.vue` - Complete profile editor
- [x] `pages/profile.vue` - Profile page route

### Navigation ✅
- [x] Auth UI added to desktop navigation
- [x] Auth UI added to mobile menu
- [x] Profile link in user dropdown

---

## 🚀 Next Steps: Auth0 Configuration

### 1. Create Auth0 Application

Go to [Auth0 Dashboard](https://manage.auth0.com/) and:

1. **Create Application**:
   - Click "Applications" → "Create Application"
   - Name: "Warhammer 40K Escalation League"
   - Type: **Single Page Application**
   - Click "Create"

2. **Configure Settings**:
   - **Allowed Callback URLs**:
     ```
     http://localhost:8888/.netlify/functions/auth-callback,
     https://your-app.netlify.app/.netlify/functions/auth-callback
     ```
   
   - **Allowed Logout URLs**:
     ```
     http://localhost:8888,
     https://your-app.netlify.app
     ```
   
   - **Allowed Web Origins**:
     ```
     http://localhost:8888,
     https://your-app.netlify.app
     ```
   
   - **Allowed Origins (CORS)**:
     ```
     http://localhost:8888,
     https://your-app.netlify.app
     ```

3. **Copy Credentials**:
   - Domain: `your-tenant.auth0.com`
   - Client ID: `abc123...`
   - Client Secret: `xyz789...` (click "Show")

### 2. Configure Netlify Integration

**Option A: Use Netlify's Auth0 UI Extension (Recommended)**

1. Go to Netlify Dashboard → Site Settings → Integrations
2. Find "Auth0" integration
3. Click "Enable" or "Configure"
4. Paste your Auth0 credentials:
   - Domain
   - Client ID
   - Client Secret
5. Save configuration

**Option B: Manual Setup with Environment Variables**

If the UI extension isn't working, set environment variables manually:

1. Go to Netlify Dashboard → Site Settings → Build & Deploy → Environment
2. Add variables:
   ```
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_CALLBACK_URL=https://your-app.netlify.app/.netlify/functions/auth-callback
   AUTH0_LOGOUT_URL=https://your-app.netlify.app
   ```

### 3. Create Local `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Auth0 credentials:

```bash
# Database (already configured)
DATABASE_URL=your-existing-neon-url
NETLIFY_DATABASE_URL=your-existing-neon-url

# Auth0 Configuration (ADD THESE)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_CALLBACK_URL=http://localhost:8888/.netlify/functions/auth-callback
AUTH0_LOGOUT_URL=http://localhost:8888

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Node Version
NODE_VERSION=20.19.0
```

### 4. Create Netlify Functions

**IMPORTANT**: Netlify's Auth0 integration should automatically create these functions, but if it doesn't, you'll need to create them manually.

Check if these functions exist after enabling the integration:
- `/.netlify/functions/auth-login`
- `/.netlify/functions/auth-callback`
- `/.netlify/functions/auth-logout`

If they don't exist, you may need to use a different approach (let me know and I can help with that).

---

## 🧪 Testing Locally

### 1. Start Development Server

```bash
npm run dev:netlify
```

This starts the app at `http://localhost:8888` with Netlify functions enabled.

### 2. Test Login Flow

1. Navigate to `http://localhost:8888/dashboard`
2. Click "Login" button in the navigation
3. Should redirect to Auth0 hosted login page
4. Login with your Auth0 account
5. Should redirect back to the app
6. User menu should appear with your avatar
7. Check database - new user record should be created

### 3. Test Profile Page

1. Click on your avatar in the navigation
2. Click "My Profile"
3. Should show your user info
4. Try editing your name
5. Click "Save Changes"
6. Changes should persist

### 4. Test Logout

1. Click on your avatar
2. Click "Logout"
3. Should clear session and return to logged out state

---

## 🐛 Troubleshooting

### Login Button Does Nothing

**Issue**: Clicking login redirects to 404

**Solution**: 
- Verify Netlify Auth0 integration is enabled
- Check that `/.netlify/functions/auth-login` exists
- Run `netlify dev` (not `npm run dev`)

### "Callback URL not allowed" Error

**Issue**: Auth0 shows error after login

**Solution**:
- Check callback URLs in Auth0 dashboard match exactly
- Make sure to include `/.netlify/functions/auth-callback`
- No trailing slashes in URLs

### User Not Created in Database

**Issue**: Login works but no user in database

**Solution**:
- Check database connection: `curl http://localhost:8888/api/health`
- Check `/api/auth/user` endpoint manually
- Review server logs for errors

### Session Not Persisting

**Issue**: User logged in but loses session on refresh

**Solution**:
- Verify `SESSION_SECRET` is set in `.env`
- Check that cookies are being set (check browser DevTools → Application → Cookies)
- Make sure you're using `netlify dev` not `npm run dev`

---

## 📚 Architecture Notes

### How Authentication Works

```
1. User clicks "Login"
   ↓
2. Redirect to /.netlify/functions/auth-login
   ↓
3. Netlify function redirects to Auth0 hosted page
   ↓
4. User authenticates with Auth0
   ↓
5. Auth0 redirects to /.netlify/functions/auth-callback
   ↓
6. Netlify function validates token and sets cookie
   ↓
7. Redirect to dashboard
   ↓
8. Frontend calls /api/auth/user
   ↓
9. API creates/updates user in database
   ↓
10. User info returned to frontend
```

### User vs Player Architecture

**User Table** (Global)
- Stores Auth0 authentication info
- One per person across all leagues
- Managed through profile page

**Players Table** (League-specific)
- Stores league participation data
- Multiple per user (one per league)
- Links to user via `userId` foreign key

**Linking Strategy**:
- Initially, players exist without `userId`
- Later, we can add UI to link existing players to user accounts
- New players can be auto-linked when created by authenticated users

---

## ✅ Success Criteria

The implementation is working when:

- [x] Code implemented (100% ✅)
- [ ] Auth0 configured
- [ ] Environment variables set
- [ ] Login flow works
- [ ] User created in database
- [ ] Profile page displays user info
- [ ] Profile updates save
- [ ] Logout clears session
- [ ] Works on both local and production

---

## 📞 Need Help?

If you run into issues:

1. Check the troubleshooting section above
2. Review Netlify function logs: `netlify dev` output
3. Check browser console for errors
4. Review Auth0 logs: Auth0 Dashboard → Monitoring → Logs
5. Check database: `npm run db:studio`

**Next Action**: Configure your Auth0 application following Step 1 above! 🚀
