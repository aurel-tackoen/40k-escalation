# Bug Fix: Player Email Field Removed

**Date**: October 14, 2025  
**Status**: ✅ Fixed

## Problem

Users were unable to add themselves as players to a league. The error was:

```
null value in column "email" of relation "players" violates not-null constraint
```

## Root Cause

The `email` field was removed from the `PlayersView.vue` component form, but:
1. The database schema still had the `email` column as NOT NULL
2. The API endpoint (`server/api/players.post.ts`) still required and validated the `email` field
3. The component was still sending `email` in the payload

## Solution

### 1. Database Migration (Migration 0007)
Generated and applied migration to drop the `email` column from the `players` table:

```sql
ALTER TABLE "players" DROP COLUMN "email";
```

**Why remove email?**
- Email is already stored in the `users` table (from Auth0)
- Players are linked to users via `userId` foreign key
- No need to duplicate email data in the `players` table
- Users can have different display names per league while keeping one email in the users table

### 2. API Endpoint Update
Updated `server/api/players.post.ts`:
- Removed `email` from validation check
- Removed `email` field from the database insert operation
- Now only requires: `name`, `leagueId`, `userId`

**Before:**
```typescript
if (!body.name || !body.email || !body.leagueId || !body.userId) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Name, email, leagueId, and userId are required'
  })
}

const newPlayer = await db.insert(players).values({
  leagueId: body.leagueId,
  userId: body.userId,
  name: body.name,
  email: body.email,  // ❌ Removed
  faction: body.faction || null,
  // ...
})
```

**After:**
```typescript
if (!body.name || !body.leagueId || !body.userId) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Name, leagueId, and userId are required'
  })
}

const newPlayer = await db.insert(players).values({
  leagueId: body.leagueId,
  userId: body.userId,
  name: body.name,
  faction: body.faction || null,
  // ...
})
```

### 3. Component Update
Updated `app/components/views/PlayersView.vue`:
- Removed `email` from the emitted payload when adding a player

**Before:**
```javascript
emit('add-player', {
  name: newPlayer.value.name,
  faction: newPlayer.value.faction,
  userId: user.value.id,
  email: user.value.email  // ❌ Removed
})
```

**After:**
```javascript
emit('add-player', {
  name: newPlayer.value.name,
  faction: newPlayer.value.faction,
  userId: user.value.id
})
```

## Files Modified

1. `db/schema.ts` - Already had email removed
2. `migrations/0007_noisy_cable.sql` - Migration to drop email column
3. `server/api/players.post.ts` - Removed email validation and field
4. `app/components/views/PlayersView.vue` - Removed email from emit payload

## Testing

After applying these changes:
1. ✅ Users can join a league as a player with just display name and faction
2. ✅ Email is retrieved from the linked `users` table when needed
3. ✅ No database constraint violations
4. ✅ Player creation works correctly

## Data Integrity

Since players are always linked to users via `userId`:
- Email can be retrieved via: `JOIN users ON players.userId = users.id`
- No data loss from removing the email column
- Maintains referential integrity through foreign key constraint

## Related

- **Auth0 Integration**: Users must be authenticated to join as players
- **Multi-league Support**: Users can have different display names in different leagues
- **Data Normalization**: Email stored once in users table, not duplicated in players
