import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, initStorage } from "./storage";
import { checkDatabaseConnection } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if the database connection is available
  try {
    const isDbConnected = await checkDatabaseConnection();
    if (isDbConnected) {
      // Initialize the PostgreSQL storage
      const pgStorage = await initStorage();
      console.log('Using PostgreSQL storage for data persistence');
      (global as any).storage = pgStorage;
    } else {
      console.log('Using in-memory storage (database connection failed)');
    }
  } catch (error) {
    console.error('Error checking database connection:', error);
    console.log('Falling back to in-memory storage');
  }
  
  // API Routes prefix with /api
  
  // Get games list
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve games' });
    }
  });

  // Get game by ID
  app.get('/api/games/:id', async (req, res) => {
    try {
      const game = await storage.getGameById(req.params.id);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve game' });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leaderboard' });
    }
  });

  // Get user game history
  app.get('/api/users/:userId/history', async (req, res) => {
    try {
      const history = await storage.getUserGameHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve game history' });
    }
  });

  // Record game result
  app.post('/api/games/result', async (req, res) => {
    try {
      const { userId, gameId, betAmount, winAmount, outcome } = req.body;
      
      if (!userId || !gameId || betAmount === undefined || winAmount === undefined || !outcome) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const result = await storage.recordGameResult({
        userId,
        gameId,
        betAmount,
        winAmount,
        outcome
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to record game result' });
    }
  });

  // Get user
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve user' });
    }
  });

  // Create user
  app.post('/api/users', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      const user = await storage.createUser({ username, password, balance: 100 });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update user balance
  app.patch('/api/users/:id/balance', async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (amount === undefined) {
        return res.status(400).json({ message: 'Amount is required' });
      }
      
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const updatedUser = await storage.updateUserBalance(parseInt(req.params.id), amount);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user balance' });
    }
  });
  
  // Admin API routes
  
  // Run database migration
  app.post('/api/admin/run-migration', (req, res) => {
    try {
      // Set environment variable for triggering migration
      process.env.DB_MIGRATE = 'true';
      
      // Execute the migration script
      const { exec } = require('child_process');
      
      const migrate = exec('node scripts/migrate-db.js');
      
      let stdoutData = '';
      let stderrData = '';
      
      migrate.stdout.on('data', (data: string) => {
        console.log(`[Migration] ${data}`);
        stdoutData += data;
      });
      
      migrate.stderr.on('data', (data: string) => {
        console.error(`[Migration Error] ${data}`);
        stderrData += data;
      });
      
      migrate.on('close', (code: number) => {
        console.log(`Migration process exited with code ${code}`);
        
        // Reset environment variable
        process.env.DB_MIGRATE = 'false';
        
        if (code === 0) {
          res.json({ 
            message: 'Database migration completed successfully',
            details: stdoutData
          });
        } else {
          res.status(500).json({ 
            message: 'Database migration failed',
            details: stderrData || stdoutData
          });
        }
      });
      
      // Do not reset the environment variable here as the migration is async
    } catch (error) {
      console.error('Migration execution error:', error);
      res.status(500).json({ 
        message: 'Failed to execute migration script',
        error: String(error)
      });
    }
  });
  
  // Wallet API routes
  
  // Get user by wallet address
  app.get('/api/wallet/:address', async (req, res) => {
    try {
      const user = await storage.getWalletByAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ message: 'No user found with this wallet address' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve user by wallet address' });
    }
  });
  
  // Connect wallet to user
  app.post('/api/wallet/connect', async (req, res) => {
    try {
      const { userId, walletAddress } = req.body;
      
      if (!userId || !walletAddress) {
        return res.status(400).json({ message: 'User ID and wallet address are required' });
      }
      
      // Check if wallet already connected to another user
      const existingWallet = await storage.getWalletByAddress(walletAddress);
      if (existingWallet && existingWallet.id !== parseInt(userId)) {
        return res.status(409).json({ message: 'Wallet already connected to another user' });
      }
      
      // Update user with wallet address
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create updated user with wallet address
      const updatedUser = await storage.createUser({
        ...user,
        walletAddress
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to connect wallet' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
