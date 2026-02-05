# Phase 2: API Layer - Research

**Researched:** 2026-02-05
**Domain:** Nuxt Nitro API routes + Drizzle ORM query updates
**Confidence:** HIGH

## Summary

This phase involves renaming API terminology from "round" to "phase" across Nuxt server routes and Drizzle ORM queries. The work is straightforward but requires careful attention to three distinct layers: file/route naming, request/response payload properties, and internal variable names referencing schema columns.

The codebase currently has a mismatch: Phase 1 renamed the schema column from `round` to `phase`, but API handlers still use `round` in Drizzle queries (e.g., `armies.round`, `pairings.round`). These are TypeScript errors that would surface at runtime. The build currently passes because Nuxt's TypeScript configuration may not strictly check server routes, but direct `tsc` checking reveals the errors.

**Primary recommendation:** Update all API handlers atomically (in order: schema references, then internal variables, then request/response payloads, then file renames) to maintain consistency and avoid runtime errors.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt | 4.1.2 | Full-stack Vue framework | File-based API routing in server/api/ |
| Nitro | 2.12.6 | Server engine for Nuxt | Handles API route compilation and serving |
| Drizzle ORM | 0.44.6 | TypeScript SQL ORM | Type-safe queries with schema-driven column references |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-orm/pg-core | 0.44.6 | PostgreSQL adapter | All database queries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual rename | Find/replace | Risk of inconsistent changes; type errors catch mistakes |

**No installation needed:** All required packages already installed.

## Architecture Patterns

### Current API Route Structure
```
server/api/
├── admin/
│   ├── rounds/             # Needs rename to phases/
│   │   └── [id].put.ts
│   └── matches/
│       ├── [id].put.ts     # Uses pairings.round
│       └── all.get.ts      # Uses matches.round
├── armies.post.ts          # Uses body.round, armies.round
├── armies.delete.ts        # Uses query.round, armies.round
├── matches.post.ts         # Uses body.round, pairings.round
├── pairings/
│   ├── generate.post.ts    # Uses body.round, pairings.round
│   ├── index.get.ts        # Uses query.round, pairings.round
│   └── manual.post.ts      # Uses body.round
└── league-settings/        # Uses firstRoundPairingMethod (keep - DB column name)
```

### Pattern 1: Drizzle Column Reference Updates
**What:** Schema exports `phase` property; code must use `tablename.phase` not `tablename.round`
**When to use:** Every query referencing phase column
**Example:**
```typescript
// Source: Verified from db/schema.ts and Drizzle docs
// BEFORE (current broken code)
eq(armies.round, body.round)  // TS error: 'round' does not exist on type

// AFTER (correct)
eq(armies.phase, body.phase)  // Compiles correctly
```

### Pattern 2: Request/Response Property Updates
**What:** API payloads use `phase` property in JSON
**When to use:** All request body parsing and response building
**Example:**
```typescript
// BEFORE
const { leagueId, round, player1Id } = body
if (!leagueId || !round || !player1Id) {
  throw createError({ statusCode: 400, statusMessage: 'Missing: leagueId, round, player1Id' })
}

// AFTER
const { leagueId, phase, player1Id } = body
if (!leagueId || !phase || !player1Id) {
  throw createError({ statusCode: 400, statusMessage: 'Missing: leagueId, phase, player1Id' })
}
```

### Pattern 3: Nuxt File-Based Route Rename
**What:** Renaming directory changes API route path automatically
**When to use:** `/api/rounds` endpoint needs to become `/api/phases`
**Example:**
```bash
# Nuxt file-based routing
server/api/admin/rounds/[id].put.ts  ->  /api/admin/rounds/:id
server/api/admin/phases/[id].put.ts  ->  /api/admin/phases/:id
```

### Anti-Patterns to Avoid
- **Partial updates:** Don't update schema references without updating variable names (creates confusion)
- **Breaking API compatibility without frontend update:** Ensure Phase 3 (frontend) handles new payload shapes
- **Keeping legacy aliases:** Clean break preferred over maintaining round/phase dual support

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API route renaming | Manual path configuration | Nuxt file-based routing | Move file, route changes automatically |
| Type validation | Runtime checks | Drizzle TypeScript | Schema types catch errors at compile time |
| Column aliasing | SQL aliases | Drizzle select syntax | `{ round: table.phase }` if needed for backward compat |

**Key insight:** Nuxt's file-based routing means renaming `server/api/admin/rounds/` to `server/api/admin/phases/` automatically changes the route from `/api/admin/rounds/` to `/api/admin/phases/` with zero configuration.

## Common Pitfalls

### Pitfall 1: TypeScript Passes But Runtime Fails
**What goes wrong:** Build succeeds but API calls fail with "column round does not exist"
**Why it happens:** Nuxt's TypeScript config may not strictly type-check server routes; actual column names come from schema
**How to avoid:** Run `npx tsc --noEmit server/api/specific-file.ts` to verify schema access patterns
**Warning signs:** Using `any` types, untyped body parsing, schema references that differ from column names

### Pitfall 2: Inconsistent Payload Names
**What goes wrong:** API accepts `round` but returns `phase` (or vice versa)
**Why it happens:** Updated column reference but forgot request body destructuring
**How to avoid:** Update in order: schema access -> variable names -> body/query parsing -> response building
**Warning signs:** `body.round` with `table.phase` in same handler

### Pitfall 3: Missing Query Parameter Updates
**What goes wrong:** GET endpoints still expect `?round=` instead of `?phase=`
**Why it happens:** Query strings aren't type-checked like body payloads
**How to avoid:** Search for `query.round` in addition to `body.round`
**Warning signs:** `getQuery(event)` followed by `query.round`

### Pitfall 4: Forgetting Insert/Update Objects
**What goes wrong:** Insert fails because `round` property doesn't exist in schema
**Why it happens:** `.values({ round: value })` when schema expects `phase`
**How to avoid:** Check both `.where()` clauses AND `.values()` objects
**Warning signs:** `db.insert(table).values({ round: ... })`

### Pitfall 5: Database Column Names vs TypeScript Property Names
**What goes wrong:** Confusion about what to rename
**Why it happens:** `firstRoundPairingMethod` in league_settings is actually a DB column name (snake_case in DB)
**How to avoid:** Distinguish between: (1) Drizzle property names (TypeScript), (2) Request/response properties (JSON), (3) Actual DB column names
**Warning signs:** Trying to rename columns that represent different concepts (e.g., "first round" as initial pairing, not league phase)

## Code Examples

Verified patterns from codebase analysis:

### Complete Handler Update Pattern
```typescript
// Source: server/api/pairings/manual.post.ts (current -> updated)

// BEFORE
const { leagueId, round, player1Id, player2Id, isBye, dueDate } = body

if (!leagueId || !round || !player1Id) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required fields: leagueId, round, player1Id'
  })
}

const newPairing = {
  leagueId,
  round,  // Drizzle will reject - schema has 'phase' not 'round'
  player1Id,
  ...
}

// AFTER
const { leagueId, phase, player1Id, player2Id, isBye, dueDate } = body

if (!leagueId || !phase || !player1Id) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required fields: leagueId, phase, player1Id'
  })
}

const newPairing = {
  leagueId,
  phase,  // Matches schema definition
  player1Id,
  ...
}
```

### Query Parameter Update Pattern
```typescript
// Source: server/api/pairings/index.get.ts (current -> updated)

// BEFORE
const round = query.round ? parseInt(query.round as string) : null
if (round !== null) {
  conditions.push(eq(pairings.round, round))  // Error: pairings.round doesn't exist
}

// AFTER
const phase = query.phase ? parseInt(query.phase as string) : null
if (phase !== null) {
  conditions.push(eq(pairings.phase, phase))  // Correct: matches schema
}
```

### Select Field Mapping Pattern
```typescript
// Source: server/api/admin/matches/all.get.ts

// BEFORE
const results = await db.select({
  id: matches.id,
  round: matches.round,  // Error
  ...
})

// AFTER
const results = await db.select({
  id: matches.id,
  phase: matches.phase,  // Correct
  ...
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `body.round` | `body.phase` | Phase 2 | API contract change |
| `?round=N` | `?phase=N` | Phase 2 | Query parameter change |
| `/api/admin/rounds/` | `/api/admin/phases/` | Phase 2 | Route path change |

**Deprecated/outdated:**
- `rounds` terminology: Replaced with `phases` to avoid confusion with Warhammer battle rounds

## Scope Clarification

### In Scope (Phase 2 - API Layer)
1. Rename `/api/admin/rounds/` folder to `/api/admin/phases/`
2. Update all `body.round` to `body.phase` in request parsing
3. Update all `query.round` to `query.phase` in query parameter parsing
4. Update all `table.round` to `table.phase` in Drizzle queries
5. Update all `round:` to `phase:` in insert/update value objects
6. Update error messages mentioning "round"
7. Update success messages mentioning "round"

### Out of Scope (Different Phase/Concept)
1. `firstRoundPairingMethod` / `subsequentRoundMethod` in league_settings - These refer to "initial round" vs "subsequent rounds" of tournament pairing, not league phases. Keep as-is.
2. `Math.round()` in admin/system-status.get.ts - JavaScript math function, not terminology
3. Frontend components - Phase 3 handles Vue component updates

## Files Requiring Updates

Based on grep analysis of the codebase:

| File | Updates Needed |
|------|----------------|
| `server/api/admin/rounds/[id].put.ts` | Move to `phases/` folder |
| `server/api/armies.post.ts` | body.round, armies.round, error message |
| `server/api/armies.delete.ts` | query.round, armies.round, error message |
| `server/api/matches.post.ts` | body.round, pairings.round, insert values |
| `server/api/pairings/generate.post.ts` | body.round, pairings.round, success message |
| `server/api/pairings/index.get.ts` | query.round, pairings.round, select field |
| `server/api/pairings/manual.post.ts` | body.round, insert values, error message |
| `server/api/admin/matches/[id].put.ts` | body.round, updateData.round |
| `server/api/admin/matches/all.get.ts` | matches.round select field |

**Total: 9 files, 1 folder rename**

## Open Questions

Things that couldn't be fully resolved:

1. **API Versioning Strategy**
   - What we know: Routes change from `/api/rounds` to `/api/phases`
   - What's unclear: Whether to maintain backward compatibility for existing clients
   - Recommendation: Clean break since this is terminology standardization before production; add API versioning in future if needed

2. **Frontend Coordination**
   - What we know: Frontend will need updates in Phase 3
   - What's unclear: Exact timing of frontend vs backend deployment
   - Recommendation: Complete Phase 2 first, then Phase 3 frontend updates; local dev can handle mismatch temporarily

## Sources

### Primary (HIGH confidence)
- db/schema.ts - Direct codebase inspection showing `phase` column names
- TypeScript compiler output - Verified errors with `npx tsc --noEmit server/api/armies.post.ts`
- server/api/*.ts files - Direct grep analysis of current codebase

### Secondary (MEDIUM confidence)
- Nuxt documentation (nuxt.com/docs) - File-based API routing patterns
- Drizzle ORM documentation (orm.drizzle.team) - Query and insert patterns

### Tertiary (LOW confidence)
- None - All findings verified against codebase and official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Directly verified against package.json and codebase
- Architecture: HIGH - Pattern derived from existing codebase structure
- Pitfalls: HIGH - Verified TypeScript errors exist; patterns confirmed
- Files to update: HIGH - Complete grep analysis of server/api/ directory

**Research date:** 2026-02-05
**Valid until:** Indefinite (internal refactoring, not external API changes)
