# Multi-Game System Refactor - Implementation Progress

**Date**: October 15, 2025  
**Status**: Phase 1 & 2 Complete - Database and Backend ✅

---

## ✅ Completed Work

### Phase 1: Database Schema (COMPLETE)
- ✅ Added `game_systems` table with columns: id, name, shortName, isActive, createdAt
- ✅ Added `factions` table with columns: id, gameSystemId, name, category, isActive, createdAt
- ✅ Added `missions` table with columns: id, gameSystemId, name, category, isActive, createdAt
- ✅ Added `gameSystemId` column to `leagues` table (NOT NULL with proper migration)
- ✅ Migration successfully applied with backward compatibility (existing leagues → Warhammer 40k)

**Migration File**: `migrations/0008_nostalgic_human_cannonball.sql`

### Phase 2: Static Data Files (COMPLETE)
Created comprehensive data files for all 4 game systems:

**Game Systems** (`app/data/game-systems.js`):
- Warhammer 40,000 (40k)
- Age of Sigmar (aos)
- The Old World (tow)
- Middle-Earth Strategy Battle Game (mesbg)

**Factions** (`app/data/factions-by-system.js`):
- 40k: 41 factions (Imperium, Chaos, Xenos)
- AoS: 24 factions (Order, Chaos, Death, Destruction)
- ToW: 17 factions (Order, Chaos, Death, Destruction)
- MESBG: 33 factions (Free Peoples, Elves, Dwarves, Evil)

**Missions** (`app/data/missions-by-system.js`):
- 40k: 15 missions (Eternal War, Maelstrom, Matched Play)
- AoS: 13 missions (Battleplans, Matched Play)
- ToW: 12 missions (Standard, Special, Scenario, Narrative)
- MESBG: 14 missions (Scenario, Narrative)

### Phase 3: API Endpoints (COMPLETE)

**New Endpoints Created**:
1. ✅ `GET /api/game-systems` - Fetch all active game systems
2. ✅ `GET /api/factions?gameSystemId=X` - Fetch factions (filtered by game system)
3. ✅ `GET /api/missions?gameSystemId=X` - Fetch missions (filtered by game system)
4. ✅ `POST /api/seed-game-systems` - Populate database with game systems, factions, missions

**Updated Endpoints**:
5. ✅ `POST /api/leagues/create` - Now requires `gameSystemId` in request body
6. ✅ `PATCH /api/leagues/[id]` - Now supports updating `gameSystemId`

### Phase 4: Pinia Store (COMPLETE)

**Updated `app/stores/leagues.js`**:

**New State**:
```javascript
gameSystems: []            // Available game systems
currentGameSystem: null    // Active game system for current league
factions: []               // Factions for current game system
missions: []               // Missions for current game system
```

**New Getters**:
- `currentGameSystemName` - Returns current game system name
- `availableFactions` - Returns factions array
- `availableMissions` - Returns missions array

**New Actions**:
- `fetchGameSystems()` - Fetch all game systems
- `fetchFactions(gameSystemId)` - Fetch factions for specific game system
- `fetchMissions(gameSystemId)` - Fetch missions for specific game system

**Updated Actions**:
- `switchLeague(leagueId)` - Now fetches game system data when switching leagues

**App Initialization** (`app/app.vue`):
- ✅ Added `onMounted()` hook to fetch game systems on app startup

---

## 🔄 Remaining Work

### Phase 5: Update Component Forms (IN PROGRESS)

**Components to Update**:

1. **PlayersView.vue** - Dynamic faction selector
   - Replace hardcoded factions array with `leaguesStore.availableFactions`
   - Update dropdown to use dynamic faction list

2. **MatchesView.vue** - Dynamic mission selector
   - Replace hardcoded missions array with `leaguesStore.availableMissions`
   - Update dropdown to use dynamic mission list

3. **League Creation Form** (`pages/leagues/create.vue`)
   - Add game system selector dropdown
   - Fetch factions/missions when game system is selected
   - Include `gameSystemId` in league creation request

4. **DashboardView.vue** - Display current game system
   - Add game system badge/indicator
   - Show game system name in league header

### Phase 6: Testing

**Test Scenarios**:
1. ✅ Database migration applied successfully
2. ⏳ Seed game systems data (`POST /api/seed-game-systems`)
3. ⏳ Fetch game systems (`GET /api/game-systems`)
4. ⏳ Fetch factions for each game system
5. ⏳ Fetch missions for each game system
6. ⏳ Create league with game system selection
7. ⏳ Switch leagues and verify factions/missions update
8. ⏳ Create player with game-system-specific faction
9. ⏳ Record match with game-system-specific mission

### Phase 7: Documentation

**Files to Update**:
- ⏳ `AGENTS.md` - Add game systems architecture
- ⏳ Create `GAME_SYSTEMS_GUIDE.md` - Usage guide
- ⏳ Update `QUICKSTART.md` - Add seed-game-systems step

---

## 🗄️ Database Schema Summary

### New Tables

**game_systems**
```sql
id              serial PRIMARY KEY
name            varchar(100) NOT NULL UNIQUE
short_name      varchar(50) NOT NULL
is_active       boolean DEFAULT true NOT NULL
created_at      timestamp DEFAULT now() NOT NULL
```

**factions**
```sql
id              serial PRIMARY KEY
game_system_id  integer NOT NULL → game_systems.id (CASCADE DELETE)
name            varchar(100) NOT NULL
category        varchar(50)
is_active       boolean DEFAULT true NOT NULL
created_at      timestamp DEFAULT now() NOT NULL
```

**missions**
```sql
id              serial PRIMARY KEY
game_system_id  integer NOT NULL → game_systems.id (CASCADE DELETE)
name            varchar(255) NOT NULL
category        varchar(100)
is_active       boolean DEFAULT true NOT NULL
created_at      timestamp DEFAULT now() NOT NULL
```

### Modified Tables

**leagues**
```sql
-- ADDED:
game_system_id  integer NOT NULL → game_systems.id
```

---

## 🎯 Next Steps

### Immediate Actions

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Seed Game Systems Data**
   ```bash
   curl -X POST http://localhost:8888/api/seed-game-systems
   ```

3. **Verify API Endpoints**
   ```bash
   # Test game systems
   curl http://localhost:8888/api/game-systems
   
   # Test factions (40k = id 1)
   curl http://localhost:8888/api/factions?gameSystemId=1
   
   # Test missions (AoS = id 2)
   curl http://localhost:8888/api/missions?gameSystemId=2
   ```

4. **Update League Creation Form**
   - Add game system dropdown
   - Make it required field
   - Default to Warhammer 40k for now

5. **Update Player/Match Forms**
   - Use dynamic factions from store
   - Use dynamic missions from store

---

## 🔧 Implementation Notes

### Backward Compatibility
- All existing leagues automatically assigned to Warhammer 40k (gameSystemId = 1)
- Migration includes proper default values and NULL handling
- No data loss during migration

### Data Validation
- Factions validated against league's game system
- Missions validated against league's game system
- Game system required for new leagues

### Performance Considerations
- Factions/missions fetched once per league switch
- Cached in Pinia store
- No redundant API calls

### Security
- No authentication changes required
- Existing role-based access control maintained
- Game system selection restricted to league owners/organizers

---

## 📊 Statistics

**Total Factions**: 115
- 40k: 41 factions
- AoS: 24 factions
- ToW: 17 factions
- MESBG: 33 factions

**Total Missions**: 54
- 40k: 15 missions
- AoS: 13 missions
- ToW: 12 missions
- MESBG: 14 missions

**Estimated Completion**: 75%
- ✅ Database: 100%
- ✅ Backend: 100%
- ✅ Pinia Store: 100%
- ⏳ Components: 20%
- ⏳ Testing: 0%
- ⏳ Documentation: 0%

---

## 🚀 Deployment Considerations

### Environment Variables
No new environment variables required. Existing `DATABASE_URL` is sufficient.

### Migration Sequence
1. Deploy schema changes (migration 0008)
2. Seed game systems data
3. Deploy updated frontend
4. Test all functionality

### Rollback Plan
If issues occur:
1. Revert frontend deployment
2. Remove `gameSystemId` NOT NULL constraint (allow NULL temporarily)
3. Investigate and fix issues
4. Redeploy

---

## 💡 Future Enhancements

### Potential Additions
- Game system themes (colors, icons per system)
- Custom missions per league
- Import factions from external sources
- Game system-specific army validation rules
- Point calculation variations per system

### Low Priority
- Multi-language support for faction/mission names
- Game system logos/images
- Historical game systems (older editions)

---

**Last Updated**: October 15, 2025, 3:45 PM  
**Author**: AI Agent  
**Status**: Ready for Component Updates
