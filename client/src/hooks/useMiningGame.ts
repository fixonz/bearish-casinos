import { useState, useCallback, useEffect } from 'react';

// Types of mining hardware available
export interface MiningHardware {
  id: string;
  name: string;
  icon: string;
  hashRate: number; // Hash rate in TH/s
  powerConsumption: number; // Power consumption in watts
  cost: number; // Cost in game currency
  lifespan: number; // Lifespan in mining cycles before breakdown
}

// Mining pool options
export interface MiningPool {
  id: string;
  name: string;
  icon: string;
  fee: number; // Pool fee as percentage (0-100)
  luck: number; // Luck factor (affects rewards, 0.8-1.2)
  minPayout: number; // Minimum payout in crypto units
}

// Cryptocurrency that can be mined
export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  baseReward: number; // Base reward per TH/s
  difficulty: number; // Mining difficulty (higher = harder)
  marketPrice: number; // Current price in game currency
  volatility: number; // Price volatility (0-1)
}

// Mining stats for game state
export interface MiningStats {
  totalHashRate: number;
  energyConsumption: number;
  operatingCosts: number;
  miningEfficiency: number;
  lastBlockFound: number;
  totalMined: Record<string, number>; // Total amount mined per cryptocurrency
  totalEarned: number; // Total earned in game currency
  hardware: Record<string, number>; // Owned hardware by id and count
  runningHardware: Record<string, number>; // Currently running hardware
}

// Mining history entry
export interface MiningEvent {
  timestamp: Date;
  type: 'block' | 'payout' | 'breakdown' | 'purchase';
  description: string;
  amount?: number;
  cryptoId?: string;
}

// Game state
export interface MiningGameState {
  gameStarted: boolean;
  gameLevel: number;
  availableHardware: MiningHardware[];
  availablePools: MiningPool[];
  availableCryptos: Cryptocurrency[];
  selectedPool: MiningPool | null;
  selectedCrypto: Cryptocurrency | null;
  stats: MiningStats;
  balance: number;
  cycleCount: number;
  isMining: boolean;
  autoMining: boolean;
  miningEvents: MiningEvent[];
  miningSpeed: number; // Cycles per second
}

// Default values for the game
const DEFAULT_HARDWARE: MiningHardware[] = [
  {
    id: 'basic-gpu',
    name: 'Basic GPU Rig',
    icon: '💻',
    hashRate: 0.1,
    powerConsumption: 200,
    cost: 30,
    lifespan: 100
  },
  {
    id: 'gaming-gpu',
    name: 'Gaming GPU Rig',
    icon: '🖥️',
    hashRate: 0.5,
    powerConsumption: 300,
    cost: 100,
    lifespan: 150
  },
  {
    id: 'mining-gpu',
    name: 'Mining GPU Rig',
    icon: '⚡',
    hashRate: 1.2,
    powerConsumption: 500,
    cost: 250,
    lifespan: 200
  },
  {
    id: 'asic-miner',
    name: 'ASIC Miner',
    icon: '🔌',
    hashRate: 5,
    powerConsumption: 1200,
    cost: 800,
    lifespan: 250
  },
  {
    id: 'mining-farm',
    name: 'Mining Farm',
    icon: '🏭',
    hashRate: 30,
    powerConsumption: 8000,
    cost: 5000,
    lifespan: 300
  }
];

const DEFAULT_POOLS: MiningPool[] = [
  {
    id: 'solo',
    name: 'Solo Mining',
    icon: '🔒',
    fee: 0,
    luck: 0.8,
    minPayout: 0.001
  },
  {
    id: 'small-pool',
    name: 'Small Pool',
    icon: '👥',
    fee: 1,
    luck: 1.0,
    minPayout: 0.0005
  },
  {
    id: 'medium-pool',
    name: 'Medium Pool',
    icon: '👪',
    fee: 2,
    luck: 1.1,
    minPayout: 0.0002
  },
  {
    id: 'large-pool',
    name: 'Large Pool',
    icon: '🏙️',
    fee: 3,
    luck: 1.2,
    minPayout: 0.0001
  }
];

const DEFAULT_CRYPTOCURRENCIES: Cryptocurrency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    baseReward: 0.00001,
    difficulty: 1,
    marketPrice: 50000,
    volatility: 0.05
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    baseReward: 0.0001,
    difficulty: 0.7,
    marketPrice: 2800,
    volatility: 0.07
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    icon: 'Ł',
    baseReward: 0.001,
    difficulty: 0.5,
    marketPrice: 100,
    volatility: 0.1
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    icon: '🐕',
    baseReward: 10,
    difficulty: 0.3,
    marketPrice: 0.1,
    volatility: 0.15
  }
];

const INITIAL_STATS: MiningStats = {
  totalHashRate: 0,
  energyConsumption: 0,
  operatingCosts: 0,
  miningEfficiency: 0,
  lastBlockFound: 0,
  totalMined: {},
  totalEarned: 0,
  hardware: {},
  runningHardware: {}
};

export const useMiningGame = (initialBalance: number = 100) => {
  const [state, setState] = useState<MiningGameState>({
    gameStarted: false,
    gameLevel: 1,
    availableHardware: DEFAULT_HARDWARE,
    availablePools: DEFAULT_POOLS,
    availableCryptos: DEFAULT_CRYPTOCURRENCIES,
    selectedPool: DEFAULT_POOLS[0],
    selectedCrypto: DEFAULT_CRYPTOCURRENCIES[0],
    stats: INITIAL_STATS,
    balance: initialBalance,
    cycleCount: 0,
    isMining: false,
    autoMining: false,
    miningEvents: [],
    miningSpeed: 1
  });

  // Start the game
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameStarted: true
    }));
  }, []);

  // Purchase hardware
  const purchaseHardware = useCallback((hardwareId: string, quantity: number = 1): boolean => {
    setState(prev => {
      const hardware = prev.availableHardware.find(h => h.id === hardwareId);
      if (!hardware) return prev;

      const totalCost = hardware.cost * quantity;
      if (totalCost > prev.balance) return prev; // Not enough money

      // Add to owned hardware
      const updatedHardware = { ...prev.stats.hardware };
      updatedHardware[hardwareId] = (updatedHardware[hardwareId] || 0) + quantity;

      // Add to running hardware
      const updatedRunning = { ...prev.stats.runningHardware };
      updatedRunning[hardwareId] = (updatedRunning[hardwareId] || 0) + quantity;

      // Record purchase event
      const event: MiningEvent = {
        timestamp: new Date(),
        type: 'purchase',
        description: `Purchased ${quantity} ${hardware.name}`,
        amount: totalCost
      };

      // Update state
      return {
        ...prev,
        balance: prev.balance - totalCost,
        stats: {
          ...prev.stats,
          hardware: updatedHardware,
          runningHardware: updatedRunning
        },
        miningEvents: [event, ...prev.miningEvents]
      };
    });

    return true;
  }, []);

  // Select mining pool
  const selectPool = useCallback((poolId: string) => {
    setState(prev => {
      const pool = prev.availablePools.find(p => p.id === poolId);
      if (!pool) return prev;

      return {
        ...prev,
        selectedPool: pool
      };
    });
  }, []);

  // Select cryptocurrency to mine
  const selectCrypto = useCallback((cryptoId: string) => {
    setState(prev => {
      const crypto = prev.availableCryptos.find(c => c.id === cryptoId);
      if (!crypto) return prev;

      return {
        ...prev,
        selectedCrypto: crypto
      };
    });
  }, []);

  // Start/stop mining
  const toggleMining = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMining: !prev.isMining
    }));
  }, []);

  // Toggle auto mining
  const toggleAutoMining = useCallback(() => {
    setState(prev => ({
      ...prev,
      autoMining: !prev.autoMining
    }));
  }, []);

  // Change mining speed
  const setMiningSpeed = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      miningSpeed: speed
    }));
  }, []);

  // Calculate mining rewards for a cycle
  const calculateRewards = useCallback((
    hashRate: number,
    crypto: Cryptocurrency,
    pool: MiningPool,
    difficultyFactor: number
  ): number => {
    // Base calculation
    const baseAmount = hashRate * crypto.baseReward;
    
    // Apply difficulty factor
    const difficultyAdjusted = baseAmount / (crypto.difficulty * difficultyFactor);
    
    // Apply pool luck and fee
    const poolAdjusted = difficultyAdjusted * pool.luck * (1 - pool.fee / 100);
    
    // Add some randomness (+-10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    return poolAdjusted * randomFactor;
  }, []);

  // Mine a cycle
  const mineCycle = useCallback(() => {
    setState(prev => {
      if (!prev.isMining || !prev.selectedCrypto || !prev.selectedPool) return prev;

      // Calculate total hash rate from running hardware
      let totalHashRate = 0;
      let totalPower = 0;
      const runningHardwareUpdated = { ...prev.stats.runningHardware };
      
      // Process each type of running hardware
      for (const [hwId, count] of Object.entries(runningHardwareUpdated)) {
        const hardware = prev.availableHardware.find(h => h.id === hwId);
        if (!hardware || count <= 0) continue;
        
        totalHashRate += hardware.hashRate * count;
        totalPower += hardware.powerConsumption * count;
        
        // Check for hardware breakdowns (random chance based on lifespan)
        for (let i = 0; i < count; i++) {
          const breakdownChance = 1 / hardware.lifespan;
          if (Math.random() < breakdownChance) {
            runningHardwareUpdated[hwId]--;
            
            // Record breakdown event
            const breakdownEvent: MiningEvent = {
              timestamp: new Date(),
              type: 'breakdown',
              description: `A ${hardware.name} broke down!`
            };
            
            prev.miningEvents = [breakdownEvent, ...prev.miningEvents];
          }
        }
      }
      
      // Calculate operating costs based on power consumption
      const powerCostPerWatt = 0.0001; // Cost per watt per cycle
      const operatingCosts = totalPower * powerCostPerWatt;
      
      // Skip if no running hardware
      if (totalHashRate <= 0) {
        return {
          ...prev,
          isMining: false, // Stop mining if no hardware is running
          stats: {
            ...prev.stats,
            runningHardware: runningHardwareUpdated,
            totalHashRate: 0,
            energyConsumption: 0,
            operatingCosts: 0
          }
        };
      }
      
      // Pay operating costs
      const balanceAfterCosts = prev.balance - operatingCosts;
      
      // If balance is negative, stop mining
      if (balanceAfterCosts < 0) {
        return {
          ...prev,
          isMining: false,
          stats: {
            ...prev.stats,
            runningHardware: runningHardwareUpdated
          }
        };
      }
      
      // Calculate difficulty factor based on game level and cycle count
      const difficultyFactor = 1 + (prev.gameLevel - 1) * 0.2 + prev.cycleCount * 0.0001;
      
      // Calculate mining rewards
      const crypto = prev.selectedCrypto;
      const pool = prev.selectedPool;
      const rewardAmount = calculateRewards(totalHashRate, crypto, pool, difficultyFactor);
      
      // Update total mined for this crypto
      const totalMinedUpdated = { ...prev.stats.totalMined };
      totalMinedUpdated[crypto.id] = (totalMinedUpdated[crypto.id] || 0) + rewardAmount;
      
      // Check if a block was found (based on hashrate and luck)
      const blockChance = (totalHashRate / 1000) * pool.luck * (1 / difficultyFactor);
      const foundBlock = Math.random() < blockChance;
      
      let miningEventsUpdated = [...prev.miningEvents];
      let lastBlockFound = prev.stats.lastBlockFound;
      let earnedAmount = 0;
      
      if (foundBlock) {
        // Calculate block reward (much larger than regular mining)
        const blockReward = rewardAmount * 1000 * (1 + Math.random());
        
        // Convert to game currency based on market price
        earnedAmount = blockReward * crypto.marketPrice;
        
        // Record block found event
        const blockEvent: MiningEvent = {
          timestamp: new Date(),
          type: 'block',
          description: `Found a ${crypto.symbol} block! Earned ${blockReward.toFixed(8)} ${crypto.symbol}`,
          amount: blockReward,
          cryptoId: crypto.id
        };
        
        miningEventsUpdated = [blockEvent, ...miningEventsUpdated];
        lastBlockFound = prev.cycleCount;
      }
      
      // Check if reached minimum payout threshold for regular mining
      const accumulatedCrypto = totalMinedUpdated[crypto.id] || 0;
      
      if (accumulatedCrypto >= pool.minPayout && !foundBlock) {
        // Convert to game currency based on market price
        const payoutAmount = accumulatedCrypto * crypto.marketPrice;
        earnedAmount = payoutAmount;
        
        // Reset mined amount
        totalMinedUpdated[crypto.id] = 0;
        
        // Record payout event
        const payoutEvent: MiningEvent = {
          timestamp: new Date(),
          type: 'payout',
          description: `Received payout of ${accumulatedCrypto.toFixed(8)} ${crypto.symbol}`,
          amount: accumulatedCrypto,
          cryptoId: crypto.id
        };
        
        miningEventsUpdated = [payoutEvent, ...miningEventsUpdated];
      }
      
      // Update balances and stats
      const updatedBalance = balanceAfterCosts + earnedAmount;
      const totalEarned = prev.stats.totalEarned + earnedAmount;
      
      return {
        ...prev,
        balance: updatedBalance,
        cycleCount: prev.cycleCount + 1,
        stats: {
          ...prev.stats,
          totalHashRate,
          energyConsumption: totalPower,
          operatingCosts,
          miningEfficiency: totalHashRate / totalPower,
          lastBlockFound,
          totalMined: totalMinedUpdated,
          totalEarned,
          runningHardware: runningHardwareUpdated
        },
        miningEvents: miningEventsUpdated.slice(0, 50) // Keep last 50 events
      };
    });
  }, [calculateRewards]);

  // Manage the mining loop
  useEffect(() => {
    if (!state.isMining) return;

    const interval = setInterval(() => {
      mineCycle();
    }, 1000 / state.miningSpeed);

    return () => clearInterval(interval);
  }, [state.isMining, state.miningSpeed, mineCycle]);

  // Update cryptocurrency prices periodically
  useEffect(() => {
    if (!state.gameStarted) return;

    const interval = setInterval(() => {
      setState(prev => {
        const updatedCryptos = prev.availableCryptos.map(crypto => {
          // Apply price volatility
          const changePercent = (Math.random() * 2 - 1) * crypto.volatility * 100;
          const priceFactor = 1 + changePercent / 100;
          const newPrice = Math.max(0.01, crypto.marketPrice * priceFactor);
          
          return {
            ...crypto,
            marketPrice: newPrice
          };
        });

        return {
          ...prev,
          availableCryptos: updatedCryptos,
          selectedCrypto: updatedCryptos.find(c => c.id === prev.selectedCrypto?.id) || updatedCryptos[0]
        };
      });
    }, 5000); // Update prices every 5 seconds

    return () => clearInterval(interval);
  }, [state.gameStarted]);

  // Reset all hardware
  const resetHardware = useCallback(() => {
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hardware: {},
        runningHardware: {},
        totalHashRate: 0,
        energyConsumption: 0,
        operatingCosts: 0
      },
      isMining: false
    }));
  }, []);

  // Get hardware details
  const getHardwareDetails = useCallback((id: string): MiningHardware | undefined => {
    return state.availableHardware.find(h => h.id === id);
  }, [state.availableHardware]);

  // Get total earnings in game currency
  const getTotalEarningsInCurrency = useCallback((): number => {
    return state.stats.totalEarned;
  }, [state.stats.totalEarned]);

  // Get the most profitable cryptocurrency to mine
  const getMostProfitableCrypto = useCallback((): Cryptocurrency | null => {
    if (state.availableCryptos.length === 0) return null;

    let bestCrypto = state.availableCryptos[0];
    let bestProfit = 0;

    state.availableCryptos.forEach(crypto => {
      const profitPerHashrate = (crypto.baseReward * crypto.marketPrice) / crypto.difficulty;
      if (profitPerHashrate > bestProfit) {
        bestProfit = profitPerHashrate;
        bestCrypto = crypto;
      }
    });

    return bestCrypto;
  }, [state.availableCryptos]);

  return {
    ...state,
    startGame,
    purchaseHardware,
    selectPool,
    selectCrypto,
    toggleMining,
    toggleAutoMining,
    setMiningSpeed,
    mineCycle,
    resetHardware,
    getHardwareDetails,
    getTotalEarningsInCurrency,
    getMostProfitableCrypto
  };
};