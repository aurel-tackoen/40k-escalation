import { integer, pgTable, varchar, text, timestamp, boolean, date } from 'drizzle-orm/pg-core';

// Leagues table
export const leagues = pgTable('leagues', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  startDate: date().notNull(),
  endDate: date(),
  currentRound: integer().default(1).notNull(),
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

// Players table (also serves as users table with Netlify Identity)
export const players = pgTable('players', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  netlifyId: varchar({ length: 255 }).unique(), // Netlify Identity user ID (null for legacy players)
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  faction: varchar({ length: 100 }),
  role: varchar({ length: 50 }).default('player').notNull(), // player, organizer, admin
  wins: integer().default(0).notNull(),
  losses: integer().default(0).notNull(),
  draws: integer().default(0).notNull(),
  totalPoints: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  lastLogin: timestamp() // Track last authentication
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
  playerId: integer().references(() => players.id).notNull(),
  round: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  totalPoints: integer().notNull(),
  units: text().notNull(), // JSON string of units array
  isValid: boolean().default(true).notNull(),
  lastModified: date().notNull(),
  createdAt: timestamp().defaultNow().notNull()
});

// Legacy posts table (can be removed later)
export const posts = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull().default('')
});
