# Auth0 Manual Functions Setup - Complete! ✅

**Date**: October 14, 2025  
**Status**: Ready to test with Auth0 credentials

---

## ✅ What Was Just Created

### Netlify Functions (Manual Implementation)
Since Netlify's Auth0 integration didn't auto-create functions, we built them manually:

1. **`netlify/functions/auth-login.js`**
   - Redirects to Auth0 hosted login
   - Builds OAuth authorization URL
   - Includes state parameter for CSRF protection

2. **`netlify/functions/auth-callback.js`**
   - Handles OAuth callback from Auth0
   - Exchanges code for access token
   - Fetches user info from Auth0
   - Creates secure session cookie
   - Redirects to `/dashboard`

3. **`netlify/functions/auth-logout.js`**
   - Clears session cookie
   - Redirects to Auth0 logout
   - Returns user to homepage

### Updated API Endpoints
All endpoints now read from session cookies (not Netlify context):

- ✅ `server/api/auth/user.get.ts` - Reads from `auth_session` cookie
- ✅ `server/api/users/me.get.ts` - Reads from `auth_session` cookie
- ✅ `server/api/users/me.put.ts` - Reads from `auth_session` cookie

---

## 🎯 Next Steps: Configure Auth0

### 1. Create Auth0 Application

Go to [Auth0 Dashboard](https://manage.auth0.com/):

1. **Applications** → **Create Application**
2. **Name**: "Warhammer 40K Escalation League"
3. **Type**: **Regular Web Application** (not SPA!)
4. Click **Create**

### 2. Configure Application Settings

In your new Auth0 application settings:

**Allowed Callback URLs**:
```
http://localhost:8888/.netlify/functions/auth-callback,
https://your-app.netlify.app/.netlify/functions/auth-callback
```

**Allowed Logout URLs**:
```
http://localhost:8888,
https://your-app.netlify.app
```

**Allowed Web Origins**:
```
http://localhost:8888,
https://your-app.netlify.app
```

Click **Save Changes** at the bottom!

### 3. Copy Credentials

From the same settings page, copy these values:

- **Domain**: `your-tenant.auth0.com`
- **Client ID**: `abc123xyz...`
- **Client Secret**: `secret123...` (click "Show")

### 4. Create Local `.env` File

```bash
# Create .env file
cp .env.example .env

# Edit .env with your Auth0 credentials
```

Your `.env` should look like:
```bash
AUTH0_DOMAIN=your-actual-tenant.auth0.com
AUTH0_CLIENT_ID=your-actual-client-id
AUTH0_CLIENT_SECRET=your-actual-secret
AUTH0_CALLBACK_URL=http://localhost:8888/.netlify/functions/auth-callback
AUTH0_LOGOUT_URL=http://localhost:8888

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)
```

### 5. Add to Netlify Dashboard

Go to your Netlify site → **Site Settings** → **Environment Variables**:

Add these variables:
```
AUTH0_DOMAIN=your-actual-tenant.auth0.com
AUTH0_CLIENT_ID=your-actual-client-id
AUTH0_CLIENT_SECRET=your-actual-secret
AUTH0_CALLBACK_URL=https://your-app.netlify.app/.netlify/functions/auth-callback
AUTH0_LOGOUT_URL=https://your-app.netlify.app
SESSION_SECRET=(generate with: openssl rand -base64 32)
```

**Important**: Use **production URL** for callback in Netlify!

---

## 🧪 Testing

### Start the Dev Server
```bash
npm run dev:netlify
```

### Test the Flow

1. **Go to**: `http://localhost:8888/dashboard`
2. **Click**: "Login" button in navigation
3. **Should redirect**: To Auth0 login page
4. **Login**: With your Auth0 account (or create one)
5. **Should redirect**: Back to `/dashboard`
6. **Check**: User menu should appear with your name/avatar
7. **Go to**: Profile page (click avatar → My Profile)
8. **Check**: Your info should display
9. **Try**: Edit your name and save
10. **Click**: Logout

### Check Database
```bash
npm run db:studio
```

Look in the `users` table - you should see your account!

---

## 🐛 Troubleshooting

### "Callback URL mismatch" error
- Check Auth0 settings have **exact** callback URL
- Must include `/.netlify/functions/auth-callback`
- No trailing slashes

### Functions not found (404)
- Make sure you're using `npm run dev:netlify` (not `npm run dev`)
- Check `netlify/functions/` directory exists with all 3 files
- Restart the dev server

### Cookie not being set
- Check browser DevTools → Application → Cookies
- Should see `auth_session` cookie
- If missing, check function logs in terminal

### User not created in database
- Check database connection works: `curl http://localhost:8888/api/health`
- Check API endpoint: `curl http://localhost:8888/api/auth/user`
- Look for errors in terminal

---

## 📊 How It Works

```
1. User clicks "Login"
   ↓
2. GET /.netlify/functions/auth-login
   ↓
3. Redirect to Auth0 (https://your-tenant.auth0.com/authorize)
   ↓
4. User authenticates with Auth0
   ↓
5. Auth0 redirects to /.netlify/functions/auth-callback?code=xxx
   ↓
6. Exchange code for access_token
   ↓
7. Fetch user info from Auth0
   ↓
8. Create session cookie (auth_session)
   ↓
9. Redirect to /dashboard
   ↓
10. Frontend calls /api/auth/user
   ↓
11. API reads cookie, creates/updates user in DB
   ↓
12. User logged in! 🎉
```

---

## 🔐 Security Notes

### Session Storage
- Uses HTTP-only cookies (can't be accessed by JavaScript)
- Secure flag in production
- SameSite=Lax (CSRF protection)
- 24-hour expiration

### Token Storage
- Access token stored in session cookie
- Not exposed to client-side JavaScript
- Validated on every API request

### Future Improvements
- Add proper session encryption (currently base64)
- Implement token refresh
- Add rate limiting
- Add CSRF token validation

---

## ✅ Success Criteria

You're done when:
- [x] Auth0 functions created
- [x] API endpoints updated
- [ ] Auth0 application configured
- [ ] Environment variables set
- [ ] Local testing passes
- [ ] User created in database
- [ ] Profile page works
- [ ] Logout works

---

**Ready to test!** Configure Auth0 following Step 1-4 above, then test! 🚀
