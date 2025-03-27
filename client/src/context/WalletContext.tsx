import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Wallet } from '../types';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

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

// This is the internal provider that uses Wagmi hooks
const WalletContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Wagmi hooks for wallet interaction
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
  });
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  
  // State for the wallet
  const [wallet, setWallet] = useState<Wallet>({
    address: '',
    balance: 1000, // Default starting balance
    isConnected: false,
    userId: ''
  });
  
  // Update wallet state when wagmi state changes
  useEffect(() => {
    if (isConnected && address) {
      setWallet(prev => ({
        ...prev,
        address: address,
        isConnected: true,
        userId: address.slice(0, 10), // Creating a userId from the address
        // Keep the existing balance for now, we'll update separately
      }));
    } else {
      // If disconnected in wagmi, update our local state
      if (wallet.isConnected) {
        setWallet({
          address: '',
          balance: 0,
          isConnected: false,
          userId: ''
        });
      }
    }
  }, [isConnected, address, wallet.isConnected]);
  
  // Update balance when wagmi balance changes
  useEffect(() => {
    if (balanceData && isConnected) {
      const atomBalance = parseFloat(balanceData.formatted);
      setWallet(prev => ({
        ...prev,
        // For now, we'll keep a simulated balance for the games
        // In a real implementation, this would be connected to the actual blockchain
        // balance: atomBalance,
      }));
    }
  }, [balanceData, isConnected]);
  
  const connectWallet = useCallback(async () => {
    try {
      if (connectors[0]?.ready) {
        connect({ connector: connectors[0] });
        return true;
      } else {
        // Fallback - for demo purposes only
        // In a real implementation, this would be removed
        setWallet({
          address: 'abst1demo' + Math.random().toString(36).substring(2, 8),
          balance: 1000,
          isConnected: true,
          userId: 'user' + Math.random().toString(36).substring(2, 6)
        });
        return true;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [connect, connectors, toast]);

  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    
    // Always reset the local state
    setWallet({
      address: '',
      balance: 0,
      isConnected: false,
      userId: ''
    });
  }, [disconnect]);

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

// This is the exported provider that wraps with our context
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Since the RainbowKit provider is now in App.tsx, we just use our context provider
  return (
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  );
};

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
