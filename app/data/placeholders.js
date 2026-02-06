// Game-specific placeholder text for forms
// This provides contextually appropriate examples based on the selected game system

export const placeholders = {
  // Warhammer 40,000
  '40k': {
    leagueName: 'e.g., Winter Crusade 2025',
    armyName: "e.g., Emperor's Fist",
    armyNameHint: '"Emperor\'s Fist - Phase 1", "Storm Wardens - 500pts"',
    armyExamples: '"Emperor\'s Fist", "The Crimson Crusade", "Task Force Omega"',
    unitName: 'e.g., Tactical Squad, Intercessor Squad',
    roundName: 'e.g., Combat Patrol (500pts)',
    scenarioObjective: 'Describe mission objective (e.g., "Purge the Enemy", "Take and Hold")'
  },

  // Age of Sigmar
  'aos': {
    leagueName: 'e.g., Storm of Sigmar Campaign 2025',
    armyName: 'e.g., The Bloodbound Reavers',
    armyNameHint: '"Bloodbound Reavers - Phase 1", "Stormcast Eternals - 500pts"',
    armyExamples: '"Bloodbound Reavers", "The Golden Legion", "Nighthaunt Host"',
    unitName: 'e.g., Blood Warriors, Liberators',
    roundName: 'e.g., Vanguard (500pts)',
    scenarioObjective: 'Describe battleplan objective (e.g., "Steal the Prize", "Battle for the Pass")'
  },

  // The Old World
  'tow': {
    leagueName: 'e.g., Return to the Old World 2025',
    armyName: 'e.g., The Iron Legion',
    armyNameHint: '"The Iron Legion - Phase 1", "Vampire Counts - 500pts"',
    armyExamples: '"The Iron Legion", "Skaven Horde", "High Elf Spearhost"',
    unitName: 'e.g., Spearmen Regiment, Black Knights',
    roundName: 'e.g., Border Patrol (500pts)',
    scenarioObjective: 'Describe scenario objective (e.g., "Pitched Battle", "Border Dispute")'
  },

  // Middle-Earth Strategy Battle Game
  'mesbg': {
    leagueName: 'e.g., War of the Ring Campaign 2025',
    armyName: 'e.g., Rangers of the North',
    armyNameHint: '"Rangers of the North - Phase 1", "Mordor Orcs - 300pts"',
    armyExamples: '"Rangers of the North", "Moria Goblins", "Riders of Rohan"',
    unitName: 'e.g., Warriors of Minas Tirith, Uruk-hai Scouts',
    roundName: 'e.g., Skirmish (300pts)',
    scenarioObjective: 'e.g., "Control the Ring", "Defend the Village", "Escape the Caves"'
  },

  // The Horus Heresy
  'hh': {
    leagueName: 'e.g., Age of Darkness Campaign 2025',
    armyName: 'e.g., Sons of Horus 7th Company',
    armyNameHint: '"Sons of Horus 7th Company - Phase 1", "Imperial Fists - 500pts"',
    armyExamples: '"Sons of Horus 7th Company", "Death Guard Plague Marines", "Blood Angels Host"',
    unitName: 'e.g., Legion Tactical Squad, Cataphractii Terminators',
    roundName: 'e.g., Zone Mortalis (500pts)',
    scenarioObjective: 'Describe mission objective (e.g., "Onslaught", "The Price of Betrayal")'
  }
}

// Generic fallback placeholders (used when game system not selected)
export const genericPlaceholders = {
  leagueName: 'e.g., Winter Escalation League 2025',
  armyName: 'e.g., My Army Name',
  armyNameHint: '"My Army Name - Phase 1", "Battle Force - 500pts"',
  armyExamples: '"Strike Force Alpha", "The Warband", "Battle Group One"',
  unitName: 'e.g., Infantry Squad, Elite Unit',
  roundName: 'e.g., 500 Points',
  scenarioObjective: 'Describe the scenario objective...'
}

// Helper function to get placeholders for a game system
export function getPlaceholders(gameSystemShortName) {
  return placeholders[gameSystemShortName] || genericPlaceholders
}

// Helper function to get placeholder by key for a game system
export function getPlaceholder(gameSystemShortName, key) {
  const systemPlaceholders = placeholders[gameSystemShortName] || genericPlaceholders
  return systemPlaceholders[key] || genericPlaceholders[key] || ''
}
