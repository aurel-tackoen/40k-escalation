# Codebase Structure

**Analysis Date:** 2026-02-05

## Directory Layout

```
40k-escalation/
├── app/                           # Frontend application
│   ├── app.vue                    # Root app component
│   ├── assets/css/                # Global CSS (Tailwind, animations)
│   ├── components/                # Reusable Vue components
│   │   ├── admin/                 # Admin-only components
│   │   └── views/                 # Page view components
│   ├── composables/               # Vue 3 composition functions
│   ├── data/                      # Static data files
│   ├── layouts/                   # Page layouts (default, admin)
│   ├── pages/                     # File-based routing (Nuxt)
│   │   ├── admin/                 # Admin pages
│   │   ├── join/                  # Join league by token
│   │   ├── leagues/               # League management pages
│   │   └── *.vue                  # Root-level pages
│   └── stores/                    # Pinia stores (auth, leagues)
├── server/                        # Backend API
│   ├── api/                       # REST API endpoints
│   │   ├── admin/                 # Admin endpoints
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── leagues/               # League management endpoints
│   │   ├── pairings/              # Pairing generation endpoints
│   │   ├── players/               # Player management endpoints
│   │   └── *.ts                   # Root API endpoints
│   └── utils/                     # Server utilities (auth, tokens)
├── db/                            # Database
│   ├── index.ts                   # Drizzle ORM initialization
│   ├── schema.ts                  # Table definitions
│   └── migrations/                # Database migration files
├── test-utils/                    # Test utilities
├── tests/                         # Test files
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   ├── component/                 # Vue component tests
│   └── e2e/                       # End-to-end tests
├── guide/                         # Documentation
├── nuxt.config.ts                 # Nuxt configuration
├── drizzle.config.ts              # Drizzle ORM config
├── vitest.config.ts               # Vitest config
├── playwright.config.ts           # Playwright E2E config
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

## Directory Purposes

**app/:**
- Purpose: Contains entire frontend application (Vue 3 + Nuxt)
- Files: Pages, components, stores, composables, layouts
- Build output: Generated into `.nuxt/` and `dist/`

**app/pages/:**
- Purpose: File-based routing - each file maps to a URL
- Convention: `pages/foo.vue` → `/foo`, `pages/admin/bar.vue` → `/admin/bar`, `pages/[id].vue` → `/:id`
- Key files: `index.vue` (home), `dashboard.vue`, `leagues/`, `admin/`, `join/[token].vue`
- Mounted by: NuxtPage component in `app.vue`

**app/components/:**
- Purpose: Reusable Vue 3 components
- Structure: Root components + subdirectories by feature
- Key components:
  - `admin/`: UnitTypesManager, MissionsManager, GameSystemsManager, FactionsManager, MatchesManager, UsersManager, LeaguesManager
  - `views/`: DashboardView, PlayersView, MatchesView, PairingsView, ArmyListsView, LeagueSetupView, ProfileView
  - Modals: CreatePlayerModal, ConfirmationModal, AdminModal
  - UI: ToastContainer, LoadingSpinner, Logo, LeagueSwitcher, UserMenu, LoginButton
- Naming: PascalCase (MatchCard.vue, CreatePlayerModal.vue)

**app/stores/:**
- Purpose: Pinia stores for global state
- Key stores:
  - `auth.js` - User authentication state (120 lines)
  - `leagues.js` - All league/player/match data (1361 lines - large, monolithic)
- Pattern: `defineStore()` with state, getters, actions
- Accessed via: `useAuthStore()` and `useLeaguesStore()`

**app/composables/:**
- Purpose: Extract Vue 3 logic into reusable hooks
- Key composables (~23 files):
  - `useAuth.js` - Wrapper around auth store
  - `usePlayerStats.js` - Player statistics calculations
  - `usePlayerLookup.js` - Find player by ID
  - `useFormatting.js` - Date/number formatting
  - `useMatchResults.js` - Win streak, match analysis
  - `usePairings.js` - Pairing logic and Swiss system
  - `usePaintingStats.js` - Painting progress calculations
  - `useMatchValidation.js` - Match result validation
  - `useArmyForm.js` - Army list form logic
  - `useLeagueRules.js` - League rule validation
  - Plus others for data manipulation, filtering, modal handling

**server/api/:**
- Purpose: RESTful API endpoints (Nitro serverless)
- Routing: File-based - `server/api/foo.get.ts` → GET `/api/foo`
- Subdirectories organize by resource:
  - `auth/` - Login, callback, user, logout
  - `leagues/` - Create, join, list, update, delete, share token management
  - `players/` - CRUD for players within leagues
  - `matches/` - CRUD for matches (with score handling)
  - `pairings/` - Generate pairings, create manual, delete
  - `admin/` - Administrative operations on game systems, factions, missions
- Pattern: Each file exports default event handler
- Authentication: All use `requireAuth()` or `requireLeagueRole()` from `server/utils/auth.ts`

**server/utils/:**
- Purpose: Shared server utilities
- Key files:
  - `auth.ts` - Authentication helpers (requireAuth, requireLeagueRole, requireAdmin)
  - `tokens.ts` - Share token generation (32-char hex)

**db/:**
- Purpose: Database schema and ORM setup
- Files:
  - `schema.ts` - Drizzle table definitions for 11 entities
  - `index.ts` - Neon client initialization with Drizzle ORM
- Entities: gameSystems, factions, missions, unitTypes, users, leagues, rounds, players, matches, armies, leagueMemberships, pairings, leagueSettings
- Database: PostgreSQL via Neon (Netlify)

**migrations/:**
- Purpose: Database migration history
- Auto-generated by `npm run db:generate` (drizzle-kit)
- Contains: SQL statements for schema changes

**tests/:**
- Purpose: Test suites organized by type
- Structure:
  - `unit/` - Pure function and composable tests
  - `integration/` - Store and API tests
  - `component/` - Vue component rendering tests
  - `e2e/` - Full user flow tests with Playwright
- Config: vitest.config.ts, playwright.config.ts

## Key File Locations

**Entry Points:**
- `app/app.vue` - Root component, initializes auth and leagues on mount
- `app/pages/index.vue` - Public home page
- `app/pages/dashboard.vue` - Authenticated league dashboard
- `nuxt.config.ts` - Nuxt configuration (SSR disabled, Pinia module, Netlify preset)

**Configuration:**
- `nuxt.config.ts` - Nuxt app config, runtime config (API base, database URL, JWT secret)
- `drizzle.config.ts` - Drizzle migration config pointing to `db/`
- `vitest.config.ts` - Test runner config
- `playwright.config.ts` - E2E test config
- `tsconfig.json` - TypeScript config
- `eslint.config.ts` - Linting rules

**Core Logic:**
- `app/stores/auth.js` - Authentication state and methods
- `app/stores/leagues.js` - ALL league data management (monolithic)
- `server/utils/auth.ts` - API authentication and authorization
- `db/schema.ts` - Data model definitions

**Authentication Flow:**
- `server/api/auth/login.get.ts` - Redirect to Auth0
- `server/api/auth/callback.get.ts` - Handle Auth0 callback, create session
- `server/api/auth/logout.get.ts` - Clear session
- `server/api/auth/user.get.ts` - Fetch authenticated user from database

**League Management:**
- `server/api/leagues/create.post.ts` - Create new league with rounds
- `server/api/leagues/[id].get.ts` - Fetch league details
- `server/api/leagues/[id].patch.ts` - Update league settings
- `server/api/leagues/[id].delete.ts` - Delete league (owner only)
- `server/api/leagues/[id]/join.post.ts` - Join league with player creation
- `server/api/leagues/[id]/leave.post.ts` - Leave league
- `server/api/leagues/[id]/members.get.ts` - List league members
- `server/api/leagues/public.get.ts` - List public leagues
- `server/api/leagues/info-by-token/[token].get.ts` - Get league info by share token
- `server/api/leagues/join-by-token/[token].post.ts` - Join via share token

**Player Management:**
- `server/api/players.get.ts` - List players in league
- `server/api/players.post.ts` - Create player
- `server/api/players.put.ts` - Update player
- `server/api/players.delete.ts` - Delete player
- `server/api/players/[id]/toggle-active.patch.ts` - Toggle player active status

**Match Management:**
- `server/api/matches.get.ts` - List matches in league
- `server/api/matches.post.ts` - Record match result
- `server/api/matches.put.ts` - Update match result
- `server/api/matches.delete.ts` - Delete match

**Army Lists:**
- `server/api/armies.get.ts` - List armies
- `server/api/armies.post.ts` - Save army list
- `server/api/armies.delete.ts` - Delete army

**Pairings:**
- `server/api/pairings/index.get.ts` - List pairings for league
- `server/api/pairings/generate.post.ts` - Auto-generate pairings (Swiss system)
- `server/api/pairings/manual.post.ts` - Create manual pairing
- `server/api/pairings/[id].delete.ts` - Delete pairing

**Game System Admin:**
- `server/api/game-systems.get.ts` - List game systems
- `server/api/factions.get.ts` - List factions for game system
- `server/api/missions.get.ts` - List missions for game system
- `server/api/unit-types.get.ts` - List unit types for game system
- `server/api/admin/game-systems.post.ts` - Create game system (admin)
- `server/api/admin/game-systems/[id].put.ts` - Update game system (admin)
- `server/api/admin/factions.post.ts` - Create faction (admin)
- `server/api/admin/missions.post.ts` - Create mission (admin)
- `server/api/admin/unit-types.post.ts` - Create unit type (admin)

**Layouts:**
- `app/layouts/default.vue` - Standard layout with header, sidebar, navbar (for all pages)
- `app/layouts/admin.vue` - Admin-specific layout

**Data/Static Files:**
- `app/data/` - Contains static data files for game systems, factions, missions

**Assets:**
- `app/assets/css/main.css` - Global styles, Tailwind directives, custom animations (smoke effects)

## Naming Conventions

**Files:**
- Components: PascalCase (MatchCard.vue, CreatePlayerModal.vue)
- Pages: kebab-case or PascalCase (dashboard.vue, leagues/, [token].vue)
- Stores: camelCase with prefix (auth.js, leagues.js)
- Composables: camelCase with "use" prefix (usePlayerStats.js, useFormatting.js)
- API endpoints: kebab-case reflecting resource (leagues.get.ts, pairings/[id].delete.ts)
- Database tables: camelCase (gameSystems, leagueMemberships, unitTypes)

**Functions:**
- Store actions: camelCase verbs (fetchUser, createLeague, updatePlayer, togglePlayerActive)
- Composable exports: camelCase (usePlayerStats, useFormatting)
- Utilities: camelCase (requireAuth, generateShareToken)

**Variables:**
- Refs: Suffix with "Ref" or unwrapped (authStore, leaguesStore, loading, error)
- Computed: No special suffix, named descriptively (currentLeague, sortedPlayers)

**Constants:**
- Uppercase with underscores (DATABASE_URL, AUTH0_DOMAIN, API_BASE)
- Or exported as objects (matchTypes, pairingMethods)

**Types:**
- Interfaces/Types: PascalCase (Player, Match, League, GameSystem)
- Props: Type objects inline in component script setup

## Where to Add New Code

**New Feature - Full Flow:**
- **Backend API:** `server/api/[resource].post.ts` (or .put, .delete, .get)
  - Example: `server/api/tournaments.post.ts` for tournament creation
  - Must include authentication check via `requireAuth()` or `requireLeagueRole()`
  - Return `{ success: true, data: ... }` or throw `createError()`
- **Store Action:** Add method to `app/stores/leagues.js` (or new store if separate domain)
  - Example: `async createTournament(data)` calling `$fetch('/api/tournaments', { method: 'POST', body: data })`
  - Update state and handle errors
- **Composable:** Extract logic to `app/composables/use[Feature].js` if reusable
  - Example: `useToastification.js` for tournament notifications
- **Component:** Create view in `app/components/views/[Feature]View.vue`
  - Accept data via props, use store actions and composables
  - Emit events or call store methods on user interaction
- **Page:** Create route in `app/pages/[feature].vue`
  - Use layout, import view component, setup store and composables
  - Pass league data to view component

**New Reusable Component:**
- Create in `app/components/[Feature].vue` (or subdirectory if related to feature)
- Use Vue 3 `<script setup>` syntax
- Accept data via props, emit events
- Example: `app/components/TournamentCard.vue`

**New Utility Function:**
- Server utilities: Add to `server/utils/[domain].ts` or new file
  - Example: `server/utils/tournaments.ts` for tournament-specific logic
- Client utilities: Add to composable or utility file
  - Pure functions in `app/composables/useUtility.js`

**Database Schema Change:**
- Edit `db/schema.ts` to add/modify table
- Run `npm run db:generate` to create migration file
- Run `npm run db:migrate` to apply migration
- Update corresponding API endpoints to handle new fields

**Tests:**
- Unit tests: `tests/unit/[domain]/[function].test.ts`
- Component tests: `tests/component/[ComponentName].test.ts`
- Integration tests: `tests/integration/[domain]/[flow].test.ts`
- E2E tests: `tests/e2e/[feature].spec.ts`

## Special Directories

**app/assets/:**
- Purpose: Static assets (CSS, images, fonts)
- Generated: No
- Committed: Yes
- Notes: Tailwind CSS in `css/main.css`, animations for UI effects

**migrations/:**
- Purpose: Database schema migration history
- Generated: Yes (by `drizzle-kit generate`)
- Committed: Yes (version control for schema)
- Notes: SQL statements that track schema evolution

**.nuxt/:**
- Purpose: Generated Nuxt build output
- Generated: Yes (during `npm run build`)
- Committed: No (in .gitignore)
- Notes: Intermediate build artifacts

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)
- Notes: Managed by package-lock.json

**.env / .env.example:**
- Purpose: Environment variables
- Generated: No
- Committed: .env.example only (for reference)
- Notes: .env contains secrets (DATABASE_URL, JWT_SECRET, Auth0 config)

**test-utils/:**
- Purpose: Shared utilities for writing tests
- Generated: No
- Committed: Yes
- Notes: Fixtures, mocks, helpers for test suites

---

*Structure analysis: 2026-02-05*
