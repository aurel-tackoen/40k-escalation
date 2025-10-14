# Database Setup - Quick Checklist ✅

## Current Status

✅ **Database Configuration Updated**
- `db/index.ts` - Now supports both local and production database URLs
- `drizzle.config.ts` - Configured for dual environment support
- `.env` - Updated with local branch connection and correct ports

✅ **Connection Priority**
1. Local dev: Uses `DATABASE_URL` from `.env` (your 'local' branch)
2. Production: Falls back to `NETLIFY_DATABASE_URL` (auto-set by Netlify)

## Next Steps to Complete Setup

### 1. Verify Your Neon Branch ⏳

Check that your DATABASE_URL in `.env` points to your 'local' branch:
- Go to [Neon Console](https://console.neon.tech)
- Verify you have a `local` branch (or create one)
- Make sure the connection string in `.env` matches your local branch

**Current Connection**: `ep-snowy-shadow-ae769vbt-pooler`

If this is your main/production branch, you should:
1. Create a new `local` branch in Neon
2. Update `.env` with the local branch connection string

### 2. Run Migration on Local Branch ⏳

```bash
# Apply the new multi-league schema to your local branch
npm run db:migrate

# Verify it worked
npm run db:studio
```

### 3. Run Data Migration ⏳

```bash
# Start dev server
npm run dev:netlify

# In another terminal, run the data migration
curl -X POST http://localhost:8888/api/migrate-to-multileague
```

This will:
- Create a default league (or use existing)
- Assign all players to that league
- Create league memberships
- Set first user as league owner

### 4. Test the Application ⏳

```bash
# Already running from step 3
npm run dev:netlify

# Open browser
open http://localhost:8888
```

Test that:
- App loads without database errors
- You can view players/armies/matches
- Data is still intact after migration

## For Production Deployment Later

### Before Deploying

1. **Test everything locally first** ✅ (Do this now)
2. **Commit your code**:
   ```bash
   git add .
   git commit -m "Add multi-league database support"
   git push origin leagues
   ```

### During Deployment

1. **Merge to main** (or deploy from leagues branch)
2. **Netlify will automatically**:
   - Use `NETLIFY_DATABASE_URL` (production branch)
   - Deploy your new code
   - No manual database config needed!

### After Deployment

1. **Run migrations on production**:
   ```bash
   # Data migration
   curl -X POST https://your-site.netlify.app/api/migrate-to-multileague
   ```

2. **Verify production works**:
   - Check site loads
   - Check database in Neon Console
   - Test creating/joining leagues

## Important Notes

### ⚠️ Your .env File
- ✅ Contains your local database credentials
- ✅ Is in `.gitignore` (never committed)
- ✅ Callback URLs updated to port 8888 (Netlify dev)

### ⚠️ Auth0 Configuration
You may need to add `http://localhost:8888/api/auth/callback` to your Auth0 allowed callback URLs:
1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your App → Settings
3. Add to "Allowed Callback URLs": `http://localhost:8888/api/auth/callback`
4. Add to "Allowed Logout URLs": `http://localhost:8888`
5. Save changes

### ⚠️ Database Branches
- **Local branch** = Your development/testing environment
- **Main branch** = Production (used by Netlify)
- Changes to local don't affect production
- You can reset local branch anytime without risk

## Troubleshooting

### "Database URL not found" Error

The app can't find a database connection.

**Fix**: Make sure `.env` exists and has `DATABASE_URL` set:
```bash
cat .env | grep DATABASE_URL
```

### Migrations Failing

You might be applying migrations to the wrong branch.

**Check which branch you're connected to**:
- Look at the endpoint in your `DATABASE_URL`
- Match it with your Neon Console branch endpoint
- If it's the main branch, create and switch to a local branch

### Port 3000 vs 8888 Confusion

- **Port 3000**: Standard Nuxt dev server (`npm run dev`)
- **Port 8888**: Netlify dev server (`npm run dev:netlify`)

For this project, **use port 8888** (Netlify dev) because you're using Netlify's Neon integration.

## File Changes Summary

### Modified Files
- ✅ `db/index.ts` - Added dual database URL support
- ✅ `drizzle.config.ts` - Added DATABASE_URL fallback
- ✅ `.env` - Updated callback URLs to port 8888
- ✅ `.env.example` - Added database configuration template

### New Files
- ✅ `guide/DATABASE_LOCAL_SETUP.md` - Comprehensive setup guide
- ✅ `guide/DATABASE_SETUP_CHECKLIST.md` - This checklist

## Quick Commands Reference

```bash
# Start development server
npm run dev:netlify

# Database migrations
npm run db:generate    # Generate migration files
npm run db:migrate     # Apply migrations
npm run db:studio      # Open database GUI

# Data migration (multi-league)
curl -X POST http://localhost:8888/api/migrate-to-multileague

# Check your environment
cat .env | grep DATABASE_URL
```

---

**Ready to proceed?** Run the migrations (step 2 above) and you'll be all set! 🚀
