# Requirements: 40k Escalation League Manager

**Defined:** 2026-02-06
**Core Value:** Players can easily track their league progress and see where they stand

## v0.2 Requirements

Requirements for game-specific league formats with progression tracking.

### League Format System

- [ ] **FMT-01**: Organizer selects a league format when creating a league (game system + format type)
- [ ] **FMT-02**: Each game system defines its available formats (OW: PtG/Matched, 40k: Crusade/Matched, AoS: PtG/Matched, HH: Matched)
- [ ] **FMT-03**: League format determines which scoring rules, match fields, and progression features are active
- [ ] **FMT-04**: Game-specific default scoring applied automatically (no organizer configuration needed)

### Match Recording (Game-Specific)

- [ ] **MTH-01**: Old World PtG match: opponent, mission, result (crushing victory/victory/draw/loss), auto-calculated CP, painting bonus tracking, 2-game CP cap per phase
- [ ] **MTH-02**: Old World Matched: opponent, mission, VP scored, auto-calculated TP (0-6 scale from VP differential)
- [ ] **MTH-03**: 40k Crusade match: opponent, mission, result, XP earned per unit, "Marked for Greatness" unit selection
- [ ] **MTH-04**: 40k Matched: opponent, mission, VP scored (primary + secondary + painting), result
- [ ] **MTH-05**: AoS PtG match: opponent, mission, result (major/minor victory, draw), favoured warriors selection, renown earned per unit, glory earned
- [ ] **MTH-06**: AoS Matched: opponent, mission, VP scored, battle tactics completed, result (major/minor/draw)
- [ ] **MTH-07**: HH Matched: opponent, mission, VP scored (primary + secondary), result

### Standings & Scoring

- [ ] **STD-01**: Old World PtG standings: total CP with 2-game cap enforcement, VP tiebreaker
- [ ] **STD-02**: Old World Matched standings: total TP (0-6 scale), tiebreakers (total VP → secondary VP → generals slain)
- [ ] **STD-03**: 40k Crusade standings: Win/Loss/Draw record, VP tiebreaker
- [ ] **STD-04**: 40k Matched standings: Win/Loss/Draw record, total VP tiebreaker
- [ ] **STD-05**: AoS PtG standings: total glory points earned, VP tiebreaker
- [ ] **STD-06**: AoS Matched standings: 3/1/0 points, tiebreakers (VP → battle tactics count)
- [ ] **STD-07**: HH Matched standings: 2/1/0 points (Win/Draw/Loss), VP tiebreaker

### Unit Progression — Old World Path to Glory

- [ ] **OWP-01**: Player manages a roster of units (name, type: infantry/cavalry/character)
- [ ] **OWP-02**: Track current XP per unit after each game (manual entry)
- [ ] **OWP-03**: Record veteran abilities gained (selected from known ability list)
- [ ] **OWP-04**: Record battlefield losses results (ability loss, XP loss, or lesson learned)
- [ ] **OWP-05**: Track character progression separately (Seasoned Commander table results)
- [ ] **OWP-06**: Record character death/promotion results (Dead, Badly Wounded, Lesson Learned)
- [ ] **OWP-07**: Army roster view showing all units with their current XP, abilities, and status

### Unit Progression — 40k Crusade

- [ ] **CRU-01**: Player manages an Order of Battle (unit name, points, crusade points)
- [ ] **CRU-02**: Track Supply Limit and Supply Used
- [ ] **CRU-03**: Track XP per unit, with automatic rank calculation (Battle-ready → Blooded → Battle-hardened → Heroic → Legendary)
- [ ] **CRU-04**: Record Battle Honours gained (Battle Traits, Weapon Modifications, Crusade Relics)
- [ ] **CRU-05**: Record Battle Scars (from failed Out of Action tests)
- [ ] **CRU-06**: Track Requisition Points (starting 5, max 10, +1 per battle)
- [ ] **CRU-07**: Record requisition usage (Increase Supply, Renowned Heroes, Repair, etc.)
- [ ] **CRU-08**: Order of Battle view showing all units with ranks, honours, scars, crusade points

### Unit Progression — AoS Path to Glory

- [ ] **APG-01**: Player manages an Order of Battle (starting 1000pts, units + warlord)
- [ ] **APG-02**: Track Renown Points per unit, with automatic rank calculation (Aspiring → Elite → Mighty → Legendary)
- [ ] **APG-03**: Record Hero Path selection (Warrior/Leader/Mage/Devout) and abilities gained at each rank
- [ ] **APG-04**: Track Glory Points (earned per battle, spent to add/reinforce units)
- [ ] **APG-05**: Record enhancements gained through quests
- [ ] **APG-06**: Track active quests and completion
- [ ] **APG-07**: Order of Battle view showing all units with ranks, path progress, enhancements

## Future Requirements

Deferred to later milestones.

- **FUT-01**: Organizer-configurable scoring overrides (custom point values per result)
- **FUT-02**: HH campaign/progression format (if GW releases official rules)
- **FUT-03**: Cross-league standings (player rankings across multiple leagues)
- **FUT-04**: Army list builder integration (points validation against game system rules)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rules engine / dice rolling | App is a tracking tool, not a rules engine. Players handle rules at the table. |
| Auto-calculated XP from match data | Manual entry chosen — simpler, players know the rules |
| Custom homebrew campaign formats | Scope too broad — support official formats only for now |
| Army list validation | Would require maintaining full game system data — too complex |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FMT-01 | Phase 1 | Pending |
| FMT-02 | Phase 1 | Pending |
| FMT-03 | Phase 1 | Pending |
| FMT-04 | Phase 1 | Pending |
| MTH-01 | Phase 2 | Pending |
| MTH-02 | Phase 2 | Pending |
| MTH-03 | Phase 2 | Pending |
| MTH-04 | Phase 2 | Pending |
| MTH-05 | Phase 2 | Pending |
| MTH-06 | Phase 2 | Pending |
| MTH-07 | Phase 2 | Pending |
| STD-01 | Phase 3 | Pending |
| STD-02 | Phase 3 | Pending |
| STD-03 | Phase 3 | Pending |
| STD-04 | Phase 3 | Pending |
| STD-05 | Phase 3 | Pending |
| STD-06 | Phase 3 | Pending |
| STD-07 | Phase 3 | Pending |
| OWP-01 | Phase 4 | Pending |
| OWP-02 | Phase 4 | Pending |
| OWP-03 | Phase 4 | Pending |
| OWP-04 | Phase 4 | Pending |
| OWP-05 | Phase 4 | Pending |
| OWP-06 | Phase 4 | Pending |
| OWP-07 | Phase 4 | Pending |
| CRU-01 | Phase 5 | Pending |
| CRU-02 | Phase 5 | Pending |
| CRU-03 | Phase 5 | Pending |
| CRU-04 | Phase 5 | Pending |
| CRU-05 | Phase 5 | Pending |
| CRU-06 | Phase 5 | Pending |
| CRU-07 | Phase 5 | Pending |
| CRU-08 | Phase 5 | Pending |
| APG-01 | Phase 6 | Pending |
| APG-02 | Phase 6 | Pending |
| APG-03 | Phase 6 | Pending |
| APG-04 | Phase 6 | Pending |
| APG-05 | Phase 6 | Pending |
| APG-06 | Phase 6 | Pending |
| APG-07 | Phase 6 | Pending |

**Coverage:**
- v0.2 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 — traceability updated with v0.2 phase mappings*
