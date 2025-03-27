import { useState, useCallback, useEffect } from 'react';

// Interface for a meme coin/token in the race
export interface MemeCoin {
  id: number;
  name: string;
  symbol: string;
  icon: string; // Emoji or imported asset
  color: string; // CSS color for visual identification
  position: number; // Current position in the race (0-100)
  odds: number; // Betting odds (e.g., 2.5x means 2.5x payout if winning)
  speedFactor: number; // Hidden internal speed factor
  rngFactor: number; // Random "luck" factor
}

export interface MemeRaceBet {
  coinId: number;
  amount: number;
}

export interface RaceHistory {
  timestamp: Date;
  winner: MemeCoin;
  playerBet?: MemeRaceBet;
  playerWon: boolean;
  winAmount: number;
}

export interface MemeRaceState {
  coins: MemeCoin[];
  isRacing: boolean;
  countdown: number | null;
  finished: boolean;
  winner: MemeCoin | null;
  currentBet: MemeRaceBet | null;
  raceHistory: RaceHistory[];
}

// Define the default meme coins with their properties
const DEFAULT_MEME_COINS: MemeCoin[] = [
  {
    id: 1,
    name: 'Dogecoin',
    symbol: 'DOGE',
    icon: '🐕',
    color: '#c3a634',
    position: 0,
    odds: 3.5,
    speedFactor: 0.9,
    rngFactor: 1.2
  },
  {
    id: 2,
    name: 'Shiba Inu',
    symbol: 'SHIB',
    icon: '🐕‍🦺',
    color: '#ff5a1f',
    position: 0,
    odds: 4.2,
    speedFactor: 0.85,
    rngFactor: 1.3
  },
  {
    id: 3,
    name: 'Pepe',
    symbol: 'PEPE',
    icon: '🐸',
    color: '#2e7d32',
    position: 0,
    odds: 2.8,
    speedFactor: 1.0,
    rngFactor: 1.0
  },
  {
    id: 4,
    name: 'Floki',
    symbol: 'FLOKI',
    icon: '⚔️',
    color: '#1976d2',
    position: 0,
    odds: 5.0,
    speedFactor: 0.8,
    rngFactor: 1.4
  },
  {
    id: 5,
    name: 'Bonk',
    symbol: 'BONK',
    icon: '🐶',
    color: '#ffa000',
    position: 0,
    odds: 6.5,
    speedFactor: 0.75,
    rngFactor: 1.5
  },
  {
    id: 6,
    name: 'Monie',
    symbol: 'MONIE',
    icon: '💰',
    color: '#9c27b0',
    position: 0,
    odds: 8.0,
    speedFactor: 0.7,
    rngFactor: 1.6
  }
];

export const useMemeRace = () => {
  const [state, setState] = useState<MemeRaceState>({
    coins: DEFAULT_MEME_COINS,
    isRacing: false,
    countdown: null,
    finished: false,
    winner: null,
    currentBet: null,
    raceHistory: []
  });

  // Place a bet on a specific meme coin
  const placeBet = useCallback((coinId: number, amount: number): boolean => {
    if (state.isRacing || state.countdown !== null) {
      return false;
    }

    setState(prev => ({
      ...prev,
      currentBet: { coinId, amount }
    }));

    return true;
  }, [state.isRacing, state.countdown]);

  // Clear the current bet
  const clearBet = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentBet: null
    }));
  }, []);

  // Start the race with countdown
  const startRace = useCallback(() => {
    if (state.isRacing || state.countdown !== null) {
      return false;
    }

    // Reset positions
    const resetCoins = state.coins.map(coin => ({
      ...coin,
      position: 0
    }));

    // Start countdown from 3
    setState(prev => ({
      ...prev,
      coins: resetCoins,
      countdown: 3,
      finished: false,
      winner: null
    }));

    // Handle countdown
    const countdownInterval = setInterval(() => {
      setState(prev => {
        if (prev.countdown === null || prev.countdown <= 0) {
          clearInterval(countdownInterval);
          return {
            ...prev,
            countdown: null,
            isRacing: true
          };
        }
        return {
          ...prev,
          countdown: prev.countdown - 1
        };
      });
    }, 1000);

    return true;
  }, [state.isRacing, state.countdown, state.coins]);

  // Simulate the race progression
  useEffect(() => {
    if (!state.isRacing) return;

    // Introduce some randomness to the race
    const raceInterval = setInterval(() => {
      setState(prev => {
        // Update positions
        const updatedCoins = prev.coins.map(coin => {
          // Base speed (0.5-2.5)
          const baseSpeed = 0.5 + Math.random() * 2;
          
          // Apply coin-specific speed and RNG factors
          const adjustedSpeed = baseSpeed * coin.speedFactor * (Math.random() * coin.rngFactor);
          
          // Calculate new position
          let newPosition = coin.position + adjustedSpeed;
          
          // Cap at 100 (finish line)
          newPosition = Math.min(100, newPosition);
          
          return {
            ...coin,
            position: newPosition
          };
        });

        // Check if any coin has finished
        const finishedCoins = updatedCoins.filter(coin => coin.position >= 100);
        
        if (finishedCoins.length > 0) {
          // Race has finished
          clearInterval(raceInterval);
          
          // Sort by position to find the winner (in case multiple coins finish in same update)
          const sortedCoins = [...updatedCoins].sort((a, b) => b.position - a.position);
          const winner = sortedCoins[0];
          
          // Determine if player won
          const playerWon = prev.currentBet?.coinId === winner.id;
          
          // Calculate winnings
          const winAmount = playerWon 
            ? (prev.currentBet?.amount || 0) * winner.odds 
            : 0;
          
          // Create race history entry
          const historyEntry: RaceHistory = {
            timestamp: new Date(),
            winner,
            playerBet: prev.currentBet || undefined,
            playerWon,
            winAmount
          };
          
          return {
            ...prev,
            coins: updatedCoins,
            isRacing: false,
            finished: true,
            winner,
            raceHistory: [historyEntry, ...prev.raceHistory].slice(0, 10) // Keep last 10 races
          };
        }
        
        return {
          ...prev,
          coins: updatedCoins
        };
      });
    }, 100); // Update every 100ms for smoother animation

    return () => clearInterval(raceInterval);
  }, [state.isRacing]);

  // Reset the race
  const resetRace = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRacing: false,
      countdown: null,
      finished: false,
      winner: null,
      coins: prev.coins.map(coin => ({ ...coin, position: 0 }))
    }));
  }, []);

  // Get a coin by ID
  const getCoinById = useCallback((id: number): MemeCoin | undefined => {
    return state.coins.find(coin => coin.id === id);
  }, [state.coins]);

  // Get winning amount for a bet
  const getWinningAmount = useCallback((coinId: number, betAmount: number): number => {
    const coin = getCoinById(coinId);
    if (!coin) return 0;
    return betAmount * coin.odds;
  }, [getCoinById]);

  return {
    ...state,
    placeBet,
    clearBet,
    startRace,
    resetRace,
    getCoinById,
    getWinningAmount
  };
};