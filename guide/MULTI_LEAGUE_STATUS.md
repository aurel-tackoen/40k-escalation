# Multi-League Refactor - Implementation Status

**Date**: October 14, 2025
**Status**: 🟡 In Progress (Phase 1 Complete + Database Setup Complete)

---

## ✅ Phase 0: Database Environment Setup (COMPLETE)

### Local Development Configuration
- ✅ Updated `db/index.ts` - Supports both DATABASE_URL (local) and NETLIFY_DATABASE_URL (production)
- ✅ Updated `drizzle.config.ts` - Dual environment support
- ✅ Updated `.env` - Configured for local Neon branch with correct ports (8888)
- ✅ Updated `.env.example` - Added database configuration template
- ✅ Created `guide/DATABASE_LOCAL_SETUP.md` - Comprehensive setup guide
- ✅ Created `guide/DATABASE_SETUP_CHECKLIST.md` - Quick setup checklist

### Database Branch Strategy
- **Local Development**: Uses dedicated `local` branch via `DATABASE_URL` in `.env`
- **Production**: Uses main branch via `NETLIFY_DATABASE_URL` (auto-set by Netlify)
- Changes to local branch don't affect production
- Safe to test migrations and data changes locally

### Next Step
- ⏳ **TODO**: Run migrations on local branch (`npm run db:migrate`)

---

## ✅ Phase 1: Database Schema (COMPLETE)

### Database Changes
- ✅ Updated `leagues` table with ownership columns:
  - `createdBy` (FK to users.id) - League owner
  - `isPublic` (boolean) - Public vs private
  - `joinPassword` (varchar) - Hashed password
  - `maxPlayers` (integer) - Optional limit
  - `status` (varchar) - 'draft', 'active', 'completed', 'archived'

- ✅ Updated `players` table to be league-specific:
  - `leagueId` (FK to leagues.id, NOT NULL, CASCADE DELETE)
  - Removed unique constraint on `email` (users can have multiple players)
  - Stats (wins, losses, draws, totalPoints) now scoped to league

- ✅ Updated `armies` table:
  - `leagueId` (FK to leagues.id, NOT NULL, CASCADE DELETE)

- ✅ Created `league_memberships` table:
  - Junction table linking users to leagues
  - Tracks role ('owner', 'organizer', 'player')
  - Links to player entity via `playerId`
  - Status tracking ('active', 'inactive', 'banned')

### Migration
- ✅ Generated migration: `0006_jittery_prodigy.sql`
- ✅ Created data migration script: `/api/migrate-to-multileague`
- ⏳ **TODO**: Run migration scripts

---

## ✅ Phase 2: Backend API (PARTIAL)

### New Endpoints Created
- ✅ `POST /api/leagues/create` - Create league with rounds
- ✅ `POST /api/leagues/:id/join` - Join league with password
- ✅ `POST /api/leagues/:id/leave` - Leave league
- ✅ `GET /api/leagues/my` - Get user's leagues
- ✅ `POST /api/migrate-to-multileague` - Data migration script

### Updated Endpoints
- ✅ `GET /api/players?leagueId=123` - Now league-scoped
- ✅ `POST /api/players` - Creates player in specific league + links membership

### Endpoints Still TODO
- ⏳ `GET /api/armies?leagueId=123` - Filter by league
- ⏳ `POST /api/armies` - Add leagueId validation
- ⏳ `GET /api/matches?leagueId=123` - Filter by league
- ⏳ `POST /api/matches` - Add leagueId validation
- ⏳ `GET /api/leagues/:id` - Get single league with full data
- ⏳ `PATCH /api/leagues/:id` - Update league settings (owner only)
- ⏳ `DELETE /api/leagues/:id` - Delete league (owner only)
- ⏳ `GET /api/leagues/:id/members` - List members
- ⏳ `PATCH /api/leagues/:id/members/:userId/role` - Update member role

### Dependencies
- ✅ Installed `bcryptjs` for password hashing

---

## ⏳ Phase 3: Frontend State Management (TODO)

### Pinia Store Refactor
- ⏳ Rename `league.js` to `leagues.js` (plural)
- ⏳ Update state structure:
  ```javascript
  state: {
    myLeagues: [],           // User's leagues
    currentLeagueId: null,   // Active league
    leagues: {},             // Map of league data
    players: [],             // Scoped to current league
    matches: [],             // Scoped to current league
    armies: []               // Scoped to current league
  }
  ```
- ⏳ Add getters:
  - `currentLeague` - Get active league
  - `myRole` - Get user's role in current league
  - `canEditLeague` - Permission check
  - `isOwner` - Permission check
- ⏳ Update actions:
  - `createLeague(leagueData, password)`
  - `joinLeague(leagueId, password)`
  - `leaveLeague(leagueId)`
  - `switchLeague(leagueId)`
  - `fetchMyLeagues()`
  - All existing actions need leagueId parameter

---

## ⏳ Phase 4: Frontend UI (TODO)

### New Pages Needed
- ⏳ `/leagues` - List user's leagues
- ⏳ `/leagues/create` - Create new league form
- ⏳ `/leagues/join` - Join league form
- ⏳ `/leagues/:id/settings` - League settings (owner/organizer)
- ⏳ `/leagues/:id/members` - Member management

### Route Changes
- ⏳ Update routes from:
  - `/dashboard` → `/leagues/:id/dashboard`
  - `/players` → `/leagues/:id/players`
  - `/armies` → `/leagues/:id/armies`
  - `/matches` → `/leagues/:id/matches`
  - `/setup` → `/leagues/:id/setup`

### Layout Updates
- ⏳ Add league switcher dropdown to navigation
- ⏳ Add "Create League" button
- ⏳ Add "Join League" button
- ⏳ Show current league name in header
- ⏳ Show user's role badge (Owner/Organizer/Player)

### Component Updates
- ⏳ Update all components to use scoped data (via currentLeagueId)
- ⏳ Add permission-based UI elements:
  - Show/hide edit buttons based on role
  - Disable actions for non-owners
- ⏳ Update forms to include leagueId

---

## 📋 Migration Checklist

### Before Running Migration
- ⏳ **BACKUP DATABASE** - Critical!
- ⏳ Test migration script on copy of production data
- ⏳ Verify all users have user IDs
- ⏳ Verify at least one user exists to be league owner

### Migration Steps
1. ⏳ Run data migration: `POST /api/migrate-to-multileague`
   - Creates default league if needed
   - Assigns all players to league
   - Creates memberships
   - Sets first user as owner
   - Updates armies with leagueId

2. ⏳ Apply database migration: `npm run db:migrate`
   - Applies schema changes
   - Makes leagueId NOT NULL
   - Creates new table

3. ⏳ Verify migration:
   - Check all players have leagueId
   - Check league has createdBy
   - Check memberships created
   - Check armies have leagueId

---

## 🚨 Breaking Changes

### API Changes
- ❗ `GET /api/players` now requires `?leagueId=123` parameter
- ❗ `POST /api/players` now requires `leagueId` in body
- ❗ All player queries will be scoped to leagues
- ❗ Email uniqueness removed from players (same user can join multiple leagues)

### Frontend Changes
- ❗ Store structure completely changed
- ❗ Routes will change (add `/leagues/:id` prefix)
- ❗ Components need league context everywhere

---

## 🎯 Next Steps (Priority Order)

### Immediate (Do Next)
1. **Run Migration**:
   ```bash
   # Step 1: Data migration
   curl -X POST http://localhost:8888/api/migrate-to-multileague
   
   # Step 2: Apply schema migration
   npm run db:migrate
   
   # Step 3: Verify
   npm run db:studio
   ```

2. **Update Remaining Endpoints**:
   - Update armies GET/POST endpoints
   - Update matches GET/POST endpoints
   - Test all endpoints with leagueId parameter

3. **Refactor Pinia Store**:
   - Create new leagues store structure
   - Add league switching logic
   - Update all actions

### Short Term (This Week)
4. **Create League List Page**:
   - Show user's leagues
   - Create league form
   - Join league form

5. **Add League Switcher**:
   - Dropdown in navigation
   - Save current league to localStorage

6. **Update Core Components**:
   - Dashboard, Players, Armies, Matches
   - Add league context

### Medium Term (Next Week)
7. **League Settings Page**:
   - Edit league (owner only)
   - Manage members (owner/organizer)
   - Delete league (owner only)

8. **Permission System**:
   - Add role-based UI
   - Add permission checks

9. **Testing**:
   - Test multi-league switching
   - Test data isolation
   - Test permissions

---

## 📊 Architecture Decisions Made

### ✅ Player Architecture: Option A (League-Specific Players)
**Decision**: Players are league-specific entities with stats scoped to each league.

**Why**:
- Simplest to implement
- Natural data scoping
- Stats automatically scoped
- Minimal migration complexity

**Trade-offs**:
- More player records in DB
- No global stats (can add later)
- User can have multiple "identities" across leagues

### ✅ Password Security
- Using bcryptjs for hashing
- Passwords stored hashed in database
- Compare on join attempt
- Support for passwordless public leagues

### ✅ Cascade Deletes
- Delete league → cascade to all dependent data
- Keeps database clean
- Owner leaving = archive league (don't delete)

---

## 🔧 Technical Notes

### Database Constraints
- `players.leagueId` - NOT NULL, CASCADE DELETE
- `armies.leagueId` - NOT NULL, CASCADE DELETE
- `leagues.createdBy` - NOT NULL (after migration)
- `league_memberships` - Unique per (userId, leagueId)

### Role Hierarchy
1. `owner` - Full control
2. `organizer` - Can manage, can't delete
3. `player` - Can participate, limited edit

### League Status Flow
- `draft` → `active` → `completed` → `archived`
- Active leagues accept new members
- Completed leagues are read-only
- Archived leagues are hidden from UI

---

## 📝 Future Enhancements (Phase 2+)

### Nice-to-Have Features
- [ ] League invitations (email/link)
- [ ] League templates (copy structure)
- [ ] League discovery/browse page
- [ ] League activity feed
- [ ] Global player profiles (aggregate across leagues)
- [ ] Cross-league statistics
- [ ] League badges/achievements
- [ ] League seasons (archive and restart)

### Advanced Features
- [ ] Multi-league tournaments
- [ ] League chat/announcements
- [ ] League exports (CSV/PDF)
- [ ] Advanced permissions (custom roles)
- [ ] League webhooks (Discord/Slack)

---

## 🐛 Known Issues / Risks

### Current Risks
- ⚠️ Migration must run BEFORE schema migration
- ⚠️ No rollback plan if migration fails
- ⚠️ Breaking change to API (need frontend update)
- ⚠️ Need to handle existing data carefully

### Mitigation
- ✅ Migration script is idempotent
- ✅ Data migration separate from schema
- ⏳ Test on staging first
- ⏳ Keep backup before migration

---

## 📚 Related Documentation

- **Main Guide**: `/AGENTS.md` - Updated with multi-league architecture
- **Database Schema**: `/db/schema.ts` - All schema changes
- **Migration Script**: `/server/api/migrate-to-multileague.post.ts`
- **API Endpoints**: `/server/api/leagues/*` - New endpoints

---

**Last Updated**: October 14, 2025  
**Updated By**: AI Agent  
**Current Phase**: Phase 1 Complete, Phase 2 In Progress
