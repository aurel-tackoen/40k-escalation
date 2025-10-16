# Warhammer 40k Escalation League Manager - AI Agent Guide

> **Production-Ready Full-Stack Application** - Nuxt 4 + Vue 3 + PostgreSQL + Netlify  
> **NEW: Multi-Game System Support** - Now supports 4 Warhammer game systems! 🎮

## 🎯 Project Overview

A comprehensive full-stack web application for managing escalation league campaigns across multiple Warhammer game systems with database persistence, painting progress tracking, and advanced analytics.

### Supported Game Systems
- 🎲 **Warhammer 40,000** - 40 factions, 15 missions
- ⚔️ **Age of Sigmar** - 24 factions, 13 missions  
- 🏰 **The Old World** - 17 factions, 12 missions
- 🗡️ **Middle-Earth Strategy Battle Game** - 29 factions, 14 missions

### Technology Stack
- **Framework**: Nuxt v4.1.2 (Vue 3.5.22 Composition API)
- **Styling**: Tailwind CSS v4.1.13 with custom Warhammer 40k theme
- **Database**: PostgreSQL via Neon with Drizzle ORM v0.44.6
- **State Management**: Pinia 2.3.1
- **Icons**: Lucide Vue Next v0.545.0
- **Deployment**: Netlify with serverless functions
- **Code Quality**: ESLint 9.37.0 - ✅ Zero lint errors

### Project Status
✅ **PRODUCTION READY** - Complete feature set with zero technical debt
- 12 reusable composables (100% coverage)
- Full database integration with 40 API endpoints
- Multi-game system support with dynamic factions/missions
- **Share link system** for private league access (simplified from dual invite system)
- CSV export functionality across all data types
- Painting progress tracking with leaderboard
- Match analytics (win streaks, close games, decisive victories)
- Form validation framework
- Comprehensive test data seeding

---

## 📁 Project Structure

```
app/                          # Nuxt 4 application directory
├── app.vue                   # Root component with navigation
├── assets/css/               # Global styles
│   ├── base.css             # Tailwind base config
│   └── main.css             # Custom Warhammer theme
├── components/               # Auto-imported Vue components
│   ├── LoginButton.vue      # Auth0 login button
│   ├── PaintingProgress.vue # Painting leaderboard widget
│   ├── UserMenu.vue         # User profile menu
│   └── views/               # View components (6 total)
│       ├── ArmyListsView.vue    # Army builder with validation & export
│       ├── DashboardView.vue    # League overview & standings
│       ├── LeagueSetupView.vue  # League configuration
│       ├── MatchesView.vue      # Match recording with analytics
│       ├── PlayersView.vue      # Player management with export
│       └── ProfileView.vue      # User profile editor
├── composables/              # Reusable composition functions (11 total)
│   ├── useArmyFiltering.js  # Army-specific filtering (new)
│   ├── useArmyForm.js       # Army form management (new)
│   ├── useArmyManagement.js # Army validation & escalation (15 functions)
│   ├── useArrayFiltering.js # Advanced filtering & sorting (16 functions)
│   ├── useAuth.js           # Auth wrapper (composable-style API)
│   ├── useConfirmation.js   # Confirmation dialogs (3 functions)
│   ├── useDataExport.js     # CSV export utilities (7 functions)
│   ├── useFormatting.js     # Date/number formatting (9 functions)
│   ├── useFormManagement.js # Form state & validation (13 functions)
│   ├── useMatchResults.js   # Match analytics (10 functions)
│   ├── usePaintingStats.js  # Painting calculations (8 functions)
│   ├── usePlayerLookup.js   # Player data lookups (4 functions)
│   ├── usePlayerStats.js    # Player statistics (6 functions)
│   ├── useRoundLookup.js    # Round data access (5 functions)
│   └── useUser.js           # User profile management (new)
├── data/                     # Static reference data (NEW: Multi-game system)
│   ├── game-systems.js      # 4 game systems (40k, AoS, ToW, MESBG)
│   ├── factions-by-system.js # 110 factions across all systems
│   └── missions-by-system.js # 53 missions across all systems
├── layouts/
│   └── default.vue          # Default layout wrapper
├── pages/                    # File-based routing (6 pages)
│   ├── index.vue            # Home/welcome page
│   ├── dashboard.vue        # Main dashboard
│   ├── players.vue          # Player management
│   ├── armies.vue           # Army list builder
│   ├── matches.vue          # Match recording
│   ├── profile.vue          # User profile page (new)
│   └── setup.vue            # League setup
└── stores/
    ├── auth.js              # Auth store (user, login, logout)
    └── leagues.js           # Multi-league Pinia store (game systems support, 800+ lines)

db/                           # Database layer
├── index.ts                 # Neon database connection
└── schema.ts                # Drizzle schema (8 tables, 80+ fields) - NEW: +3 tables

server/api/                   # Nitro API routes (40 endpoints)
├── armies.*.ts              # Army management (3 endpoints: GET, POST, DELETE)
├── auth/*.ts                # Auth0 authentication (4 endpoints: login, logout, callback, user)
├── debug*.ts                # Debug utilities (3 endpoints: main, token check, memberships)
├── factions.get.ts          # GET /api/factions (game system filtering)
├── game-systems.get.ts      # GET /api/game-systems
├── health.get.ts            # GET /api/health (system check)
├── leagues/*.ts             # League management (14 endpoints: CRUD, join, members, sharing)
├── matches.*.ts             # Match recording (2 endpoints: GET, POST)
├── missions.get.ts          # GET /api/missions (game system filtering)
├── players.*.ts             # Player management (4 endpoints: GET, POST, PUT, DELETE)
├── seed*.post.ts            # Data seeding (2 endpoints: game systems, test data)
└── users/me.*.ts            # User profile (2 endpoints: GET, PUT)

migrations/                   # Drizzle ORM migrations (5 migrations)
├── 0000_aspiring_molly_hayes.sql
├── 0001_military_giant_girl.sql
├── 0002_open_thundra.sql
├── 0003_lumpy_mockingbird.sql
└── meta/                    # Migration metadata & snapshots

guide/                        # Comprehensive documentation (20 files)
├── QUICKSTART.md            # Database setup & API usage
├── STRUCTURE.md             # Detailed project structure
├── COMPOSABLE_QUICK_REFERENCE.md
├── COMPOSABLES_INTEGRATION_COMPLETE.md
├── PAINTING_IMPLEMENTATION_COMPLETE.md
└── [15 additional guide files]

Configuration Files
├── nuxt.config.ts           # Nuxt 4 config (SSR false, Netlify preset)
├── netlify.toml             # Netlify deployment config
├── drizzle.config.ts        # Database ORM configuration
├── eslint.config.ts         # ESLint 9 flat config
├── tailwind.config.js       # Tailwind CSS v4
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript config
```

---

## 🎨 Vue Component Coding Standards

### File Structure Order (MANDATORY)
All `.vue` files must follow this exact order:
1. `<script setup>` - Composition API with TypeScript support
2. `<template>` - HTML structure
3. `<style>` - Global styles (if needed)
4. `<style scoped>` - Component-specific styles (if needed)

### Composition API Standards
- ✅ Always use `<script setup>` syntax (no Options API)
- ✅ Import composables from `~/composables/` directory
- ✅ Use `defineProps()` and `defineEmits()` for component interface
- ✅ Leverage `toRef()` for composable reactivity with props
- ✅ Prefer `computed()` over methods for derived state
- ✅ Use `ref()` for primitive values, `reactive()` for objects

### Component Examples

**Simple Component:**
```vue
<script setup>
import { computed, toRef } from 'vue'
import { usePlayerLookup } from '~/composables/usePlayerLookup'

const props = defineProps({
  players: { type: Array, required: true }
})

const emit = defineEmits(['update'])

// Use composables
const { getPlayerName } = usePlayerLookup(toRef(props, 'players'))

// Computed properties for derived state
const activePlayerCount = computed(() => 
  props.players.filter(p => p.wins + p.losses > 0).length
)
</script>

<template>
  <div class="card">
    <h2>{{ activePlayerCount }} Active Players</h2>
  </div>
</template>

<style scoped>
.card {
  @apply bg-gray-800 border border-gray-600 rounded-lg p-6;
}
</style>
```

---

## 🧩 Composables Architecture (12 Total)

All composables are **production-ready** and **fully integrated**. Each composable is pure JavaScript (no `.ts`) and follows functional programming principles.

### Usage Pattern
```javascript
// In component <script setup>
import { useComposableName } from '~/composables/useComposableName'

const props = defineProps({ data: Array })

// Initialize composable with reactive props
const { function1, function2 } = useComposableName(toRef(props, 'data'))
```

### Complete Composable Inventory

#### 1. **useArmyManagement.js** (15 functions)
Army validation, escalation, and point calculations
- `calculateArmyTotal(units)` - Sum unit points
- `isValidArmy(army, pointLimit)` - Validate against limit
- `canEscalateArmy(army)` - Check if can copy to next round
- `hasPreviousRoundArmy(playerId, round)` - Check for prior army
- `getPreviousRoundArmy(playerId, round)` - Fetch prior army
- `getArmyStatus(army, pointLimit)` - Get validation status
- `getArmyStatusText(status)` - Human-readable status
- `getArmyStatusClass(status)` - Tailwind color class
- `getArmyIcon(status)` - Icon component for status
- `calculateRemainingPoints(army, pointLimit)` - Points available
- `getPlayerArmies(playerId)` - All armies for player
- `getArmiesForRound(round)` - All armies in round
- `hasArmyForRound(playerId, round)` - Check army exists
- `sortArmiesByRound()` - Sort ascending by round
- `sortArmiesByPlayer(players)` - Sort by player name

#### 2. **useArrayFiltering.js** (16 functions)
Advanced filtering, sorting, and array operations
- `filterByField(array, field, value)` - Filter by single field
- `filterByMultipleCriteria(array, criteria)` - Multi-field filter
- `sortByField(array, field, order)` - Sort by field (asc/desc)
- `sortByMultipleFields(array, fields)` - Multi-field sort
- `groupBy(array, field)` - Group objects by field
- `uniqueValues(array, field)` - Get unique field values
- `countByField(array, field)` - Count occurrences
- `findByField(array, field, value)` - Find first match
- `findAllByField(array, field, value)` - Find all matches
- `sumByField(array, field)` - Sum numeric field
- `averageByField(array, field)` - Calculate average
- `maxByField(array, field)` - Find maximum value
- `minByField(array, field)` - Find minimum value
- `paginate(array, page, pageSize)` - Pagination helper
- `search(array, fields, query)` - Multi-field text search
- `batchProcess(array, batchSize, processor)` - Process in batches

#### 3. **useConfirmation.js** (3 functions)
User confirmation dialogs
- `showConfirmation(message, onConfirm)` - Show dialog
- `confirmDelete(itemName, onConfirm)` - Delete confirmation
- `confirmAction(actionName, details, onConfirm)` - Generic action

#### 4. **useDataExport.js** (7 functions)
CSV export with custom formatting
- `formatForExport(data, columns)` - Format data for export
- `downloadCSV(data, filename)` - Trigger browser download
- `exportToCSV(data, columns, filename)` - Complete export flow
- `sanitizeCSVValue(value)` - Escape special chars
- `formatDateForExport(date)` - ISO date format
- `formatNumberForExport(number, decimals)` - Consistent number format
- `generateFilename(prefix, extension)` - Timestamp filename

#### 5. **useFormatting.js** (9 functions)
Date and number formatting
- `formatDate(date, options)` - Flexible date formatting
- `formatRelativeDate(date)` - "2 days ago" format
- `formatNumber(number, decimals)` - Number with decimals
- `formatPercentage(value, total, decimals)` - Calculate %
- `formatPoints(points)` - Game points with formatting
- `pluralize(count, singular, plural)` - Smart pluralization
- `truncateText(text, length)` - Text truncation with ellipsis
- `formatWinLossRecord(wins, losses, draws)` - "5-2-1" format
- `formatRoundName(roundNumber)` - "Round 1" or custom

#### 6. **useFormManagement.js** (13 functions)
Form state management and validation
- `createFormState(initialData)` - Initialize form
- `updateField(field, value)` - Update single field
- `updateFields(updates)` - Batch update
- `resetForm(data)` - Reset to initial or new data
- `isFieldValid(field, rules)` - Single field validation
- `isFormValid(requiredFields)` - All fields validation
- `getFieldError(field, rules)` - Get validation error
- `markFieldTouched(field)` - Track user interaction
- `isFieldTouched(field)` - Check if touched
- `clearErrors()` - Clear all errors
- `setErrors(errors)` - Set multiple errors
- `hasChanges()` - Detect form modifications
- `getChangedFields()` - List of changed fields

#### 7. **useGameSystems.js** (7 functions) ⭐ NEW
Game system utilities and badge styling
- `getGameSystemName(gameSystemId)` - Get name by ID (returns null if not found)
- `getGameSystemNameWithFallback(gameSystemId)` - Get name with 'Unknown' fallback
- `getGameSystemById(gameSystemId)` - Get full game system object
- `hasGameSystems()` - Check if game systems loaded
- `getGameSystemBadgeClasses()` - CSS classes for game system badge
- `getGameSystemTextClasses()` - CSS classes for game system text
- `getGameSystemHintClasses()` - CSS classes for inline hints

#### 8. **useMatchResults.js** (10 functions)
Match outcome analysis and statistics
- `determineWinner(p1Points, p2Points)` - Calculate winner
- `isCloseGame(p1Points, p2Points, threshold)` - Detect nail-biters
- `isDecisiveVictory(p1Points, p2Points, threshold)` - Blowouts
- `getMatchQuality(p1Points, p2Points)` - Quality rating
- `getMatchQualityClass(quality)` - CSS class for quality
- `getMatchQualityText(quality)` - Human-readable quality
- `calculatePointDifferential(p1Points, p2Points)` - Point spread
- `getPlayerWinStreak(playerId, matches)` - Current streak
- `getPlayerRecentForm(playerId, matches, count)` - W/L/D history
- `getHeadToHeadRecord(p1Id, p2Id, matches)` - H2H stats

#### 9. **usePaintingStats.js** (8 functions)
Painting progress calculations and visualization
- `getUnitPaintPercentage(unit)` - Unit % painted
- `getArmyPaintingStats(army)` - Army totals & %
- `getPlayerPaintingStats(playerId, round, armies)` - Player stats
- `getPaintProgressClass(percentage)` - Progress bar color
- `getPaintStatusText(percentage)` - "Battle Ready", etc.
- `isPaintingComplete(army)` - Check if 100%
- `calculatePaintingLeaderboard(players, armies, round)` - Rankings
- `getAverageArmyCompletion(armies)` - League-wide average

#### 10. **usePlayerLookup.js** (4 functions)
Player data access helpers
- `getPlayerName(playerId)` - Get player name
- `getPlayerFaction(playerId)` - Get player faction
- `getPlayerById(playerId)` - Get full player object
- `getPlayersByFaction(faction)` - Filter by faction

#### 11. **usePlayerStats.js** (6 functions)
Player statistics and rankings
- `calculateWinPercentage(player)` - Win % with safety
- `getTotalGames(player)` - Total games played
- `getPlayerRank(playerId, players)` - Current ranking
- `sortPlayersByStandings(players)` - Sort by performance
- `getPlayerStats(playerId, matches)` - Detailed statistics
- `comparePlayerStats(p1Id, p2Id, players, matches)` - Compare two

#### 12. **useRoundLookup.js** (5 functions)
Round data access and validation
- `getRoundByNumber(roundNumber)` - Get round object
- `getRoundName(roundNumber)` - Get round name
- `getRoundPointLimit(roundNumber)` - Get point limit
- `isValidRound(roundNumber)` - Check if round exists
- `getCurrentRound()` - Get active round

---

## 🗄️ Database Schema (PostgreSQL + Drizzle ORM)

### Tables Overview

#### 1. **game_systems** (NEW - Game Systems)
```typescript
{
  id: serial (PK, auto-increment)
  name: varchar(100) - Game system name (unique) - "Warhammer 40,000"
  shortName: varchar(50) - Short code - "40k", "aos", "tow", "mesbg"
  isActive: boolean - Active status (default: true)
  createdAt: timestamp - Creation timestamp
}
```

#### 2. **factions** (NEW - Dynamic Factions)
```typescript
{
  id: serial (PK, auto-increment)
  gameSystemId: integer (FK -> game_systems.id, cascade delete)
  name: varchar(100) - Faction name
  category: varchar(50) - Category (e.g., "Imperium", "Chaos", "Order")
  isActive: boolean - Active status (default: true)
  createdAt: timestamp - Creation timestamp
}
```

#### 3. **missions** (NEW - Dynamic Missions)
```typescript
{
  id: serial (PK, auto-increment)
  gameSystemId: integer (FK -> game_systems.id, cascade delete)
  name: varchar(255) - Mission name
  category: varchar(100) - Category (e.g., "Matched Play", "Battleplan")
  isActive: boolean - Active status (default: true)
  createdAt: timestamp - Creation timestamp
}
```

#### 4. **users** (User Authentication)
```typescript
{
  id: integer (PK, auto-increment)
  auth0Id: varchar(255) - Auth0 user ID (unique)
  email: varchar(255) - Email (unique)
  name: varchar(255) - User display name
  picture: text - Avatar URL from Auth0
  role: varchar(50) - User role (player, organizer, admin)
  createdAt: timestamp - Account creation
  lastLoginAt: timestamp - Last login timestamp
}
```

#### 5. **leagues** (League Configuration)
```typescript
{
  id: integer (PK, auto-increment)
  name: varchar(255) - League name
  description: text - League description
  gameSystemId: integer (FK -> game_systems.id) - REQUIRED game system
  startDate: date - Start date
  endDate: date - End date (optional)
  currentRound: integer - Active round (default: 1)
  createdAt: timestamp - Creation timestamp
}
```

#### 6. **rounds** (Round Configuration)
```typescript
{
  id: integer (PK, auto-increment)
  leagueId: integer (FK -> leagues.id)
  number: integer - Round number (1, 2, 3...)
  name: varchar(255) - Round name ("500 Points", etc.)
  pointLimit: integer - Max points for round
  startDate: date - Round start
  endDate: date - Round end
}
```

#### 4. **players** (Player Registration)
```typescript
{
  id: integer (PK, auto-increment)
  name: varchar(255) - Player name
  email: varchar(255) - Email (unique)
  faction: varchar(100) - Warhammer faction
  wins: integer - Total wins (default: 0)
  losses: integer - Total losses (default: 0)
  draws: integer - Total draws (default: 0)
  totalPoints: integer - Battle points earned (default: 0)
  createdAt: timestamp - Registration date
}
```

#### 5. **matches** (Battle Results)
```typescript
{
  id: integer (PK, auto-increment)
  leagueId: integer (FK -> leagues.id, optional)
  round: integer - Round number
  player1Id: integer (FK -> players.id)
  player2Id: integer (FK -> players.id)
  player1Points: integer - Player 1 battle points
  player2Points: integer - Player 2 battle points
  winnerId: integer (FK -> players.id, optional for draws)
  mission: varchar(255) - Mission name
  datePlayed: date - Date of battle
  notes: text - Additional notes
  createdAt: timestamp - Record creation
}
```

#### 6. **armies** (Army Lists)
```typescript
{
  id: integer (PK, auto-increment)
  playerId: integer (FK -> players.id)
  round: integer - Round number
  name: varchar(255) - Army name
  totalPoints: integer - Total army points
  units: text - JSON string of units array
  isValid: boolean - Validation status (default: true)
  lastModified: date - Last modification date
  createdAt: timestamp - Creation timestamp
}
```

**Units JSON Structure:**
```javascript
[
  {
    name: "Tactical Squad",
    role: "Troops",
    points: 100,
    totalModels: 10,        // For painting tracking
    paintedModels: 7        // For painting tracking
  },
  // ... more units
]
```

### Database Scripts
```bash
npm run db:generate    # Generate migrations from schema changes
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio GUI
```

---

## 🌐 API Endpoints (17 Total)

All endpoints follow RESTful conventions and return JSON with this structure:
```typescript
{
  success: boolean
  data: any           // Actual data
  message?: string    // Optional message
  count?: number      // For list endpoints
}
```

### Game Systems API (NEW)
- `GET /api/game-systems` - List all active game systems
- `GET /api/factions?gameSystemId=X` - List factions (filtered by game system)
- `GET /api/missions?gameSystemId=X` - List missions (filtered by game system)
- `POST /api/seed-game-systems` - Populate game systems, factions, missions (idempotent)

### Players API
- `GET /api/players` - List all players
- `POST /api/players` - Create player (body: { name, email, faction })
- `DELETE /api/players/:id` - Delete player

### Armies API
- `GET /api/armies` - List all armies (units auto-parsed from JSON)
- `POST /api/armies` - Create army (body: { playerId, round, name, totalPoints, units[] })
- `DELETE /api/armies/:id` - Delete army

### Matches API
- `GET /api/matches` - List all matches
- `POST /api/matches` - Record match (auto-updates player stats)
  ```json
  {
    "leagueId": 1,
    "round": 1,
    "player1Id": 1,
    "player2Id": 2,
    "player1Points": 85,
    "player2Points": 60,
    "winnerId": 1,
    "mission": "Purge the Enemy",
    "datePlayed": "2025-10-13",
    "notes": "Close game!"
  }
  ```

### Leagues API
- `GET /api/leagues` - List all leagues (includes rounds)
- `POST /api/leagues` - Create league with rounds (requires gameSystemId)
- `PUT /api/leagues/:id` - Update league (including currentRound, gameSystemId)

### Utility API
- `GET /api/health` - System health check
- `GET /api/debug` - Database introspection (table counts)
- `POST /api/seed` - Populate test data (idempotent)

---

## 🎨 Component Details

### 1. **DashboardView.vue** (Dashboard Overview)
**Purpose**: Main overview with standings, stats, and painting leaderboard

**Composables Used**: 
- `usePlayerLookup` - Get player names
- `useFormatting` - Format dates
- `usePlayerStats` - Sort standings
- `useLeaguesStore` - Game system badge (NEW)

**Key Features**:
- Game system badge in header (NEW)
- League info cards (current round, player count, armies, matches)
- Current standings table with W-L-D records
- Recent matches list
- Painting leaderboard widget (PaintingProgress component)
- Responsive grid layout

**Props**:
```javascript
{
  league: Object,          // Current league
  players: Array,          // All players
  matches: Array,          // All matches
  armies: Array,           // All armies
  paintingLeaderboard: Array // Painting stats
}
```

### 2. **PlayersView.vue** (Player Management)
**Purpose**: Add, view, and manage players with export

**Composables Used**:
- `usePaintingStats` - Calculate painting progress
- `usePlayerStats` - Calculate win %
- `useConfirmation` - Delete confirmations
- `useFormManagement` - Form state & validation
- `useDataExport` - CSV export
- `useLeaguesStore` - Dynamic factions by game system (NEW)

**Key Features**:
- Add player form with validation (name, faction)
- **Dynamic faction dropdown** - Shows factions for current game system (NEW)
- Game system indicator in faction selector (NEW)
- Player cards with faction, record, and painting progress
- Export to CSV (includes win %, all stats)
- Delete with confirmation
- Trophy icon header
- Form auto-reset after submission

**Events Emitted**:
```javascript
emit('add-player', { name, faction })
emit('delete-player', playerId)
```

### 3. **ArmyListsView.vue** (Army Builder)
**Purpose**: Create, view, and manage army lists with validation

**Composables Used**:
- `usePaintingStats` - Painting calculations
- `usePlayerLookup` - Get player names
- `useFormatting` - Format dates
- `useRoundLookup` - Get round info
- `useConfirmation` - Delete confirmations
- `useArmyManagement` - Army validation & escalation
- `useArrayFiltering` - Filter & sort armies
- `useDataExport` - CSV export

**Key Features**:
- Army list builder with unit editor
- **Users can only create armies for themselves** (security enforced)
- **Organizers can create armies for any player** (role-based permissions)
- Point validation against round limit
- Army escalation (copy from previous round)
- Advanced filtering (by player, round, status)
- Status indicators (Valid/Invalid/Over Limit)
- Painting progress tracking per unit
- Export to CSV
- Multi-step form for creating armies

**Props**:
```javascript
{
  players: Array,
  armies: Array,
  rounds: Array
}
```

**Events Emitted**:
```javascript
emit('add-army', armyData)
emit('delete-army', armyId)
```

### 4. **MatchesView.vue** (Match Recording)
**Purpose**: Record battle results with advanced analytics

**Composables Used**:
- `usePlayerLookup` - Get player names/factions
- `useFormatting` - Format dates
- `useMatchResults` - Match quality & streaks
- `useDataExport` - CSV export
- `useLeaguesStore` - Dynamic missions by game system (NEW)

**Key Features**:
- Match recording form (2 players, points, mission, date)
- **Dynamic mission dropdown** - Shows missions for current game system (NEW)
- Winner auto-calculation
- Match quality indicators (Close Game, Decisive Victory)
- Win streak badges
- Recent form display (last 5 games)
- Match history table with quality badges
- Export to CSV
- Auto-update player stats on save

**Match Quality Badges**:
- 🔥 **Decisive Victory** - Point diff > 30
- ⚔️ **Close Game** - Point diff ≤ 10
- 🏆 **Standard Win** - Everything else

### 5. **LeagueSetupView.vue** (League Configuration)
**Purpose**: Configure league settings and rounds

**Key Features**:
- League name, description, dates
- Multiple rounds configuration
- Point limits per round
- Current round selector
- Add/remove rounds dynamically

**Events Emitted**:
```javascript
emit('save-league', leagueData)
```

### 6. **PaintingProgress.vue** (Painting Leaderboard Widget)
**Purpose**: Display painting completion rankings

**Props**:
```javascript
{
  leaderboard: Array,  // Pre-calculated by Pinia store
  currentRound: Number
}
```

**Key Features**:
- Ranked list with medals (1st gold, 2nd silver, 3rd bronze)
- Progress bars with color coding:
  - 🟣 Purple: 100% complete
  - 🟢 Green: 71-99%
  - 🟡 Yellow: 31-70%
  - 🔴 Red: 0-30%
- Model counts (painted/total)
- "Fully Painted!" celebration for 100%

---

## 🎯 Common Development Tasks

### Adding a New Feature

**1. Database Schema Change**
```bash
# Edit db/schema.ts with new table/field
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

**2. Create API Endpoint**
```typescript
// server/api/my-endpoint.get.ts
import { db } from '~/db'
import { myTable } from '~/db/schema'

export default defineEventHandler(async (event) => {
  try {
    const data = await db.select().from(myTable)
    return { success: true, data }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch data'
    })
  }
})
```

**3. Add Composable (if needed)**
```javascript
// app/composables/useMyFeature.js
export function useMyFeature(data) {
  const processData = (item) => {
    // Business logic here
    return transformedItem
  }
  
  return {
    processData
  }
}
```

**4. Create/Update Component**
```vue
<script setup>
import { useMyFeature } from '~/composables/useMyFeature'

const props = defineProps({ data: Array })
const { processData } = useMyFeature(toRef(props, 'data'))
</script>

<template>
  <div class="card">
    <!-- UI here -->
  </div>
</template>
```

### Debugging Checklist
```bash
# Check lint errors
npm run lint

# Fix auto-fixable errors
npm run lint:fix

# Check database connection
# Visit: http://localhost:8888/api/health

# Check all API endpoints
# Visit: http://localhost:8888/api/debug

# View database in GUI
npm run db:studio
```

---

## 🚀 Deployment

### Netlify Deployment Configuration

**Build Settings** (in `netlify.toml`):
- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: 20.19.0
- Functions Directory: `.netlify/functions-internal`

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `NETLIFY_DATABASE_URL` - Same as DATABASE_URL (for Drizzle)
- `JWT_SECRET` - (Optional) For future auth

**Deploy Commands**:
```bash
# Via Netlify CLI
netlify login
netlify deploy --prod

# Via Git Push
git push origin main  # Auto-deploys on Netlify
```

### Pre-Deployment Checklist
- ✅ Run `npm run lint` - No errors
- ✅ Test all composables in components
- ✅ Verify database migrations applied
- ✅ Test all API endpoints
- ✅ Check environment variables set
- ✅ Test CSV exports work
- ✅ Verify painting calculations accurate

---

## 📊 Multi-Game System Architecture

### Game Systems Overview
The application now supports **4 Warhammer game systems** with dynamic faction and mission loading:

| Game System | Short Code | Factions | Missions |
|-------------|------------|----------|----------|
| Warhammer 40,000 | 40k | 40 | 15 |
| Age of Sigmar | aos | 24 | 13 |
| The Old World | tow | 17 | 12 |
| Middle-Earth SBG | mesbg | 29 | 14 |
| **TOTAL** | | **110** | **53** |

### Data Flow
1. **Database Tables**: `game_systems`, `factions`, `missions` (seeded via `/api/seed-game-systems`)
2. **API Endpoints**: `/api/game-systems`, `/api/factions?gameSystemId=X`, `/api/missions?gameSystemId=X`
3. **Pinia Store**: `leagues.js` - Fetches and caches game system data
4. **Components**: Use `storeToRefs(leaguesStore)` to access `availableFactions` and `availableMissions`

### League-Game System Relationship
- Each **league** is linked to a **game system** via `gameSystemId` (foreign key)
- When a league is selected, the store fetches factions/missions for that game system
- Components dynamically populate dropdowns based on current league's game system

### Adding a New Game System
1. Add to `app/data/game-systems.js`:
   ```javascript
   { name: 'New Game', shortName: 'ng' }
   ```
2. Add factions to `app/data/factions-by-system.js`:
   ```javascript
   { gameSystemShortName: 'ng', name: 'Faction Name', category: 'Category' }
   ```
3. Add missions to `app/data/missions-by-system.js`:
   ```javascript
   { gameSystemShortName: 'ng', name: 'Mission Name', category: 'Matched Play' }
   ```
4. Run seed endpoint: `POST /api/seed-game-systems`

### Migration Guide (Single → Multi System)
**If you have existing data before this refactor:**
1. All existing leagues will default to `gameSystemId = 1` (Warhammer 40k)
2. Run `POST /api/seed-game-systems` to populate new tables
3. Update leagues with correct game system: `PATCH /api/leagues/:id` with `{ gameSystemId: X }`
4. Players/armies/matches remain unchanged (backward compatible)

---

## 📊 Data Reference (Legacy - Now Dynamic)

### Static Data Removed
⚠️ **Factions and Missions are now database-driven**. The static arrays in `app/data/` are now seed sources only.

For current data:
- **Factions**: Fetch via `GET /api/factions?gameSystemId=X` (110 total across 4 systems)
- **Missions**: Fetch via `GET /api/missions?gameSystemId=X` (53 total across 4 systems)
- **Game Systems**: Fetch via `GET /api/game-systems` (4 total)

---

## 📚 Documentation Files

### Essential Reading
1. **QUICKSTART.md** - Database setup, API usage examples
2. **STRUCTURE.md** - Detailed project structure
3. **COMPOSABLE_QUICK_REFERENCE.md** - All 11 composables quick ref
4. **COMPOSABLES_INTEGRATION_COMPLETE.md** - Integration examples
5. **FEATURE_AUTO_ARMY_PLAYER.md** - Army creation security (self-only)

### Full Documentation Index
- COMPOSABLES.md - Original composable proposals
- COMPOSABLES_COMPLETE.md - Implementation completion report
- COMPOSABLES_IMPLEMENTED.md - Implementation details
- COMPOSABLES_LOW_PRIORITY.md - Low priority composables
- COMPOSABLES_MEDIUM_PRIORITY.md - Medium priority composables
- COMPOSABLE_SUGGESTIONS.md - Future composable ideas
- ICONS_ADDED.md - Lucide icons usage guide
- INTEGRATION_GUIDE.md - Component integration patterns
- LOW_PRIORITY_COMPLETE.md - Low priority completion report
- PAINTING_COMPOSABLE_REFACTOR.md - Painting refactor details
- PAINTING_FEATURE.md - Painting feature design
- PAINTING_IMPLEMENTATION_COMPLETE.md - Painting completion
- PAINTING_INTEGRATED.md - Painting integration guide
- PAINTING_QUICK_REFERENCE.md - Painting composable quick ref
- PAINTING_REFACTORED.md - Painting refactor completion
- WORKING.md - Active development notes

---

## ⚡ Quick Command Reference

```bash
# Development
npm run dev                  # Start Nuxt dev server (port 3000) ⭐ RECOMMENDED

# Database
npm run db:generate          # Generate migration from schema
npm run db:migrate           # Apply migrations
npm run db:studio            # Open Drizzle Studio

# Code Quality
npm run lint                 # Check for lint errors
npm run lint:fix             # Auto-fix lint errors

# Build & Deploy
npm run build                # Production build
npm run preview              # Preview production build
npm run generate             # Static site generation

# Netlify
netlify dev                  # Start dev server with functions
netlify deploy --prod        # Deploy to production
```

---

## 🎯 AI Agent Instructions

### When Making Changes:
1. ✅ **Always preserve file structure order** in `.vue` files (script → template → style)
2. ✅ **Use Composition API** with `<script setup>` - no Options API
3. ✅ **Import composables** when adding new functionality
4. ✅ **Use `toRef()` when passing props** to composables
5. ✅ **Run lint after changes**: `npm run lint:fix`
6. ✅ **Test API endpoints** after database changes
7. ✅ **Update this AGENTS.md** if structure changes
8. ✅ **Check zero lint errors** before committing

### Code Quality Rules:
- No code duplication - use composables
- Proper error handling in all API routes
- Validation on all user inputs
- Responsive design for all components
- Accessibility (ARIA labels, semantic HTML)
- Consistent Tailwind classes (use theme colors)

### Git Workflow:
```bash
git add .
git commit -m "feat: descriptive commit message"
git push origin main
```

---

## 🏆 Project Achievements

- ✅ **Zero Technical Debt** - Clean architecture, no known issues
- ✅ **Zero Lint Errors** - ESLint 9 strict compliance
- ✅ **100% Composable Coverage** - 12/12 composables implemented
- ✅ **Full Database Integration** - PostgreSQL + Drizzle ORM
- ✅ **Complete API Layer** - 17 RESTful endpoints
- ✅ **Multi-Game System Support** - 4 Warhammer game systems (110 factions, 53 missions)
- ✅ **CSV Export Everywhere** - Players, armies, matches
- ✅ **Advanced Analytics** - Match quality, win streaks, painting leaderboard
- ✅ **Production Deployment** - Netlify-ready configuration
- ✅ **Comprehensive Documentation** - 20+ guide files

**Last Updated**: January 2025  
**Status**: Production Ready ⚡