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
  const [candles, setCandles] = useState<Array<{ 
    position: number, 
    open: number, 
    close: number, 
    high: number, 
    low: number,
    isGreen: boolean, 
    width: number 
  }>>([]);
  const [activeCandle, setActiveCandle] = useState<number>(0);
  
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
  
  // Generate random candles for the chart - crypto style
  const generateCandles = () => {
    const candleCount = 8; // More candles for better chart
    const newCandles = [];
    
    for (let i = 0; i < candleCount; i++) {
      // Crypto-style candle with open, close, high, low
      const open = 50 + Math.random() * 30;
      
      // Make first candle always green
      let close, isGreen;
      if (i === 0) {
        // First candle is always green (close > open)
        close = open + 5 + Math.random() * 15;
        isGreen = true;
      } else {
        close = 50 + Math.random() * 30;
        isGreen = close >= open;
      }
      
      // High and low beyond open/close for proper candlestick
      const high = Math.max(open, close) + (Math.random() * 10);
      const low = Math.min(open, close) - (Math.random() * 10);
      
      newCandles.push({
        position: 20 + i * 40, // Space them out horizontally
        open: open,
        close: close,
        high: high,
        low: low,
        isGreen: isGreen,
        width: 12, // Consistent width for better appearance
      });
    }
    
    setCandles(newCandles);
  };
  
  // Play sound effect
  const playSound = (type: 'start' | 'cashout' | 'crash') => {
    try {
      let sound: HTMLAudioElement;
      
      switch (type) {
        case 'start':
          // Rocket launch sound
          sound = new Audio('data:audio/wav;base64,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');
          break;
        case 'cashout':
          // Cash register sound
          sound = new Audio('data:audio/wav;base64,UklGRigCAABXQVZFZm10IBAAAAABAAEARKwAABCxAAACAAgAZGF0YQQCAACBgIF/gn2Cf4B+gH9+fX9/fn1/gH19f4F8fICCe3yAg3p8f4R6e3+Een1+gnx8foJ9fH6CfXx+gn18foJ9fH6CfXx+gn18foJ9fH6CfXt/gXx8gIF8fICBfHyAgXx9f4J8fX+CfH1/gnx9f4J7fn+BfH6AgHx+gIB8foB/fH6Af3x+gH98foB/e3+Bfnx/gX18f4F9fH+BfXx/gX1/fnl9hDQFTrAsmf6H/z33VNxODzMGbwanB1YHwAcwCIMI5QcuB68GCwZ1BSEFgARXBJ8DTAPmAhsCaAGuAPn/Pf+O/tb9M/2A/Pn7Ffya+kb6JPor+lL6//p7+/f7qPxm/SL+0v6J/zkA9wCmAVUCAgOrA0kE3ARfBesFlwaEBu0GXQfdB1AIxAj+CGoJ0QkhCnIK1wpGC5QLRAzuDJwNSQ75DqgPXBATEcYRgBIoE9kTkhRHFfUVoxZUF/4XoBhHGegZaxr8GocbFRyfHC0dtB09HsMeRR/HH0YgwCAcIXUhzSEiIm8iviIFI1AjmiPgIyQkZiSrJOskLiVmJaMl3yURJkkmeyaqJtUm/iYhJ0QnYSd6J5QnrCe+J88n4SfxJwAoDCgXKB4oJygtKDEoDwdNCmABgfcy2EHEPbqerZCpnaqYrJOthK52sXCyYLVRtze7G70FwOPC0MW1yJnL8c9a4ITkSew6/xgAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAA==');
          break;
        case 'crash':
          // Crash sound
          sound = new Audio('data:audio/wav;base64,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');
          break;
      }
      
      sound.volume = 0.5;
      sound.play().catch(e => console.error('Error playing sound:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
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
    setActiveCandle(0);
    
    // Play start sound
    playSound('start');
    
    // Generate candles for this round
    generateCandles();
    
    // Generate the crash point - consistent regardless of bet amount
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    
    // Refresh chart data
    setChartData([{ time: 0, value: 1 }]);
    
    // Start increasing multiplier
    let startTime = Date.now();
    let timeElapsed = 0;
    let candleIndex = 0;
    
    const interval = setInterval(() => {
      timeElapsed = (Date.now() - startTime) / 1000;
      
      // MUCH slower growth curve for better gameplay
      // This gives players time to enjoy the game and make decisions
      const newMultiplier = 1 + (timeElapsed / 7); // Linear growth is easier to understand and predict
      const roundedMultiplier = Math.floor(newMultiplier * 100) / 100;
      
      setMultiplier(roundedMultiplier);
      
      // Add point to chart data
      setChartData(prev => [...prev, { time: timeElapsed, value: roundedMultiplier }]);
      
      // Update active candle every 5 seconds
      if (timeElapsed > (candleIndex + 1) * 5 && candleIndex < candles.length - 1) {
        candleIndex++;
        setActiveCandle(candleIndex);
      }
      
      // Check if we've reached the crash point
      if (roundedMultiplier >= newCrashPoint) {
        clearInterval(interval);
        setIsCrashed(true);
        setIsRunning(false);
        
        // Play crash sound
        playSound('crash');
        
        setHistory(prev => [{ multiplier: roundedMultiplier, timestamp: new Date() }, ...prev].slice(0, 10));
      }
    }, 100); // Update every 100ms for smoother animation and less CPU usage
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  // Cash out at the current multiplier
  const cashOut = useCallback(() => {
    if (!isRunning || isCrashed) return 0;
    
    // Play cashout sound
    playSound('cashout');
    
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
    candles,
    activeCandle,
    startGame,
    cashOut
  };
};