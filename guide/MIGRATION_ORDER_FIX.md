# Migration Order Fix - IMPORTANT! 🚨

## The Problem

When running `npm run db:migrate`, you got this error:
```
column "leagueId" of relation "armies" contains null values
```

**Why?** The schema migration tries to add a `NOT NULL` column to existing tables that already have data, but those rows don't have `leagueId` values yet.

## The Solution: Two-Step Migration

We need to migrate in a specific order:

### ✅ Correct Order

1. **Run Data Migration FIRST** (populates leagueId in existing data)
2. **Then Run Schema Migration** (adds NOT NULL constraint)

### ❌ Wrong Order (What You Just Tried)

1. ~~Schema migration first~~ ❌ - Fails because data doesn't have leagueId yet
2. ~~Data migration second~~ - Never gets here

---

## Step-by-Step Fix

### Step 1: Start Dev Server

```bash
npm run dev:netlify
```

Keep this running in one terminal.

### Step 2: Run Data Migration (In Another Terminal)

This script will:
- Add `leagueId` to all existing armies (temporarily nullable)
- Add `leagueId` to all existing players
- Create league memberships
- Set up the default league

```bash
curl -X POST http://localhost:8888/api/migrate-to-multileague
```

**Expected output:**
```json
{
  "success": true,
  "message": "✅ Multi-league migration completed successfully",
  "data": {
    "leagueId": 1,
    "leagueName": "Default Escalation League",
    "playersMigrated": X,
    "membershipsCreated": Y,
    "armiesUpdated": Z
  }
}
```

### Step 3: Now Run Schema Migration

Now that all data has `leagueId` values, the schema migration will work:

```bash
npm run db:migrate
```

**This time it should succeed!** ✅

### Step 4: Verify Everything Works

```bash
# Open database GUI
npm run db:studio

# Check tables:
# - armies should have leagueId column
# - players should have leagueId column
# - league_memberships should exist with data
```

---

## Why This Order Matters

### The Migration File (`0006_jittery_prodigy.sql`)

This migration tries to:
```sql
ALTER TABLE "armies" ADD COLUMN "leagueId" integer NOT NULL;
ALTER TABLE "players" ADD COLUMN "leagueId" integer NOT NULL;
```

**Problem:** If armies/players already exist without leagueId values, this fails!

### The Data Migration Script

The `/api/migrate-to-multileague` endpoint:
1. Checks if migration needed (looks for rows without leagueId)
2. Creates/gets a default league
3. **Populates leagueId in existing data**
4. Creates memberships
5. Links everything together

---

## Alternative: Fresh Start (If You Have No Important Data)

If your local database has test data only, you can reset:

### Option A: Drop and Recreate Tables

```bash
# Connect to your database
npm run db:studio

# In Drizzle Studio, delete all data from tables
# Then run:
npm run db:migrate
```

### Option B: Reset Your Local Branch

In Neon Console:
1. Delete your `local` branch
2. Create a new `local` branch from `main`
3. Update `.env` with the new connection string
4. Run `npm run db:migrate` (clean slate!)

---

## For Future Reference

When adding NOT NULL columns to existing tables with data:

### Best Practice: Three-Step Migration

1. **Migration 1**: Add column as NULLABLE
   ```sql
   ALTER TABLE "armies" ADD COLUMN "leagueId" integer;
   ```

2. **Data Script**: Populate the column
   ```sql
   UPDATE armies SET leagueId = 1 WHERE leagueId IS NULL;
   ```

3. **Migration 2**: Make it NOT NULL
   ```sql
   ALTER TABLE "armies" ALTER COLUMN "leagueId" SET NOT NULL;
   ```

---

## Quick Command Reference

```bash
# 1. Start dev server
npm run dev:netlify

# 2. Run data migration (in another terminal)
curl -X POST http://localhost:8888/api/migrate-to-multileague

# 3. Run schema migration
npm run db:migrate

# 4. Verify
npm run db:studio

# Check migration worked
curl http://localhost:8888/api/players?leagueId=1
curl http://localhost:8888/api/armies
```

---

## Troubleshooting

### "Server not running" when trying data migration

**Fix:**
```bash
# Make sure dev server is running
npm run dev:netlify

# Wait for "Local: http://localhost:8888" message
# Then try the curl command again
```

### Data migration says "already migrated"

**This is good!** It means:
- Data already has leagueId values
- You can safely run `npm run db:migrate`
- The script is idempotent (safe to run multiple times)

### Schema migration still fails

**Check if data migration actually ran:**
```bash
# This endpoint checks for unmigrated data
curl http://localhost:8888/api/migrate-to-multileague

# If it says "already migrated", good!
# If not, the data migration didn't complete
```

### Import errors in console

**Fixed!** All import paths now use relative paths:
- `~/db` → `../../db` ✅
- Works with Nitro's module resolution

---

## Status After Fix

✅ Import paths fixed in all new endpoints
✅ Migration order documented
✅ Ready to run data migration
⏳ Need to run data migration
⏳ Then run schema migration

**Next command:**
```bash
npm run dev:netlify
# Then in another terminal:
curl -X POST http://localhost:8888/api/migrate-to-multileague
```
