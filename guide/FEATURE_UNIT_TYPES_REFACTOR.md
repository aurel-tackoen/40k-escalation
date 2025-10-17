# Unit Types Refactor - Implementation Summary

## Overview
Successfully refactored hardcoded unit types in `ArmyListsView.vue` to be dynamic based on game system. This allows each Warhammer game system (40k, AoS, ToW, MESBG) to have its own appropriate unit organization structure.

## Changes Made

### 1. Data Layer (`app/data/unit-types-by-system.js`) ✅
Created static data file defining unit types for each game system:
- **40k**: HQ, Troops, Elites, Fast Attack, Heavy Support, Flyer, Dedicated Transport, Fortification, Lord of War
- **Age of Sigmar**: Leaders, Battleline, Conditional Battleline, Artillery, Behemoth, Other Units, Unique, Reinforcements
- **The Old World**: Lords, Heroes, Core, Special, Rare, Mercenaries, Allies
- **MESBG**: Heroes of Legend/Valour/Fortitude, Minor Heroes, Independent Heroes, Warriors, Monsters, Siege Engines, War Beasts

Each unit type includes:
- `name`: Display name
- `category`: Grouping (Command, Core, Elite, Support, etc.)
- `displayOrder`: Sort order for dropdowns

### 2. Database Schema (`db/schema.ts`) ✅
Added `unitTypes` table with columns:
- `id`: Primary key (serial)
- `gameSystemId`: Foreign key to game_systems (with cascade delete)
- `name`: Unit type name (varchar 100)
- `category`: Unit category (varchar 50)
- `displayOrder`: Sort order (integer)
- `isActive`: Active flag (boolean, default true)
- `createdAt`: Timestamp

Migration created: `migrations/0011_white_satana.sql`

### 3. API Endpoint (`server/api/unit-types.get.ts`) ✅
Created GET endpoint following same pattern as factions/missions:
- Accepts optional `?gameSystemId=X` query parameter
- Returns unit types filtered by game system
- Ordered by `displayOrder` for consistent UI presentation
- Returns JSON with `success`, `data`, `count`, and `gameSystemId` fields

### 4. Store Integration (`app/stores/leagues.js`) ✅
Extended leagues store with:
- State: Added `unitTypes` array
- Getter: Added `availableUnitTypes` computed property
- Action: Added `fetchUnitTypes(gameSystemId)` method
- Integration: Added `fetchUnitTypes` to all locations where `fetchFactions` and `fetchMissions` are called:
  - `switchLeague()` - When switching between leagues
  - `updateLeague()` - When game system changes
  - `initialize()` - On app initialization

### 5. UI Component (`app/components/views/ArmyListsView.vue`) ✅
Updated army builder form:
- Added `availableUnitTypes` from store via `storeToRefs`
- Replaced hardcoded `<option>` elements with dynamic `v-for` loop
- Unit type dropdown now automatically updates when switching leagues with different game systems

**Before:**
```vue
<option value="HQ">HQ</option>
<option value="Troops">Troops</option>
<!-- ... hardcoded options -->
```

**After:**
```vue
<option v-for="unitType in availableUnitTypes" :key="unitType.id" :value="unitType.name">
  {{ unitType.name }}
</option>
```

### 6. Database Seeding (`server/api/seed-game-systems.post.ts`) ✅
Extended seeding endpoint to populate unit types:
- Imports unit types data from `unit-types-by-system.js`
- Creates unit types for each game system
- Tracks created counts
- Returns summary including unit types statistics

## Testing Required

To complete the refactor, run these tests:

### 1. Seed the Database
```bash
# Start dev server
npm run dev

# In another terminal, run seeding
curl -X POST http://localhost:8888/api/seed-game-systems
```

### 2. Test Unit Type Dropdown
1. Create/join a 40k league
2. Go to Army Lists, click "Build New Army"
3. Verify unit type dropdown shows: HQ, Troops, Elites, Fast Attack, Heavy Support, Flyer, Dedicated Transport, etc.

### 3. Test Game System Switching
1. Switch to an Age of Sigmar league
2. Go to Army Lists, click "Build New Army"
3. Verify unit type dropdown now shows: Leaders, Battleline, Artillery, Behemoth, etc.
4. Switch back to 40k league
5. Verify dropdown reverts to 40k unit types

### 4. Test Existing Armies
1. View existing army lists created before this change
2. Verify unit type badges still display correctly
3. Edit an existing army
4. Verify you can still modify units

## Backward Compatibility

Existing army data is fully compatible because:
- Unit types are stored as text strings in the `units` JSON field
- The stored values (e.g., "HQ", "Troops") match the new database values
- No data migration is required

## Files Modified

1. `/app/data/unit-types-by-system.js` (new)
2. `/db/schema.ts`
3. `/server/api/unit-types.get.ts` (new)
4. `/app/stores/leagues.js`
5. `/app/components/views/ArmyListsView.vue`
6. `/server/api/seed-game-systems.post.ts`
7. `/migrations/0011_white_satana.sql` (generated)

## Benefits

1. **Authenticity**: Each game system uses its proper army organization
2. **Maintainability**: Unit types managed in central data files
3. **Scalability**: Easy to add new game systems or modify existing ones
4. **Consistency**: Follows established patterns for factions and missions
5. **User Experience**: Dropdown automatically updates when switching game systems

## Next Steps

1. Run database migration: `npm run db:migrate`
2. Seed unit types: `POST /api/seed-game-systems`
3. Test in UI across different game systems
4. Consider adding unit type categories/grouping in UI for better organization
5. Add unit type validation rules (e.g., "Battleline required" for AoS)
