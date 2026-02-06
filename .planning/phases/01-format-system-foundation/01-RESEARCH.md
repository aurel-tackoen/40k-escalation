# Phase 1: Format System Foundation - Research

**Researched:** 2026-02-06
**Domain:** Format registry pattern, database schema extension, Vue 3 form enhancement, Drizzle ORM migrations
**Confidence:** HIGH

## Summary

This phase adds a format system to an existing Nuxt 4 + Drizzle ORM + Neon PostgreSQL application. The codebase already has a game system concept (`gameSystems` table with `matchType` and `matchConfig`), but no concept of "format" (e.g., Matched Play vs Path to Glory vs Crusade). The format system needs to be layered on top of the existing game system architecture.

The primary challenge is that the existing architecture treats each game system as having one match type. The new format system introduces a second dimension: each game system has multiple formats, each with its own scoring rules, match fields, and progression features. This is fundamentally a **registry pattern** problem -- a static configuration registry that maps `(gameSystem, format)` pairs to behavior configs.

**Primary recommendation:** Add a `format` varchar column to the `leagues` table (not a separate formats table), create a TypeScript format registry as a shared data file under `app/data/`, and extend the league creation form with a reactive format selection step that appears after game system selection.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Format selection flow**: Two-step: organizer picks game system first, then format options appear based on that system. Format step always shown, even for game systems with only one format (HH). Each format shows a name + short description of what it enables. Format selection is required -- cannot create a league without choosing one.
- **Existing league migration**: Manual migration script for 2 specific leagues: 40k league -> `40k-matched` (data stays as-is, already VP-based), Old World league -> `ow-ptg` (derive CP from existing `marginOfVictory`: Massacre->3, Major Victory->2, Minor Victory->2, Draw->1). Painting bonus (+1 CP) applied retroactively to past OW matches -- derive from existing painting data in the app. Player stats (wins/losses/draws/totalPoints) fully recalculated to match the new CP-based system -- clean slate. Not a user-facing feature -- one-time migration script run during Phase 1.
- **Format display in-app**: Subtle badge/tag near the league name, not the main focus. Badge visible both inside the league page AND in the league list/browse view. Badge shows full format name: "Path to Glory", "Matched Play", "Crusade" (not abbreviations). All leagues use the same card style -- no visual distinction between campaign and classic formats beyond the badge text.
- **Format immutability**: Format shown as read-only in league settings with a lock indicator. Format CAN be changed if no matches have been recorded yet. Once a match is recorded, format locks permanently with explanation message ("Format locked -- matches have been recorded"). No admin override needed.

### Claude's Discretion
- Format registry architecture (how configs are structured internally)
- Database schema for format storage (column type, enum vs varchar)
- API endpoint design for format lookup
- Exact badge styling and positioning

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

This phase uses only existing project dependencies. No new libraries needed.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.44.6 | Database ORM, schema definition, migrations | Already used throughout project |
| drizzle-kit | ^0.31.5 | Migration generation | Already used for all schema changes |
| nuxt | ^4.1.2 | Full-stack framework | Project foundation |
| vue | ^3.5.22 | UI framework | Project foundation |
| pinia | ^2.3.1 | State management | Used by leagues store |
| lucide-vue-next | ^0.545.0 | Icons (Lock icon for immutability) | Already used throughout project |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @neondatabase/serverless | ^1.0.2 | Direct DB access for migration script | Used in migration script only |
| tsx | ^4.20.6 | Run TypeScript migration scripts | Already a devDependency |

### New Libraries Needed
None. The format registry is pure TypeScript data -- no external libraries required.

## Architecture Patterns

### Recommended Format Registry Structure

The format registry should be a shared TypeScript file in `app/data/` following the existing pattern of `game-systems.js`, `factions-by-system.js`, etc.

```
app/
  data/
    game-systems.js          # Existing - game system definitions
    format-registry.ts        # NEW - format definitions per game system
    factions-by-system.js    # Existing
    ...
```

### Pattern 1: Static Format Registry (Recommended)

**What:** A TypeScript object mapping format keys to configuration objects, organized by game system.
**When to use:** When format configurations are developer-defined, not user-configurable.
**Why:** Formats are fixed by game rules (Path to Glory, Matched Play, Crusade). They don't need to be stored in the database as a separate table -- they're static configuration. The league just needs to record which format was selected.

```typescript
// app/data/format-registry.ts

export interface FormatConfig {
  key: string            // e.g., 'ow-ptg', '40k-matched'
  name: string           // e.g., 'Path to Glory'
  description: string    // Short description for selection UI
  gameSystem: string     // shortName of game system: 'tow', '40k', 'aos', 'hh'
  category: 'campaign' | 'matched'  // For future routing (progression vs simple)
  scoring: {
    type: string         // 'cp' | 'vp' | 'tp' | 'glory' | 'wld' | 'points'
    label: string        // What points are called: 'Campaign Points', 'Victory Points', etc.
    defaultRanking: string  // Primary sort: 'total_cp', 'total_vp', 'wld_record', etc.
  }
  features: {
    progression: boolean    // Shows progression UI (unit rosters, XP, etc.)
    paintingBonus: boolean  // Painting progress contributes to scoring
    matchForm: string       // Which match form variant to use
    standingsType: string   // Which standings calculator to use
  }
}

export const FORMAT_REGISTRY: Record<string, FormatConfig> = {
  'ow-ptg': {
    key: 'ow-ptg',
    name: 'Path to Glory',
    description: 'Campaign Points scoring, unit progression, painting bonuses',
    gameSystem: 'tow',
    category: 'campaign',
    scoring: {
      type: 'cp',
      label: 'Campaign Points',
      defaultRanking: 'total_cp',
    },
    features: {
      progression: true,
      paintingBonus: true,
      matchForm: 'ow-ptg',
      standingsType: 'ow-ptg',
    },
  },
  'ow-matched': {
    key: 'ow-matched',
    name: 'Matched Play',
    description: 'Tournament Points from Victory Point differential',
    gameSystem: 'tow',
    category: 'matched',
    scoring: {
      type: 'tp',
      label: 'Tournament Points',
      defaultRanking: 'total_tp',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'ow-matched',
      standingsType: 'ow-matched',
    },
  },
  '40k-crusade': {
    key: '40k-crusade',
    name: 'Crusade',
    description: 'Narrative campaign with unit XP, battle honours, and requisition',
    gameSystem: '40k',
    category: 'campaign',
    scoring: {
      type: 'wld',
      label: 'Win/Loss/Draw',
      defaultRanking: 'wld_record',
    },
    features: {
      progression: true,
      paintingBonus: false,
      matchForm: '40k-crusade',
      standingsType: '40k-crusade',
    },
  },
  '40k-matched': {
    key: '40k-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring with primary and secondary objectives',
    gameSystem: '40k',
    category: 'matched',
    scoring: {
      type: 'vp',
      label: 'Victory Points',
      defaultRanking: 'total_vp',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: '40k-matched',
      standingsType: '40k-matched',
    },
  },
  'aos-ptg': {
    key: 'aos-ptg',
    name: 'Path to Glory',
    description: 'Glory Points, unit renown, hero paths, and quests',
    gameSystem: 'aos',
    category: 'campaign',
    scoring: {
      type: 'glory',
      label: 'Glory Points',
      defaultRanking: 'total_glory',
    },
    features: {
      progression: true,
      paintingBonus: false,
      matchForm: 'aos-ptg',
      standingsType: 'aos-ptg',
    },
  },
  'aos-matched': {
    key: 'aos-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring with battle tactics',
    gameSystem: 'aos',
    category: 'matched',
    scoring: {
      type: 'points',
      label: 'Match Points',
      defaultRanking: 'total_points',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'aos-matched',
      standingsType: 'aos-matched',
    },
  },
  'hh-matched': {
    key: 'hh-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring for the Age of Darkness',
    gameSystem: 'hh',
    category: 'matched',
    scoring: {
      type: 'points',
      label: 'Match Points',
      defaultRanking: 'total_points',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'hh-matched',
      standingsType: 'hh-matched',
    },
  },
}

// Helper: get formats for a game system by shortName
export function getFormatsForGameSystem(shortName: string): FormatConfig[] {
  return Object.values(FORMAT_REGISTRY).filter(f => f.gameSystem === shortName)
}

// Helper: get a single format config by key
export function getFormatConfig(formatKey: string): FormatConfig | null {
  return FORMAT_REGISTRY[formatKey] || null
}

// Helper: get format display name for badges
export function getFormatDisplayName(formatKey: string): string {
  return FORMAT_REGISTRY[formatKey]?.name || 'Unknown'
}
```

### Pattern 2: Database Column Design (varchar, not enum)

**What:** Store the format key as a `varchar` column on the `leagues` table.
**Why varchar over enum:**
- Enum requires a migration every time a new format is added (e.g., when GW releases a new game mode)
- varchar is flexible and the registry validates allowed values at the application layer
- The existing codebase uses varchar for similar fields (`matchType`, `pairingMethod`, `status`)
- Consistent with existing patterns in `db/schema.ts`

```typescript
// Addition to leagues table in db/schema.ts
export const leagues = pgTable('leagues', {
  // ... existing columns ...
  format: varchar('format', { length: 50 }),  // 'ow-ptg', '40k-matched', etc.
})
```

**Why nullable:** Existing leagues don't have a format. After migration they will, but the column should be nullable for the migration window. The migration script sets the format for existing leagues.

### Pattern 3: Format Immutability Check

**What:** Server-side validation that prevents format changes after matches exist.
**When to use:** On the league PATCH endpoint.

```typescript
// In server/api/leagues/[id].patch.ts
if (body.format !== undefined) {
  // Check if any matches exist for this league
  const matchCount = await db
    .select({ count: sql`count(*)` })
    .from(matches)
    .where(eq(matches.leagueId, leagueId))

  if (parseInt(matchCount[0].count) > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format cannot be changed after matches have been recorded'
    })
  }
}
```

### Pattern 4: Format Selection UI in League Creation

**What:** A reactive two-step selection within the existing "Basic Information" card.
**How:** After game system is selected, show a radio/card group of available formats for that system. Uses the `getFormatsForGameSystem()` helper from the registry.

The existing create form already has a `selectedGameSystem` computed and a `watch` on `form.gameSystemId`. The format selector would be a new section that appears conditionally when `form.gameSystemId` is set.

### Anti-Patterns to Avoid
- **Separate `formats` database table:** Over-engineering. Formats are static config, not user data. A join table adds complexity for no benefit when the data never changes at runtime.
- **Storing format config in the database:** The config belongs in code where it's versioned and typed. Only the format key (identifier) goes in the DB.
- **Using pgEnum:** Hard to migrate, adds DB-level constraints that are better handled in application code given the project's pattern.
- **Coupling format to game system in the DB:** The format key already encodes the game system (e.g., `ow-ptg`). Don't add a separate `formatType` + `formatSubtype` when a single key works.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Migration script | Custom DB connection setup | `db` from `../db/index.ts` or `tsx` with direct neon() | The project already has a db module and tsx for running TS scripts |
| Format validation | Custom validation logic | Registry lookup + existence check | The registry IS the validation -- if the key exists in the registry, it's valid |
| Reactive format options | Manual DOM manipulation | Vue computed property filtering FORMAT_REGISTRY | Vue reactivity handles the two-step flow naturally |
| Match count check | Complex query | Simple `count(*)` with drizzle | Single query, no need for pagination or complex logic |

## Common Pitfalls

### Pitfall 1: Forgetting to Include Format in ALL League Data Endpoints
**What goes wrong:** Format badge appears in some places but not others because some endpoints don't return the format field.
**Why it happens:** The `leagues` data flows through multiple endpoints: `leagues/my.get.ts`, `leagues/[id].get.ts`, `leagues/public.get.ts`, `leagues/info-by-token/[token].get.ts`, and `admin/leagues.get.ts`. Missing any one means inconsistent behavior.
**How to avoid:** Systematically update ALL endpoints that return league data. The format column is on the leagues table so `select()` will include it automatically for endpoints using `select().from(leagues)`, but endpoints that manually construct response objects (like `leagues/my.get.ts`) need manual addition.
**Files to update:**
- `server/api/leagues/my.get.ts` -- manually constructs response, must add `format` field
- `server/api/leagues/[id].get.ts` -- uses `select()`, format auto-included
- `server/api/leagues/public.get.ts` -- check if constructs manual response
- `server/api/leagues/info-by-token/[token].get.ts` -- check response construction
- `server/api/admin/leagues.get.ts` -- admin view should show format

### Pitfall 2: Migration Script Painting Bonus Calculation
**What goes wrong:** Painting bonus retroactive application is more complex than it appears.
**Why it happens:** The painting data is stored as JSON in the `armies.units` field with per-unit `paintedModels` and `totalModels`. To determine if a player had "fully painted" for a given match's phase, you need to check the army list for that phase.
**How to avoid:** For the OW PtG migration specifically:
1. Get all matches for the OW league
2. For each match, get the phase number
3. For each player in the match, find their army for that phase
4. Calculate painting percentage from army units data
5. If percentage >= 100% (or whatever threshold), add +1 CP
**Warning signs:** If painting bonus CP totals seem too high, the threshold may need adjustment.

### Pitfall 3: Format Selection Must Be Required for New Leagues
**What goes wrong:** League gets created without a format, breaking format-dependent behavior downstream.
**Why it happens:** The `format` column is nullable (for backward compat with existing leagues), but the create form and API should enforce it.
**How to avoid:** Add validation in both:
- Client: `validateForm()` in `leagues/create.vue` -- check `form.format` is set
- Server: `leagues/create.post.ts` -- validate `body.format` exists and is in the registry

### Pitfall 4: League Settings View Needs Immutability Logic
**What goes wrong:** Organizer changes format after matches are played, breaking scoring/standings data.
**Why it happens:** The settings view currently allows changing game system freely. Format needs stricter logic.
**How to avoid:** In `LeagueSetupView.vue`:
1. Check match count on mount (or receive as prop)
2. If matches > 0: show format as read-only with lock icon and explanation
3. If matches = 0: show format as editable dropdown (but only formats for current game system)
4. Server-side: PATCH endpoint must also enforce this check

### Pitfall 5: Store Cache Invalidation After Format Change
**What goes wrong:** After changing format in settings (before first match), the cached league object in the Pinia store still has the old format.
**Why it happens:** The `leagues` cache in the store (`this.leagues[id]`) is updated from the PATCH response, but the `myLeagues` array may not be updated.
**How to avoid:** In the `updateLeague` action, also update the `myLeagues` entry with the new format value, similar to how `name` is already updated there (line 547 of leagues.js).

## Code Examples

### Database Migration SQL
```sql
-- Add format column to leagues table
ALTER TABLE "leagues" ADD COLUMN "format" varchar(50);
```

### Schema Update (db/schema.ts)
```typescript
// In the leagues table definition, add after gameSystemId:
format: varchar('format', { length: 50 }),  // Format key: 'ow-ptg', '40k-matched', etc.
```

### League Creation Form - Format Selection Section
```vue
<!-- Format Selection (appears after game system is selected) -->
<div v-if="form.gameSystemId && availableFormats.length > 0" class="space-y-3">
  <label class="block text-gray-300 font-semibold mb-2">
    League Format <span class="text-red-400">*</span>
  </label>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div
      v-for="format in availableFormats"
      :key="format.key"
      @click="form.format = format.key"
      class="p-4 rounded-lg border-2 cursor-pointer transition-all"
      :class="form.format === format.key
        ? 'border-purple-500 bg-purple-900/20'
        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'"
    >
      <div class="font-semibold text-gray-100">{{ format.name }}</div>
      <p class="text-sm text-gray-400 mt-1">{{ format.description }}</p>
    </div>
  </div>
  <p class="text-sm text-gray-400 mt-1">
    The format determines scoring rules, match recording, and available features
  </p>
</div>
```

### Format Badge Component Pattern
```vue
<!-- Subtle badge near league name -->
<span
  v-if="formatName"
  class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 border border-gray-600"
>
  {{ formatName }}
</span>
```

### Migration Script Structure
```typescript
// scripts/migrate-formats.ts (run with tsx)
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, and, sql } from 'drizzle-orm'
import * as schema from '../db/schema'

async function migrateFormats() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL required')

  const client = neon(databaseUrl)
  const db = drizzle(client, { schema })

  // 1. Set format for 40k league
  // await db.update(schema.leagues).set({ format: '40k-matched' }).where(eq(schema.leagues.id, LEAGUE_ID))

  // 2. Set format for OW league
  // await db.update(schema.leagues).set({ format: 'ow-ptg' }).where(eq(schema.leagues.id, LEAGUE_ID))

  // 3. Recalculate OW PtG player stats (CP-based)
  // For each match: derive CP from marginOfVictory
  // Massacre -> 3 CP, Major Victory -> 2, Minor Victory -> 2, Draw -> 1, Loss -> 0
  // Check painting for +1 CP bonus

  // 4. Reset player stats and recalculate from matches
  // Zero out wins/losses/draws/totalPoints for OW league players
  // Iterate all matches, recalculate with CP scoring
}
```

### Format Immutability in Settings View
```vue
<!-- Format display in league settings -->
<div class="md:col-span-2">
  <label class="block text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
    League Format
    <Lock v-if="hasMatches" :size="14" class="text-gray-400" />
  </label>

  <!-- Editable: no matches yet -->
  <select
    v-if="!hasMatches"
    v-model="editableLeague.format"
    class="input-field"
    required
  >
    <option v-for="fmt in availableFormats" :key="fmt.key" :value="fmt.key">
      {{ fmt.name }}
    </option>
  </select>

  <!-- Read-only: matches recorded -->
  <div v-else class="input-field bg-gray-800 cursor-not-allowed flex items-center justify-between">
    <span>{{ currentFormatName }}</span>
    <span class="text-xs text-gray-500">Format locked -- matches have been recorded</span>
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single matchType per game system | Format key per league (game system + format) | This phase | Each league can have its own scoring/progression behavior |
| player.totalPoints = VP sum | player.totalPoints = format-specific scoring | This phase (migration) | OW PtG leagues track CP instead of VP |
| No format concept | Format shown on league cards/headers | This phase | Users see which format a league uses |

## Open Questions

1. **Exact league IDs for migration**
   - What we know: There are exactly 2 leagues to migrate (40k and OW)
   - What's unclear: Their exact database IDs
   - Recommendation: Query the DB at migration time by game system or have the implementer hard-code the known IDs. The migration script should verify the leagues exist before modifying.

2. **Painting bonus threshold for retroactive CP**
   - What we know: Painting bonus is +1 CP when army is "fully painted"
   - What's unclear: What percentage constitutes "fully painted" -- is it 100% models painted, or some threshold?
   - Recommendation: Use 100% as the threshold (all models painted = bonus). The `usePaintingStats` composable already calculates this percentage per army per phase.

3. **Format for leagues created between migration and code deploy**
   - What we know: The column is nullable, so leagues created before the code deploy will have `null` format
   - What's unclear: N/A -- there are only 2 leagues total in production
   - Recommendation: Not a concern. The migration script handles the existing leagues. The `null` check in the badge display handles graceful degradation.

4. **Changing game system in settings should reset format**
   - What we know: Currently the settings view allows changing game system
   - What's unclear: Should changing game system also clear the format selection?
   - Recommendation: Yes. If game system changes, format must be re-selected (since formats are game-system-specific). Add a watcher that clears format when gameSystemId changes.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** - Direct reading of all relevant source files:
  - `db/schema.ts` - Current database schema (leagues, matches, players tables)
  - `app/pages/leagues/create.vue` - League creation form (740 lines)
  - `server/api/leagues/create.post.ts` - League creation API endpoint
  - `app/stores/leagues.js` - Pinia store (1361 lines, all league operations)
  - `app/components/LeagueCard.vue` - League card component
  - `app/components/views/DashboardView.vue` - Dashboard with league header
  - `app/components/views/LeagueSetupView.vue` - League settings view
  - `server/api/leagues/[id].patch.ts` - League update endpoint
  - `server/api/leagues/my.get.ts` - User leagues endpoint (manual response construction)
  - `app/data/game-systems.js` - Existing game system definitions
  - `app/composables/useStandings.js` - Current standings logic
  - `app/composables/useMatchResults.js` - Match result calculations
  - `app/composables/useMatchValidation.js` - Match validation
  - `app/composables/usePaintingStats.js` - Painting statistics
  - `server/api/matches.post.ts` - Match creation with stat updates
  - `migrations/` directory - 23 existing migrations showing the pattern

### Secondary (MEDIUM confidence)
- **Drizzle ORM documentation** - varchar column types, migration patterns (verified by existing codebase usage)
- **Vue 3 reactivity** - computed properties, watchers, reactive form patterns (verified by existing codebase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing tools
- Architecture (format registry): HIGH - Based on existing patterns in the codebase (game-systems.js, factions-by-system.js)
- Architecture (DB schema): HIGH - Follows exact same varchar pattern as existing fields (matchType, status, pairingMethod)
- Pitfalls: HIGH - Identified from direct code reading of all affected files
- Migration approach: MEDIUM - Painting bonus retroactive calculation needs careful testing against real data
- Code examples: HIGH - Derived from actual codebase patterns

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (stable -- no external dependency changes expected)
