import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Wallet } from '../types';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { casinoContracts } from '../lib/contracts';

interface WalletContextType {
  wallet: Wallet;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  updateBalance: (newBalance: number) => void;
  placeBet: (amount: number) => boolean;
  addWinnings: (amount: number) => void;
  updateUsername: (newUsername: string) => void;
  updateProfilePicture: (newProfilePicture: string) => void;
  
  // Smart contract related methods
  playCoinFlip: (isHeads: boolean, betAmount: number) => Promise<{ success: boolean; won: boolean }>;
  joinCrashGame: (betAmount: number) => Promise<boolean>;
  cashoutCrashGame: () => Promise<boolean>;
  playDice: (targetNumber: number, isOver: boolean, betAmount: number) => Promise<{ success: boolean; roll: number; won: boolean }>;
  calculateDiceMultiplier: (targetNumber: number, isOver: boolean) => number;
  deposit: (amount: number) => Promise<boolean>;
  withdraw: (amount: number) => Promise<boolean>;
}

// Create a default value to avoid the undefined check
const defaultWalletContext: WalletContextType = {
  wallet: {
    address: '',
    balance: 0,
    isConnected: false,
    userId: '',
    username: 'Guest',
    profilePicture: '/attached_assets/head.png'
  },
  connectWallet: async () => false,
  disconnectWallet: () => {},
  updateBalance: () => {},
  placeBet: () => false,
  addWinnings: () => {},
  updateUsername: () => {},
  updateProfilePicture: () => {},
  
  // Smart contract related methods
  playCoinFlip: async () => ({ success: false, won: false }),
  joinCrashGame: async () => false,
  cashoutCrashGame: async () => false,
  playDice: async () => ({ success: false, roll: 0, won: false }),
  calculateDiceMultiplier: () => 0,
  deposit: async () => false,
  withdraw: async () => false
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
    userId: '',
    username: 'Guest',
    profilePicture: '/attached_assets/head.png'
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
          userId: '',
          username: 'Guest',
          profilePicture: '/attached_assets/head.png'
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
        // Generate a random player name for the demo
        const demoNames = ['CryptoBull', 'MoonHodler', 'DiamondHands', 'BTCWhale', 'DegensUnite'];
        const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
        // Pick a random avatar from the provided ones
        const avatarOptions = [
          '/attached_assets/Y2HmxLIx_400x400.jpg',
          '/attached_assets/processed-nft-33-1-dark (1).png',
          '/attached_assets/bearishshs.png',
          '/attached_assets/head.png',
          '/attached_assets/image_1743101567935.png'
        ];
        const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        
        setWallet({
          address: 'abst1demo' + Math.random().toString(36).substring(2, 8),
          balance: 1000,
          isConnected: true,
          userId: 'user' + Math.random().toString(36).substring(2, 6),
          username: randomName,
          profilePicture: randomAvatar
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
      userId: '',
      username: 'Guest',
      profilePicture: '/attached_assets/head.png'
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

  // Update the wallet username
  const updateUsername = useCallback((newUsername: string) => {
    if (!wallet.isConnected) return;
    
    setWallet(prev => ({
      ...prev,
      username: newUsername
    }));
    
    toast({
      title: "Profile Updated",
      description: "Your display name has been updated successfully.",
    });
  }, [wallet.isConnected, toast]);

  // Update the wallet profile picture
  const updateProfilePicture = useCallback((newProfilePicture: string) => {
    if (!wallet.isConnected) return;
    
    setWallet(prev => ({
      ...prev,
      profilePicture: newProfilePicture
    }));
    
    toast({
      title: "Profile Updated",
      description: "Your profile picture has been updated successfully.",
    });
  }, [wallet.isConnected, toast]);

  // Smart contract integration methods
  useEffect(() => {
    // Connect to the casino contracts when wallet connects
    if (wallet.isConnected && wallet.address) {
      casinoContracts.connect(wallet).catch(error => {
        console.error('Failed to connect to casino contracts:', error);
      });
    } else {
      casinoContracts.disconnect();
    }
  }, [wallet.isConnected, wallet.address]);

  // Play coin flip game via smart contract
  const playCoinFlip = useCallback(async (isHeads: boolean, betAmount: number): Promise<{ success: boolean; won: boolean }> => {
    if (!wallet.isConnected || wallet.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      });
      return { success: false, won: false };
    }

    // First, deduct the bet amount locally
    const success = placeBet(betAmount);
    if (!success) {
      return { success: false, won: false };
    }

    try {
      // Call the contract function
      const result = await casinoContracts.playCoinFlip(isHeads, betAmount);
      
      // If won, add winnings
      if (result.won) {
        // Calculate winnings (2x minus house edge)
        const winAmount = betAmount * 1.975; // Approximate 2.5% house edge
        addWinnings(winAmount);
        
        toast({
          title: "You Won!",
          description: `You won ${winAmount.toFixed(2)} tokens!`,
          variant: "default",
        });
      } else {
        toast({
          title: "You Lost",
          description: `Better luck next time!`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error playing coin flip:', error);
      
      // Refund the bet amount since the transaction failed
      addWinnings(betAmount);
      
      toast({
        title: "Transaction Failed",
        description: "Failed to complete the coin flip. Your bet has been refunded.",
        variant: "destructive",
      });
      
      return { success: false, won: false };
    }
  }, [wallet, placeBet, addWinnings, toast]);

  // Join crash game via smart contract
  const joinCrashGame = useCallback(async (betAmount: number): Promise<boolean> => {
    if (!wallet.isConnected || wallet.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      });
      return false;
    }

    // First, deduct the bet amount locally
    const success = placeBet(betAmount);
    if (!success) {
      return false;
    }

    try {
      // Call the contract function
      const result = await casinoContracts.joinCrashGame(betAmount);
      
      if (!result) {
        // Refund if joining failed
        addWinnings(betAmount);
        toast({
          title: "Failed to Join",
          description: "Could not join the crash game. Your bet has been refunded.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error joining crash game:', error);
      
      // Refund the bet amount since the transaction failed
      addWinnings(betAmount);
      
      toast({
        title: "Transaction Failed",
        description: "Failed to join the crash game. Your bet has been refunded.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [wallet, placeBet, addWinnings, toast]);

  // Cashout from crash game via smart contract
  const cashoutCrashGame = useCallback(async (): Promise<boolean> => {
    if (!wallet.isConnected) {
      toast({
        title: "Not Connected",
        description: "You need to connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the contract function
      const result = await casinoContracts.cashoutCrashGame();
      
      // Handling of actual winnings would be done via events in a real implementation
      // Here we're just returning the success status
      return result;
    } catch (error) {
      console.error('Error cashing out from crash game:', error);
      
      toast({
        title: "Cashout Failed",
        description: "Failed to cash out from the crash game.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [wallet, toast]);

  // Play dice game via smart contract
  const playDice = useCallback(async (
    targetNumber: number,
    isOver: boolean,
    betAmount: number
  ): Promise<{ success: boolean; roll: number; won: boolean }> => {
    if (!wallet.isConnected || wallet.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      });
      return { success: false, roll: 0, won: false };
    }

    // First, deduct the bet amount locally
    const success = placeBet(betAmount);
    if (!success) {
      return { success: false, roll: 0, won: false };
    }

    try {
      // Call the contract function
      const result = await casinoContracts.playDice(targetNumber, isOver, betAmount);
      
      // If won, add winnings
      if (result.won) {
        // Calculate winnings based on the multiplier
        const multiplier = casinoContracts.calculateDiceMultiplier(targetNumber, isOver);
        const winAmount = betAmount * multiplier;
        addWinnings(winAmount);
        
        toast({
          title: "You Won!",
          description: `You rolled a ${result.roll} and won ${winAmount.toFixed(2)} tokens!`,
          variant: "default",
        });
      } else {
        toast({
          title: "You Lost",
          description: `You rolled a ${result.roll}. Better luck next time!`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error playing dice game:', error);
      
      // Refund the bet amount since the transaction failed
      addWinnings(betAmount);
      
      toast({
        title: "Transaction Failed",
        description: "Failed to complete the dice game. Your bet has been refunded.",
        variant: "destructive",
      });
      
      return { success: false, roll: 0, won: false };
    }
  }, [wallet, placeBet, addWinnings, toast]);

  // Calculate dice multiplier
  const calculateDiceMultiplier = useCallback((targetNumber: number, isOver: boolean): number => {
    return casinoContracts.calculateDiceMultiplier(targetNumber, isOver);
  }, []);

  // Deposit funds to the casino contract
  const deposit = useCallback(async (amount: number): Promise<boolean> => {
    if (!wallet.isConnected) {
      toast({
        title: "Not Connected",
        description: "You need to connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the contract function
      const result = await casinoContracts.deposit(amount);
      
      if (result) {
        // Update balance after successful deposit
        // In a real implementation, we would get the new balance from the contract
        updateBalance(wallet.balance + amount);
        
        toast({
          title: "Deposit Successful",
          description: `Successfully deposited ${amount} tokens.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Deposit Failed",
          description: "Failed to deposit funds.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error depositing funds:', error);
      
      toast({
        title: "Transaction Failed",
        description: "Failed to deposit funds.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [wallet, updateBalance, toast]);

  // Withdraw funds from the casino contract
  const withdraw = useCallback(async (amount: number): Promise<boolean> => {
    if (!wallet.isConnected) {
      toast({
        title: "Not Connected",
        description: "You need to connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    if (wallet.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the contract function
      const result = await casinoContracts.withdraw(amount);
      
      if (result) {
        // Update balance after successful withdrawal
        updateBalance(wallet.balance - amount);
        
        toast({
          title: "Withdrawal Successful",
          description: `Successfully withdrew ${amount} tokens.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "Failed to withdraw funds.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      
      toast({
        title: "Transaction Failed",
        description: "Failed to withdraw funds.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [wallet, updateBalance, toast]);

  const contextValue: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    updateBalance,
    placeBet,
    addWinnings,
    updateUsername,
    updateProfilePicture,
    
    // Smart contract methods
    playCoinFlip,
    joinCrashGame,
    cashoutCrashGame,
    playDice,
    calculateDiceMultiplier,
    deposit,
    withdraw
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
