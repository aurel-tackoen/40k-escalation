// Unit types organized by game system
export const unitTypesBySystem = {
  '40k': [
    // Warhammer 40,000 Force Organization Chart
    { name: 'HQ', category: 'Command', displayOrder: 1 },
    { name: 'Troops', category: 'Core', displayOrder: 2 },
    { name: 'Elites', category: 'Specialist', displayOrder: 3 },
    { name: 'Fast Attack', category: 'Specialist', displayOrder: 4 },
    { name: 'Heavy Support', category: 'Specialist', displayOrder: 5 },
    { name: 'Flyer', category: 'Specialist', displayOrder: 6 },
    { name: 'Dedicated Transport', category: 'Support', displayOrder: 7 },
    { name: 'Fortification', category: 'Support', displayOrder: 8 },
    { name: 'Lord of War', category: 'Command', displayOrder: 9 }
  ],

  'aos': [
    // Age of Sigmar Battlefield Roles
    { name: 'Leaders', category: 'Command', displayOrder: 1 },
    { name: 'Battleline', category: 'Core', displayOrder: 2 },
    { name: 'Conditional Battleline', category: 'Core', displayOrder: 3 },
    { name: 'Artillery', category: 'Support', displayOrder: 4 },
    { name: 'Behemoth', category: 'Elite', displayOrder: 5 },
    { name: 'Other Units', category: 'Standard', displayOrder: 6 },
    { name: 'Unique', category: 'Special', displayOrder: 7 },
    { name: 'Reinforcements', category: 'Support', displayOrder: 8 }
  ],

  'tow': [
    // The Old World Army Organization
    { name: 'Lords', category: 'Command', displayOrder: 1 },
    { name: 'Heroes', category: 'Command', displayOrder: 2 },
    { name: 'Core', category: 'Core', displayOrder: 3 },
    { name: 'Special', category: 'Elite', displayOrder: 4 },
    { name: 'Rare', category: 'Elite', displayOrder: 5 },
    { name: 'Mercenaries', category: 'Special', displayOrder: 6 },
    { name: 'Allies', category: 'Special', displayOrder: 7 }
  ],

  'mesbg': [
    // Middle-Earth Strategy Battle Game Unit Types
    { name: 'Heroes of Legend', category: 'Command', displayOrder: 1 },
    { name: 'Heroes of Valour', category: 'Command', displayOrder: 2 },
    { name: 'Heroes of Fortitude', category: 'Command', displayOrder: 3 },
    { name: 'Minor Heroes', category: 'Command', displayOrder: 4 },
    { name: 'Independent Heroes', category: 'Command', displayOrder: 5 },
    { name: 'Warriors', category: 'Core', displayOrder: 6 },
    { name: 'Monsters', category: 'Elite', displayOrder: 7 },
    { name: 'Siege Engines', category: 'Support', displayOrder: 8 },
    { name: 'War Beasts', category: 'Elite', displayOrder: 9 }
  ],

  'hh': [
    // The Horus Heresy Age of Darkness Force Organization
    { name: 'HQ', category: 'Command', displayOrder: 1 },
    { name: 'Troops', category: 'Core', displayOrder: 2 },
    { name: 'Elites', category: 'Specialist', displayOrder: 3 },
    { name: 'Fast Attack', category: 'Specialist', displayOrder: 4 },
    { name: 'Heavy Support', category: 'Specialist', displayOrder: 5 },
    { name: 'Lord of War', category: 'Command', displayOrder: 6 },
    { name: 'Primarch', category: 'Command', displayOrder: 7 },
    { name: 'Dedicated Transport', category: 'Support', displayOrder: 8 },
    { name: 'Fortification', category: 'Support', displayOrder: 9 },
    { name: 'Legion Specific', category: 'Special', displayOrder: 10 }
  ]
}

// Helper function to get unit types for a specific game system
export function getUnitTypesForSystem(gameSystemShortName) {
  return unitTypesBySystem[gameSystemShortName] || []
}

// Helper function to get all unit types flattened with game system info
export function getAllUnitTypesWithSystem() {
  const allUnitTypes = []

  Object.entries(unitTypesBySystem).forEach(([gameSystemShortName, unitTypes]) => {
    unitTypes.forEach(unitType => {
      allUnitTypes.push({
        ...unitType,
        gameSystemShortName
      })
    })
  })

  return allUnitTypes
}
