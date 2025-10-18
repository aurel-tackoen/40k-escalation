import { integer, pgTable, varchar, text, timestamp, boolean, date, serial } from 'drizzle-orm/pg-core';

// Game systems table (Warhammer 40k, AoS, The Old World, MESBG, etc.)
export const gameSystems = pgTable('game_systems', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  shortName: varchar('short_name', { length: 50 }).notNull(), // "40k", "aos", "tow", "mesbg"
  description: text('description'), // Game system description
  matchType: varchar('match_type', { length: 50 }).default('victory_points').notNull(), // 'victory_points', 'percentage', 'scenario'
  matchConfig: text('match_config'), // JSON string with matchConfig object (pointsLabel, pointsRange, etc.)
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Factions table (dynamic, per game system)
export const factions = pgTable('factions', {
  id: serial('id').primaryKey(),
  gameSystemId: integer('game_system_id').references(() => gameSystems.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }), // "Order", "Chaos", "Death", "Destruction" for AoS, etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Missions table (dynamic, per game system)
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  gameSystemId: integer('game_system_id').references(() => gameSystems.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }), // "Matched Play", "Narrative", etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Unit types table (dynamic, per game system)
export const unitTypes = pgTable('unit_types', {
  id: serial('id').primaryKey(),
  gameSystemId: integer('game_system_id').references(() => gameSystems.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // "HQ", "Troops", "Leaders", "Battleline", etc.
  category: varchar('category', { length: 50 }), // "Command", "Core", "Elite", "Support", etc.
  displayOrder: integer('display_order').notNull(), // Order to display in dropdowns
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Users table (Auth0 authentication)
export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  auth0Id: varchar({ length: 255 }).notNull().unique(), // Auth0 user ID
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  picture: text(), // Avatar URL from Auth0
  role: varchar({ length: 50 }).default('user').notNull(), // User role (user, organizer, admin)
  createdAt: timestamp().defaultNow().notNull(),
  lastLoginAt: timestamp().defaultNow().notNull()
});

// Leagues table
export const leagues = pgTable('leagues', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  rules: text(), // Custom league rules set by organizer
  gameSystemId: integer('game_system_id').references(() => gameSystems.id).notNull(), // Which game system this league uses
  startDate: date().notNull(),
  endDate: date(),
  currentRound: integer().default(1).notNull(),
  createdBy: integer().references(() => users.id).notNull(), // League owner
  isPrivate: boolean().default(false).notNull(), // Private leagues require share links
  shareToken: varchar({ length: 32 }).unique(), // 32-character URL token for direct sharing
  allowDirectJoin: boolean().default(true).notNull(), // Allow joining via share links
  maxPlayers: integer(), // Optional player limit
  status: varchar({ length: 50 }).default('active').notNull(), // 'draft', 'active', 'completed', 'archived'
  createdAt: timestamp().defaultNow().notNull()
});

// League rounds table
export const rounds = pgTable('rounds', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id).notNull(),
  number: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  pointLimit: integer().notNull(),
  startDate: date().notNull(),
  endDate: date().notNull()
});

// Players table (league-specific entities)
export const players = pgTable('players', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id, { onDelete: 'cascade' }).notNull(), // Players are league-specific
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(), // Link to authenticated user (required for Auth0 integration)
  name: varchar({ length: 255 }).notNull(), // Display name (can be different from user.name)
  faction: varchar({ length: 100 }),
  armyName: varchar({ length: 255 }), // Persistent army name for this league (e.g., "Emperor's Fist")
  wins: integer().default(0).notNull(), // Stats scoped to this league
  losses: integer().default(0).notNull(),
  draws: integer().default(0).notNull(),
  totalPoints: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull()
});

// Matches table
export const matches = pgTable('matches', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id),
  round: integer().notNull(),
  player1Id: integer().references(() => players.id).notNull(),
  player2Id: integer().references(() => players.id).notNull(),

  // Match type and game system
  matchType: varchar('match_type', { length: 50 }).default('victory_points').notNull(), // 'victory_points', 'percentage', 'scenario'
  gameSystemId: integer('game_system_id').references(() => gameSystems.id), // Link to game system (can derive from league, but explicit is clearer)

  // Victory Points (40k, AoS, HH)
  player1Points: integer('player1_points').default(0).notNull(),
  player2Points: integer('player2_points').default(0).notNull(),

  // Percentage/Casualties System (The Old World)
  player1ArmyValue: integer('player1_army_value'), // Total army points
  player2ArmyValue: integer('player2_army_value'),
  player1CasualtiesValue: integer('player1_casualties_value'), // Points of casualties inflicted
  player2CasualtiesValue: integer('player2_casualties_value'),
  marginOfVictory: varchar('margin_of_victory', { length: 50 }), // 'Massacre', 'Major Victory', 'Minor Victory', 'Draw'

  // Scenario-based (MESBG)
  scenarioObjective: text('scenario_objective'), // Description of the scenario objective
  player1ObjectiveCompleted: boolean('player1_objective_completed'), // Did player 1 complete the objective?
  player2ObjectiveCompleted: boolean('player2_objective_completed'), // Did player 2 complete the objective?

  // Common fields
  winnerId: integer().references(() => players.id),
  mission: varchar({ length: 255 }),
  datePlayed: date(),
  notes: text(),

  // Flexible JSON for future game-specific data
  additionalData: text('additional_data'), // JSON string for future extensibility

  createdAt: timestamp().defaultNow().notNull()
});

// Army lists table
export const armies = pgTable('armies', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id, { onDelete: 'cascade' }).notNull(), // League-specific
  playerId: integer().references(() => players.id, { onDelete: 'cascade' }).notNull(),
  round: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  totalPoints: integer().notNull(),
  units: text().notNull(), // JSON string of units array
  isValid: boolean().default(true).notNull(),
  lastModified: date().notNull(),
  createdAt: timestamp().defaultNow().notNull()
});

// League memberships table (junction table for users in leagues)
export const leagueMemberships = pgTable('league_memberships', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  leagueId: integer().references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  playerId: integer().references(() => players.id, { onDelete: 'cascade' }), // Links to player entity in this league
  role: varchar({ length: 50 }).default('player').notNull(), // 'owner', 'organizer', 'player'
  joinedAt: timestamp().defaultNow().notNull(),
  status: varchar({ length: 50 }).default('active').notNull(), // 'active', 'inactive', 'banned', 'invited'
  leftAt: timestamp(), // Timestamp when user left/was removed from league (null if active)
});

// Legacy posts table (can be removed later)
export const posts = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull().default('')
});
