export interface Game {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  rtp: number;
  category: string;
  isPopular: boolean;
  isNew: boolean;
  isTrending: boolean;
  isHot: boolean;
  path: string;
  maxWin: number;
}

export interface GameResult {
  id: string;
  userId: string;
  gameId: string;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  outcome: string;
  timestamp: Date;
}

export interface User {
  id: number;
  username: string;
  balance: number;
  level: string;
  points: number;
  totalBets: number;
  wins: number;
  losses: number;
  totalWagered: number;
  bestMultiplier: number;
  joinedAt: Date;
}

export interface Wallet {
  address: string;
  balance: number;
  isConnected: boolean;
  userId: string; // Add userId for game results
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  avatar: string;
  wins: number;
  bestMultiplier: number;
  totalWagered: number;
  joinedAt: Date;
}

export interface CoinFlipState {
  isFlipping: boolean;
  selectedSide: 'heads' | 'tails' | null;
  result: 'heads' | 'tails' | null;
  hasWon: boolean | null;
}

export interface DiceState {
  isRolling: boolean;
  selectedNumber: number | null;
  result: number | null;
  hasWon: boolean | null;
}

export interface SlotsState {
  isSpinning: boolean;
  result: Array<string | null>;
  hasWon: boolean | null;
}

export interface CrashState {
  isRunning: boolean;
  multiplier: number;
  hasCrashed: boolean;
  hasUserCashedOut: boolean;
  cashOutMultiplier: number | null;
}

export type GameState = CoinFlipState | DiceState | SlotsState | CrashState;
