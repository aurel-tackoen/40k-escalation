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
- ✓ Round/phase structure with point escalation — existing
- ✓ Pairing generation (random, swiss) — existing
- ✓ Painting score tracking with photo evidence — existing
- ✓ Admin panel for game systems, factions, missions — existing
- ✓ Public league pages for non-members — existing

### Active

- [ ] Rename "Round" to "Phase" throughout the application to avoid confusion with Warhammer game rounds

### Out of Scope

- Mobile native app — web-first, responsive design sufficient for now
- Real-time updates — polling/refresh acceptable for league pace
- Tournament brackets — this is for escalation leagues, not single-day events

## Context

**Existing codebase:** Nuxt 4 + Vue 3 frontend, Netlify serverless backend, Drizzle ORM with Neon PostgreSQL, Auth0 authentication. ~1700 lines of codebase documentation in `.planning/codebase/`.

**Terminology issue:** "Round" is a loaded term in Warhammer 40k — it refers to game turns (battle rounds). Using "Round" for league progression periods confuses users. Renaming to "Phase" aligns with escalation league terminology and eliminates ambiguity.

**Scope of rename:** Database column, API endpoints, store state, component text, URL routes. Need to ensure backwards compatibility for existing data.

## Constraints

- **Tech stack**: Must stay on Nuxt 4 / Vue 3 / Drizzle / Netlify — no framework changes
- **Data migration**: Existing leagues have rounds; migration must preserve data
- **URL stability**: If routes change, consider redirects for bookmarked links

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| "Phase" over "Stage" | Fits escalation league terminology better | — Pending |

---
*Last updated: 2026-02-05 after initialization*
