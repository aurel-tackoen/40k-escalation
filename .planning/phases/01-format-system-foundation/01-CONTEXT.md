# Phase 1: Format System Foundation - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the format registry and integrate format selection into league creation. Organizers pick a game system then a format, and that choice drives the app's behavior (match forms, scoring, progression). Includes migrating 2 existing leagues to the new system.

Game-specific match recording, standings logic, and progression UIs are separate phases — this phase builds the foundation they plug into.

</domain>

<decisions>
## Implementation Decisions

### Format selection flow
- Two-step: organizer picks game system first, then format options appear based on that system
- Format step always shown, even for game systems with only one format (HH)
- Each format shows a name + short description of what it enables (e.g., "Path to Glory — Campaign Points scoring, unit progression, painting bonuses")
- Format selection is required — cannot create a league without choosing one

### Existing league migration
- Manual migration script for 2 specific leagues:
  - 40k league → `40k-matched` (data stays as-is, already VP-based)
  - Old World league → `ow-ptg` (derive CP from existing `marginOfVictory`: Massacre→3, Major Victory→2, Minor Victory→2, Draw→1)
- Painting bonus (+1 CP) applied retroactively to past OW matches — derive from existing painting data in the app
- Player stats (wins/losses/draws/totalPoints) fully recalculated to match the new CP-based system — clean slate
- Not a user-facing feature — one-time migration script run during Phase 1

### Format display in-app
- Subtle badge/tag near the league name, not the main focus
- Badge visible both inside the league page AND in the league list/browse view
- Badge shows full format name: "Path to Glory", "Matched Play", "Crusade" (not abbreviations)
- All leagues use the same card style — no visual distinction between campaign and classic formats beyond the badge text

### Format immutability
- Format shown as read-only in league settings with a lock indicator
- Format CAN be changed if no matches have been recorded yet (editable in settings before first match)
- Once a match is recorded, format locks permanently with an explanation message ("Format locked — matches have been recorded")
- No admin override needed — the before-first-match window is sufficient

### Claude's Discretion
- Format registry architecture (how configs are structured internally)
- Database schema for format storage (column type, enum vs varchar)
- API endpoint design for format lookup
- Exact badge styling and positioning

</decisions>

<specifics>
## Specific Ideas

- Migration mapping for OW: Massacre→3 CP, Major Victory→2 CP, Minor Victory→2 CP, Draw→1 CP, Loss→0 CP
- Painting bonus derived from existing `painting_progress` data
- Format descriptions should help organizers who don't know the difference understand what they're choosing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-format-system-foundation*
*Context gathered: 2026-02-06*
