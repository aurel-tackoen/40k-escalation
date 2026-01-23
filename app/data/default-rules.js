/**
 * Default League Rules Template
 * Comprehensive markdown-formatted rules for escalation leagues
 * Game-specific and common rules separated for flexibility
 */

// Common rules shared across all game systems
const COMMON_RULES = {
  introduction: (gameSystemName) => `# League Rules & Guidelines

Welcome to the ${gameSystemName} escalation league! Please read these rules carefully to ensure a fair and enjoyable experience for all participants.

---

`,

  armyBuilding: `## Army Building

### Point Limits
- Each stage has a specific point limit (see Stage Configuration)
- Armies **must not exceed** the current stage's point limit
- Under-strength armies are allowed but not recommended

### List Submission
- Army lists must be submitted **before each stage begins**
- Late submissions may result in match forfeits
- Lists can be modified between stages, but not during a stage

### Army Composition
- Follow official army construction rules for your faction
- All models must be **WYSIWYG** (What You See Is What You Get)
- Proxies require prior approval from your opponent
- Check with the organizer regarding any restricted units or special rules

### Painting Requirements
- Armies should be painted to at least **Battle Ready** standard
- Track your painting progress in the Army Lists section
- Fully painted armies earn bonus glory (and bragging rights!)

---

`,

  matchScheduling: `### Playing Matches
- Each player must complete **at least one match per stage**
- Matches should use missions from the current game's official rules
- Both players should agree on mission, deployment, and any special rules

### Scheduling
- Matches must be completed within the stage timeframe
- Coordinate with opponents to schedule games
- Report any scheduling conflicts to the league organizer

### Disputes
- Resolve disputes through friendly discussion first
- If unresolved, contact the league organizer
- The organizer's ruling is final
- *Remember: This is about fun and community!*

---

`,

  leagueStandings: `## League Standings

### Championship
- Final standings at the end of all stages determine the league champion
- Top 3 players receive recognition and eternal glory
- Special awards may be given for painting, sportsmanship, and narrative excellence

---

`,

  sportsmanship: `## Sportsmanship & Community

### Expected Behavior
- **Be respectful** to all players, regardless of skill level
- **Communicate clearly** about rules and army interactions
- **Play fairly** and with good sportsmanship
- **Have fun!** This is a game, enjoy the hobby together

### Best Practices
- Bring dice, tape measure, and rules reference materials
- Arrive on time for scheduled matches
- Keep matches moving at a reasonable pace
- Help newer players learn the game
- Share hobby tips and painting techniques

### Code of Conduct
- Zero tolerance for cheating or intentional rules violations
- Respect the venue and leave play areas clean
- Report any issues to the league organizer promptly

---

`,

  support: `## Questions & Support

If you have any questions about these rules or need clarification:
- Contact the league organizer
- Post in the league's communication channel
- Refer to official game rules for detailed clarifications

**Good luck, have fun, and may the dice roll in your favor!** 🎲`
}

// Game-specific scoring rules
const GAME_SPECIFIC_RULES = {
  victory_points: {
    scoring: (pointsLabel, maxPoints) => `## Scoring System

### ${pointsLabel}
Each match awards ${pointsLabel} based on mission objectives:
- **Primary Objectives:** Main mission goals (typically ${Math.floor(maxPoints * 0.45)}-${Math.floor(maxPoints * 0.5)} ${pointsLabel})
- **Secondary Objectives:** Additional tactical objectives
- **Bonus Objectives:** Additional points as specified by mission

### League Points (LP)
Match results translate to League Points for standings:
- **Win:** 3 League Points
- **Draw:** 1 League Point  
- **Loss:** 0 League Points

> **Tiebreaker:** If players have equal League Points, rankings are determined by total ${pointsLabel} scored across all matches.

---

`,

    reporting: (pointsLabel) => `### Results Reporting
- Results must be reported **within 48 hours** of match completion
- Both players should verify the reported scores
- Record ${pointsLabel} scored by each player and the mission played
- Optional: Share photos or battle reports for extra community engagement!

---

`,

    standings: (pointsLabel) => `### Ranking System
1. **Primary:** Total League Points (wins/draws)
2. **Tiebreaker 1:** Total ${pointsLabel} scored
3. **Tiebreaker 2:** Head-to-head record
4. **Tiebreaker 3:** Point differential in head-to-head matches

---

`
  },

  percentage: {
    scoring: () => `## Scoring System

### Casualty-Based Victory
Matches are won by inflicting casualties on your opponent's army:
- Record the **total army value** for both players at the start
- Record the **total casualty value** inflicted by each player at the end
- Victory is determined by **margin of victory percentage**

### Victory Levels
The margin of victory determines the result:
- **Draw:** Margin < 10%
- **Minor Victory:** Margin 10-24%
- **Major Victory:** Margin 25-49%
- **Massacre:** Margin ≥ 50%

**Margin Calculation:**
\`\`\`
Margin = ((Your Casualties Inflicted - Opponent's Casualties Inflicted) / Max Army Value) × 100
\`\`\`

### League Points (LP)
Victory level translates to League Points:
- **Massacre:** 5 League Points
- **Major Victory:** 4 League Points
- **Minor Victory:** 3 League Points
- **Draw:** 1 League Point each
- **Loss:** 0 League Points

> **Tiebreaker:** If players have equal League Points, rankings are determined by total casualties inflicted across all matches.

---

`,

    reporting: () => `### Results Reporting
- Results must be reported **within 48 hours** of match completion
- Both players should verify the reported scores
- Record **army values** and **casualties inflicted** for each player
- Include the **margin of victory** and resulting victory level
- Optional: Share photos or battle reports for extra community engagement!

---

`,

    standings: () => `### Ranking System
1. **Primary:** Total League Points (based on victory levels)
2. **Tiebreaker 1:** Total casualties inflicted
3. **Tiebreaker 2:** Head-to-head record
4. **Tiebreaker 3:** Average margin of victory

---

`
  },

  scenario: {
    scoring: () => `## Scoring System

### Scenario Objectives
Each match has a unique scenario with specific objectives:
- **Primary Objective:** Scenario-specific victory condition (e.g., control objectives, kill target, etc.)
- **Casualties:** Models killed can serve as a tiebreaker
- **Special Conditions:** Some scenarios have additional victory conditions

### Determining Winner
1. **Primary:** Player who completes the scenario objective wins
2. **Tiebreaker 1:** If both or neither complete the objective, most casualties inflicted wins
3. **Tiebreaker 2:** If casualties are equal, the match is a draw

### League Points (LP)
Match results translate to League Points for standings:
- **Win:** 3 League Points
- **Draw:** 1 League Point  
- **Loss:** 0 League Points

> **Tiebreaker:** If players have equal League Points, rankings are determined by total wins, then total casualties inflicted.

---

`,

    reporting: () => `### Results Reporting
- Results must be reported **within 48 hours** of match completion
- Both players should verify the reported scores
- Record the **scenario objective** and whether each player completed it
- Record **casualties inflicted** by each player (for tiebreaker purposes)
- Include the mission/scenario played
- Optional: Share photos or battle reports for extra community engagement!

---

`,

    standings: () => `### Ranking System
1. **Primary:** Total League Points (wins/draws)
2. **Tiebreaker 1:** Total objectives completed
3. **Tiebreaker 2:** Head-to-head record
4. **Tiebreaker 3:** Total casualties inflicted

---

`
  }
}

/**
 * Generate complete league rules based on game system
 * @param {Object} gameSystem - Game system object with matchType and matchConfig
 * @returns {string} Complete markdown-formatted rules
 */
export function generateLeagueRules(gameSystem) {
  if (!gameSystem || !gameSystem.matchType) {
    throw new Error('Invalid game system: matchType is required')
  }

  const { name, matchType, matchConfig } = gameSystem
  const specificRules = GAME_SPECIFIC_RULES[matchType]

  if (!specificRules) {
    throw new Error(`Unknown match type: ${matchType}`)
  }

  // Build the complete rules document
  let rules = COMMON_RULES.introduction(name)

  // Add game-specific scoring rules
  if (matchType === 'victory_points') {
    const pointsLabel = matchConfig.pointsLabel || 'Victory Points'
    const maxPoints = matchConfig.pointsRange?.max || 100
    rules += specificRules.scoring(pointsLabel, maxPoints)
  } else {
    rules += specificRules.scoring()
  }

  // Add common army building rules
  rules += COMMON_RULES.armyBuilding

  // Add match requirements header
  rules += '## Match Requirements\n\n'

  // Add game-specific reporting rules
  if (matchType === 'victory_points') {
    const pointsLabel = matchConfig.pointsLabel || 'Victory Points'
    rules += specificRules.reporting(pointsLabel)
  } else {
    rules += specificRules.reporting()
  }

  // Add common scheduling rules
  rules += COMMON_RULES.matchScheduling

  // Add game-specific standings rules
  if (matchType === 'victory_points') {
    const pointsLabel = matchConfig.pointsLabel || 'Victory Points'
    rules += specificRules.standings(pointsLabel)
  } else {
    rules += specificRules.standings()
  }

  // Add common standings info
  rules += COMMON_RULES.leagueStandings

  // Add common sportsmanship rules
  rules += COMMON_RULES.sportsmanship

  // Add common support section
  rules += COMMON_RULES.support

  return rules
}

/**
 * Legacy default rules (for backward compatibility)
 * Uses Warhammer 40k scoring as default
 */
export const DEFAULT_LEAGUE_RULES = generateLeagueRules({
  name: 'Warhammer 40,000',
  matchType: 'victory_points',
  matchConfig: {
    pointsLabel: 'Victory Points',
    pointsRange: { min: 0, max: 100 }
  }
})
