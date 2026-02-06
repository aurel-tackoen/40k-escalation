# Bug Fix: Match Creation 500 Error

**Date**: February 6, 2026  
**Status**: ✅ FIXED

## Problem

Users were experiencing a **500 Internal Server Error** when trying to add matches in production.

## Root Cause

**Field Name Mismatch**: The frontend was sending `round` but the API and database schema expected `phase`.

### Technical Details

1. **Database Schema** (`db/schema.ts`): Uses `phase` field
   ```typescript
   export const matches = pgTable('matches', {
     id: integer().primaryKey().generatedAlwaysAsIdentity(),
     leagueId: integer().references(() => leagues.id),
     phase: integer().notNull(),  // ← Expects "phase"
     // ... other fields
   })
   ```

2. **API Validation** (`server/api/matches.post.ts`): Validates for `phase`
   ```typescript
   if (!body.player1Id || !body.player2Id || body.phase === undefined) {
     throw createError({
       statusCode: 400,
       statusMessage: 'Player IDs and phase are required'
     })
   }
   ```

3. **Frontend Components**: Were sending `round` instead of `phase`
   - `MatchesView.vue` - Match recording form
   - `MatchCard.vue` - Match display card
   - `MatchesManager.vue` - Admin match editor

## Changes Made

### 1. Enhanced API Logging (`server/api/matches.post.ts`)
- Added request body logging for debugging
- Added detailed error logging with stack traces
- Added environment-aware error messages (dev vs production)

### 2. Fixed Frontend Components

#### `app/components/views/MatchesView.vue`
- ✅ Changed `newMatch.round` → `newMatch.phase` in reactive ref
- ✅ Changed `newMatch.round` → `newMatch.phase` in `resetForm()`
- ✅ Changed `newMatch.round` → `newMatch.phase` in `startEditMatch()`
- ✅ Changed `v-model="newMatch.round"` → `v-model="newMatch.phase"` in template
- ✅ Changed `match.round` → `match.phase` in `filteredMatches` filter
- ✅ Changed `match.round` → `match.phase` in table display

#### `app/components/MatchCard.vue`
- ✅ Changed `match.round` → `match.phase` in badge display

#### `app/components/admin/MatchesManager.vue`
- ✅ Changed `editForm.round` → `editForm.phase` in reactive ref initialization
- ✅ Changed `editForm.round` → `editForm.phase` in `openEditModal()`
- ✅ Changed `editForm.round` → `editForm.phase` in `closeEditModal()`
- ✅ Changed `editForm.round` → `editForm.phase` in `saveMatch()`
- ✅ Changed `v-model="editForm.round"` → `v-model="editForm.phase"` in template
- ✅ Changed `match.round` → `match.phase` in table display

## Testing Instructions

### 1. Test Match Creation
1. Navigate to the Matches page
2. Fill in the match form:
   - Select a **Phase** (previously labeled as "Round")
   - Select two players
   - Enter victory points/casualties/objectives (depending on game system)
   - Select mission
   - Enter date
3. Click "Record Match"
4. **Expected Result**: Match is created successfully without 500 error

### 2. Test Match Editing
1. Click "Edit" on any existing match
2. Modify any field
3. Click "Save Changes"
4. **Expected Result**: Match is updated successfully

### 3. Test Match Filtering
1. Use the "All Phases" dropdown to filter matches
2. **Expected Result**: Matches are correctly filtered by phase

### 4. Test Admin Panel
1. Navigate to Admin → Matches Manager
2. Click "Edit" on a match
3. Modify the phase number
4. Save changes
5. **Expected Result**: Changes are saved successfully

## Verification in Production

### Check Netlify Logs
1. Go to Netlify dashboard → Functions → matches.post
2. Look for the new logging output:
   ```
   Match creation request body: {
     "player1Id": 1,
     "player2Id": 2,
     "phase": 1,  // ← Should now be "phase" instead of "round"
     ...
   }
   ```

### Monitor for Errors
- If the 500 error persists, check the logs for detailed error messages
- The enhanced logging will show exactly what field is missing or invalid

## Prevention

To prevent similar issues in the future:

1. **Use TypeScript** - Type safety would catch field name mismatches
2. **Shared Types** - Define match types in a shared file used by both frontend and backend
3. **API Contract Testing** - Add tests that validate request/response structure
4. **Field Name Consistency** - Use the same field names across database, API, and frontend

## Related Files

- `server/api/matches.post.ts` - Enhanced logging and error handling
- `server/api/matches.put.ts` - Match update endpoint (also uses `phase`)
- `db/schema.ts` - Database schema definition
- `app/components/views/MatchesView.vue` - Main match recording UI
- `app/components/MatchCard.vue` - Match display card
- `app/components/admin/MatchesManager.vue` - Admin match editor

## Rollout Plan

1. ✅ Fix all references to `round` → `phase` in frontend
2. ✅ Add enhanced logging to API endpoint
3. 🔄 Deploy to production
4. 🔄 Monitor Netlify logs for successful match creation
5. 🔄 Test match creation in production environment
6. 🔄 Mark as resolved

## Notes

- The database schema uses `phase` throughout, which is consistent with the league `phases` terminology
- The word "Phase" is displayed in the UI (not "Round"), which matches the backend field name
- All match-related API endpoints expect `phase`, not `round`
