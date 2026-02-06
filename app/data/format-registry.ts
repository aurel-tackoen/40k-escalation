// Format registry - defines all supported league formats across game systems
// Format keys are stored in the leagues table (varchar) and looked up here for configuration

export interface FormatConfig {
  key: string            // Unique identifier: 'ow-ptg', '40k-matched', etc.
  name: string           // Display name: 'Path to Glory', 'Matched Play', etc.
  description: string    // Short description for format selection UI
  gameSystem: string     // Matches shortName from game-systems.js: 'tow', '40k', 'aos', 'hh'
  category: 'campaign' | 'matched'  // Routes to progression vs simple behavior
  scoring: {
    type: string         // 'cp' | 'vp' | 'tp' | 'glory' | 'wld' | 'points'
    label: string        // What points are called: 'Campaign Points', 'Victory Points', etc.
    defaultRanking: string  // Primary sort: 'total_cp', 'total_vp', 'wld_record', etc.
  }
  features: {
    progression: boolean    // Shows progression UI (unit rosters, XP, etc.)
    paintingBonus: boolean  // Painting progress contributes to scoring
    matchForm: string       // Which match form variant to use
    standingsType: string   // Which standings calculator to use
  }
}

export const FORMAT_REGISTRY: Record<string, FormatConfig> = {
  'ow-ptg': {
    key: 'ow-ptg',
    name: 'Path to Glory',
    description: 'Campaign Points scoring, unit progression, painting bonuses',
    gameSystem: 'tow',
    category: 'campaign',
    scoring: {
      type: 'cp',
      label: 'Campaign Points',
      defaultRanking: 'total_cp',
    },
    features: {
      progression: true,
      paintingBonus: true,
      matchForm: 'ow-ptg',
      standingsType: 'ow-ptg',
    },
  },
  'ow-matched': {
    key: 'ow-matched',
    name: 'Matched Play',
    description: 'Tournament Points from Victory Point differential',
    gameSystem: 'tow',
    category: 'matched',
    scoring: {
      type: 'tp',
      label: 'Tournament Points',
      defaultRanking: 'total_tp',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'ow-matched',
      standingsType: 'ow-matched',
    },
  },
  '40k-crusade': {
    key: '40k-crusade',
    name: 'Crusade',
    description: 'Narrative campaign with unit XP, battle honours, and requisition',
    gameSystem: '40k',
    category: 'campaign',
    scoring: {
      type: 'wld',
      label: 'Win/Loss/Draw',
      defaultRanking: 'wld_record',
    },
    features: {
      progression: true,
      paintingBonus: false,
      matchForm: '40k-crusade',
      standingsType: '40k-crusade',
    },
  },
  '40k-matched': {
    key: '40k-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring with primary and secondary objectives',
    gameSystem: '40k',
    category: 'matched',
    scoring: {
      type: 'vp',
      label: 'Victory Points',
      defaultRanking: 'total_vp',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: '40k-matched',
      standingsType: '40k-matched',
    },
  },
  'aos-ptg': {
    key: 'aos-ptg',
    name: 'Path to Glory',
    description: 'Glory Points, unit renown, hero paths, and quests',
    gameSystem: 'aos',
    category: 'campaign',
    scoring: {
      type: 'glory',
      label: 'Glory Points',
      defaultRanking: 'total_glory',
    },
    features: {
      progression: true,
      paintingBonus: false,
      matchForm: 'aos-ptg',
      standingsType: 'aos-ptg',
    },
  },
  'aos-matched': {
    key: 'aos-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring with battle tactics',
    gameSystem: 'aos',
    category: 'matched',
    scoring: {
      type: 'points',
      label: 'Match Points',
      defaultRanking: 'total_points',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'aos-matched',
      standingsType: 'aos-matched',
    },
  },
  'hh-matched': {
    key: 'hh-matched',
    name: 'Matched Play',
    description: 'Victory Points scoring for the Age of Darkness',
    gameSystem: 'hh',
    category: 'matched',
    scoring: {
      type: 'points',
      label: 'Match Points',
      defaultRanking: 'total_points',
    },
    features: {
      progression: false,
      paintingBonus: false,
      matchForm: 'hh-matched',
      standingsType: 'hh-matched',
    },
  },
}

// Helper: get formats for a game system by shortName
export function getFormatsForGameSystem(shortName: string): FormatConfig[] {
  return Object.values(FORMAT_REGISTRY).filter(f => f.gameSystem === shortName)
}

// Helper: get a single format config by key
export function getFormatConfig(formatKey: string): FormatConfig | null {
  return FORMAT_REGISTRY[formatKey] || null
}

// Helper: get format display name for badges
export function getFormatDisplayName(formatKey: string): string {
  return FORMAT_REGISTRY[formatKey]?.name || 'Unknown'
}
