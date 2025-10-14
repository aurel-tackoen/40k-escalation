import { integer, pgTable, varchar, text, timestamp, boolean, date } from 'drizzle-orm/pg-core';

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
  startDate: date().notNull(),
  endDate: date(),
  currentRound: integer().default(1).notNull(),
  createdBy: integer().references(() => users.id).notNull(), // League owner
  isPublic: boolean().default(true).notNull(), // Public vs private league
  joinPassword: varchar({ length: 255 }), // Hashed password for joining (nullable for public leagues)
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
  userId: integer().references(() => users.id), // Link to authenticated user (nullable for non-auth players)
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(), // Not unique - same user can have multiple players across leagues
  faction: varchar({ length: 100 }),
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
  player1Points: integer().default(0).notNull(),
  player2Points: integer().default(0).notNull(),
  winnerId: integer().references(() => players.id),
  mission: varchar({ length: 255 }),
  datePlayed: date(),
  notes: text(),
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
  status: varchar({ length: 50 }).default('active').notNull(), // 'active', 'inactive', 'banned'
});

// Legacy posts table (can be removed later)
export const posts = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull().default('')
});
