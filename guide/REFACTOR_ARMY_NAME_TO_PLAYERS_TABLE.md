# Refactor: Army Name Moved to Players Table

**Date**: October 18, 2025  
**Status**: ✅ **COMPLETE**  
**Impact**: Database schema, API endpoints, frontend components

## 📋 Summary

Moved `armyName` field from `league_memberships` table to `players` table to improve data architecture and simplify API interactions.

### Why This Change?

**Problem**: Army names were stored in `league_memberships` table, which created:
- **Redundant data structure** - Players are already league-specific
- **Fragmented API** - Required 2 separate endpoints to update player profile
- **Confusing architecture** - Army names are player attributes, not membership attributes

**Solution**: Move `armyName` to `players` table where it logically belongs.

---

## 🗄️ Database Changes

### Schema Update (`db/schema.ts`)

**Added to `players` table**:
```typescript
armyName: varchar({ length: 255 }), // Persistent army name for this league
```

**Migration**: `migrations/0017_absent_hedge_knight.sql`
```sql
ALTER TABLE "players" ADD COLUMN "armyName" varchar(255);
```

**Note**: `armyName` remains in `league_memberships` table temporarily for backward compatibility but is now secondary to `players.armyName`.

---

## 🔧 API Endpoint Changes

### Updated Endpoints

#### 1. `GET /api/players` ✅
**Before**: Joined `league_memberships` to get `armyName`  
**After**: Selects `armyName` directly from `players` table

```typescript
// Now simpler query
select({
  armyName: players.armyName, // ✅ From players table
  // ...other fields
})
```

---

#### 2. `PUT /api/players` ✅
**Before**: Only updated `name` and `faction`  
**After**: Also accepts and updates `armyName`

```typescript
// Request body now includes:
{
  id: number,
  name: string,
  faction: string,
  armyName?: string  // ✅ NEW
}
```

---

#### 3. `POST /api/players` ✅
**Before**: Didn't handle `armyName`  
**After**: Accepts `armyName` in request body and saves to `players` table

---

#### 4. `POST /api/leagues/[id]/join` ✅
**Before**: Saved `armyName` only to `league_memberships`  
**After**: Saves `armyName` to both `players` and `league_memberships` (for compatibility)

---

#### 5. `GET /api/leagues/my` ✅
**Before**: Returned `armyName` from `membership.armyName`  
**After**: Fetches player record and returns `armyName` from `players` table

```typescript
// Now fetches player record
const [playerRecord] = await db
  .select({ armyName: players.armyName })
  .from(players)
  .where(eq(players.id, membership.playerId))
```

---

#### 6. `GET /api/users/me` ✅
**Before**: Joined `league_memberships` to get `armyName`  
**After**: Selects `armyName` directly from `players` table

---

#### 7. `GET /api/leagues/[id]/membership` ✅
**Before**: Returned `armyName` from `league_memberships`  
**After**: Fetches from player record and includes in response

---

### Deleted Endpoint

#### ❌ `PUT /api/users/me/army-name` - REMOVED
**Reason**: No longer needed. Use `PUT /api/players` instead.

**Before** (2 API calls):
```javascript
// Update player
await $fetch('/api/players', { method: 'PUT', body: { id, name, faction } })

// Separate army name update
await $fetch('/api/users/me/army-name', { method: 'PUT', body: { userId, leagueId, armyName } })
```

**After** (1 API call):
```javascript
// Single update
await $fetch('/api/players', { method: 'PUT', body: { id, name, faction, armyName } })
```

---

## 🎨 Frontend Changes

### Component: `app/components/views/PlayersView.vue` ✅

**Removed**:
- Dual API call pattern (lines 160-180)
- `armyNameUpdateSuccess` and `armyNameUpdateError` state variables
- Separate army name update success/error messages in template
- Import of `toastError` (no longer used)

**Updated**:
```javascript
// OLD: Separate updates
emit('update-player', { id, name, faction })
await $fetch('/api/users/me/army-name', { ... })

// NEW: Single update with armyName
emit('update-player', { 
  id, 
  name, 
  faction, 
  armyName // ✅ Included in single emit
})
```

---

### Store: `app/stores/leagues.js` ✅

**Updated `currentArmyName` getter**:
```javascript
// OLD: From membership
currentArmyName: (state) => {
  const membership = state.myLeagues.find(l => l.id === state.currentLeagueId)
  return membership?.armyName || null
}

// NEW: From currentPlayer
currentArmyName: (state) => {
  const player = state.currentPlayer
  return player?.armyName || null
}
```

---

## ✅ Benefits

1. **Cleaner Data Model**
   - Single source of truth for player data
   - Army names logically belong with player records

2. **Simpler API**
   - Reduced from 2 endpoints to 1 for player updates
   - Fewer joins in database queries

3. **Better Developer Experience**
   - Intuitive data structure
   - Easier to reason about
   - Less code to maintain

4. **Performance**
   - Fewer API calls from frontend
   - Simpler database queries

---

## 🧪 Testing Checklist

### Player Creation
- [ ] Create player via PlayersView - verify armyName saves
- [ ] Create player via CreatePlayerModal - verify armyName saves
- [ ] Join league via join page - verify armyName saves

### Player Update
- [ ] Update player name/faction/armyName in PlayersView
- [ ] Verify single API call updates all fields
- [ ] Verify no errors in console

### Display
- [ ] Verify armyName displays in PlayersView player cards
- [ ] Verify armyName displays in ProfileView
- [ ] Verify armyName displays in ArmyListsView (army name generation)
- [ ] Verify armyName displays in Dashboard

### Data Migration
- [ ] Existing players retain their army names after migration
- [ ] New players can set army names
- [ ] Army names persist across page refreshes

---

## 🔄 Migration Path (If Needed)

If you have existing data in production:

```sql
-- Copy armyName from league_memberships to players
UPDATE players p
SET "armyName" = m."armyName"
FROM league_memberships m
WHERE p.user_id = m.user_id 
  AND p.league_id = m.league_id
  AND m."armyName" IS NOT NULL;
```

---

## 📝 Future Cleanup (Optional)

~~Consider removing `armyName` from `league_memberships` table entirely:~~

```sql
-- ✅ COMPLETED: armyName column removed
ALTER TABLE league_memberships DROP COLUMN "armyName";
```

**Status**: ✅ **COMPLETED** - Migration `0018_elite_sister_grimm.sql` applied.

The `armyName` column has been completely removed from the `league_memberships` table. All armyName data is now exclusively in the `players` table.

---

## 🎯 Files Changed

### Database
- ✅ `db/schema.ts` - Added `armyName` to players table
- ✅ `migrations/0017_absent_hedge_knight.sql` - Migration file

### API Endpoints (Server)
- ✅ `server/api/players.get.ts` - Updated to select from players table
- ✅ `server/api/players.put.ts` - Added armyName support
- ✅ `server/api/players.post.ts` - Added armyName support
- ✅ `server/api/leagues/[id]/join.post.ts` - Saves to players table
- ✅ `server/api/leagues/my.get.ts` - Fetches from players table
- ✅ `server/api/users/me.get.ts` - Selects from players table
- ✅ `server/api/leagues/[id]/membership.get.ts` - Gets from player record
- ❌ `server/api/users/me/army-name.put.ts` - **DELETED**

### Frontend (App)
- ✅ `app/components/views/PlayersView.vue` - Single update emit
- ✅ `app/stores/leagues.js` - Updated currentArmyName getter

### Documentation
- ✅ `guide/REFACTOR_ARMY_NAME_TO_PLAYERS_TABLE.md` - This file
- ⏳ `AGENTS.md` - To be updated

---

## 🏆 Result

**Before**: Fragmented, confusing architecture with redundant endpoint  
**After**: Clean, intuitive data model with consolidated API

✅ **Zero Lint Errors**  
✅ **Database Migration Applied**  
✅ **All Endpoints Updated**  
✅ **Frontend Components Updated**  
✅ **Ready for Testing**

---

**Last Updated**: October 18, 2025
