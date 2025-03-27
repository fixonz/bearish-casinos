import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Wallet } from '../types';

interface WalletContextType {
  wallet: Wallet;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  updateBalance: (newBalance: number) => void;
  placeBet: (amount: number) => boolean;
  addWinnings: (amount: number) => void;
}

// Create a default value to avoid the undefined check
const defaultWalletContext: WalletContextType = {
  wallet: {
    address: '',
    balance: 0,
    isConnected: false,
    userId: ''
  },
  connectWallet: async () => false,
  disconnectWallet: () => {},
  updateBalance: () => {},
  placeBet: () => false,
  addWinnings: () => {}
};

const WalletContext = createContext<WalletContextType>(defaultWalletContext);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for the wallet
  const [wallet, setWallet] = useState<Wallet>({
    address: 'abst1demo123456',
    balance: 1000,
    isConnected: true,
    userId: 'user1' // Add a default userId
  });

  const connectWallet = useCallback(async () => {
    try {
      // In a real implementation, this would connect to Abstract Mainnet
      // For now, we'll simulate with mock data
      
      // Simulate some loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock address and balance
      const mockAddress = 'abst1' + Math.random().toString(36).substring(2, 10);
      const mockBalance = parseFloat((Math.random() * 200).toFixed(2));
      
      setWallet({
        address: mockAddress,
        balance: mockBalance,
        isConnected: true,
        userId: 'user' + Math.random().toString(36).substring(2, 6)
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: '',
      balance: 0,
      isConnected: false,
      userId: ''
    });
  }, []);

  // Update the wallet balance (used after bets/wins)
  const updateBalance = useCallback((newBalance: number) => {
    setWallet(prev => ({
      ...prev,
      balance: newBalance
    }));
  }, []);

  // Place a bet with the wallet
  const placeBet = useCallback((amount: number): boolean => {
    if (!wallet.isConnected || wallet.balance < amount) {
      return false;
    }
    
    // Deduct bet amount from balance
    setWallet(prev => ({
      ...prev,
      balance: parseFloat((prev.balance - amount).toFixed(2))
    }));
    
    return true;
  }, [wallet]);

  // Add winnings to wallet
  const addWinnings = useCallback((amount: number) => {
    setWallet(prev => ({
      ...prev,
      balance: parseFloat((prev.balance + amount).toFixed(2))
    }));
  }, []);

  const contextValue = {
    wallet,
    connectWallet,
    disconnectWallet,
    updateBalance,
    placeBet,
    addWinnings
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
