import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Game, GameResult } from '../types';
import { GAMES } from '../lib/games';
import { generateId } from '@/lib/utils';

interface GamesContextType {
  games: Game[];
  gameHistory: GameResult[];
  addGameResult: (result: Omit<GameResult, 'id' | 'timestamp'>) => void;
  getGameById: (id: string) => Game | undefined;
  getCategoryGames: (category: string) => Game[];
  getTrendingGames: () => Game[];
  getPopularGames: () => Game[];
}

// Create a default value for the context to avoid undefined checks
const defaultGamesContext: GamesContextType = {
  games: [],
  gameHistory: [],
  addGameResult: () => {},
  getGameById: () => undefined,
  getCategoryGames: () => [],
  getTrendingGames: () => [],
  getPopularGames: () => []
};

const GamesContext = createContext<GamesContextType>(defaultGamesContext);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [games] = useState<Game[]>(GAMES);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);

  const addGameResult = useCallback((result: Omit<GameResult, 'id' | 'timestamp'>) => {
    const newResult: GameResult = {
      ...result,
      id: generateId(),
      timestamp: new Date()
    };

    setGameHistory(prev => [newResult, ...prev]);
  }, []);

  const getGameById = useCallback((id: string): Game | undefined => {
    return games.find(game => game.id === id);
  }, [games]);

  const getCategoryGames = useCallback((category: string): Game[] => {
    return games.filter(game => game.category === category);
  }, [games]);

  const getTrendingGames = useCallback((): Game[] => {
    return games.filter(game => game.isTrending);
  }, [games]);

  const getPopularGames = useCallback((): Game[] => {
    return games.filter(game => game.isPopular);
  }, [games]);

  const contextValue: GamesContextType = {
    games,
    gameHistory,
    addGameResult,
    getGameById,
    getCategoryGames,
    getTrendingGames,
    getPopularGames
  };

  return (
    <GamesContext.Provider value={contextValue}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGamesContext = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGamesContext must be used within a GamesProvider');
  }
  return context;
};
