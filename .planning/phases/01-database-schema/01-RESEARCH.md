# Phase 1: Database Schema - Research

**Researched:** 2026-02-05
**Domain:** Drizzle ORM schema migration, PostgreSQL column/table renaming
**Confidence:** HIGH

## Summary

This research investigates how to rename database columns and tables from "round" terminology to "phase" terminology in a Drizzle ORM + PostgreSQL (Neon serverless) environment without data loss. The project uses Drizzle ORM 0.44.6 with Drizzle Kit 0.31.5 for migrations.

The key finding is that **drizzle-kit can detect column renames** when using `drizzle-kit generate` interactively, but the safest approach for a complex rename involving multiple tables is to use **custom migrations** with explicit `ALTER TABLE ... RENAME COLUMN` and `ALTER TABLE ... RENAME TO` SQL statements. This ensures data is preserved and the rename is atomic.

The scope of changes is significant: 6 tables are affected, with both column renames (e.g., `currentRound` to `currentPhase`) and one table rename (`rounds` to `phases`). Foreign key constraints do NOT need to be recreated for simple column renames in PostgreSQL - the constraints automatically update to reference the new column/table names.

**Primary recommendation:** Use a custom Drizzle migration with hand-written `ALTER TABLE ... RENAME` statements, then update the schema.ts file to match. This is safer than relying on drizzle-kit's automatic rename detection for bulk operations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.44.6 | ORM for TypeScript | Already in use, type-safe queries |
| drizzle-kit | 0.31.5 | Migration generation and execution | Already in use, generates SQL migrations |
| @neondatabase/serverless | 1.0.2 | PostgreSQL driver for Neon | Already in use, serverless-compatible |
| @netlify/neon | 0.1.0 | Netlify integration for Neon | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PostgreSQL 16+ | (Neon) | Database engine | RENAME COLUMN is fully supported |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom migration | drizzle-kit auto-detect | Auto-detect works but may miss some renames in bulk operations |
| Hand-written SQL | drizzle-kit generate | More control but requires SQL knowledge |

**Installation:**
```bash
# Already installed - no additional packages needed
```

## Architecture Patterns

### Recommended Migration Strategy

For bulk column/table renames, use this **two-step approach**:

1. **Generate custom migration file** with Drizzle Kit
2. **Write explicit RENAME SQL statements**
3. **Update schema.ts** to match new column names
4. **Run migration** on all environments

### Pattern 1: Custom Migration for Renames
**What:** Generate an empty migration file and write explicit ALTER TABLE statements
**When to use:** When renaming multiple columns/tables to ensure data preservation
**Example:**
```sql
-- Source: PostgreSQL ALTER TABLE documentation
-- Step 1: Rename the table
ALTER TABLE "rounds" RENAME TO "phases";

-- Step 2: Rename columns in leagues table
ALTER TABLE "leagues" RENAME COLUMN "currentRound" TO "currentPhase";

-- Step 3: Rename columns in other tables
ALTER TABLE "players" RENAME COLUMN "joined_round" TO "joined_phase";
ALTER TABLE "players" RENAME COLUMN "left_round" TO "left_phase";

-- ... continue for all columns
```

### Pattern 2: Schema Update After Migration
**What:** Update schema.ts to use new column/table names AFTER migration runs
**When to use:** Always - schema must match database
**Example:**
```typescript
// Source: Drizzle ORM documentation
// BEFORE (in schema.ts)
export const rounds = pgTable('rounds', { ... });
currentRound: integer().default(1).notNull(),

// AFTER (in schema.ts)
export const phases = pgTable('phases', { ... });
currentPhase: integer().default(1).notNull(),
```

### Recommended Project Structure
```
migrations/
├── 0021_jazzy_meggan.sql     # Previous migration
├── 0022_[name].sql           # NEW: Phase rename migration
└── meta/
    └── _journal.json         # Auto-updated by drizzle-kit
db/
└── schema.ts                 # Update AFTER migration created
```

### Anti-Patterns to Avoid
- **Updating schema.ts before creating migration:** Drizzle-kit may generate DROP/ADD instead of RENAME, causing data loss
- **Running drizzle-kit generate without reviewing output:** Auto-detection may not always choose RENAME
- **Skipping foreign key verification:** While PostgreSQL handles this automatically, always verify in testing

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Migration tracking | Custom version table | drizzle-kit's _journal.json | Already tracks which migrations ran |
| Column type inference | Manual type definitions | Drizzle's inferred types | Type safety from schema |
| Database connection pooling | Custom pool | @neondatabase/serverless | Handles serverless connection lifecycle |

**Key insight:** Use drizzle-kit's migration infrastructure even for custom SQL - it handles tracking, ordering, and execution.

## Common Pitfalls

### Pitfall 1: Schema/Database Mismatch
**What goes wrong:** Updating schema.ts before migration runs causes query failures
**Why it happens:** Drizzle generates queries based on schema.ts, but database still has old column names
**How to avoid:**
1. Create migration with old column names in schema.ts
2. Run migration
3. Then update schema.ts
4. Verify queries work
**Warning signs:** TypeScript errors about missing columns after migration

### Pitfall 2: Auto-Detection Choosing DROP/ADD
**What goes wrong:** drizzle-kit generate creates DROP COLUMN + ADD COLUMN instead of RENAME
**Why it happens:** When multiple changes occur simultaneously, rename detection may fail
**How to avoid:** Use `drizzle-kit generate --custom` for explicit control
**Warning signs:** Generated SQL contains DROP COLUMN statements for columns with data

### Pitfall 3: Foreign Key Constraint Names
**What goes wrong:** Expecting FK constraints to fail during table rename
**Why it happens:** Misunderstanding PostgreSQL behavior
**How to avoid:** Trust that PostgreSQL automatically updates FK references during RENAME
**Warning signs:** None - this is actually a non-issue, but developers often worry about it unnecessarily

### Pitfall 4: Sequence Name Mismatch
**What goes wrong:** Table renamed but sequence still has old name (e.g., `rounds_id_seq`)
**Why it happens:** PostgreSQL RENAME TABLE doesn't rename associated sequences
**How to avoid:** Either rename sequence explicitly or leave it (sequences work regardless of name)
**Warning signs:** Cosmetic only - the sequence `rounds_id_seq` will still work for `phases` table

### Pitfall 5: Application Code References
**What goes wrong:** TypeScript compiles but runtime queries fail
**Why it happens:** String references to old column names in queries
**How to avoid:** Use Drizzle's typed queries exclusively, search codebase for string literals
**Warning signs:** Grep for 'round' string literals in API routes and components

## Code Examples

Verified patterns from official sources:

### Generate Custom Migration
```bash
# Source: https://orm.drizzle.team/docs/kit-custom-migrations
npx drizzle-kit generate --custom --name=rename-rounds-to-phases
```

### PostgreSQL Rename Column Syntax
```sql
-- Source: https://www.postgresql.org/docs/current/sql-altertable.html
ALTER TABLE "leagues" RENAME COLUMN "currentRound" TO "currentPhase";
```

### PostgreSQL Rename Table Syntax
```sql
-- Source: https://www.postgresql.org/docs/current/sql-altertable.html
ALTER TABLE "rounds" RENAME TO "phases";
```

### Complete Migration Example
```sql
-- Migration: Rename 'round' terminology to 'phase'
-- This is a data-preserving operation

-- Rename the rounds table to phases
ALTER TABLE "rounds" RENAME TO "phases";

-- Rename columns in leagues table
ALTER TABLE "leagues" RENAME COLUMN "currentRound" TO "currentPhase";

-- Rename columns in players table
ALTER TABLE "players" RENAME COLUMN "joined_round" TO "joined_phase";
ALTER TABLE "players" RENAME COLUMN "left_round" TO "left_phase";

-- Rename columns in pairings table
ALTER TABLE "pairings" RENAME COLUMN "round" TO "phase";

-- Rename columns in matches table
ALTER TABLE "matches" RENAME COLUMN "round" TO "phase";

-- Rename columns in armies table
ALTER TABLE "armies" RENAME COLUMN "round" TO "phase";

-- Note: Foreign key constraints automatically update
-- Note: Sequence 'rounds_id_seq' can remain (or rename if desired)
```

### Updated Schema Example
```typescript
// Source: Project's db/schema.ts pattern
// After migration, update schema.ts:

// Rename table export and pgTable name
export const phases = pgTable('phases', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id).notNull(),
  number: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  pointLimit: integer().notNull(),
  startDate: date().notNull(),
  endDate: date().notNull()
});

// Update column names in leagues table
export const leagues = pgTable('leagues', {
  // ... other columns
  currentPhase: integer().default(1).notNull(), // was currentRound
  // ...
});

// Update column names in players table
export const players = pgTable('players', {
  // ... other columns
  joinedPhase: integer('joined_phase').default(1).notNull(), // was joined_round
  leftPhase: integer('left_phase'), // was left_round
  // ...
});
```

### Running Migration
```bash
# Source: Project's package.json scripts
npm run db:migrate
# or
netlify dev:exec drizzle-kit migrate
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual FK drop/recreate | PostgreSQL auto-updates FKs | Always in PG | Simpler migrations |
| drizzle-kit push (direct) | drizzle-kit generate + migrate | Best practice | Trackable, reversible |

**Deprecated/outdated:**
- `drizzle-kit push` for production: Use generate + migrate for audit trail
- Manual version tracking: Use _journal.json

## Open Questions

Things that couldn't be fully resolved:

1. **Sequence Renaming**
   - What we know: PostgreSQL doesn't auto-rename sequences with tables
   - What's unclear: Whether leaving `rounds_id_seq` name causes any issues
   - Recommendation: Leave sequence name as-is (it's purely cosmetic) or add explicit rename if desired

2. **Snapshot Synchronization**
   - What we know: Custom migrations need manual snapshot updates
   - What's unclear: Whether drizzle-kit will detect schema drift after custom migration
   - Recommendation: After migration, run `drizzle-kit generate` to verify snapshot matches schema

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM Migrations Docs](https://orm.drizzle.team/docs/migrations) - Migration workflow
- [Drizzle Kit Custom Migrations](https://orm.drizzle.team/docs/kit-custom-migrations) - Custom SQL migrations
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html) - RENAME syntax

### Secondary (MEDIUM confidence)
- [Drizzle Kit Generate Docs](https://orm.drizzle.team/docs/drizzle-kit-generate) - Rename detection behavior
- [Neon Migration Guide](https://neon.com/docs/guides/drizzle-migrations) - Neon + Drizzle integration

### Tertiary (LOW confidence)
- [GitHub Issue #3826](https://github.com/drizzle-team/drizzle-orm/issues/3826) - Known rename detection limitations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies
- Architecture: HIGH - PostgreSQL RENAME is well-documented and reliable
- Pitfalls: HIGH - Based on PostgreSQL documentation and project migration history

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable domain)

---

## Appendix: Full Scope of Changes

### Tables Affected

| Table | Change Type | Old Name | New Name |
|-------|-------------|----------|----------|
| rounds | RENAME TABLE | rounds | phases |
| leagues | RENAME COLUMN | currentRound | currentPhase |
| players | RENAME COLUMN | joined_round | joined_phase |
| players | RENAME COLUMN | left_round | left_phase |
| pairings | RENAME COLUMN | round | phase |
| matches | RENAME COLUMN | round | phase |
| armies | RENAME COLUMN | round | phase |

### Files Requiring Code Updates (After Schema Change)

**Server API Routes:**
- server/api/leagues.get.ts
- server/api/leagues.post.ts
- server/api/leagues.put.ts
- server/api/leagues/[id].get.ts
- server/api/leagues/[id].patch.ts
- server/api/leagues/[id].delete.ts
- server/api/leagues/create.post.ts
- server/api/leagues/my.get.ts
- server/api/leagues/info-by-token/[token].get.ts
- server/api/matches.post.ts
- server/api/players.get.ts
- server/api/players/[id]/toggle-active.patch.ts
- server/api/armies.post.ts
- server/api/armies.delete.ts
- server/api/pairings/index.get.ts
- server/api/pairings/generate.post.ts
- server/api/admin/leagues.get.ts
- server/api/admin/leagues/[id].put.ts
- server/api/admin/matches/all.get.ts
- server/api/admin/matches/[id].put.ts
- server/api/admin/rounds/[id].put.ts (rename file to phases)

**Note:** This list covers Drizzle query updates. Phase 2 and Phase 3 cover API endpoint paths and frontend components.
