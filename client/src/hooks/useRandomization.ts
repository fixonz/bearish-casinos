import { useState, useCallback } from 'react';

// Generate a random number between min and max (inclusive)
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Coin flip hook
export const useCoinFlip = () => {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<Array<{ result: 'heads' | 'tails', timestamp: Date }>>([]);
  
  const flip = useCallback(() => {
    setIsFlipping(true);
    // Simulate coin flip animation delay
    setTimeout(() => {
      const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(flipResult);
      setHistory(prev => [{ result: flipResult as 'heads' | 'tails', timestamp: new Date() }, ...prev].slice(0, 10));
      setIsFlipping(false);
    }, 1500);
  }, []);
  
  return {
    result,
    isFlipping,
    history,
    flip
  };
};

// Dice roll hook
export const useDiceRoll = () => {
  const [dice, setDice] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<Array<{ dice: number[], timestamp: Date }>>([]);
  
  const roll = useCallback((numberOfDice: number = 1) => {
    setIsRolling(true);
    // Simulate dice roll animation delay
    setTimeout(() => {
      const diceResults = Array.from({ length: numberOfDice }, () => getRandomNumber(1, 6));
      setDice(diceResults);
      setHistory(prev => [{ dice: diceResults, timestamp: new Date() }, ...prev].slice(0, 10));
      setIsRolling(false);
    }, 1500);
  }, []);
  
  return {
    dice,
    isRolling,
    history,
    roll
  };
};

// Slots game hook
export const useSlots = () => {
  // Define slot symbols
  const symbols = [
    { name: 'cherry', value: 2 },
    { name: 'lemon', value: 3 },
    { name: 'orange', value: 4 },
    { name: 'plum', value: 5 },
    { name: 'bell', value: 10 },
    { name: 'bar', value: 20 },
    { name: 'seven', value: 50 },
    { name: 'diamond', value: 100 }
  ];
  
  const [reels, setReels] = useState<string[][]>([
    ['cherry', 'lemon', 'orange'],
    ['plum', 'bell', 'bar'],
    ['seven', 'diamond', 'cherry']
  ]);
  
  const [spinResult, setSpinResult] = useState<string[]>(['cherry', 'plum', 'seven']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winLines, setWinLines] = useState<number[]>([]);
  
  // Generate weighted random symbol based on values (higher value = less likely)
  const getRandomSymbol = () => {
    // Calculate total weight (inverse of value)
    const totalWeight = symbols.reduce((sum, symbol) => sum + (100 / symbol.value), 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of symbols) {
      const weight = 100 / symbol.value;
      if (random <= weight) {
        return symbol.name;
      }
      random -= weight;
    }
    
    // Fallback
    return symbols[0].name;
  };
  
  // Spin the slots
  const spin = useCallback((bet: number) => {
    setIsSpinning(true);
    
    // Reset previous win
    setWinAmount(0);
    setWinLines([]);
    
    // Generate new random reels with 3 visible positions each
    const newReels: string[][] = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];
    
    setTimeout(() => {
      setReels(newReels);
      
      // Center row is the default payline
      const centerPayline = [newReels[0][1], newReels[1][1], newReels[2][1]];
      setSpinResult(centerPayline);
      
      // Check for win on center line
      if (centerPayline[0] === centerPayline[1] && centerPayline[1] === centerPayline[2]) {
        const symbol = symbols.find(s => s.name === centerPayline[0]);
        if (symbol) {
          setWinAmount(bet * symbol.value);
          setWinLines([1]); // Center line (index 1)
        }
      }
      
      // Check top line
      const topPayline = [newReels[0][0], newReels[1][0], newReels[2][0]];
      if (topPayline[0] === topPayline[1] && topPayline[1] === topPayline[2]) {
        const symbol = symbols.find(s => s.name === topPayline[0]);
        if (symbol) {
          setWinAmount(prev => prev + bet * symbol.value);
          setWinLines(prev => [...prev, 0]); // Top line (index 0)
        }
      }
      
      // Check bottom line
      const bottomPayline = [newReels[0][2], newReels[1][2], newReels[2][2]];
      if (bottomPayline[0] === bottomPayline[1] && bottomPayline[1] === bottomPayline[2]) {
        const symbol = symbols.find(s => s.name === bottomPayline[0]);
        if (symbol) {
          setWinAmount(prev => prev + bet * symbol.value);
          setWinLines(prev => [...prev, 2]); // Bottom line (index 2)
        }
      }
      
      // Diagonal top-left to bottom-right
      const diagonalDown = [newReels[0][0], newReels[1][1], newReels[2][2]];
      if (diagonalDown[0] === diagonalDown[1] && diagonalDown[1] === diagonalDown[2]) {
        const symbol = symbols.find(s => s.name === diagonalDown[0]);
        if (symbol) {
          setWinAmount(prev => prev + bet * symbol.value);
          setWinLines(prev => [...prev, 3]); // Diagonal down (index 3)
        }
      }
      
      // Diagonal bottom-left to top-right
      const diagonalUp = [newReels[0][2], newReels[1][1], newReels[2][0]];
      if (diagonalUp[0] === diagonalUp[1] && diagonalUp[1] === diagonalUp[2]) {
        const symbol = symbols.find(s => s.name === diagonalUp[0]);
        if (symbol) {
          setWinAmount(prev => prev + bet * symbol.value);
          setWinLines(prev => [...prev, 4]); // Diagonal up (index 4)
        }
      }
      
      setIsSpinning(false);
    }, 2000);
  }, []);
  
  return {
    reels,
    spinResult,
    isSpinning,
    winAmount,
    winLines,
    symbols,
    spin
  };
};

// Crash game hook
export const useCrash = () => {
  const [multiplier, setMultiplier] = useState(1);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [crashPoint, setCrashPoint] = useState(1);
  const [hasUserCashedOut, setHasUserCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ multiplier: number, timestamp: Date }>>([]);
  const [chartData, setChartData] = useState<Array<{ time: number, value: number }>>([{ time: 0, value: 1 }]);
  
  // Generate a crash point with a consistent distribution regardless of bet amount
  const generateCrashPoint = (): number => {
    // Base house edge (constant regardless of bet amount)
    const houseEdge = 0.05;
    
    // Generate a random value with a more balanced distribution
    const randomValue = Math.random();
    
    // Use a formula that creates a smoother distribution
    // This is the "provably fair" approach similar to what real crypto gambling sites use
    let crashPoint = 0.99 / (randomValue * houseEdge);
    
    // Round to 2 decimal places
    crashPoint = Math.floor(crashPoint * 100) / 100;
    
    // Enforce minimum and reasonable maximum
    crashPoint = Math.max(1.01, Math.min(crashPoint, 100));
    
    // Small chance (2%) for a very high multiplier between 10-100x
    if (randomValue > 0.98) {
      crashPoint = 10 + Math.random() * 90;
      crashPoint = Math.floor(crashPoint * 100) / 100;
    }
    
    // More common (28%) chance for medium multiplier between 2-10x
    else if (randomValue > 0.70) {
      crashPoint = 2 + Math.random() * 8;
      crashPoint = Math.floor(crashPoint * 100) / 100;
    }
    
    // 70% chance for lower multipliers between 1.01-2x
    else {
      crashPoint = 1.01 + Math.random() * 0.99;
      crashPoint = Math.floor(crashPoint * 100) / 100;
    }
    
    return crashPoint;
  };
  
  // Start the crash game
  const startGame = useCallback(() => {
    if (isRunning) return;
    
    // Reset values
    setMultiplier(1);
    setIsCrashed(false);
    setIsRunning(true);
    setHasUserCashedOut(false);
    setCashOutMultiplier(null);
    
    // Generate the crash point - consistent regardless of bet amount
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    
    // Refresh chart data
    setChartData([{ time: 0, value: 1 }]);
    
    // Start increasing multiplier
    let startTime = Date.now();
    let timeElapsed = 0;
    
    const interval = setInterval(() => {
      timeElapsed = (Date.now() - startTime) / 1000;
      
      // Consistent multiplier growth function that doesn't change with bet amount
      // Slower initial growth, then accelerating
      const newMultiplier = Math.pow(1.0016, timeElapsed * 1000);
      const roundedMultiplier = Math.floor(newMultiplier * 100) / 100;
      
      setMultiplier(roundedMultiplier);
      
      // Add point to chart data
      setChartData(prev => [...prev, { time: timeElapsed, value: roundedMultiplier }]);
      
      // Check if we've reached the crash point
      if (roundedMultiplier >= newCrashPoint) {
        clearInterval(interval);
        setIsCrashed(true);
        setIsRunning(false);
        setHistory(prev => [{ multiplier: roundedMultiplier, timestamp: new Date() }, ...prev].slice(0, 10));
      }
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  // Cash out at the current multiplier
  const cashOut = useCallback(() => {
    if (!isRunning || isCrashed) return 0;
    
    const cashoutMultiplier = multiplier;
    setHasUserCashedOut(true);
    setCashOutMultiplier(cashoutMultiplier);
    setIsRunning(false);
    
    return cashoutMultiplier;
  }, [isRunning, isCrashed, multiplier]);
  
  return {
    multiplier,
    hasCrashed: isCrashed,
    isRunning,
    hasUserCashedOut,
    cashOutMultiplier,
    history,
    chartData,
    startGame,
    cashOut
  };
};