import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletContext } from '@/context/WalletContext';
import { useDiceRoll } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';

interface DiceRollProps {
  maxBet?: number;
  minBet?: number;
}

const DiceRoll: React.FC<DiceRollProps> = ({ maxBet = 1000, minBet = 0.1 }) => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { toast } = useToast();
  const { isRolling, result, selectedNumber, hasWon, roll } = useDiceRoll();
  
  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(6.0);
  const [showWinModal, setShowWinModal] = useState(false);
  
  // Dice numbers
  const diceNumbers = [1, 2, 3, 4, 5, 6];
  
  // Update potential win when bet amount changes
  useEffect(() => {
    setPotentialWin(parseFloat((betAmount * 6).toFixed(2)));
  }, [betAmount]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= maxBet) {
      setBetAmount(value);
    }
  };

  // Handle roll button click
  const handleRoll = (number: number) => {
    if (isRolling) return;
    
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
    
    // Roll the dice
    roll(number);
  };

  // Effect to handle win/loss after roll
  useEffect(() => {
    if (hasWon === null || isRolling) return;
    
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
  }, [hasWon, isRolling, potentialWin, addWinnings, toast]);

  // Play again handler
  const handlePlayAgain = () => {
    setShowWinModal(false);
  };

  // Double down handler
  const handleDoubleDown = () => {
    setShowWinModal(false);
    setBetAmount(Math.min(betAmount * 2, maxBet));
  };
  
  // Get dice face class based on the result
  const getDiceFace = (num: number) => {
    const dots = [];
    for (let i = 0; i < num; i++) {
      dots.push(
        <div key={i} className="w-2 h-2 bg-black rounded-full"></div>
      );
    }
    
    return (
      <div className={`grid ${
        num === 1 ? 'place-items-center' :
        num === 2 ? 'grid-cols-2 place-items-center' :
        num === 3 ? 'grid-cols-3 place-items-center' :
        num === 4 ? 'grid-cols-2 gap-2' :
        num === 5 ? 'grid-cols-3 gap-1' :
        'grid-cols-3 gap-1'
      } w-full h-full p-2`}>
        {dots}
      </div>
    );
  };

  return (
    <>
      <div className="game-preview bg-[#1a1a1a] rounded-xl p-6 text-center relative overflow-hidden">
        {/* Dice element */}
        <div className="dice mx-auto mb-6 relative">
          <div className={`dice-face w-20 h-20 bg-white rounded-lg shadow-lg transition-all duration-300 transform ${isRolling ? 'animate-spin' : ''}`}>
            {result ? getDiceFace(result) : getDiceFace(1)}
          </div>
        </div>
        
        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${
            result ? (hasWon ? 'text-[#00FF00]' : 'text-[#FF4081]') : 'text-[#FFD700]'
          }`}>
            {isRolling ? 'Rolling...' : 
              result ? (hasWon ? 'You Won!' : 'You Lost!') : 
              'Choose a Number!'}
          </div>
          <div className="text-lg text-gray-300">
            {hasWon && <span className="text-[#00FF00]">You won {potentialWin.toFixed(2)} ATOM!</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {diceNumbers.map(number => (
            <Button 
              key={number}
              className={`w-12 h-12 bg-[#1a1a1a] rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center ${
                selectedNumber === number && !isRolling ? 'border-2 border-[#FFD700]' : ''
              }`}
              onClick={() => handleRoll(number)}
              disabled={isRolling}
            >
              {number}
            </Button>
          ))}
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
                disabled={isRolling}
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

export default DiceRoll;
