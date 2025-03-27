import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  gameResults, type GameResult, type InsertGameResult,
  type LeaderboardEntry
} from "@shared/schema";

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
      joinedAt: now
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
        joinedAt: user.joinedAt
      }));
  }
}

export const storage = new MemStorage();
