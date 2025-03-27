import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletContext } from '@/context/WalletContext';
import { useCoinFlip } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';
import headImg from '@assets/head.png';
import tailsImg from '@assets/taills.png';

interface CoinFlipProps {
  maxBet?: number;
  minBet?: number;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ maxBet = 1000, minBet = 0.1 }) => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { toast } = useToast();
  const { isFlipping, result, selectedSide, hasWon, flip } = useCoinFlip();
  
  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(2.0);
  const [showWinModal, setShowWinModal] = useState(false);
  
  // Update potential win when bet amount changes
  useEffect(() => {
    setPotentialWin(parseFloat((betAmount * 2).toFixed(2)));
  }, [betAmount]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= maxBet) {
      setBetAmount(value);
    }
  };

  // Handle flip button click
  const handleFlip = (side: 'heads' | 'tails') => {
    if (isFlipping) return;
    
    if (!wallet.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to play.",
        variant: "destructive",
      });
      return;
    }
    
    if (wallet.balance < betAmount) {
      toast({
        title: "Insufficient balance",
        description: "Your wallet doesn't have enough funds for this bet.",
        variant: "destructive",
      });
      return;
    }
    
    // Place the bet
    placeBet(betAmount);
    
    // Flip the coin
    flip(side);
  };

  // Effect to handle win/loss after flip
  useEffect(() => {
    if (hasWon === null || isFlipping) return;
    
    if (hasWon) {
      // Add winnings
      addWinnings(potentialWin);
      
      // Show win modal
      setShowWinModal(true);
    } else if (hasWon === false) {
      toast({
        title: "You lost",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }
  }, [hasWon, isFlipping, potentialWin, addWinnings, toast]);

  // Play again handler
  const handlePlayAgain = () => {
    setShowWinModal(false);
  };

  // Double down handler
  const handleDoubleDown = () => {
    setShowWinModal(false);
    setBetAmount(Math.min(betAmount * 2, maxBet));
  };

  return (
    <>
      <div className="game-preview bg-[#1a1a1a] rounded-xl p-6 text-center relative overflow-hidden">
        {/* Animated coin element */}
        <div className={`coin mb-6 ${isFlipping ? 'flipping' : ''}`}>
          <div className="coin-front flex items-center justify-center">
            <img src={headImg} alt="Heads" className="w-full h-full p-2" />
          </div>
          <div className="coin-back flex items-center justify-center">
            <img src={tailsImg} alt="Tails" className="w-full h-full p-2" />
          </div>
        </div>
        
        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${
            result ? (hasWon ? 'text-[#00FF00]' : 'text-[#FF4081]') : 'text-[#FFD700]'
          }`}>
            {isFlipping ? 'Flipping...' : 
              result ? (hasWon ? 'You Won!' : 'You Lost!') : 
              'Choose Heads or Tails!'}
          </div>
          <div className="text-lg text-gray-300">
            {hasWon && <span className="text-[#00FF00]">You won {potentialWin.toFixed(2)} ATOM!</span>}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mb-8">
          <Button 
            className={`px-6 py-3 bg-[#1a1a1a] rounded-lg hover:bg-opacity-80 transition-all flex items-center space-x-2 ${
              selectedSide === 'heads' && !isFlipping ? 'border-2 border-[#FFD700]' : ''
            }`}
            onClick={() => handleFlip('heads')}
            disabled={isFlipping}
          >
            <img src={headImg} alt="Heads" className="w-6 h-6" />
            <span>Heads</span>
          </Button>
          <Button 
            className={`px-6 py-3 bg-[#1a1a1a] rounded-lg hover:bg-opacity-80 transition-all flex items-center space-x-2 ${
              selectedSide === 'tails' && !isFlipping ? 'border-2 border-[#FFD700]' : ''
            }`}
            onClick={() => handleFlip('tails')}
            disabled={isFlipping}
          >
            <img src={tailsImg} alt="Tails" className="w-6 h-6" />
            <span>Tails</span>
          </Button>
        </div>
        
        {/* Bet controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Bet Amount</label>
            <div className="relative">
              <Input 
                type="number" 
                value={betAmount} 
                onChange={handleBetAmountChange}
                min={minBet}
                max={maxBet}
                step={0.1}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 focus:border-[#FFD700] focus:outline-none pr-16"
                disabled={isFlipping}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ATOM</div>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Potential Win</label>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-[#FFD700] flex items-center h-10">
              {potentialWin.toFixed(2)} ATOM
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFD700] bg-opacity-10 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FF4081] bg-opacity-10 rounded-full"></div>
      </div>

      {/* Win Modal */}
      <WinModal 
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        amount={potentialWin}
        onPlayAgain={handlePlayAgain}
        onDoubleDown={handleDoubleDown}
      />
    </>
  );
};

export default CoinFlip;
