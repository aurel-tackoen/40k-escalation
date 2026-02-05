/**
 * Test Data Factories
 * Generate mock data for testing
 */

export const createMockPlayer = (overrides = {}) => ({
  id: 1,
  name: 'Test Player',
  faction: 'Space Marines',
  wins: 5,
  losses: 2,
  draws: 1,
  totalPoints: 500,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockArmy = (overrides = {}) => ({
  id: 1,
  playerId: 1,
  phase: 1,
  name: 'Test Army',
  totalPoints: 500,
  units: JSON.stringify([
    {
      name: 'Tactical Squad',
      role: 'Troops',
      points: 100,
      totalModels: 10,
      paintedModels: 7
    },
    {
      name: 'Captain',
      role: 'HQ',
      points: 100,
      totalModels: 1,
      paintedModels: 1
    }
  ]),
  isValid: true,
  lastModified: new Date('2025-01-01'),
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockMatch = (overrides = {}) => ({
  id: 1,
  leagueId: 1,
  phase: 1,
  player1Id: 1,
  player2Id: 2,
  player1Points: 85,
  player2Points: 60,
  winnerId: 1,
  mission: 'Purge the Enemy',
  datePlayed: new Date('2025-01-15'),
  notes: 'Great game!',
  createdAt: new Date('2025-01-15'),
  ...overrides
})

export const createMockLeague = (overrides = {}) => ({
  id: 1,
  name: 'Test League',
  description: 'A test league',
  gameSystemId: 1,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  currentPhase: 1,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockPhase = (overrides = {}) => ({
  id: 1,
  leagueId: 1,
  number: 1,
  name: '500 Points',
  pointLimit: 500,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  ...overrides
})

export const createMockGameSystem = (overrides = {}) => ({
  id: 1,
  name: 'Warhammer 40,000',
  shortName: '40k',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockFaction = (overrides = {}) => ({
  id: 1,
  gameSystemId: 1,
  name: 'Space Marines',
  category: 'Imperium',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockMission = (overrides = {}) => ({
  id: 1,
  gameSystemId: 1,
  name: 'Purge the Enemy',
  category: 'Matched Play',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 1,
  auth0Id: 'auth0|123456',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  role: 'player',
  createdAt: new Date('2025-01-01'),
  lastLoginAt: new Date('2025-01-15'),
  ...overrides
})
