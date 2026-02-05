# Codebase Concerns

**Analysis Date:** 2026-02-05

## Tech Debt

**Monolithic Store Module:**
- Issue: `app/stores/leagues.js` is 1361 lines - a single mega-store combining state for leagues, game systems, factions, missions, players, matches, pairings, and UI flags
- Files: `app/stores/leagues.js`
- Impact: Difficult to maintain, test individual features, and reason about state changes. Any modification affects entire store. Performance issues on large data sets
- Fix approach: Split into smaller stores: `useLeagueStore`, `useGameSystemStore`, `usePlayerStore`, `useMatchStore`, `usePairingStore`. Keep separate concerns isolated

**Untyped Frontend Code:**
- Issue: All Vue composables and stores written in JavaScript (.js) instead of TypeScript, making them susceptible to type errors that only surface at runtime
- Files: `app/composables/*.js`, `app/stores/*.js`
- Impact: Runtime errors in production, harder to refactor safely, IDE cannot provide proper autocomplete/validation
- Fix approach: Convert to TypeScript incrementally starting with composables that handle critical data (matches, pairings)

**Session Token Using Simple Base64:**
- Issue: Session cookie stores base64-encoded JSON without encryption (`Buffer.from(sessionData).toString('base64')`)
- Files: `server/api/auth/callback.get.ts` (line 117)
- Impact: Session data is readable by anyone with cookie access, even over HTTPS. Should use proper encryption
- Fix approach: Implement server-side session storage (JWT or signed tokens) or use proper encryption (libsodium, crypto.box). Remove sensitive data from client-accessible format

**Type Safety Bypasses:**
- Issue: Multiple instances of `// eslint-disable-next-line @typescript-eslint/no-explicit-any` and `any` type casts
- Files: `server/api/auth/callback.get.ts` (lines 30-31, 46-47 for Auth0 responses)
- Impact: Loses type safety for Auth0 API responses; bugs in field extraction won't be caught
- Fix approach: Create proper TypeScript interfaces for Auth0 token response and userinfo responses

**Missing Error Handling in Frontend:**
- Issue: Only 10 occurrences of try/catch across entire app/composables directory for API calls
- Files: `app/composables/*.js` (widespread)
- Impact: Network errors, 401 auth failures, and API errors will crash components or fail silently
- Fix approach: Add consistent error handling wrapper, use `try/catch` for all API calls, implement error boundary component

**API Endpoints Lack Consistent Validation:**
- Issue: Some routes validate query/body parameters inconsistently (e.g., `leagues.get.ts` validates nothing, `leagues.put.ts` validates basic ID parsing)
- Files: `server/api/leagues.get.ts` (no auth/validation), `server/api/leagues.put.ts` (minimal validation)
- Impact: Data integrity issues, injection vulnerabilities if downstream code doesn't validate
- Fix approach: Create middleware/helper for request validation, use Zod schema validation on all endpoints

**Cleartext Secrets in Environment Config:**
- Issue: `.env.example` shows SESSION_SECRET placeholder but session implementation uses simple Base64 encoding, rendering secret unused/misused
- Files: `.env.example`, `server/api/auth/callback.get.ts`
- Impact: Security theater - SESSION_SECRET environment variable is not used; migration instructions in comments suggest incomplete refactor
- Fix approach: Implement actual symmetric encryption using SESSION_SECRET, use it for all sensitive session data

## Known Bugs

**League Membership Inconsistency on Join:**
- Symptoms: User joins league → league_memberships table gets record → but subsequent API calls may still see user as non-member due to race conditions in transaction
- Files: `server/api/leagues/[id]/join.post.ts` (182 lines), `server/api/leagues/join-by-token/[token].post.ts` (176 lines)
- Trigger: Rapid clicks on join button or immediate page navigation after joining
- Workaround: Refresh page after joining to force fresh data fetch
- Root cause: No transaction wrapping the user/player/membership creation - three separate inserts can be partially completed if one fails

**Admin Panel Fields Not Matching Schema:**
- Symptoms: Admin can edit leagues but can't see/modify `rules`, `shareToken`, or `createdAt` fields; matches editor missing game-specific fields for The Old World and MESBG
- Files: Admin components (see ADMIN_DATA_COVERAGE_ANALYSIS.md), `server/api/admin/` endpoints
- Trigger: User opens admin league/match editors
- Workaround: Direct database manipulation for rules and custom data
- Impact: Game system-specific match data (casualties, army values, scenario objectives) cannot be tracked through UI

**Pairings Can Be Overwritten Without Validation:**
- Symptoms: Calling `/api/pairings/generate` twice will delete first round's pairings and create new ones, losing recorded match data
- Files: `server/api/pairings/generate.post.ts` (lines 26-43)
- Trigger: Organizer clicks "regenerate pairings" on round that already has matches recorded
- Workaround: None - data loss occurs
- Root cause: No check for existing matches before deleting pairings

## Security Considerations

**N+1 Query on League Fetch:**
- Risk: `/api/leagues` fetches all leagues, then loops to fetch rounds for each league individually (N+1 pattern)
- Files: `server/api/leagues.get.ts` (lines 14-25)
- Current mitigation: None
- Recommendations: Use JOIN query or batch load rounds in single query; add query timeout to prevent resource exhaustion

**No Rate Limiting on Auth/Login:**
- Risk: `/api/auth/callback` and `/api/auth/login` endpoints have no rate limiting - account takeover via brute force possible
- Files: `server/api/auth/callback.get.ts`, `server/api/auth/login.get.ts`
- Current mitigation: Auth0 may rate limit upstream, but not guaranteed
- Recommendations: Implement rate limiting middleware (allow 5 attempts per IP per 15 minutes); add exponential backoff

**Cross-League Data Access Not Validated Uniformly:**
- Risk: Some API routes check league membership (`requireLeagueRole`), but others only check existence of resource
- Files: `server/api/matches.get.ts`, `server/api/armies.get.ts` (need audit for missing auth checks)
- Current mitigation: Partial - some routes protected, others not consistently
- Recommendations: Create middleware that enforces league membership for all cross-league resource access; audit all fetch endpoints

**SQL Injection via Match Data Fields:**
- Risk: Match notes and custom fields are stored as user input without sanitization
- Files: `server/api/matches.post.ts`, `server/api/matches.put.ts`
- Current mitigation: Drizzle ORM parameterized queries prevent injection, but frontend validation missing
- Recommendations: Add frontend validation for match notes; implement server-side maximum length constraints

**Default Admin User Seeding:**
- Risk: Seed endpoint exists to create game systems with hard-coded admin data
- Files: `server/api/admin/seed-game-systems.post.ts`
- Current mitigation: Only accessible to admin role, but if first user gets admin, data pollution occurs
- Recommendations: Remove seed endpoint or require special token; document initial admin setup process

## Performance Bottlenecks

**Painting Leaderboard Calculation in Store Getter:**
- Problem: `paintingLeaderboard` getter in `app/stores/leagues.js` (lines 87-135) loops all players, finds armies, processes arrays every time accessed
- Files: `app/stores/leagues.js`
- Cause: No caching, computed on every access, O(n) per player to find matching army in array
- Improvement path: Memoize with timestamp-based cache invalidation; index armies by playerId; use SQL computed columns

**Frontend Fetches All User Leagues on Every Load:**
- Problem: `fetchMyLeagues()` in store makes uncached API call to `/api/leagues/my?_=${cacheBuster}` on every app init
- Files: `app/stores/leagues.js` (line 276 - includes cache buster)
- Cause: Cache buster prevents browser caching; no localStorage fallback
- Improvement path: Cache in localStorage with 5-minute TTL; only bust on explicit refresh; implement stale-while-revalidate pattern

**Swiss Pairing Algorithm Not Optimized:**
- Problem: Pairing generation recalculates statistics for all players on every generation
- Files: `app/composables/usePairings.js` (lines 53-69, BYE selection iterates all pairings)
- Cause: Linear search for previous BYEs instead of indexed lookup
- Improvement path: Index bye counts during initial load; memoize match history; pre-sort players by strength

## Fragile Areas

**Match Result Calculation - Multiple Game Systems:**
- Files: `app/composables/useMatchValidation.js`, `app/composables/useMatchResults.js`
- Why fragile: Different game systems (40k victory points, The Old World percentages, MESBG scenario) have entirely different validation rules crammed into switch statements with no clear extension point
- Safe modification: Extract game-system-specific validation to strategy pattern or plugin system before adding new game system
- Test coverage: Unit tests exist for some functions but not all game-system branches (TOW percentage calc missing tests)

**League Join Process:**
- Files: `server/api/leagues/[id]/join.post.ts`, `server/api/leagues/join-by-token/[token].post.ts`, `app/stores/leagues.js` (join action)
- Why fragile: Creates user → player → membership across multiple tables with no transaction. Network failure mid-way leaves orphaned records. League membership validation then checks only league_memberships table
- Safe modification: Wrap all three inserts in database transaction; add cascade delete rules; add idempotency token
- Test coverage: No integration tests for join race conditions; manual testing only

**Pairing Validation Logic:**
- Files: `app/composables/usePairings.js`, `server/api/pairings/generate.post.ts`
- Why fragile: Checks for existing pairings (`hasPairing`) use linear search; BYE selection has no seed control making tests flaky; no validation that players exist in league
- Safe modification: Add comprehensive validation endpoint before generate; make random BYE selection deterministic with seed parameter
- Test coverage: `usePairings.js` not covered by tests; generate endpoint has no validation tests

**Admin Panel Form Routing:**
- Files: `app/pages/admin/` (various manager pages), `app/components/admin/` (form components)
- Why fragile: Each resource type (GameSystem, Faction, Mission, Match) has separate form component with duplicated validation logic
- Safe modification: Extract common form patterns to generic FormBuilder component; centralize validation schemas
- Test coverage: No admin panel component tests; forms tested only through manual E2E testing

## Scaling Limits

**Database Transactions on Large League Join:**
- Current capacity: No explicit transaction limits, but Neon serverless may timeout on complex multi-insert operations
- Limit: If league has 100+ players and complex league-settings, join operation with validation could exceed statement timeout
- Scaling path: Implement job queue for join operations; pre-compute league player count; add async membership validation

**Pairings Generation Algorithm Complexity:**
- Current capacity: Swiss algorithm O(n²) for pairing calculation works for leagues up to ~200 players
- Limit: At 500+ players, pairing generation becomes UI-blocking and database-heavy (multiple round-trip queries)
- Scaling path: Move algorithm to backend, implement incremental BYE selection, batch pairing queries, add progress indication

**N+1 Query Pattern in League List:**
- Current capacity: Loads all leagues + individual round fetches acceptable up to ~50 leagues
- Limit: At 200+ leagues, `/api/leagues` endpoint causes database connection pool saturation
- Scaling path: Implement pagination; add round aggregation in single query; cache league lists with invalidation

**Painting Statistics Calculations:**
- Current capacity: Leaderboard calculations fast up to ~100 armies per league
- Limit: At 500+ armies, calculating painted percentages for leaderboard freezes UI (all computed in getter)
- Scaling path: Pre-compute painting statistics in database during match save; update incrementally; add memoization

## Scaling Limits

**Multi-League Architecture Partially Implemented:**
- Current capacity: Schema supports multiple leagues per user, but data access patterns still assume single-league context
- Limit: If user has 20+ leagues, store state management becomes complex; switching leagues requires full data reload
- Scaling path: Implement lazy-loaded league state; add league-specific caching; remove global game-systems state (duplicate per league load)

## Dependencies at Risk

**Drizzle ORM Version Lock:**
- Risk: Using `drizzle-orm@0.44.6` with newer migration tools (drizzle-kit@0.31.5) - version mismatch could cause schema drift
- Impact: Migrations fail silently; schema state becomes unreliable; data validation breaks
- Migration plan: Align versions quarterly; test migrations in staging before production; document migration contract

**Neon Serverless Dependency:**
- Risk: Entire database layer depends on Neon's `@netlify/neon` integration
- Impact: If Neon service degrades, all database operations fail; no fallback connection strategy
- Migration plan: Document Neon fallback procedure; implement retry logic with exponential backoff; test failover scenarios

**Auth0 Integration Brittle:**
- Risk: Custom role extraction via auth0 Actions and namespace claims; if Auth0 rule triggers fail, role defaults to 'user'
- Impact: Organizers lose admin capabilities; silent permission loss
- Migration plan: Log all role extraction failures; add audit trail for role changes; implement fallback role check

## Missing Critical Features

**No Audit Trail:**
- Problem: No tracking of who changed what in leagues, matches, or pairings. If organizer makes mistake, no history to rollback
- Blocks: Data integrity verification, compliance reporting, debugging user issues
- Files affected: All mutation endpoints (`leagues.put.ts`, `matches.put.ts`, `pairings/generate.post.ts`)

**No League Backup/Export:**
- Problem: No way to export league data to CSV/JSON for backup or external analysis
- Blocks: Data protection, analytics, migration to other systems
- Files: `app/composables/useDataExport.js` exists but exports only armies/results, not full league state

**No Webhook System:**
- Problem: No way for external systems to be notified when matches complete, pairings generated, or round advances
- Blocks: Third-party integrations, automated notifications to Discord/Slack
- Files: None exist

**Incomplete Game System Support:**
- Problem: Admin can create game systems but The Old World and MESBG-specific fields not fully integrated into match UI
- Blocks: Non-40K leagues cannot properly track casualty data, scenario objectives
- Files: `ADMIN_DATA_COVERAGE_ANALYSIS.md` documents fields at 55% coverage for match type

## Test Coverage Gaps

**No Frontend Composable Tests for Error Paths:**
- What's not tested: Network errors, API 401/403 responses, missing data in API responses in composables
- Files: `tests/unit/composables/` - existing tests only happy paths
- Risk: App crashes silently on network issues; no graceful degradation
- Priority: **High** - affects user experience on unreliable networks

**No Admin Panel Component Tests:**
- What's not tested: Admin form submissions, validation, async data loading, edit/delete flows
- Files: `app/pages/admin/`, `app/components/admin/` - zero test coverage
- Risk: Admin features break undetected; data loss possible (e.g., round deletion)
- Priority: **High** - admin operations are high-impact

**No Integration Tests for League Join:**
- What's not tested: Race conditions in join, membership creation atomicity, multiple players joining same league
- Files: `tests/integration/api/` - no join-specific test
- Risk: Orphaned records in production; users unable to join leagues sporadically
- Priority: **High** - core user flow

**No E2E Tests for Pairing + Match Flow:**
- What's not tested: Full round lifecycle - generate pairings → record matches → advance round → calculate standings
- Files: `tests/e2e/` probably minimal
- Risk: Round structure could silently break; matches not counted properly
- Priority: **Medium** - discovered in manual testing

**Swiss Algorithm Tests Missing Game-Specific Cases:**
- What's not tested: Pairing with BYE, rematch prevention, tiebreaker ordering (points differential vs head-to-head)
- Files: `app/composables/usePairings.js` has no test file
- Risk: Unfair pairings could occur for complex leagues
- Priority: **Medium** - affects league fairness

**No Database Constraint Tests:**
- What's not tested: Cascade delete behavior, foreign key integrity, unique constraint violations
- Files: Tests don't verify schema constraints
- Risk: Silent data corruption if schema assumptions violated
- Priority: **Medium** - data integrity risk

---

## Summary Priority Matrix

| Area | Impact | Effort | Priority |
|------|--------|--------|----------|
| Session encryption | High | Medium | **Critical** |
| Frontend error handling | High | High | **Critical** |
| API validation middleware | High | Medium | **Critical** |
| League join transaction | High | Medium | **High** |
| Monolithic store split | Medium | High | **High** |
| TypeScript conversion | Medium | High | **High** |
| Admin panel test coverage | Medium | Medium | **High** |
| Painting leaderboard caching | Medium | Low | **Medium** |
| Pairing N+1 queries | Low | Low | **Medium** |
| Game system extension point | Low | Medium | **Medium** |

---

*Concerns audit: 2026-02-05*
