import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletContext } from '@/context/WalletContext';
import { useSlots } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';

interface SlotsProps {
  maxBet?: number;
  minBet?: number;
}

const Slots: React.FC<SlotsProps> = ({ maxBet = 1000, minBet = 0.1 }) => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { toast } = useToast();
  const { isSpinning, result, hasWon, spin, symbols } = useSlots();
  
  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(100.0);
  const [showWinModal, setShowWinModal] = useState(false);
  
  const reel1Ref = useRef<HTMLDivElement>(null);
  const reel2Ref = useRef<HTMLDivElement>(null);
  const reel3Ref = useRef<HTMLDivElement>(null);
  
  // Update potential win when bet amount changes
  useEffect(() => {
    setPotentialWin(parseFloat((betAmount * 100).toFixed(2)));
  }, [betAmount]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= maxBet) {
      setBetAmount(value);
    }
  };

  // Handle spin button click
  const handleSpin = () => {
    if (isSpinning) return;
    
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
    
    // Trigger the spin animation
    if (reel1Ref.current) {
      reel1Ref.current.style.transform = `translateY(-${Math.floor(Math.random() * 20) * 100}px)`;
    }
    if (reel2Ref.current) {
      reel2Ref.current.style.transform = `translateY(-${Math.floor(Math.random() * 20) * 100}px)`;
    }
    if (reel3Ref.current) {
      reel3Ref.current.style.transform = `translateY(-${Math.floor(Math.random() * 20) * 100}px)`;
    }
    
    // Spin the slots
    spin();
  };

  // Effect to handle win/loss after spin
  useEffect(() => {
    if (hasWon === null || isSpinning) return;
    
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
  }, [hasWon, isSpinning, potentialWin, addWinnings, toast]);

  // Play again handler
  const handlePlayAgain = () => {
    setShowWinModal(false);
  };

  // Double down handler
  const handleDoubleDown = () => {
    setShowWinModal(false);
    setBetAmount(Math.min(betAmount * 2, maxBet));
  };

  // Generate multiple symbols for the reels
  const generateReelSymbols = () => {
    return symbols.concat(symbols).map((symbol, index) => (
      <div key={index} className="slot-symbol h-24 flex items-center justify-center text-4xl">
        {symbol}
      </div>
    ));
  };

  return (
    <>
      <div className="game-preview bg-[#1a1a1a] rounded-xl p-6 text-center relative overflow-hidden">
        {/* Slots machine */}
        <div className="slots-machine bg-[#222222] rounded-xl p-4 mb-6 mx-auto max-w-sm">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="slot-reel h-24 bg-white rounded-lg overflow-hidden">
              <div 
                ref={reel1Ref} 
                className="slot-symbols transition-transform duration-[2500ms] ease-out"
                style={{ transform: 'translateY(0)' }}
              >
                {generateReelSymbols()}
              </div>
            </div>
            <div className="slot-reel h-24 bg-white rounded-lg overflow-hidden">
              <div 
                ref={reel2Ref} 
                className="slot-symbols transition-transform duration-[2500ms] ease-out"
                style={{ transform: 'translateY(0)' }}
              >
                {generateReelSymbols()}
              </div>
            </div>
            <div className="slot-reel h-24 bg-white rounded-lg overflow-hidden">
              <div 
                ref={reel3Ref} 
                className="slot-symbols transition-transform duration-[2500ms] ease-out"
                style={{ transform: 'translateY(0)' }}
              >
                {generateReelSymbols()}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className={`px-6 py-3 bg-[#FF4081] text-white rounded-full text-lg font-medium hover:bg-opacity-90 transition-all ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSpin}
              disabled={isSpinning}
            >
              {isSpinning ? 'Spinning...' : 'SPIN'}
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${
            hasWon === true ? 'text-[#00FF00]' : 
            hasWon === false ? 'text-[#FF4081]' : 
            'text-[#FFD700]'
          }`}>
            {isSpinning ? 'Spinning...' : 
              hasWon === true ? 'You Won!' : 
              hasWon === false ? 'You Lost!' : 
              'Spin to Win!'}
          </div>
          <div className="text-lg text-gray-300">
            {hasWon && <span className="text-[#00FF00]">You won {potentialWin.toFixed(2)} ATOM!</span>}
          </div>
          
          {result.every(r => r) && (
            <div className="mt-4 flex justify-center gap-4">
              {result.map((symbol, index) => (
                <div key={index} className="text-4xl">{symbol}</div>
              ))}
            </div>
          )}
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
                disabled={isSpinning}
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

export default Slots;
