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

  // Possible symbols for the slots
  const symbols = ['🐻', '💰', '⭐', '🍒', '7️⃣'];

  const spin = useCallback(() => {
    setIsSpinning(true);
    setHasWon(null);
    setResult([null, null, null]);

    // Simulate delay for animation
    setTimeout(() => {
      // Get random symbols for each reel
      const spinResult = [
        symbols[getRandomNumber(0, symbols.length - 1)],
        symbols[getRandomNumber(0, symbols.length - 1)],
        symbols[getRandomNumber(0, symbols.length - 1)]
      ];
      
      setResult(spinResult);
      
      // Check if all symbols match (win condition)
      const win = spinResult[0] === spinResult[1] && spinResult[1] === spinResult[2];
      setHasWon(win);
      setIsSpinning(false);
    }, 2500);
  }, [symbols]);

  return {
    isSpinning,
    result,
    hasWon,
    spin,
    symbols
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
