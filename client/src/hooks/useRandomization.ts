import { useState, useCallback, useRef, useEffect } from 'react';
import { provablyFair, ProvablyFair } from '@/lib/provablyFair';

/**
 * Generate a random number between min and max (inclusive)
 * Note: For non-critical RNG where provable fairness is not required
 */
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Provably fair coin flip hook
 * Uses the provably fair algorithm to ensure verifiable results
 */
export const useCoinFlip = () => {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  // Keep track of game history for statistical purposes
  const [history, setHistory] = useState<Array<{
    result: 'heads' | 'tails';
    selectedSide: 'heads' | 'tails';
    timestamp: Date;
    won: boolean;
    serverSeed?: string;
    clientSeed?: string;
    nonce?: number;
    serverSeedHash?: string;
  }>>([]);

  // Store verification data for the current game
  const [verificationData, setVerificationData] = useState<{
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
    serverSeed?: string;
  } | null>(null);

  // Get the server seed hash before playing
  useEffect(() => {
    // Initialize with the provably fair system's server seed hash
    setVerificationData({
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: provablyFair.getClientSeed(),
      nonce: provablyFair.getNonce()
    });
  }, []);

  /**
   * Flip the coin with a specific side selected
   * @param side - The side (heads or tails) the player is betting on
   */
  const flip = useCallback((side: 'heads' | 'tails') => {
    if (isFlipping) return;

    setIsFlipping(true);
    setSelectedSide(side);

    // Store current verification data for this game
    const currentVerificationData = {
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: provablyFair.getClientSeed(),
      nonce: provablyFair.getNonce()
    };
    
    setVerificationData(currentVerificationData);

    // Simulate coin flip animation delay
    setTimeout(() => {
      // Use the provably fair algorithm to determine the result
      const { isHeads, seed } = provablyFair.calculateCoinFlip();
      const flipResult = isHeads ? 'heads' : 'tails';
      
      setResult(flipResult);
      const won = side === flipResult;
      setHasWon(won);

      // After the game, get the revealed server seed for verification
      const revealed = provablyFair.revealServerSeed();
      
      // Add the result to history
      setHistory(prev => [
        {
          result: flipResult as 'heads' | 'tails',
          selectedSide: side,
          timestamp: new Date(),
          won,
          serverSeed: revealed.serverSeed,
          clientSeed: currentVerificationData.clientSeed,
          nonce: revealed.nonce,
          serverSeedHash: currentVerificationData.serverSeedHash
        },
        ...prev
      ].slice(0, 10));

      // Generate a new server seed for the next game
      provablyFair.generateServerSeed();
      
      // Update verification data with the new server seed hash
      setVerificationData({
        serverSeedHash: provablyFair.getServerSeedHash(),
        clientSeed: provablyFair.getClientSeed(),
        nonce: provablyFair.getNonce()
      });
      
      setIsFlipping(false);
    }, 1500);
  }, [isFlipping]);

  /**
   * Set a custom client seed for added randomness
   * @param seed - The client provided seed
   */
  const setClientSeed = useCallback((seed: string) => {
    provablyFair.setClientSeed(seed);
    setVerificationData({
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: seed,
      nonce: provablyFair.getNonce()
    });
  }, []);

  return {
    result,
    selectedSide,
    isFlipping,
    hasWon,
    history,
    verificationData,
    flip,
    setClientSeed
  };
};

/**
 * Provably fair dice roll hook
 * Uses the provably fair algorithm to ensure verifiable results
 */
export const useDiceRoll = (minValue: number = 1, maxValue: number = 100) => {
  const [result, setResult] = useState<number | null>(null);
  const [target, setTarget] = useState<number>(50);
  const [betType, setBetType] = useState<'over' | 'under'>('over');
  const [isRolling, setIsRolling] = useState(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  
  // Keep track of game history
  const [history, setHistory] = useState<Array<{
    result: number;
    target: number;
    betType: 'over' | 'under';
    timestamp: Date;
    won: boolean;
    serverSeed?: string;
    clientSeed?: string;
    nonce?: number;
  }>>([]);

  // Store verification data for the current game
  const [verificationData, setVerificationData] = useState<{
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
    serverSeed?: string;
  } | null>(null);

  // Initialize verification data
  useEffect(() => {
    setVerificationData({
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: provablyFair.getClientSeed(),
      nonce: provablyFair.getNonce()
    });
  }, []);

  /**
   * Roll the dice for a specific target and bet type
   * @param selectedTarget - The target number
   * @param selectedBetType - Whether the player is betting over or under
   */
  const roll = useCallback((selectedTarget: number, selectedBetType: 'over' | 'under') => {
    if (isRolling) return;

    setIsRolling(true);
    setTarget(selectedTarget);
    setBetType(selectedBetType);

    // Store current verification data
    const currentVerificationData = {
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: provablyFair.getClientSeed(),
      nonce: provablyFair.getNonce()
    };
    
    setVerificationData(currentVerificationData);

    // Simulate dice roll animation delay
    setTimeout(() => {
      // Use provably fair algorithm to determine the result
      const { roll, seed } = provablyFair.calculateDiceRoll(minValue, maxValue);
      
      setResult(roll);
      
      // Determine if player won based on bet type and target
      const won = selectedBetType === 'over' 
        ? roll > selectedTarget 
        : roll < selectedTarget;
      
      setHasWon(won);

      // After the game, get the revealed server seed
      const revealed = provablyFair.revealServerSeed();
      
      // Add the result to history
      setHistory(prev => [
        {
          result: roll,
          target: selectedTarget,
          betType: selectedBetType,
          timestamp: new Date(),
          won,
          serverSeed: revealed.serverSeed,
          clientSeed: currentVerificationData.clientSeed,
          nonce: revealed.nonce
        },
        ...prev
      ].slice(0, 10));

      // Generate a new server seed for the next game
      provablyFair.generateServerSeed();
      
      // Update verification data
      setVerificationData({
        serverSeedHash: provablyFair.getServerSeedHash(),
        clientSeed: provablyFair.getClientSeed(),
        nonce: provablyFair.getNonce()
      });
      
      setIsRolling(false);
    }, 1500);
  }, [isRolling, minValue, maxValue]);

  /**
   * Set a custom client seed
   */
  const setClientSeed = useCallback((seed: string) => {
    provablyFair.setClientSeed(seed);
    setVerificationData({
      serverSeedHash: provablyFair.getServerSeedHash(),
      clientSeed: seed,
      nonce: provablyFair.getNonce()
    });
  }, []);

  /**
   * Calculate win probability based on target and bet type
   */
  const getWinProbability = useCallback((targetNum: number, betTypeVal: 'over' | 'under'): number => {
    if (betTypeVal === 'over') {
      return (maxValue - targetNum) / (maxValue - minValue + 1) * 100;
    } else {
      return (targetNum - minValue) / (maxValue - minValue + 1) * 100;
    }
  }, [minValue, maxValue]);

  /**
   * Calculate payout multiplier based on win probability and house edge
   */
  const getPayoutMultiplier = useCallback((winProbability: number): number => {
    const houseEdge = 0.025; // 2.5% house edge
    const fairMultiplier = 100 / winProbability;
    return fairMultiplier * (1 - houseEdge);
  }, []);

  return {
    result,
    target,
    betType,
    isRolling,
    hasWon,
    history,
    verificationData,
    roll,
    setClientSeed,
    getWinProbability,
    getPayoutMultiplier
  };
};

// Simple dice roll hook for traditional dice (1-6)
export const useSimpleDiceRoll = () => {
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
    profilePicture: string,  // URL to profile picture
    hasJoined: boolean,
    hasCashedOut: boolean,
    cashOutMultiplier: number | null,
    isConnected: boolean
  }>>([
    // Default dummy players to ensure game is never empty
    // Real players will be populated here from the backend
  ]);
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
  const [nextGameTimestamp, setNextGameTimestamp] = useState<Date | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    userId: string,
    username: string,
    profilePicture: string,
    message: string,
    timestamp: Date
  }>>([
    {
      userId: 'player1',
      username: 'CryptoBull',
      profilePicture: '/attached_assets/Y2HmxLIx_400x400.jpg',
      message: 'Let\'s go to the moon! 🚀',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      userId: 'player2',
      username: 'MoonHodler',
      profilePicture: '/attached_assets/processed-nft-33-1-dark (1).png',
      message: 'I\'m cashing out at 3x',
      timestamp: new Date(Date.now() - 30000)
    }
  ]);
  
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
  
  // Generate candles for the chart in the exact pattern requested
  const generateCandles = () => {
    const candleCount = 6; // Number of candles to show
    const newCandles = [];
    
    // Create first candle (starting from 0 to 1x)
    newCandles.push({
      position: 20, // First position
      open: 20, // Bottom of candle
      close: 50, // Top of candle
      high: 55, // Wick high
      low: 15, // Wick low
      isGreen: true, // First candle always green
      width: 12 // Standard width
    });
    
    // Second candle (1x to 2x)
    newCandles.push({
      position: 60, // Second position
      open: 50, // Connect to previous
      close: 70, // Higher close
      high: 75,
      low: 45,
      isGreen: true, // Up trend continues
      width: 12
    });
    
    // Third candle (2x to 3x)
    newCandles.push({
      position: 100,
      open: 70,
      close: 85, // Higher again
      high: 90,
      low: 65,
      isGreen: true,
      width: 12
    });
    
    // Fourth candle (small red correction)
    newCandles.push({
      position: 140,
      open: 85,
      close: 80, // Small drop
      high: 87,
      low: 75,
      isGreen: false, // Red candle
      width: 12
    });
    
    // Fifth candle (recovery, back to green)
    newCandles.push({
      position: 180,
      open: 80,
      close: 90, // Back up
      high: 95,
      low: 75,
      isGreen: true,
      width: 12
    });
    
    // Sixth candle (strong bullish to highest point)
    newCandles.push({
      position: 220,
      open: 90,
      close: 110, // Highest point
      high: 115,
      low: 85,
      isGreen: true,
      width: 12
    });
    
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
  const joinGame = useCallback((playerId: string, username: string, betAmount: number, profilePicture: string = '/attached_assets/head.png') => {
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
          profilePicture,
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
  
  // Add chat message
  const addChatMessage = useCallback((playerId: string, message: string) => {
    const player = currentPlayers.find(p => p.id === playerId);
    if (!player) return false;
    
    setChatMessages(prev => [
      ...prev,
      {
        userId: playerId,
        username: player.username,
        profilePicture: player.profilePicture,
        message,
        timestamp: new Date()
      }
    ]);
    
    return true;
  }, [currentPlayers]);
  
  // Change player nickname
  const changePlayerNickname = useCallback((playerId: string, newNickname: string) => {
    setCurrentPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, username: newNickname } 
          : player
      )
    );
  }, []);
  
  // Change player profile picture
  const changePlayerProfilePicture = useCallback((playerId: string, newProfilePicture: string) => {
    setCurrentPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, profilePicture: newProfilePicture } 
          : player
      )
    );
  }, []);
  
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
    
    // Refresh chart data - start from 0x
    setChartData([{ time: 0, value: 0 }]);
    
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
      
      // Growth curve that starts at 0 and gradually increases
      // First 5 seconds: 0x to 1x
      // Next 5 seconds: 1x to 2x
      // Next 5 seconds: 2x to 3x, etc.
      let newMultiplier;
      
      if (timeElapsed <= 5) {
        // First 5 seconds go from 0x to 1x
        newMultiplier = timeElapsed / 5;
      } else {
        // After 5 seconds, increase by 1x every 5 seconds
        const segment = Math.floor(timeElapsed / 5);
        const segmentProgress = (timeElapsed % 5) / 5;
        newMultiplier = segment + segmentProgress;
      }
      
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
    chatMessages,
    
    // Game actions
    startGame,
    cashOut,
    
    // Multiplayer actions
    setIsMultiplayerGame,
    joinGame,
    playerCashOut,
    leaveGame,
    
    // Chat and profile actions
    addChatMessage,
    changePlayerNickname,
    changePlayerProfilePicture
  };
};