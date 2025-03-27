import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletContext } from '@/context/WalletContext';
import { useCrash } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';
import { formatNumber } from '@/lib/utils';
import bearishshsImg from '@assets/bearishshs.png';

interface CrashGameProps {
  maxBet?: number;
  minBet?: number;
}

const CrashGame: React.FC<CrashGameProps> = ({ maxBet = 1000, minBet = 0.1 }) => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { toast } = useToast();
  const { 
    isRunning, 
    multiplier, 
    hasCrashed, 
    hasUserCashedOut,
    cashOutMultiplier,
    startGame, 
    cashOut 
  } = useCrash();
  
  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Update potential win as multiplier changes
  useEffect(() => {
    if (isRunning) {
      setPotentialWin(parseFloat((betAmount * multiplier).toFixed(2)));
    }
  }, [multiplier, betAmount, isRunning]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= maxBet) {
      setBetAmount(value);
    }
  };

  // Handle start game button click
  const handleStartGame = () => {
    if (isRunning) return;
    
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
    
    // Start the game
    startGame();
  };

  // Handle cash out button click
  const handleCashOut = () => {
    if (!isRunning || hasCrashed || hasUserCashedOut) return;
    
    // Cash out
    cashOut();
    
    // Add winnings
    const winnings = betAmount * multiplier;
    addWinnings(winnings);
    
    // Show win modal
    setTimeout(() => {
      setShowWinModal(true);
    }, 500);
  };

  // Effect to handle crash
  useEffect(() => {
    if (hasCrashed && !hasUserCashedOut && isRunning === false) {
      toast({
        title: "Crashed!",
        description: `The game crashed at ${multiplier.toFixed(2)}x.`,
        variant: "destructive",
      });
    }
  }, [hasCrashed, hasUserCashedOut, isRunning, multiplier, toast]);

  // Play again handler
  const handlePlayAgain = () => {
    setShowWinModal(false);
  };

  // Double down handler
  const handleDoubleDown = () => {
    setShowWinModal(false);
    setBetAmount(Math.min(betAmount * 2, maxBet));
  };

  // Draw chart effect
  useEffect(() => {
    if (!chartRef.current || !isRunning) return;
    
    const ctx = chartRef.current;
    const width = ctx.clientWidth;
    const height = ctx.clientHeight;
    
    // Update chart position based on multiplier
    ctx.style.setProperty('--x', `${Math.min(multiplier * 10, width - 20)}px`);
    ctx.style.setProperty('--y', `${height - Math.min(multiplier * 20, height - 20)}px`);
    
  }, [multiplier, isRunning]);

  return (
    <>
      <div className="game-preview bg-[#1a1a1a] rounded-xl p-6 text-center relative overflow-hidden">
        {/* Crash game chart */}
        <div className="bg-[#121212] rounded-xl p-4 mb-6 relative h-64 overflow-hidden">
          {/* Chart grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`h-${i}`} className="border-t border-gray-800 w-full"></div>
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`v-${i}`} className="border-l border-gray-800 h-full"></div>
            ))}
          </div>
          
          {/* Trading intervals */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500 z-10">
            <span>0s</span>
            <span>5s</span>
            <span>10s</span>
            <span>15s</span>
            <span>20s</span>
          </div>
          
          {/* Multiplier scale */}
          <div className="absolute top-2 right-2 bottom-8 w-10 flex flex-col justify-between items-end text-xs text-gray-500 z-10">
            <span>10x</span>
            <span>7.5x</span>
            <span>5x</span>
            <span>2.5x</span>
            <span>1x</span>
          </div>
          
          {/* Multiplier display */}
          <div className="absolute top-2 left-2 text-4xl font-bold text-white z-10">
            {isRunning || hasCrashed ? formatNumber(multiplier, 2) + 'x' : '1.00x'}
          </div>
          
          {/* Chart */}
          <div 
            ref={chartRef} 
            className="absolute bottom-0 left-0 w-full h-full"
            style={{ 
              '--x': '0px', 
              '--y': `${chartRef.current?.clientHeight || 0}px`
            } as React.CSSProperties}
          >
            {/* Dynamic Candles - Decorative */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={`candle-${i}`} 
                className={`absolute w-4 ${i % 2 === 0 ? 'bg-[#00FF00]' : 'bg-[#FF4081]'}`}
                style={{ 
                  height: `${10 + Math.random() * 40}px`, 
                  left: `${i * 30 + 20}px`, 
                  bottom: '20px',
                  opacity: 0.7
                }}
              ></div>
            ))}
            
            {/* Green line path when game is running */}
            {isRunning && !hasCrashed && (
              <svg 
                className="absolute bottom-0 left-0 w-full h-full overflow-visible" 
                style={{ zIndex: 5 }}
              >
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00FF00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00FF00" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${chartRef.current?.clientHeight || 0} L var(--x),var(--y) L var(--x),${chartRef.current?.clientHeight || 0} Z`}
                  fill="url(#greenGradient)"
                />
                <path
                  d={`M0,${chartRef.current?.clientHeight || 0} L var(--x),var(--y)`}
                  stroke="#00FF00"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="var(--x)"
                  cy="var(--y)"
                  r="5"
                  fill="#00FF00"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </svg>
            )}
            
            {/* Red crash line when crashed */}
            {hasCrashed && !hasUserCashedOut && (
              <svg 
                className="absolute bottom-0 left-0 w-full h-full overflow-visible" 
                style={{ zIndex: 5 }}
              >
                <defs>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF4081" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FF4081" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${chartRef.current?.clientHeight || 0} L var(--x),var(--y) L var(--x),${chartRef.current?.clientHeight || 0} Z`}
                  fill="url(#redGradient)"
                />
                <path
                  d={`M0,${chartRef.current?.clientHeight || 0} L var(--x),var(--y)`}
                  stroke="#FF4081"
                  strokeWidth="3"
                  fill="none"
                />
                <line 
                  x1="var(--x)" 
                  y1="var(--y)" 
                  x2="calc(var(--x) + 100px)" 
                  y2="calc(var(--y) + 100px)"
                  stroke="#FF4081"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
          
          {/* Game state overlay */}
          {(hasCrashed || hasUserCashedOut) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-20">
              {hasCrashed && !hasUserCashedOut && (
                <>
                  <img src={bearishshsImg} alt="Bear" className="w-20 h-20 mb-2" />
                  <div className="text-4xl font-bold text-[#FF4081]">DEV RUGGED!</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    CRASHED @ {multiplier.toFixed(2)}x
                  </div>
                </>
              )}
              {hasUserCashedOut && (
                <div className="text-4xl font-bold text-[#00FF00]">
                  CASHED OUT @ {cashOutMultiplier?.toFixed(2)}x
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className={`text-2xl font-bold mb-2 ${
            hasUserCashedOut ? 'text-[#00FF00]' : 
            hasCrashed ? 'text-[#FF4081]' : 
            'text-[#FFD700]'
          }`}>
            {!isRunning && !hasCrashed && !hasUserCashedOut ? 'Place Your Bet!' : 
              isRunning ? 'To The Moon! 🚀' : 
              hasUserCashedOut ? 'You Cashed Out!' : 
              'Game Crashed!'}
          </div>
          <div className="text-lg text-gray-300">
            {hasUserCashedOut && (
              <span className="text-[#00FF00]">
                You won {(betAmount * (cashOutMultiplier || 0)).toFixed(2)} ATOM!
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button 
            className={`px-6 py-3 ${
              isRunning 
                ? 'bg-[#FF4081] text-white' 
                : 'bg-[#FFD700] text-black'
            } rounded-lg font-medium hover:bg-opacity-90 transition-all text-lg`}
            onClick={isRunning ? handleCashOut : handleStartGame}
            disabled={hasCrashed || hasUserCashedOut}
          >
            {isRunning ? 'CASH OUT' : 'PLACE BET'}
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
                disabled={isRunning}
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
        amount={cashOutMultiplier ? betAmount * cashOutMultiplier : 0}
        onPlayAgain={handlePlayAgain}
        onDoubleDown={handleDoubleDown}
      />
    </>
  );
};

export default CrashGame;
