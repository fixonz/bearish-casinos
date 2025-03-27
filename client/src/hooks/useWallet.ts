import { useState, useCallback } from 'react';
import { Wallet } from '../types';

export const useWallet = () => {
  // Mock wallet state for demonstration
  const [wallet, setWallet] = useState<Wallet>({
    address: '',
    balance: 0,
    isConnected: false
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
        isConnected: true
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
      isConnected: false
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

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    updateBalance,
    placeBet,
    addWinnings
  };
};
