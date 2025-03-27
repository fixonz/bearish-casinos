import { useState, useCallback, useEffect } from 'react';

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

// Crash game hook with multiplayer support
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
  
  // Multiplayer-specific state
  const [isMultiplayerGame, setIsMultiplayerGame] = useState(true); // Default to multiplayer mode
  const [currentPlayers, setCurrentPlayers] = useState<Array<{
    id: string,
    betAmount: number,
    username: string,
    hasJoined: boolean,
    hasCashedOut: boolean,
    cashOutMultiplier: number | null,
    isConnected: boolean
  }>>([]);
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
  const [nextGameTimestamp, setNextGameTimestamp] = useState<Date | null>(null);
  
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
          sound = new Audio('/sounds/455892__jalastram__start_sounds_001.wav');
          break;
        case 'cashout':
          // Cash register/coin sound
          sound = new Audio('/sounds/677853__el_boss__coin-flip-ping.mp3');
          break;
        case 'crash':
          // Crash sound
          sound = new Audio('/sounds/646952__audiopapkin__impact-sfx-029.wav');
          break;
      }
      
      sound.volume = 0.5;
      sound.play().catch(e => console.error('Error playing sound:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Initialize a multiplayer game with timed game cycles
  useEffect(() => {
    if (isMultiplayerGame && !isRunning && !isCrashed) {
      // Set up the next game to start in X seconds
      const NEXT_GAME_DELAY = 10; // seconds until next game starts
      setGameStartCountdown(NEXT_GAME_DELAY);
      
      const nextGame = new Date();
      nextGame.setSeconds(nextGame.getSeconds() + NEXT_GAME_DELAY);
      setNextGameTimestamp(nextGame);
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setGameStartCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            // We'll initialize the game manually since we can't reference startGame here yet
            setMultiplier(1);
            setIsCrashed(false);
            setIsRunning(true);
            setHasUserCashedOut(false);
            setCashOutMultiplier(null);
            setActiveCandle(0);
            
            // Play start sound
            playSound('start');
            
            // Generate candles
            generateCandles();
            
            // The rest of the logic will be handled by the useEffect that watches isRunning
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [isMultiplayerGame, isRunning, isCrashed, playSound]);
  
  // Add a player to the current game (for multiplayer)
  const joinGame = useCallback((playerId: string, username: string, betAmount: number) => {
    if (isCrashed) return false;
    
    // Check if player already exists
    const existingPlayerIndex = currentPlayers.findIndex(p => p.id === playerId);
    
    if (existingPlayerIndex >= 0) {
      // Update existing player
      setCurrentPlayers(prev => {
        const updated = [...prev];
        updated[existingPlayerIndex] = {
          ...updated[existingPlayerIndex],
          betAmount,
          hasJoined: true,
          isConnected: true
        };
        return updated;
      });
    } else {
      // Add new player
      setCurrentPlayers(prev => [
        ...prev,
        {
          id: playerId,
          username,
          betAmount,
          hasJoined: true,
          hasCashedOut: false,
          cashOutMultiplier: null,
          isConnected: true
        }
      ]);
    }
    
    return true;
  }, [isCrashed, currentPlayers]);
  
  // Player cash out (for multiplayer)
  const playerCashOut = useCallback((playerId: string) => {
    if (!isRunning || isCrashed) return 0;
    
    const currentMultiplier = multiplier;
    
    // Update player status
    setCurrentPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          // Play cashout sound when a player cashes out
          playSound('cashout');
          
          return {
            ...player,
            hasCashedOut: true,
            cashOutMultiplier: currentMultiplier
          };
        }
        return player;
      });
    });
    
    return currentMultiplier;
  }, [isRunning, isCrashed, multiplier, playSound]);
  
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
    
    // Reset player status for those who are still in the game
    setCurrentPlayers(prev => prev.map(player => ({
      ...player,
      hasCashedOut: false,
      cashOutMultiplier: null
    })));
    
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
        
        // Update history
        setHistory(prev => [{ multiplier: roundedMultiplier, timestamp: new Date() }, ...prev].slice(0, 10));
        
        // In multiplayer mode, prepare for the next game cycle
        if (isMultiplayerGame) {
          // Auto-start next game countdown
          const NEXT_GAME_DELAY = 10; // seconds until next game starts
          setGameStartCountdown(NEXT_GAME_DELAY);
          
          const nextGame = new Date();
          nextGame.setSeconds(nextGame.getSeconds() + NEXT_GAME_DELAY);
          setNextGameTimestamp(nextGame);
        }
      }
    }, 100); // Update every 100ms for smoother animation and less CPU usage
    
    return () => clearInterval(interval);
  }, [isRunning, isMultiplayerGame, playSound, candles]);
  
  // Cash out at the current multiplier
  const cashOut = useCallback(() => {
    if (!isRunning || isCrashed) return 0;
    
    // Play cashout sound
    playSound('cashout');
    
    const cashoutMultiplier = multiplier;
    setHasUserCashedOut(true);
    setCashOutMultiplier(cashoutMultiplier);
    
    // For single player mode, we stop the game on cash out
    if (!isMultiplayerGame) {
      setIsRunning(false);
    }
    
    return cashoutMultiplier;
  }, [isRunning, isCrashed, multiplier, isMultiplayerGame, playSound]);
  
  // Leave the game (for multiplayer)
  const leaveGame = useCallback((playerId: string) => {
    setCurrentPlayers(prev => prev.filter(player => player.id !== playerId));
  }, []);
  
  return {
    // Basic game state
    multiplier,
    hasCrashed: isCrashed,
    isRunning,
    hasUserCashedOut,
    cashOutMultiplier,
    history,
    chartData,
    candles,
    activeCandle,
    
    // Multiplayer state
    isMultiplayerGame,
    currentPlayers,
    gameStartCountdown,
    nextGameTimestamp,
    
    // Game actions
    startGame,
    cashOut,
    
    // Multiplayer actions
    setIsMultiplayerGame,
    joinGame,
    playerCashOut,
    leaveGame
  };
};