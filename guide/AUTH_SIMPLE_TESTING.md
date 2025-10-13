# Simple Authentication Testing Guide

## Changes Made

The authentication system has been simplified to work better with `netlify dev` for local development.

### What Was Changed:

1. **useAuth Composable**: Removed all complex widget closing logic and simplified to basic event handlers
2. **Layout**: Removed custom AuthModal component, now using Netlify Identity widget directly
3. **app.vue**: Removed complex widget management code that was interfering with normal operation

## Testing Authentication Locally

### 1. Start the Development Server

```bash
npm run dev:netlify
```

This starts the server on `http://localhost:8888` with Netlify Functions enabled.

### 2. Click the Login Button

- The login button is in the top right corner of the header
- Click it to open the Netlify Identity widget modal

### 3. What Should Happen

When you click "Login":
- A modal should appear over the page
- You should see the Netlify Identity login form
- You can enter email and password
- After successful login, the modal should close automatically
- Your email/username should appear in the header where the login button was

### 4. Debugging

Open your browser console (F12) to see debug messages:
- "Netlify Identity initialized" - Widget loaded successfully
- "Opening login modal" - Login button clicked
- "User logged in:" - Successful authentication

### 5. Common Issues

**Problem**: "Authentication system unavailable" error
- **Solution**: Make sure you're using `npm run dev:netlify` (not `npm run dev`)
- **Solution**: Check that Netlify Identity is configured in your Netlify dashboard

**Problem**: Modal doesn't open
- **Solution**: Check browser console for errors
- **Solution**: Verify the Netlify Identity script is loading (check Network tab)

**Problem**: Login works but user info doesn't show
- **Solution**: Check console for "User logged in:" message with user data
- **Solution**: Refresh the page after login

## How It Works Now

1. **Script Loading**: The Netlify Identity widget is loaded via a script tag in `app.vue`
2. **Initialization**: `useAuth` composable initializes the widget and sets up event listeners
3. **Login Flow**: 
   - Click Login → `window.netlifyIdentity.open('login')` is called
   - Widget opens its modal
   - User logs in
   - Widget fires 'login' event
   - useAuth updates the user ref
   - Layout reactively shows user info

## Next Steps

If login works locally:
1. Test signup functionality (same process)
2. Test logout
3. Test that protected features work when logged in
4. Deploy to Netlify and test in production

## Netlify Identity Configuration

Make sure in your Netlify dashboard:
1. Go to Site Settings → Identity
2. Enable Identity if not already enabled
3. Set Registration preferences (Open, Invite only, etc.)
4. Configure External providers if desired (Google, GitHub, etc.)
5. Set the site URL correctly

For local development, Netlify Identity will use your site's Identity settings but operate through the local dev server.
