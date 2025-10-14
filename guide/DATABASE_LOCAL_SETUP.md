# Local Database Setup with Neon Branch

## Overview

This project uses Neon PostgreSQL with different branches for local development and production:
- **Local Development**: Uses a dedicated Neon branch (e.g., `local` or `dev`)
- **Production**: Uses the main Neon branch (automatically configured by Netlify)

## Setup Instructions

### 1. Create a Neon Branch for Local Development

1. Go to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Click on **"Branches"** in the sidebar
4. Click **"Create Branch"**
5. Name it `local` or `dev`
6. Choose to branch from your main branch
7. Click **"Create"**

### 2. Get Your Local Branch Connection String

1. In the Neon Console, select your newly created `local` branch
2. Click on **"Connection Details"**
3. Copy the connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
   ```

### 3. Configure Local Environment

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your local branch connection string:
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
   
   # Also configure Auth0 settings
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_CALLBACK_URL=http://localhost:8888/api/auth/callback
   AUTH0_LOGOUT_URL=http://localhost:8888
   
   SESSION_SECRET=your-random-secret-key-here
   ```

3. **Important**: Make sure `.env` is in your `.gitignore` (it should be already)

### 4. Run Migrations on Local Branch

```bash
# Generate migrations if you have schema changes
npm run db:generate

# Apply migrations to your local branch
npm run db:migrate

# (Optional) Open Drizzle Studio to view/edit data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev:netlify
```

The app will now connect to your local Neon branch! 🎉

## How It Works

### Database Connection Logic

**`db/index.ts`:**
```typescript
// Priority: DATABASE_URL (local) → NETLIFY_DATABASE_URL (production)
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
```

**`drizzle.config.ts`:**
```typescript
dbCredentials: {
  url: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL!
}
```

### Environment Variables

| Variable | Local | Production | Purpose |
|----------|-------|------------|---------|
| `DATABASE_URL` | ✅ Set in `.env` | ❌ Not used | Local Neon branch |
| `NETLIFY_DATABASE_URL` | ❌ Not set | ✅ Auto-set by Netlify | Production Neon branch |

### Netlify Dev Behavior

When you run `npm run dev:netlify`:
1. Netlify CLI reads your `.env` file
2. Uses `DATABASE_URL` to connect to your local branch
3. In production, Netlify automatically provides `NETLIFY_DATABASE_URL`

## Production Deployment

### Netlify Configuration

**No changes needed!** Netlify automatically:
1. Sets `NETLIFY_DATABASE_URL` with the production connection string
2. The app falls back to this variable in production
3. Your production branch is used automatically

### Deploy Steps

1. **Push your code** to your git repository:
   ```bash
   git add .
   git commit -m "Add multi-league support"
   git push origin leagues
   ```

2. **Merge to main** (or deploy from your branch)

3. **Run migrations on production**:
   - Option A: Run migrations via Netlify Functions
     ```bash
     # After deployment
     curl -X POST https://your-site.netlify.app/api/migrate-to-multileague
     ```
   
   - Option B: Run locally against production (not recommended):
     ```bash
     # Temporarily set production DB URL
     DATABASE_URL="production-connection-string" npm run db:migrate
     ```

4. **Verify deployment**:
   - Check Netlify logs
   - Test the site
   - Verify database changes in Neon Console

## Troubleshooting

### "Database URL not found" Error

**Cause**: Neither `DATABASE_URL` nor `NETLIFY_DATABASE_URL` is set.

**Fix**:
```bash
# Check your .env file exists and has DATABASE_URL
cat .env | grep DATABASE_URL

# If missing, copy from .env.example and configure
cp .env.example .env
# Then edit .env with your local branch connection string
```

### Migrations Failing

**Check which database you're connected to:**
```bash
# View your current DATABASE_URL (without showing the password)
echo $DATABASE_URL | sed 's/:.*@/:***@/'
```

**Ensure you're using the local branch:**
1. Check `.env` has `DATABASE_URL` set
2. Verify the connection string points to your `local` branch
3. Check the Neon Console to confirm the branch exists

### Can't Connect to Database

**Check connection string format:**
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

**Verify:**
- Username and password are correct
- Endpoint is accessible (no typos)
- SSL mode is required (`?sslmode=require`)
- Branch is not suspended (Neon auto-suspends after inactivity)

### Netlify Dev Not Using .env

**Netlify CLI should automatically load `.env`**, but if not:

```bash
# Explicitly load .env
source .env && npm run dev:netlify

# Or use Netlify's env command
netlify env:import .env
```

## Best Practices

### ✅ DO
- Use separate branches for local/dev/staging/production
- Keep `.env` out of git (it's in `.gitignore`)
- Run migrations on local branch first to test
- Use Drizzle Studio to verify migrations: `npm run db:studio`
- Reset your local branch if you mess up (Neon makes this easy)

### ❌ DON'T
- Commit `.env` to git (contains secrets!)
- Run migrations directly on production without testing
- Mix local and production connection strings
- Share your connection strings publicly
- Delete your main/production branch

## Data Migration Strategy

### For Multi-League Refactor

1. **Test locally first:**
   ```bash
   # 1. Ensure you're on local branch
   cat .env | grep DATABASE_URL
   
   # 2. Run data migration
   curl -X POST http://localhost:8888/api/migrate-to-multileague
   
   # 3. Apply schema migration
   npm run db:migrate
   
   # 4. Verify in Drizzle Studio
   npm run db:studio
   ```

2. **Test the app:**
   ```bash
   npm run dev:netlify
   # Test all features with migrated data
   ```

3. **If successful, deploy to production:**
   - Push code to git
   - Deploy to Netlify
   - Run migration endpoints on production
   - Verify everything works

4. **If issues, reset local branch:**
   - Go to Neon Console
   - Delete `local` branch
   - Create new `local` branch from main
   - Try again with fixes

## Quick Reference

```bash
# Setup
cp .env.example .env              # Create env file
# Edit .env with your local branch URL

# Development
npm run dev:netlify               # Start dev server
npm run db:studio                 # Open database GUI

# Migrations
npm run db:generate               # Generate migration from schema
npm run db:migrate                # Apply migrations
npm run db:push                   # Push schema (dev only, skips migrations)

# Data Migration (Multi-League)
curl -X POST http://localhost:8888/api/migrate-to-multileague

# Check Environment
echo "Local: $DATABASE_URL"
echo "Production: $NETLIFY_DATABASE_URL"
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                 Neon Database                    │
│                                                  │
│  ┌─────────────┐        ┌─────────────┐        │
│  │   main      │        │   local     │        │
│  │  (production)│◄───────│  (your dev) │        │
│  │             │ branch │             │        │
│  └─────────────┘  from  └─────────────┘        │
│         ▲                      ▲                │
└─────────┼──────────────────────┼────────────────┘
          │                      │
          │                      │
    NETLIFY_DATABASE_URL    DATABASE_URL
          │                      │
          │                      │
┌─────────┼──────────┐  ┌────────┼────────────────┐
│    Production      │  │   Local Development     │
│  (Netlify)         │  │   (your machine)        │
│                    │  │                         │
│  - Auto-configured │  │  - Set in .env          │
│  - Main branch     │  │  - Local branch         │
│  - Read-only env   │  │  - Full control         │
└────────────────────┘  └─────────────────────────┘
```

## Additional Resources

- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Drizzle Kit Commands](https://orm.drizzle.team/kit-docs/overview)

---

**Need Help?** 
- Check [Neon Status](https://neonstatus.com/)
- Check [Netlify Status](https://www.netlifystatus.com/)
- Review Netlify deploy logs
- Check Neon branch logs in console
