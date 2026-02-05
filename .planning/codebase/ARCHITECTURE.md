# Architecture

**Analysis Date:** 2026-02-05

## Pattern Overview

**Overall:** Full-stack SPA with server-rendered API layer and Pinia state management

**Key Characteristics:**
- Nuxt 4 frontend (Vue 3) with SSR disabled for client-only SPA
- Netlify serverless backend with Drizzle ORM
- Auth0 authentication with session-based cookies
- Pinia stores for centralized state management
- Composition API with composables for business logic
- Tailwind CSS for styling

## Layers

**Presentation Layer (Vue 3 / Nuxt):**
- Purpose: Render UI and handle user interactions
- Location: `app/pages/`, `app/components/`, `app/layouts/`
- Contains: Vue components, page templates, layout wrappers
- Depends on: Pinia stores, composables, Tailwind CSS
- Used by: Browser clients

**State Management Layer (Pinia):**
- Purpose: Centralize application state (auth, leagues, players, matches)
- Location: `app/stores/`
- Contains: `useAuthStore` and `useLeaguesStore` defining state, getters, and actions
- Depends on: Server API endpoints
- Used by: Components, pages, composables

**Business Logic Layer (Composables):**
- Purpose: Encapsulate reusable logic (stats calculation, data filtering, formatting)
- Location: `app/composables/`
- Contains: ~23 composables like `usePlayerStats`, `usePairings`, `useFormatting`
- Depends on: Stores, utilities
- Used by: Components and pages

**API Layer (Nitro/Serverless):**
- Purpose: Handle database operations and business rules
- Location: `server/api/`
- Contains: RESTful endpoints organized by resource (leagues, players, matches, pairings)
- Depends on: Database, authentication utilities
- Used by: Frontend via `$fetch()`

**Database Layer (Drizzle ORM):**
- Purpose: Define and query PostgreSQL schema
- Location: `db/schema.ts`, `db/index.ts`
- Contains: Drizzle table definitions for 11 entities
- Depends on: Neon PostgreSQL (Netlify)
- Used by: API endpoints

**Authentication Layer (Auth0):**
- Purpose: Handle OAuth2 login/logout and session management
- Location: `server/api/auth/`, `server/utils/auth.ts`
- Contains: Login redirect, callback handler, session validation
- Depends on: Auth0 configured domain/client
- Used by: All protected API routes

## Data Flow

**User Login Flow:**

1. User clicks login button (component)
2. `useAuthStore.login()` redirects to `/api/auth/login`
3. Auth0 login handler (`server/api/auth/login.get.ts`) redirects to Auth0
4. User authenticates with Auth0
5. Auth0 redirects to `/api/auth/callback` with authorization code
6. Callback handler exchanges code for token, creates/updates user in DB, sets auth_session cookie
7. User redirected to `/dashboard`
8. `useAuthStore.fetchUser()` reads auth_session cookie, validates session, fetches user from database

**League Selection & Data Loading Flow:**

1. User navigates to dashboard (authenticated)
2. `app.vue` mounts → calls `authStore.fetchUser()` then `leaguesStore.initialize()`
3. `initialize()` fetches game systems, then user's leagues from API
4. If saved league in localStorage is valid, switches to it; otherwise switches to first league
5. `switchLeague()` fetches league details, game system data (factions, missions, unit types)
6. `fetchLeagueData()` parallel-fetches: players, matches, armies, members, pairings, league settings
7. Store state updated, components reactively re-render with league data

**Match Creation Flow:**

1. Component calls `leaguesStore.addMatch(matchData)` via composable
2. Action sends POST to `/api/matches` with match details
3. API validates user is league member, inserts match, updates player stats
4. Response includes new match object
5. Store pushes match to local state, refetches players for updated stats
6. Component reactively updates match list

## Key Abstractions

**Pinia Store (Auth):**
- Purpose: Manage authenticated user state and login/logout flows
- Examples: `app/stores/auth.js`
- Pattern: State + getters (computed) + actions (async methods)
- Exposes: `isAuthenticated`, `userName`, `userRole`, `isAdmin`, `isOrganizer`, `fetchUser()`, `login()`, `logout()`

**Pinia Store (Leagues):**
- Purpose: Manage all league-scoped data (current league, players, matches, armies, pairings)
- Examples: `app/stores/leagues.js` (1361 lines)
- Pattern: Massive centralized state with ~30 getters and ~40 actions
- Exposes: League data, game systems, computed leaderboards, player management, pairing generation

**Composables:**
- Purpose: Extract reusable Vue logic without global state
- Examples: `usePlayerStats`, `useFormatting`, `usePairings`, `useMatchResults`
- Pattern: Pure functions accepting props, returning computed data
- Used by: Components to avoid bloated templates

**API Endpoints:**
- Purpose: Define resource-specific REST operations
- Pattern: File-based routing (`/api/leagues/create.post.ts` → POST `/api/leagues/create`)
- Convention: `[resource].[method].ts` files in `server/api/`

**Authentication Middleware:**
- Purpose: Verify user identity and authorization at API layer
- Examples: `requireAuth()`, `requireLeagueRole()`, `requireLeagueMembership()`, `requireAdmin()`
- Location: `server/utils/auth.ts`
- Pattern: Throws 401/403 errors on failure, returns validated user/membership objects on success

## Entry Points

**Frontend Entry:**
- Location: `app/app.vue`
- Triggers: Page load / browser initialization
- Responsibilities: Initialize auth store, initialize leagues store if authenticated, render layout and current page

**Main Page Route:**
- Location: `app/pages/index.vue`
- Triggers: User visits `/`
- Responsibilities: Display hero section, fetch public leagues, show league cards or login prompts

**Dashboard Route:**
- Location: `app/pages/dashboard.vue`
- Triggers: Authenticated user, active league selected
- Responsibilities: Display league overview, standings, recent matches, round info

**Admin Pages:**
- Location: `app/pages/admin/`
- Triggers: Admin user accessing `/admin/*`
- Responsibilities: Manage game systems, factions, missions, unit types, users, matches, leagues

**API Auth Routes:**
- Location: `server/api/auth/login.get.ts`, `server/api/auth/callback.get.ts`, `server/api/auth/logout.get.ts`, `server/api/auth/user.get.ts`
- Triggers: User clicking login/logout or app checking session
- Responsibilities: Orchestrate Auth0 flow, manage cookies, validate sessions

**API League Routes:**
- Location: `server/api/leagues/`
- Triggers: League management actions (create, join, switch, update, delete)
- Responsibilities: Create/read/update/delete leagues, manage memberships, handle share tokens

**API Data Routes:**
- Location: `server/api/players/`, `server/api/matches/`, `server/api/armies/`, `server/api/pairings/`
- Triggers: League member data operations
- Responsibilities: CRUD operations on league-scoped resources with membership validation

## Error Handling

**Strategy:** Exception-based with try-catch at API layer, error state in Pinia stores

**Patterns:**

**API Errors:**
- Thrown as `createError({ statusCode, statusMessage })` in endpoint handlers
- Examples: `server/api/auth/login.get.ts` (lines 12-17)
- Format: `{ statusCode, statusMessage, data: { message } }`

**Store Error Handling:**
- Caught in action try-catch blocks
- Error state stored: `this.error = error.message`
- Example: `app/stores/leagues.js` (lines 286-288)
- Exposed via `error` getter for components

**Component Error Handling:**
- Components display toast notifications on error via `useToast()` composable
- Failed async operations tracked in store loading states
- User can retry operations manually

## Cross-Cutting Concerns

**Logging:**
- Browser console: `console.log()` and `console.error()` throughout stores and API
- Extensive debug logging in `app/stores/leagues.js` for complex flows
- No centralized logging service; all logs go to browser/server console

**Validation:**
- Client-side: Component form validation before API submission
- Server-side: Type checking and required field validation in API handlers
- Examples: `server/api/leagues/create.post.ts` (lines 37-42)
- Database constraints: Unique, notNull, references enforced by schema

**Authentication:**
- Auth0 OAuth2 for user authentication
- Session cookies (`auth_session`) for maintaining logged-in state
- Base64-encoded JSON in cookie containing Auth0 user ID
- Validated on every protected API call via `requireAuth()`

**Authorization:**
- Role-based: `user`, `organizer`, `admin` at user level
- League-based: `owner`, `organizer`, `player` at membership level
- Checked via `requireLeagueRole()` and `requireLeagueMembership()`

**State Persistence:**
- localStorage used for `currentLeagueId` to restore user's league selection
- League-scoped data fetched from API (no client-side persistence)
- Cleared on logout via `leaguesStore.resetStore()`

**Type Safety:**
- TypeScript in server files (`.ts` extensions)
- JavaScript in frontend (`.js` and `.vue` for stores/composables)
- No strict type checking on frontend; relies on runtime validation

---

*Architecture analysis: 2026-02-05*
