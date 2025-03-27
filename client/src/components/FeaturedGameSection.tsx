import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useCoinFlip } from '@/hooks/useRandomization';
import headImg from '@assets/head.png';
import tailsImg from '@assets/taills.png';

const FeaturedGameSection: React.FC = () => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { toast } = useToast();
  const { isFlipping, result, selectedSide, hasWon, flip } = useCoinFlip();
  const [betAmount, setBetAmount] = useState(1.00);
  const [potentialWin, setPotentialWin] = useState(2.00);
  
  // Update potential win when bet amount changes
  useEffect(() => {
    setPotentialWin(betAmount * 2);
  }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };

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
      
      toast({
        title: "You won!",
        description: `Congratulations! You won ${potentialWin.toFixed(2)} ATOM.`,
        variant: "default",
      });
    } else if (hasWon === false) {
      toast({
        title: "You lost",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }
  }, [hasWon, isFlipping, potentialWin, addWinnings, toast]);

  return (
    <section className="py-12 bg-[#222222] rounded-2xl p-6 mb-12">
      <h2 className="font-poppins font-bold text-3xl mb-8 text-center">Featured Game: Coin Flip</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Game Preview */}
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
                <input 
                  type="text" 
                  value={betAmount.toFixed(2)} 
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 focus:border-[#FFD700] focus:outline-none"
                  disabled={isFlipping}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ATOM</div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Potential Win</label>
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-[#FFD700]">
                {potentialWin.toFixed(2)} ATOM
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFD700] bg-opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FF4081] bg-opacity-10 rounded-full"></div>
        </div>
        
        {/* Game Info */}
        <div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6">
            <h3 className="font-poppins font-semibold text-xl mb-4">How To Play</h3>
            <ul className="space-y-4">
              <li className="flex">
                <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <div>
                  <p>Select your bet amount using the slider or input field</p>
                </div>
              </li>
              <li className="flex">
                <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <div>
                  <p>Choose Heads or Tails to place your bet</p>
                </div>
              </li>
              <li className="flex">
                <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <div>
                  <p>Watch the coin flip and see if you win!</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <h3 className="font-poppins font-semibold text-xl mb-4">Game Stats</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">House Edge</div>
                <div className="font-semibold">2%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Win Chance</div>
                <div className="font-semibold">50%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Max Win</div>
                <div className="font-semibold">1,000 ATOM</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Total Plays</div>
                <div className="font-semibold">45,276</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">Provably Fair</div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FF00] rounded-full mr-2"></span>
                  <span className="text-sm">Verified</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">Local Randomization</div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FF00] rounded-full mr-2"></span>
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-lg font-medium text-black hover:shadow-lg transition-all"
              onClick={() => {
                toast({
                  title: "Randomization Verified",
                  description: "Our games use the browser's crypto.getRandomValues API to ensure fair and unbiased outcomes.",
                  duration: 5000,
                });
              }}
            >
              Verify Randomization
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGameSection;
