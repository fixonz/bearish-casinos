import { useState, useEffect, useCallback } from 'react';

// Function to generate a secure random number between min and max
export const getRandomNumber = (min: number, max: number): number => {
  // Get 2 bytes of randomness
  const randomBuffer = new Uint16Array(1);
  window.crypto.getRandomValues(randomBuffer);
  
  // Convert to a decimal between 0 and 1
  const randomDecimal = randomBuffer[0] / 65536;
  
  // Scale to our range and return
  return Math.floor(randomDecimal * (max - min + 1)) + min;
};

// Hook for coin flip game
export const useCoinFlip = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const flip = useCallback((selection: 'heads' | 'tails') => {
    setIsFlipping(true);
    setSelectedSide(selection);
    setHasWon(null);
    setResult(null);

    // Simulate delay for animation
    setTimeout(() => {
      // Get random result
      const flipResult = getRandomNumber(0, 1) === 0 ? 'heads' : 'tails';
      setResult(flipResult);
      setHasWon(selection === flipResult);
      setIsFlipping(false);
    }, 3000);
  }, []);

  return {
    isFlipping,
    result,
    selectedSide,
    hasWon,
    flip
  };
};

// Hook for dice roll game
export const useDiceRoll = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const roll = useCallback((selection: number) => {
    setIsRolling(true);
    setSelectedNumber(selection);
    setHasWon(null);
    setResult(null);

    // Simulate delay for animation
    setTimeout(() => {
      // Get random result between 1 and 6
      const rollResult = getRandomNumber(1, 6);
      setResult(rollResult);
      setHasWon(selection === rollResult);
      setIsRolling(false);
    }, 2000);
  }, []);

  return {
    isRolling,
    result,
    selectedNumber,
    hasWon,
    roll
  };
};

// Hook for slots game
export const useSlots = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Array<string | null>>([null, null, null]);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  // Possible symbols for the slots - using bear themed symbols
  const symbols = ['🐻', '💰', '⭐', '🍒', '7️⃣'];
  
  // Symbol payouts - different symbols have different values
  const symbolPayouts = {
    '🐻': 5, // bear has the highest payout (5x)
    '💰': 3, // money bag has 3x
    '⭐': 2, // star has 2x
    '🍒': 1.5, // cherry has 1.5x
    '7️⃣': 4, // seven has 4x
  };

  const spin = useCallback(() => {
    setIsSpinning(true);
    setHasWon(null);
    setResult([null, null, null]);

    // Simulate delay for animation
    setTimeout(() => {
      // Get random symbols for each reel with weighted probabilities
      // Higher value symbols have lower probability
      const generateWeightedSymbol = () => {
        const rand = Math.random();
        if (rand < 0.1) return '🐻'; // 10% chance for bear
        if (rand < 0.25) return '7️⃣'; // 15% chance for seven
        if (rand < 0.45) return '💰'; // 20% chance for money bag
        if (rand < 0.70) return '⭐'; // 25% chance for star
        return '🍒'; // 30% chance for cherry
      };
      
      const spinResult = [
        generateWeightedSymbol(),
        generateWeightedSymbol(),
        generateWeightedSymbol()
      ];
      
      setResult(spinResult);
      
      // Check win conditions:
      // - All three symbols match (big win)
      // - Two adjacent symbols match (small win)
      const allMatch = spinResult[0] === spinResult[1] && spinResult[1] === spinResult[2];
      const twoMatch = 
        spinResult[0] === spinResult[1] || 
        spinResult[1] === spinResult[2];
      
      // For simplicity, we'll only count a win if all symbols match
      // In a real implementation, we'd calculate partial payouts for two matches
      setHasWon(allMatch);
      setIsSpinning(false);
    }, 2500);
  }, []);

  return {
    isSpinning,
    result,
    hasWon,
    spin,
    symbols,
    symbolPayouts
  };
};

// Hook for crash game
export const useCrash = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [hasUserCashedOut, setHasUserCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Generate crash point using randomization
  const generateCrashPoint = useCallback(() => {
    // Use random number generation for provable fairness
    // This formula creates an exponential distribution common in crash games
    const r = getRandomNumber(1, 100);
    // Adjust these values to change the distribution
    return Math.max(1.0, 0.9 * Math.pow(Math.E, r / 40));
  }, []);

  const startGame = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setHasCrashed(false);
    setHasUserCashedOut(false);
    setCashOutMultiplier(null);
    setMultiplier(1.0);
    
    // Generate the crash point at the start for fairness
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    
    // Start the multiplier increment
    const id = setInterval(() => {
      setMultiplier((prev) => {
        const increment = Math.max(0.01, prev * 0.005); // Dynamic increment
        const newValue = prev + increment;
        
        // Check if we've hit the crash point
        if (newValue >= newCrashPoint) {
          clearInterval(id);
          setHasCrashed(true);
          setIsRunning(false);
          return newCrashPoint;
        }
        
        return parseFloat(newValue.toFixed(2));
      });
    }, 100);
    
    setIntervalId(id);
  }, [isRunning, generateCrashPoint]);

  const cashOut = useCallback(() => {
    if (!isRunning || hasCrashed || hasUserCashedOut) return;
    
    setHasUserCashedOut(true);
    setCashOutMultiplier(multiplier);
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isRunning, hasCrashed, hasUserCashedOut, multiplier, intervalId]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    isRunning,
    multiplier,
    hasCrashed,
    hasUserCashedOut,
    cashOutMultiplier,
    startGame,
    cashOut
  };
};
