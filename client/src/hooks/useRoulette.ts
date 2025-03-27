import { useState, useCallback } from 'react';

// Types for roulette game
export type RouletteNumber = number | 0 | '00';
export type RouletteColor = 'red' | 'black' | 'green';
export type RouletteBetType = 
  | 'straight' // Single number
  | 'split' // Two adjacent numbers
  | 'street' // Three numbers in a row
  | 'corner' // Four numbers forming a square
  | 'fiveNumber' // 0, 00, 1, 2, 3
  | 'sixLine' // Six numbers from two rows
  | 'column' // 12 numbers in a column
  | 'dozen' // 1-12, 13-24, 25-36
  | 'red' // All red numbers
  | 'black' // All black numbers
  | 'even' // All even numbers
  | 'odd' // All odd numbers
  | 'low' // 1-18
  | 'high'; // 19-36

export interface RouletteBet {
  id: string;
  type: RouletteBetType;
  numbers: RouletteNumber[];
  amount: number;
  payout: number; // Multiplier
}

export interface RouletteState {
  isSpinning: boolean;
  result: RouletteNumber | null;
  previousResults: RouletteNumber[];
  bets: RouletteBet[];
  totalBet: number;
  potentialWin: number;
  winAmount: number;
  hasWon: boolean | null;
}

// American roulette wheel has 38 numbers: 0, 00, and 1-36
export const ROULETTE_NUMBERS: RouletteNumber[] = [
  0, '00', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36
];

// Map of numbers to colors (0 and 00 are green)
export const NUMBER_COLORS: Record<RouletteNumber, RouletteColor> = {
  0: 'green',
  '00': 'green',
  1: 'red',
  2: 'black',
  3: 'red',
  4: 'black',
  5: 'red',
  6: 'black',
  7: 'red',
  8: 'black',
  9: 'red',
  10: 'black',
  11: 'black',
  12: 'red',
  13: 'black',
  14: 'red',
  15: 'black',
  16: 'red',
  17: 'black',
  18: 'red',
  19: 'red',
  20: 'black',
  21: 'red',
  22: 'black',
  23: 'red',
  24: 'black',
  25: 'red',
  26: 'black',
  27: 'red',
  28: 'black',
  29: 'black',
  30: 'red',
  31: 'black',
  32: 'red',
  33: 'black',
  34: 'red',
  35: 'black',
  36: 'red'
};

// Payout ratios for different bet types
export const BET_PAYOUTS: Record<RouletteBetType, number> = {
  straight: 35, // 35:1
  split: 17, // 17:1
  street: 11, // 11:1
  corner: 8, // 8:1
  fiveNumber: 6, // 6:1
  sixLine: 5, // 5:1
  column: 2, // 2:1
  dozen: 2, // 2:1
  red: 1, // 1:1 (even money)
  black: 1, // 1:1 (even money)
  even: 1, // 1:1 (even money)
  odd: 1, // 1:1 (even money)
  low: 1, // 1:1 (even money)
  high: 1 // 1:1 (even money)
};

// Generate a random ID for bets
const generateId = () => Math.random().toString(36).substring(2, 9);

// Hook for roulette game
export const useRoulette = () => {
  const [state, setState] = useState<RouletteState>({
    isSpinning: false,
    result: null,
    previousResults: [],
    bets: [],
    totalBet: 0,
    potentialWin: 0,
    winAmount: 0,
    hasWon: null
  });

  // Add a bet to the table
  const placeBet = useCallback((type: RouletteBetType, numbers: RouletteNumber[], amount: number) => {
    if (state.isSpinning) return;

    setState(prev => {
      const bet: RouletteBet = {
        id: generateId(),
        type,
        numbers,
        amount,
        payout: BET_PAYOUTS[type]
      };

      const newBets = [...prev.bets, bet];
      const newTotalBet = newBets.reduce((total, bet) => total + bet.amount, 0);
      const newPotentialWin = calculatePotentialWin(newBets);

      return {
        ...prev,
        bets: newBets,
        totalBet: newTotalBet,
        potentialWin: newPotentialWin
      };
    });
  }, [state.isSpinning]);

  // Remove a bet from the table
  const removeBet = useCallback((id: string) => {
    if (state.isSpinning) return;

    setState(prev => {
      const newBets = prev.bets.filter(bet => bet.id !== id);
      const newTotalBet = newBets.reduce((total, bet) => total + bet.amount, 0);
      const newPotentialWin = calculatePotentialWin(newBets);

      return {
        ...prev,
        bets: newBets,
        totalBet: newTotalBet,
        potentialWin: newPotentialWin
      };
    });
  }, [state.isSpinning]);

  // Clear all bets
  const clearBets = useCallback(() => {
    if (state.isSpinning) return;

    setState(prev => ({
      ...prev,
      bets: [],
      totalBet: 0,
      potentialWin: 0
    }));
  }, [state.isSpinning]);

  // Calculate potential winnings from all bets
  const calculatePotentialWin = (bets: RouletteBet[]): number => {
    return bets.reduce((total, bet) => {
      return total + bet.amount * bet.payout;
    }, 0);
  };

  // Check if a bet is a winner
  const isBetWinner = (bet: RouletteBet, result: RouletteNumber): boolean => {
    // Direct number match
    if (bet.numbers.includes(result)) {
      return true;
    }

    // Outside bets
    const resultColor = NUMBER_COLORS[result];
    const resultNum = typeof result === 'number' ? result : -1; // 00 becomes -1 for comparison

    switch (bet.type) {
      case 'red':
        return resultColor === 'red';
      case 'black':
        return resultColor === 'black';
      case 'even':
        return resultNum > 0 && resultNum % 2 === 0;
      case 'odd':
        return resultNum > 0 && resultNum % 2 === 1;
      case 'low':
        return resultNum >= 1 && resultNum <= 18;
      case 'high':
        return resultNum >= 19 && resultNum <= 36;
      default:
        return false;
    }
  };

  // Spin the wheel
  const spin = useCallback(() => {
    if (state.isSpinning || state.bets.length === 0) return;

    setState(prev => ({
      ...prev,
      isSpinning: true,
      hasWon: null
    }));

    // Simulate wheel spinning
    setTimeout(() => {
      // Pick a random result
      const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
      const result = ROULETTE_NUMBERS[randomIndex];

      // Calculate winnings
      let winAmount = 0;
      let hasWon = false;

      state.bets.forEach(bet => {
        if (isBetWinner(bet, result)) {
          winAmount += bet.amount + (bet.amount * bet.payout);
          hasWon = true;
        }
      });

      setState(prev => ({
        ...prev,
        isSpinning: false,
        result,
        previousResults: [result, ...prev.previousResults].slice(0, 10),
        winAmount,
        hasWon: winAmount > 0
      }));
    }, 3000);
  }, [state.isSpinning, state.bets]);

  // Reset game for new round
  const newRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      bets: [],
      totalBet: 0,
      potentialWin: 0,
      result: null,
      winAmount: 0,
      hasWon: null
    }));
  }, []);

  return {
    ...state,
    placeBet,
    removeBet,
    clearBets,
    spin,
    newRound
  };
};

export default useRoulette;