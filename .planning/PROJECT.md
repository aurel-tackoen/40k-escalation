# 40k Escalation League Manager

## What This Is

A web app for managing Warhammer 40,000 escalation leagues. Organizers create leagues with progression phases (points escalate over time), players track matches and army painting progress, and everyone can view standings and statistics.

## Core Value

**Players can easily track their league progress and see where they stand.**

If matches can't be recorded and standings can't be viewed, nothing else matters.

## Requirements

### Validated

- ✓ Auth0 authentication with role-based access (admin, organizer, player) — existing
- ✓ Multi-league support with game system configuration — existing
- ✓ League creation with customizable settings and share tokens — existing
- ✓ Player management with army registration — existing
- ✓ Match recording with mission selection and scoring — existing
- ✓ Standings calculation with tiebreakers — existing
- ✓ Phase structure with point escalation — v0.1 (renamed from Round)
- ✓ Pairing generation (random, swiss) — existing
- ✓ Painting score tracking with photo evidence — existing
- ✓ Admin panel for game systems, factions, missions — existing
- ✓ Public league pages for non-members — existing
- ✓ "Phase" terminology throughout app (database, API, store, UI) — v0.1

### Active

(None — next milestone not yet planned)

### Out of Scope

- Mobile native app — web-first, responsive design sufficient for now
- Real-time updates — polling/refresh acceptable for league pace
- Tournament brackets — this is for escalation leagues, not single-day events

## Context

**Existing codebase:** Nuxt 4 + Vue 3 frontend, Netlify serverless backend, Drizzle ORM with Neon PostgreSQL, Auth0 authentication.

**Shipped v0.1:** Complete Round-to-Phase terminology rename across all layers. 95 files modified, 7,808 lines added. All 14 requirements validated. 210 tests passing.

**Known tech debt:**
- 48 pre-existing test failures in UserMenu.test.ts (Pinia store initialization)
- Internal admin variable names still use "round" (roundForm, showRoundModal) — intentional for code stability

## Constraints

- **Tech stack**: Must stay on Nuxt 4 / Vue 3 / Drizzle / Netlify — no framework changes
- **Data migration**: PostgreSQL ALTER TABLE RENAME used for zero-downtime migrations
- **Git workflow**: Never commit to main directly — always use a feature branch per milestone
- **Deployment**: All work stays local until the final phase of a milestone. The last phase handles push, PR, merge, and deploy. This prevents in-progress migrations/changes from hitting production

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| "Phase" over "Stage" | Fits escalation league terminology better | ✓ Good — implemented in v0.1 |
| ALTER TABLE RENAME for migration | Zero-downtime, preserves data and FK relationships | ✓ Good — clean migration |
| Preserve internal variable names | Code stability, only user-visible text matters | ✓ Good — no regressions |
| Preserve match.round property | Tournament match internals, separate from phase terminology | ✓ Good — clear separation |
| Preserve firstRoundPairingMethod | Tournament pairing settings, not phase terminology | ✓ Good — correct distinction |

---
*Last updated: 2026-02-06 after v0.1 milestone*
