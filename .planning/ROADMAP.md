# Roadmap: 40k Escalation League Manager

## Milestones

- ✅ **v0.1 Round-to-Phase Rename** — Phases 1-5 (shipped 2026-02-06) — [archive](milestones/v0.1-ROADMAP.md)
- 🚧 **v0.2 Game-Specific League Formats** — Phases 6-12 (in progress)

## Phases

<details>
<summary>✅ v0.1 Round-to-Phase Rename (Phases 1-5) — SHIPPED 2026-02-06</summary>

- [x] Phase 1: Database Schema (1/1 plans) — completed 2026-02-05
- [x] Phase 2: API Layer (2/2 plans) — completed 2026-02-05
- [x] Phase 3: State Management (2/2 plans) — completed 2026-02-05
- [x] Phase 4: User Interface (4/4 plans) — completed 2026-02-06
- [x] Phase 5: Test Verification (1/1 plans) — completed 2026-02-06

</details>

### 🚧 v0.2 Game-Specific League Formats (In Progress)

**Milestone Goal:** Make each league behave differently depending on the game system and format, with full progression tracking for campaign formats.

- [ ] **Phase 6: Format System Foundation** — Format registry, league creation integration, format-driven behavior routing
- [ ] **Phase 7: Game-Specific Match Recording** — All 7 match types across 4 game systems with format-aware forms
- [ ] **Phase 8: Game-Specific Standings & Scoring** — All 7 scoring systems with format-driven calculations and tiebreakers
- [ ] **Phase 9: Old World Path to Glory Progression** — Unit rosters, XP tracking, veteran abilities, battlefield losses, character death
- [ ] **Phase 10: 40k Crusade Progression** — Order of Battle, XP/ranks, battle honours/scars, requisition points
- [ ] **Phase 11: AoS Path to Glory Progression** — Order of Battle, renown/ranks, hero paths, glory points, quests
- [ ] **Phase 12: Release & Deploy** — Push branch, create PR, merge to main, deploy to production

## Phase Details

### Phase 6: Format System Foundation
**Goal**: Organizers can create leagues with a specific game format, and the app routes behavior based on that format
**Depends on**: Phase 5 (v0.1 complete)
**Requirements**: FMT-01, FMT-02, FMT-03, FMT-04
**Success Criteria** (what must be TRUE):
  1. Organizer sees available formats (e.g., "Old World — Path to Glory", "40k — Crusade") when creating a league and must select one
  2. Each game system offers its correct format options (OW: PtG/Matched, 40k: Crusade/Matched, AoS: PtG/Matched, HH: Matched)
  3. A league's format determines which match form, scoring rules, and progression features appear throughout the app
  4. Default scoring rules are automatically applied when a format is selected — organizer does not need to configure scoring manually
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Game-Specific Match Recording
**Goal**: Players can record matches using the correct fields for their league's game system and format
**Depends on**: Phase 6
**Requirements**: MTH-01, MTH-02, MTH-03, MTH-04, MTH-05, MTH-06, MTH-07
**Success Criteria** (what must be TRUE):
  1. Old World PtG match form shows opponent, mission, result (crushing victory/victory/draw/loss), and enforces the 2-game CP cap per phase
  2. Old World Matched and HH Matched match forms collect VP scored and auto-calculate tournament points from VP differential
  3. 40k Crusade match form includes per-unit XP earned and "Marked for Greatness" unit selection
  4. AoS PtG match form includes favoured warriors selection, per-unit renown earned, and glory earned
  5. 40k Matched and AoS Matched match forms collect VP scored with their game-specific secondary scoring fields
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

### Phase 8: Game-Specific Standings & Scoring
**Goal**: Each league displays standings calculated correctly for its game format, with proper tiebreakers
**Depends on**: Phase 7
**Requirements**: STD-01, STD-02, STD-03, STD-04, STD-05, STD-06, STD-07
**Success Criteria** (what must be TRUE):
  1. Old World PtG standings rank by total CP (with 2-game cap enforced) and use VP as tiebreaker
  2. Old World Matched standings rank by TP (0-6 scale) with tiebreakers: total VP, secondary VP, generals slain
  3. 40k Crusade and 40k Matched standings rank by W/L/D record and total VP tiebreaker respectively
  4. AoS PtG standings rank by glory points with VP tiebreaker; AoS Matched uses 3/1/0 points with VP and battle tactics tiebreakers
  5. HH Matched standings use 2/1/0 point system (Win/Draw/Loss) with VP tiebreaker
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Old World Path to Glory Progression
**Goal**: Old World PtG players can manage unit rosters with XP, veteran abilities, battlefield losses, and character death tracking
**Depends on**: Phase 7
**Requirements**: OWP-01, OWP-02, OWP-03, OWP-04, OWP-05, OWP-06, OWP-07
**Success Criteria** (what must be TRUE):
  1. Player can create and manage a roster of named units with type (infantry/cavalry/character)
  2. Player can record XP earned per unit after each game and select veteran abilities from the known ability list
  3. Player can record battlefield loss results (ability loss, XP loss, or lesson learned) and character-specific outcomes (Dead, Badly Wounded, Lesson Learned)
  4. Player can track Seasoned Commander table results for characters separately from regular units
  5. Player can view their full army roster showing each unit's current XP, abilities, and status at a glance
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD
- [ ] 09-03: TBD

### Phase 10: 40k Crusade Progression
**Goal**: 40k Crusade players can manage an Order of Battle with XP/ranks, battle honours/scars, and requisition points
**Depends on**: Phase 7
**Requirements**: CRU-01, CRU-02, CRU-03, CRU-04, CRU-05, CRU-06, CRU-07, CRU-08
**Success Criteria** (what must be TRUE):
  1. Player can create an Order of Battle with named units showing points and crusade points, and see Supply Limit vs Supply Used
  2. Player can track XP per unit with automatic rank progression (Battle-ready through Legendary)
  3. Player can record Battle Honours (Battle Traits, Weapon Modifications, Crusade Relics) and Battle Scars on units
  4. Player can see their Requisition Points balance (starting 5, max 10, +1 per battle) and record requisition usage (Increase Supply, Renowned Heroes, Repair, etc.)
  5. Player can view the full Order of Battle showing all units with their ranks, honours, scars, and crusade points
**Plans**: TBD

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD
- [ ] 10-03: TBD

### Phase 11: AoS Path to Glory Progression
**Goal**: AoS PtG players can manage an Order of Battle with renown/ranks, hero paths, glory points, quests, and enhancements
**Depends on**: Phase 7
**Requirements**: APG-01, APG-02, APG-03, APG-04, APG-05, APG-06, APG-07
**Success Criteria** (what must be TRUE):
  1. Player can create an Order of Battle (starting 1000pts) with named units and a designated warlord
  2. Player can track Renown Points per unit with automatic rank progression (Aspiring through Legendary) and select Hero Paths for heroes (Warrior/Leader/Mage/Devout) with rank-based abilities
  3. Player can earn and spend Glory Points to add or reinforce units in the Order of Battle
  4. Player can track active quests, mark them complete, and record enhancements gained through quests
  5. Player can view the full Order of Battle showing all units with ranks, path progress, and enhancements
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD
- [ ] 11-03: TBD

### Phase 12: Release & Deploy
**Goal**: v0.2 milestone is pushed, reviewed, merged to main, and deployed to production
**Depends on**: Phases 8, 9, 10, 11 (all feature work complete)
**Requirements**: None (delivery phase)
**Success Criteria** (what must be TRUE):
  1. All v0.2 changes are pushed to the milestone/v0.2 branch on the remote
  2. Pull request is created with a summary of all v0.2 changes
  3. PR is merged to main and production deployment succeeds
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

## Dependency Graph

```
Phase 6 (Format System)
  |
  v
Phase 7 (Match Recording)
  |
  +--> Phase 8 (Standings & Scoring)
  |
  +--> Phase 9 (OW PtG Progression)
  |
  +--> Phase 10 (40k Crusade Progression)
  |
  +--> Phase 11 (AoS PtG Progression)
  |
  v  (all of 8-11 complete)
Phase 12 (Release & Deploy)
```

Phases 9, 10, 11 can execute in any order (they are independent progression systems). Phase 8 can also execute in parallel with 9-11 since standings depend on match data (Phase 7), not progression data.

## Progress

**Execution Order:** 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database Schema | v0.1 | 1/1 | Complete | 2026-02-05 |
| 2. API Layer | v0.1 | 2/2 | Complete | 2026-02-05 |
| 3. State Management | v0.1 | 2/2 | Complete | 2026-02-05 |
| 4. User Interface | v0.1 | 4/4 | Complete | 2026-02-06 |
| 5. Test Verification | v0.1 | 1/1 | Complete | 2026-02-06 |
| 6. Format System Foundation | v0.2 | 0/TBD | Not started | - |
| 7. Game-Specific Match Recording | v0.2 | 0/TBD | Not started | - |
| 8. Game-Specific Standings & Scoring | v0.2 | 0/TBD | Not started | - |
| 9. OW Path to Glory Progression | v0.2 | 0/TBD | Not started | - |
| 10. 40k Crusade Progression | v0.2 | 0/TBD | Not started | - |
| 11. AoS Path to Glory Progression | v0.2 | 0/TBD | Not started | - |
| 12. Release & Deploy | v0.2 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-05*
*Last updated: 2026-02-06 — v0.2 roadmap created*
