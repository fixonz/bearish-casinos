import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
