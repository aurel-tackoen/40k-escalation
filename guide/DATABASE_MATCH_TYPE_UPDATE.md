# Database Schema Update - Match Type Configuration

## What Changed

### 1. Database Schema (`db/schema.ts`)
Added 3 new fields to the `game_systems` table:
- `description` (text) - Game system description
- `matchType` (varchar) - Type of match scoring: 'victory_points', 'percentage', or 'scenario'
- `matchConfig` (text) - JSON string containing match configuration object

### 2. Migration
Created migration: `0016_secret_war_machine.sql`
- Adds the 3 new columns to `game_systems` table

### 3. Seed Endpoint (`server/api/seed-game-systems.post.ts`)
Updated to:
- Insert `description`, `matchType`, and `matchConfig` when creating new game systems
- **UPDATE existing game systems** with these fields (important for existing data!)
- Store `matchConfig` as JSON string using `JSON.stringify()`
- Also seeds factions, missions, and unit types for each game system

### 4. GET Endpoint (`server/api/game-systems.get.ts`)
Simplified to:
- Fetch game systems directly from database
- Parse `matchConfig` JSON string back to object using `JSON.parse()`
- No longer needs to merge with static file data

## How to Use

### Step 1: Make sure migration is applied
```bash
npm run db:migrate
```

### Step 2: Seed game systems
Use the dedicated game systems endpoint to populate game systems, factions, missions, and unit types:

With your dev server running (`npm run dev`), run:
```bash
curl -X POST http://localhost:3000/api/seed-game-systems
```

Or from the browser console:
```javascript
await fetch('/api/seed-game-systems', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Step 3: Verify the data
```bash
curl http://localhost:3000/api/game-systems | python3 -m json.tool
```

You should see matchType and matchConfig in the response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Warhammer 40,000",
      "shortName": "40k",
      "description": "The grim darkness of the far future...",
      "matchType": "victory_points",
      "matchConfig": {
        "matchType": "victory_points",
        "pointsLabel": "Victory Points",
        "pointsRange": { "min": 0, "max": 100 }
      },
      "isActive": true,
      "createdAt": "2025-10-18T..."
    }
  ]
}
```

## What This Fixes

**Before**: 
- `matchType` and `matchConfig` were only in static files
- The API couldn't return them
- MatchesView couldn't determine which form to show
- Match recording always showed Victory Points form

**After**:
- `matchType` and `matchConfig` stored in database
- API returns them with game systems
- Pinia store receives them
- MatchesView reads `matchType` from `currentGameSystem.value?.matchType`
- Correct form displays based on game system:
  - **40k/AoS/HH**: Victory Points form
  - **The Old World**: Percentage/Casualties form  
  - **MESBG**: Scenario Objectives form

## Files Modified

1. ✅ `db/schema.ts` - Added 3 fields to gameSystems table
2. ✅ `migrations/0016_secret_war_machine.sql` - Migration applied
3. ✅ `server/api/seed-game-systems.post.ts` - Seeds matchType & matchConfig
4. ✅ `server/api/game-systems.get.ts` - Returns parsed matchConfig
5. ✅ All lint checks passed

## Next Steps

1. **Run the seed**: `POST /api/seed-game-systems`
2. **Test in UI**: Create a league with The Old World → should see Percentage/Casualties form
3. **Test in UI**: Create a league with MESBG → should see Scenario Objectives form
4. **Verify**: Check that match recording shows the correct form based on game system
