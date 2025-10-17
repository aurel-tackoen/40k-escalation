// Game systems supported by the application
export const gameSystems = [
  {
    name: 'Warhammer 40,000',
    shortName: '40k',
    description: 'The grim darkness of the far future where there is only war',
    matchType: 'victory_points',
    matchConfig: {
      pointsLabel: 'Victory Points',
      pointsRange: { min: 0, max: 100 },
      requiresArmyValue: false,
      supportsCasualties: false,
      supportsObjectives: false
    }
  },
  {
    name: 'Age of Sigmar',
    shortName: 'aos',
    description: 'Epic fantasy battles in the Mortal Realms',
    matchType: 'victory_points',
    matchConfig: {
      pointsLabel: 'Victory Points',
      pointsRange: { min: 0, max: 30 },
      requiresArmyValue: false,
      supportsCasualties: false,
      supportsObjectives: false
    }
  },
  {
    name: 'The Old World',
    shortName: 'tow',
    description: 'Classic Warhammer Fantasy Battles returns',
    matchType: 'percentage',
    matchConfig: {
      pointsLabel: 'Casualties',
      requiresArmyValue: true,
      supportsCasualties: true,
      supportsObjectives: false,
      victoryLevels: [
        { name: 'Draw', threshold: 0, maxThreshold: 10 },
        { name: 'Minor Victory', threshold: 10, maxThreshold: 25 },
        { name: 'Major Victory', threshold: 25, maxThreshold: 50 },
        { name: 'Massacre', threshold: 50, maxThreshold: 100 }
      ]
    }
  },
  {
    name: 'Middle-Earth Strategy Battle Game',
    shortName: 'mesbg',
    description: 'Recreate the battles of Middle-Earth',
    matchType: 'scenario',
    matchConfig: {
      pointsLabel: 'Casualties (optional)',
      pointsRange: { min: 0, max: 1000 },
      requiresArmyValue: false,
      supportsCasualties: true,
      supportsObjectives: true,
      objectiveRequired: true
    }
  },
  {
    name: 'The Horus Heresy',
    shortName: 'hh',
    description: 'The Age of Darkness - Forge your Legion\'s legacy',
    matchType: 'victory_points',
    matchConfig: {
      pointsLabel: 'Victory Points',
      pointsRange: { min: 0, max: 100 },
      requiresArmyValue: false,
      supportsCasualties: false,
      supportsObjectives: false
    }
  }
]
