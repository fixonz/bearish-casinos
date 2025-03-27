import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  level: text("level").notNull().default("Bronze"),
  points: integer("points").notNull().default(0),
  totalBets: integer("total_bets").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  totalWagered: doublePrecision("total_wagered").notNull().default(0),
  bestMultiplier: doublePrecision("best_multiplier").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  walletAddress: text("wallet_address")
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(), // e.g., 'coinflip', 'dice', etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  rtp: doublePrecision("rtp").notNull(),
  category: text("category").notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isHot: boolean("is_hot").notNull().default(false),
  maxWin: doublePrecision("max_win").notNull()
});

// Game Results table
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: text("game_id").notNull(),
  betAmount: doublePrecision("bet_amount").notNull(),
  winAmount: doublePrecision("win_amount").notNull(),
  outcome: text("outcome").notNull(), // e.g., 'win', 'lose'
  timestamp: timestamp("timestamp").notNull().defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  balance: true,
  walletAddress: true
});

export const insertGameSchema = createInsertSchema(games).pick({
  gameId: true,
  name: true,
  description: true,
  rtp: true,
  category: true,
  isPopular: true,
  isNew: true,
  isTrending: true,
  isHot: true,
  maxWin: true
});

export const insertGameResultSchema = createInsertSchema(gameResults).pick({
  userId: true,
  gameId: true,
  betAmount: true,
  winAmount: true,
  outcome: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;

// Leaderboard entry derived from Users
export type LeaderboardEntry = {
  id: number;
  username: string;
  wins: number;
  bestMultiplier: number;
  totalWagered: number;
  joinedAt: Date;
};
