import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  gameResults, type GameResult, type InsertGameResult,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  badges, type Badge, type InsertBadge,
  type LeaderboardEntry, type AchievementWithProgress
} from "@shared/schema";
import { db } from './db';
import { sql } from 'drizzle-orm';

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  getGameById(id: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Game result operations
  recordGameResult(result: InsertGameResult): Promise<GameResult>;
  getUserGameHistory(userId: string): Promise<GameResult[]>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  
  // Wallet operations
  getWalletByAddress(address: string): Promise<User | undefined>;
  getWalletByUserId(userId: number): Promise<User | undefined>;
  updateWalletBalance(userId: number, amount: number): Promise<User>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<string, Game>;
  private gameResults: GameResult[];
  private currentUserId: number;
  private currentGameId: number;
  private currentResultId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.gameResults = [];
    this.currentUserId = 1;
    this.currentGameId = 1;
    this.currentResultId = 1;
    
    // Initialize with default games
    this.initializeDefaultGames();
  }

  private initializeDefaultGames() {
    const defaultGames: InsertGame[] = [
      {
        gameId: 'coinflip',
        name: 'Coin Flip',
        description: 'Flip a coin and double your bet with a 50% chance.',
        rtp: 98,
        category: 'Coin Flip',
        isPopular: true,
        isNew: false,
        isTrending: true,
        isHot: false,
        maxWin: 2
      },
      {
        gameId: 'dice',
        name: 'Dice Roll',
        description: 'Roll the dice and win up to 6x your bet. Choose your odds.',
        rtp: 97,
        category: 'Dice',
        isPopular: false,
        isNew: true,
        isTrending: true,
        isHot: false,
        maxWin: 6
      },
      {
        gameId: 'slots',
        name: 'Bear Slots',
        description: 'Spin the slots to match symbols and win up to 100x your bet.',
        rtp: 96,
        category: 'Slots',
        isPopular: false,
        isNew: false,
        isTrending: false,
        isHot: true,
        maxWin: 100
      },
      {
        gameId: 'crash',
        name: 'Crypto Crash',
        description: 'Watch the multiplier grow and cash out before it crashes!',
        rtp: 99,
        category: 'Crash',
        isPopular: false,
        isNew: false,
        isTrending: true,
        isHot: false,
        maxWin: 1000
      },
      {
        gameId: 'blackjack',
        name: 'Blackjack',
        description: 'Beat the dealer by getting a hand value as close to 21 as possible without going over.',
        rtp: 99.5,
        category: 'Table Games',
        isPopular: true,
        isNew: true,
        isTrending: true,
        isHot: true,
        maxWin: 2.5
      },
      {
        gameId: 'roulette',
        name: 'Roulette',
        description: 'Place your bets on numbers, colors, or combinations and watch the wheel spin!',
        rtp: 97.3,
        category: 'Table Games',
        isPopular: true,
        isNew: false,
        isTrending: true,
        isHot: false,
        maxWin: 36
      },
      {
        gameId: 'poker',
        name: 'Texas Hold\'em Poker',
        description: 'Test your poker skills against the dealer with this classic card game.',
        rtp: 98.7,
        category: 'Card Games',
        isPopular: true,
        isNew: false,
        isTrending: false,
        isHot: true,
        maxWin: 500
      }
    ];
    
    defaultGames.forEach(game => {
      this.createGame(game);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      balance: insertUser.balance || 0,
      level: "Bronze",
      points: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      totalWagered: 0,
      bestMultiplier: 0,
      joinedAt: now,
      walletAddress: insertUser.walletAddress || null
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      balance: user.balance + amount
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGameById(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    
    const game: Game = {
      id,
      gameId: insertGame.gameId,
      name: insertGame.name,
      description: insertGame.description,
      rtp: insertGame.rtp,
      category: insertGame.category,
      isPopular: insertGame.isPopular || false,
      isNew: insertGame.isNew || false,
      isTrending: insertGame.isTrending || false,
      isHot: insertGame.isHot || false,
      maxWin: insertGame.maxWin
    };
    
    this.games.set(insertGame.gameId, game);
    return game;
  }

  // Game result operations
  async recordGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const id = this.currentResultId++;
    const now = new Date();
    
    const gameResult: GameResult = {
      ...insertResult,
      id,
      timestamp: now
    };
    
    this.gameResults.push(gameResult);
    
    // Update user statistics
    const user = await this.getUser(insertResult.userId);
    if (user) {
      const isWin = insertResult.outcome === 'win';
      const multiplier = insertResult.winAmount / insertResult.betAmount;
      
      const updatedUser: User = {
        ...user,
        totalBets: user.totalBets + 1,
        wins: isWin ? user.wins + 1 : user.wins,
        losses: isWin ? user.losses : user.losses + 1,
        totalWagered: user.totalWagered + insertResult.betAmount,
        bestMultiplier: isWin && multiplier > user.bestMultiplier ? multiplier : user.bestMultiplier,
        points: user.points + Math.floor(insertResult.betAmount / 10) // 1 point per 10 wagered
      };
      
      // Update user level based on points
      if (updatedUser.points >= 5000) {
        updatedUser.level = "Platinum";
      } else if (updatedUser.points >= 1000) {
        updatedUser.level = "Gold";
      } else if (updatedUser.points >= 500) {
        updatedUser.level = "Silver";
      }
      
      this.users.set(user.id, updatedUser);
    }
    
    return gameResult;
  }

  async getUserGameHistory(userId: string): Promise<GameResult[]> {
    return this.gameResults
      .filter(result => result.userId === parseInt(userId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Leaderboard
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalWagered - a.totalWagered)
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        username: user.username,
        wins: user.wins,
        bestMultiplier: user.bestMultiplier,
        totalWagered: user.totalWagered,
        joinedAt: user.joinedAt,
        level: user.level,
        points: user.points
      }));
  }
  
  // Wallet operations
  async getWalletByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address
    );
  }
  
  async getWalletByUserId(userId: number): Promise<User | undefined> {
    return this.getUser(userId);
  }
  
  async updateWalletBalance(userId: number, amount: number): Promise<User> {
    return this.updateUserBalance(userId, amount);
  }
}

// Database storage implementation using PostgreSQL
export class PgStorage implements IStorage {
  constructor(private db: any) {}

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: (users: any) => users.id.equals(id)
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: (users: any) => users.username.equals(username)
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [result] = await this.db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      balance: insertUser.balance || 0,
      level: "Bronze",
      points: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      totalWagered: 0,
      bestMultiplier: 0,
      joinedAt: new Date(),
      walletAddress: insertUser.walletAddress || null
    }).returning();
    return result;
  }

  async updateUserBalance(id: number, amount: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const [updatedUser] = await this.db.update(users)
      .set({ balance: user.balance + amount })
      .where(sql`id = ${id}`)
      .returning();
    
    return updatedUser;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    try {
      // Try a more compatible approach with the pool query
      const result = await this.db.execute(sql`
        SELECT 
          id, 
          "gameId", 
          name, 
          description, 
          "imageSrc",
          rtp, 
          category, 
          "isPopular", 
          "isNew", 
          "isTrending", 
          "isHot", 
          "maxWin",
          path
        FROM games
      `);
      return result as Game[];
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  async getGameById(id: string): Promise<Game | undefined> {
    const result = await this.db.query.games.findFirst({
      where: (games: any) => games.gameId.equals(id)
    });
    return result;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [result] = await this.db.insert(games).values({
      gameId: insertGame.gameId,
      name: insertGame.name,
      description: insertGame.description,
      rtp: insertGame.rtp,
      category: insertGame.category,
      isPopular: insertGame.isPopular || false,
      isNew: insertGame.isNew || false,
      isTrending: insertGame.isTrending || false,
      isHot: insertGame.isHot || false,
      maxWin: insertGame.maxWin
    }).returning();
    return result;
  }

  // Game result operations
  async recordGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    // 1. Add game result
    const [gameResult] = await this.db.insert(gameResults).values({
      userId: insertResult.userId,
      gameId: insertResult.gameId,
      betAmount: insertResult.betAmount,
      winAmount: insertResult.winAmount,
      outcome: insertResult.outcome,
      timestamp: new Date()
    }).returning();
    
    // 2. Update user statistics
    const user = await this.getUser(insertResult.userId);
    if (user) {
      const isWin = insertResult.outcome === 'win';
      const multiplier = insertResult.winAmount / insertResult.betAmount;
      
      // Calculate new points and level
      const newPoints = user.points + Math.floor(insertResult.betAmount / 10);
      let newLevel = user.level;
      
      if (newPoints >= 5000) {
        newLevel = "Platinum";
      } else if (newPoints >= 1000) {
        newLevel = "Gold";
      } else if (newPoints >= 500) {
        newLevel = "Silver";
      }
      
      await this.db.update(users)
        .set({
          totalBets: user.totalBets + 1,
          wins: isWin ? user.wins + 1 : user.wins,
          losses: isWin ? user.losses : user.losses + 1,
          totalWagered: user.totalWagered + insertResult.betAmount,
          bestMultiplier: isWin && multiplier > user.bestMultiplier ? multiplier : user.bestMultiplier,
          points: newPoints,
          level: newLevel
        })
        .where(sql`id = ${user.id}`);
    }
    
    return gameResult;
  }

  async getUserGameHistory(userId: string): Promise<GameResult[]> {
    return await this.db.query.gameResults.findMany({
      where: (gameResults: any) => gameResults.userId.equals(parseInt(userId)),
      orderBy: (gameResults: any, { desc }: any) => [desc(gameResults.timestamp)]
    });
  }

  // Leaderboard
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.db.query.users.findMany({
      orderBy: (users: any, { desc }: any) => [desc(users.totalWagered)],
      limit
    });
    
    return leaderboard.map((user: User) => ({
      id: user.id,
      username: user.username,
      wins: user.wins,
      bestMultiplier: user.bestMultiplier,
      totalWagered: user.totalWagered,
      joinedAt: user.joinedAt,
      level: user.level,
      points: user.points
    }));
  }

  // Wallet operations
  async getWalletByAddress(address: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: (users: any) => users.walletAddress.equals(address)
    });
    return result;
  }

  async getWalletByUserId(userId: number): Promise<User | undefined> {
    return this.getUser(userId);
  }

  async updateWalletBalance(userId: number, amount: number): Promise<User> {
    return this.updateUserBalance(userId, amount);
  }

  // Initialize the database with default games
  async initializeDefaultGames() {
    const games = await this.getGames();
    if (games.length === 0) {
      const defaultGames: InsertGame[] = [
        {
          gameId: 'coinflip',
          name: 'Coin Flip',
          description: 'Flip a coin and double your bet with a 50% chance.',
          rtp: 98,
          category: 'Coin Flip',
          isPopular: true,
          isNew: false,
          isTrending: true,
          isHot: false,
          maxWin: 2
        },
        {
          gameId: 'dice',
          name: 'Dice Roll',
          description: 'Roll the dice and win up to 6x your bet. Choose your odds.',
          rtp: 97,
          category: 'Dice',
          isPopular: false,
          isNew: true,
          isTrending: true,
          isHot: false,
          maxWin: 6
        },
        {
          gameId: 'slots',
          name: 'Bear Slots',
          description: 'Spin the slots to match symbols and win up to 100x your bet.',
          rtp: 96,
          category: 'Slots',
          isPopular: false,
          isNew: false,
          isTrending: false,
          isHot: true,
          maxWin: 100
        },
        {
          gameId: 'crash',
          name: 'Crypto Crash',
          description: 'Watch the multiplier grow and cash out before it crashes!',
          rtp: 99,
          category: 'Crash',
          isPopular: false,
          isNew: false,
          isTrending: true,
          isHot: false,
          maxWin: 1000
        },
        {
          gameId: 'blackjack',
          name: 'Blackjack',
          description: 'Beat the dealer by getting a hand value as close to 21 as possible without going over.',
          rtp: 99.5,
          category: 'Table Games',
          isPopular: true,
          isNew: true,
          isTrending: true,
          isHot: true,
          maxWin: 2.5
        },
        {
          gameId: 'roulette',
          name: 'Roulette',
          description: 'Place your bets on numbers, colors, or combinations and watch the wheel spin!',
          rtp: 97.3,
          category: 'Table Games',
          isPopular: true,
          isNew: false,
          isTrending: true,
          isHot: false,
          maxWin: 36
        },
        {
          gameId: 'poker',
          name: 'Texas Hold\'em Poker',
          description: 'Test your poker skills against the dealer with this classic card game.',
          rtp: 98.7,
          category: 'Card Games',
          isPopular: true,
          isNew: false,
          isTrending: false,
          isHot: true,
          maxWin: 500
        },
        {
          gameId: 'tokentrader',
          name: 'Token Trader',
          description: 'Trade crypto tokens to build your portfolio and make profit before time runs out.',
          rtp: 95,
          category: 'Crypto',
          isPopular: false,
          isNew: true,
          isTrending: true,
          isHot: true,
          maxWin: 5
        },
        {
          gameId: 'memerace',
          name: 'Meme Race',
          description: 'Bet on your favorite meme coin and watch the race! Different meme coins have different odds.',
          rtp: 96,
          category: 'Crypto',
          isPopular: false,
          isNew: true,
          isTrending: true,
          isHot: true,
          maxWin: 8
        },
        {
          gameId: 'mininggame',
          name: 'Crypto Mining Simulator',
          description: 'Build and manage your crypto mining operation. Purchase hardware, select pools and cryptocurrencies, and try to earn more than your initial investment!',
          rtp: 92,
          category: 'Crypto',
          isPopular: false,
          isNew: true,
          isTrending: false,
          isHot: true,
          maxWin: 5
        }
      ];
      
      for (const game of defaultGames) {
        await this.createGame(game);
      }
    }
  }
}

// Export storage for use in routes
export const storage = new MemStorage(); // Default to memory storage for now

// Initialize the PostgreSQL storage if database connection is available
export async function initStorage() {
  try {
    const pgStorage = new PgStorage(db);
    
    // Initialize database with default games
    await pgStorage.initializeDefaultGames();
    
    console.log('PostgreSQL storage initialized successfully');
    return pgStorage;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL storage:', error);
    console.log('Falling back to in-memory storage');
    return new MemStorage();
  }
}