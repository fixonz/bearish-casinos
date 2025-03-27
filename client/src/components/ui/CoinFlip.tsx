import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletContext } from '@/context/WalletContext';
import { useCoinFlip } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';
import ProvablyFairModal from '@/components/modals/ProvablyFairModal';
import { provablyFair } from '@/lib/provablyFair';
import { AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import headImg from '@assets/Red_Berry.png';
import tailsImg from '@assets/Blue_Berry.png';

interface CoinFlipProps {
  maxBet?: number;
  minBet?: number;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ maxBet = 1000, minBet = 0.1 }) => {
  const { wallet, placeBet, addWinnings, playCoinFlip } = useWalletContext();
  const { toast } = useToast();
  const { 
    isFlipping, 
    result, 
    selectedSide, 
    hasWon, 
    history, 
    verificationData,
    flip,
    setClientSeed
  } = useCoinFlip();
  
  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(2.0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [useBlockchainVerification, setUseBlockchainVerification] = useState(false);
  
  // Update potential win when bet amount changes
  useEffect(() => {
    // Calculate potential win with a 2.5% house edge
    const houseEdge = 0.025; // 2.5%
    const fairMultiplier = 2; // 1:1 odds for coin flip
    const actualMultiplier = fairMultiplier * (1 - houseEdge); // Apply house edge
    setPotentialWin(parseFloat((betAmount * actualMultiplier).toFixed(2)));
  }, [betAmount]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= maxBet) {
      setBetAmount(value);
    }
  };

  // Handle flip button click
  const handleFlip = async (side: 'heads' | 'tails') => {
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
    
    if (useBlockchainVerification) {
      // Use the blockchain version
      try {
        // The playCoinFlip function handles the bet placement internally
        const result = await playCoinFlip(side === 'heads', betAmount);
        
        if (result.success && result.won) {
          setShowWinModal(true);
        }
        
      } catch (error) {
        console.error('Error flipping coin with blockchain:', error);
        toast({
          title: "Error",
          description: "There was an error processing your bet on the blockchain.",
          variant: "destructive",
        });
      }
    } else {
      // Use the local provably fair version
      // Place the bet
      placeBet(betAmount);
      
      // Flip the coin
      flip(side);
    }
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
        {/* Header with Provably Fair Badge */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-left">Berry Picker</h2>
          <ProvablyFairModal 
            defaultClientSeed={verificationData?.clientSeed || provablyFair.getClientSeed()}
            onClientSeedChange={setClientSeed}
          />
        </div>
        
        {/* Verification Badge Alert */}
        <Alert className="mb-6 bg-[#252525] border-[#3a3a3a] text-left">
          <ShieldCheck className="h-4 w-4 text-[#00c853]" />
          <AlertDescription className="text-sm">
            This game uses provably fair technology. Server seed hash: {" "}
            <code className="text-xs bg-[#333] p-1 rounded">
              {verificationData?.serverSeedHash ? 
                `${verificationData.serverSeedHash.substring(0, 10)}...` : 
                'Generating...'}
            </code>
          </AlertDescription>
        </Alert>
        
        {/* Animated berry element */}
        <div className={`berry mb-6 ${isFlipping ? 'flipping' : ''}`}>
          <div className="berry-front flex items-center justify-center">
            <img src={headImg} alt="Red Berry" className="w-full h-full p-2" />
          </div>
          <div className="berry-back flex items-center justify-center">
            <img src={tailsImg} alt="Blue Berry" className="w-full h-full p-2" />
          </div>
        </div>
        
        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${
            result ? (hasWon ? 'text-[#00FF00]' : 'text-[#FF4081]') : 'text-[#FFD700]'
          }`}>
            {isFlipping ? 'Picking a Berry...' : 
              result ? (hasWon ? 'You Won!' : 'You Lost!') : 
              'Choose Red or Blue Berry!'}
          </div>
          <div className="text-lg text-gray-300">
            {result && !isFlipping && `The result was ${result === 'heads' ? 'Red Berry' : 'Blue Berry'}!`}
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
            <img src={headImg} alt="Red Berry" className="w-8 h-8" />
            <span>Red Berry</span>
          </Button>
          <Button 
            className={`px-6 py-3 bg-[#1a1a1a] rounded-lg hover:bg-opacity-80 transition-all flex items-center space-x-2 ${
              selectedSide === 'tails' && !isFlipping ? 'border-2 border-[#FFD700]' : ''
            }`}
            onClick={() => handleFlip('tails')}
            disabled={isFlipping}
          >
            <img src={tailsImg} alt="Blue Berry" className="w-8 h-8" />
            <span>Blue Berry</span>
          </Button>
        </div>
        
        {/* Bet controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        
        {/* Recent Results */}
        {history && history.length > 0 && (
          <div className="mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Results</h3>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 10).map((item, index) => (
                <div 
                  key={index} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.won ? 'bg-green-600' : 'bg-red-600'
                  }`}
                  title={`${item.selectedSide === 'heads' ? 'Red Berry' : 'Blue Berry'} → ${item.result === 'heads' ? 'Red Berry' : 'Blue Berry'} (${item.won ? 'Won' : 'Lost'})`}
                >
                  {item.result === 'heads' ? 'R' : 'B'}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Blockchain verification toggle */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="blockchainVerification"
              checked={useBlockchainVerification}
              onChange={() => setUseBlockchainVerification(!useBlockchainVerification)}
              className="rounded border-gray-600 text-[#FFD700] focus:ring-[#FFD700]"
            />
            <label htmlFor="blockchainVerification" className="text-sm text-gray-400">
              Use Abstract Blockchain Verification {useBlockchainVerification && '(Testnet)'}
            </label>
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
