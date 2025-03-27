import { useState, useCallback, useEffect } from 'react';

export interface TokenData {
  symbol: string;
  name: string;
  priceUSD: number;
  change24h: number; // Percentage change in 24 hours
  icon: string; // URL to token icon (can be imported asset)
}

export interface Trade {
  tokenSymbol: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  profit?: number; // Only for sell trades
}

export interface TokenTraderState {
  tokens: TokenData[];
  selectedToken: TokenData | null;
  userPortfolio: { [symbol: string]: { amount: number, avgBuyPrice: number } };
  trades: Trade[];
  priceHistory: Array<{ timestamp: Date, price: number, symbol: string }>;
  isTrading: boolean;
  lastProfit: number | null;
}

// Helpers for generating realistic market behavior
const generateRandomPrice = (basePrice: number, volatility: number = 0.03): number => {
  // Random walk algorithm with bias
  const change = basePrice * volatility * (Math.random() - 0.5) * 2;
  return Math.max(0.01, basePrice + change);
};

const generateRandomChange = (): number => {
  // Generate a random 24h change percentage (-15% to +15%)
  return Math.round((Math.random() * 30 - 15) * 100) / 100;
};

// Default tokens with realistic price ranges for the game
const DEFAULT_TOKENS: TokenData[] = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    priceUSD: 50000 + Math.random() * 15000, 
    change24h: generateRandomChange(),
    icon: '🔶'
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    priceUSD: 2800 + Math.random() * 700, 
    change24h: generateRandomChange(),
    icon: '💠'
  },
  { 
    symbol: 'BNB', 
    name: 'Binance Coin', 
    priceUSD: 350 + Math.random() * 100, 
    change24h: generateRandomChange(),
    icon: '🟡'
  },
  { 
    symbol: 'SOL', 
    name: 'Solana', 
    priceUSD: 100 + Math.random() * 50, 
    change24h: generateRandomChange(),
    icon: '🟣'
  },
  { 
    symbol: 'DOGE', 
    name: 'Dogecoin', 
    priceUSD: 0.08 + Math.random() * 0.05, 
    change24h: generateRandomChange(),
    icon: '🐕'
  },
  { 
    symbol: 'SHIB', 
    name: 'Shiba Inu', 
    priceUSD: 0.00002 + Math.random() * 0.00001, 
    change24h: generateRandomChange(),
    icon: '🐕‍🦺'
  },
  { 
    symbol: 'ATOM', 
    name: 'Cosmos', 
    priceUSD: 10 + Math.random() * 5, 
    change24h: generateRandomChange(),
    icon: '⚛️'
  },
  { 
    symbol: 'LINK', 
    name: 'Chainlink', 
    priceUSD: 12 + Math.random() * 6, 
    change24h: generateRandomChange(),
    icon: '🔗'
  }
];

export const useTokenTrader = () => {
  const [state, setState] = useState<TokenTraderState>({
    tokens: DEFAULT_TOKENS,
    selectedToken: DEFAULT_TOKENS[0],
    userPortfolio: {},
    trades: [],
    priceHistory: DEFAULT_TOKENS.map(token => ({ 
      timestamp: new Date(), 
      price: token.priceUSD,
      symbol: token.symbol
    })),
    isTrading: false,
    lastProfit: null
  });

  // Simulate market price movements
  useEffect(() => {
    if (!state.isTrading) return;

    const interval = setInterval(() => {
      setState(prevState => {
        // Update each token's price
        const updatedTokens = prevState.tokens.map(token => {
          const newPrice = generateRandomPrice(token.priceUSD, 0.02);
          const newChange = (newPrice / token.priceUSD - 1) * 100 * 0.2 + token.change24h * 0.8;
          
          return {
            ...token,
            priceUSD: newPrice,
            change24h: parseFloat(newChange.toFixed(2))
          };
        });

        // Add new price points to history (keeping only recent history for performance)
        const newPricePoints = updatedTokens.map(token => ({
          timestamp: new Date(),
          price: token.priceUSD,
          symbol: token.symbol
        }));
        
        const recentHistory = [...prevState.priceHistory, ...newPricePoints]
          .filter(p => (new Date().getTime() - p.timestamp.getTime()) < 5 * 60 * 1000); // Keep last 5 minutes
        
        // Update selected token if it exists
        const updatedSelected = prevState.selectedToken 
          ? updatedTokens.find(t => t.symbol === prevState.selectedToken?.symbol) || null 
          : null;
        
        return {
          ...prevState,
          tokens: updatedTokens,
          selectedToken: updatedSelected,
          priceHistory: recentHistory
        };
      });
    }, 1500); // Update prices every 1.5 seconds
    
    return () => clearInterval(interval);
  }, [state.isTrading]);

  // Start trading simulation
  const startTrading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTrading: true
    }));
  }, []);

  // Stop trading simulation
  const stopTrading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTrading: false
    }));
  }, []);

  // Select a token to trade
  const selectToken = useCallback((symbol: string) => {
    setState(prev => ({
      ...prev,
      selectedToken: prev.tokens.find(t => t.symbol === symbol) || null
    }));
  }, []);

  // Execute a buy trade
  const executeBuy = useCallback((symbol: string, amount: number): boolean => {
    if (amount <= 0) return false;
    
    setState(prev => {
      const token = prev.tokens.find(t => t.symbol === symbol);
      if (!token) return prev;
      
      const price = token.priceUSD;
      const totalCost = price * amount;
      
      // Add to portfolio or update existing position
      const currentPosition = prev.userPortfolio[symbol] || { amount: 0, avgBuyPrice: 0 };
      const newTotalAmount = currentPosition.amount + amount;
      const newAvgBuyPrice = (currentPosition.amount * currentPosition.avgBuyPrice + amount * price) / newTotalAmount;
      
      // Record the trade
      const newTrade: Trade = {
        tokenSymbol: symbol,
        action: 'buy',
        amount,
        price,
        timestamp: new Date()
      };
      
      return {
        ...prev,
        userPortfolio: {
          ...prev.userPortfolio,
          [symbol]: { amount: newTotalAmount, avgBuyPrice: newAvgBuyPrice }
        },
        trades: [newTrade, ...prev.trades]
      };
    });
    
    return true;
  }, []);

  // Execute a sell trade
  const executeSell = useCallback((symbol: string, amount: number): number | false => {
    let profitResult: number = 0;
    
    setState(prev => {
      const token = prev.tokens.find(t => t.symbol === symbol);
      const position = prev.userPortfolio[symbol];
      
      // Validate the sell
      if (!token || !position || position.amount < amount || amount <= 0) {
        return prev;
      }
      
      const sellPrice = token.priceUSD;
      const profit = (sellPrice - position.avgBuyPrice) * amount;
      profitResult = profit;
      
      // Update portfolio
      const newAmount = position.amount - amount;
      const updatedPortfolio = { ...prev.userPortfolio };
      
      if (newAmount <= 0) {
        // If selling entire position, remove from portfolio
        delete updatedPortfolio[symbol];
      } else {
        // If selling partial position, update amount only (avg buy price stays the same)
        updatedPortfolio[symbol] = { ...position, amount: newAmount };
      }
      
      // Record the trade
      const newTrade: Trade = {
        tokenSymbol: symbol,
        action: 'sell',
        amount,
        price: sellPrice,
        timestamp: new Date(),
        profit
      };
      
      return {
        ...prev,
        userPortfolio: updatedPortfolio,
        trades: [newTrade, ...prev.trades],
        lastProfit: profit
      };
    });
    
    return profitResult;
  }, []);

  // Calculate current portfolio value
  const getPortfolioValue = useCallback((): number => {
    return Object.entries(state.userPortfolio).reduce((total, [symbol, position]) => {
      const token = state.tokens.find(t => t.symbol === symbol);
      if (!token) return total;
      
      return total + (token.priceUSD * position.amount);
    }, 0);
  }, [state.userPortfolio, state.tokens]);

  // Get price history for a specific token
  const getTokenPriceHistory = useCallback((symbol: string) => {
    return state.priceHistory.filter(point => point.symbol === symbol);
  }, [state.priceHistory]);

  // Calculate profit/loss for a specific position
  const getPositionProfitLoss = useCallback((symbol: string): { amount: number, percentage: number } | null => {
    const position = state.userPortfolio[symbol];
    const token = state.tokens.find(t => t.symbol === symbol);
    
    if (!position || !token) return null;
    
    const currentValue = token.priceUSD * position.amount;
    const costBasis = position.avgBuyPrice * position.amount;
    const profitAmount = currentValue - costBasis;
    const profitPercentage = (profitAmount / costBasis) * 100;
    
    return {
      amount: profitAmount,
      percentage: profitPercentage
    };
  }, [state.userPortfolio, state.tokens]);

  return {
    ...state,
    startTrading,
    stopTrading,
    selectToken,
    executeBuy,
    executeSell,
    getPortfolioValue,
    getTokenPriceHistory,
    getPositionProfitLoss
  };
};