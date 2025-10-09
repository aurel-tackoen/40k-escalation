import { integer, pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Players table
export const players = pgTable('players', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    faction: varchar({ length: 100 }),
    createdAt: timestamp().defaultNow().notNull()
});

// Leagues table
export const leagues = pgTable('leagues', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    startDate: timestamp().notNull(),
    endDate: timestamp(),
    currentRound: integer().default(1).notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp().defaultNow().notNull()
});

// Army lists table
export const armyLists = pgTable('army_lists', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    playerId: integer().references(() => players.id).notNull(),
    leagueId: integer().references(() => leagues.id).notNull(),
    name: varchar({ length: 255 }).notNull(),
    faction: varchar({ length: 100 }).notNull(),
    pointsLimit: integer().notNull(),
    roster: text().notNull(), // JSON string of units
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});

// Matches table
export const matches = pgTable('matches', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    leagueId: integer().references(() => leagues.id).notNull(),
    player1Id: integer().references(() => players.id).notNull(),
    player2Id: integer().references(() => players.id).notNull(),
    player1Score: integer().default(0).notNull(),
    player2Score: integer().default(0).notNull(),
    player1Points: integer().default(0).notNull(), // Victory points
    player2Points: integer().default(0).notNull(),
    round: integer().notNull(),
    mission: varchar({ length: 255 }),
    notes: text(),
    playedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull()
});

// Example starter data if needed
export const posts = pgTable('posts', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull().default('')
});
