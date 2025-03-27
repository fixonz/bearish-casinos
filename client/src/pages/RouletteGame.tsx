import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useWalletContext } from '@/context/WalletContext';
import { useGamesContext } from '@/context/GamesContext';
import useRoulette, { 
  RouletteNumber, 
  RouletteBetType, 
  NUMBER_COLORS, 
  ROULETTE_NUMBERS 
} from '@/hooks/useRoulette';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RouletteGame = () => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { addGameResult } = useGamesContext();
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<{
    type: RouletteBetType;
    numbers: RouletteNumber[];
    label: string;
  } | null>(null);
  
  const roulette = useRoulette();
  
  // Handle bet change
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value);
  };
  
  // Handle bet placement
  const handlePlaceBet = () => {
    if (!selectedBet) {
      toast({
        title: "No bet selected",
        description: "Please select a bet type before placing your bet.",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    const betSuccess = placeBet(betAmount);
    if (!betSuccess) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive"
      });
      return;
    }
    
    roulette.placeBet(selectedBet.type, selectedBet.numbers, betAmount);
    
    toast({
      title: "Bet placed",
      description: `You placed a ${betAmount} token bet on ${selectedBet.label}.`,
      variant: "default"
    });
  };
  
  // Handle spin
  const handleSpin = () => {
    if (roulette.bets.length === 0) {
      toast({
        title: "No bets placed",
        description: "Please place at least one bet before spinning.",
        variant: "destructive"
      });
      return;
    }
    
    roulette.spin();
  };
  
  // Handle collecting winnings
  useEffect(() => {
    if (!roulette.isSpinning && roulette.result !== null && roulette.winAmount > 0) {
      addWinnings(roulette.winAmount);
      
      // Record game result
      addGameResult({
        gameId: 'roulette',
        userId: wallet.userId,
        betAmount: roulette.totalBet,
        winAmount: roulette.winAmount,
        multiplier: roulette.winAmount / roulette.totalBet,
        outcome: roulette.hasWon ? 'win' : 'loss'
      });
      
      // Show toast
      toast({
        title: "You won!",
        description: `You won ${roulette.winAmount.toFixed(2)} tokens!`,
        variant: "default"
      });
    } else if (!roulette.isSpinning && roulette.result !== null && roulette.winAmount === 0 && roulette.bets.length > 0) {
      // Record loss
      addGameResult({
        gameId: 'roulette',
        userId: wallet.userId,
        betAmount: roulette.totalBet,
        winAmount: 0,
        multiplier: 0,
        outcome: 'loss'
      });
    }
  }, [roulette.isSpinning, roulette.result, roulette.winAmount, roulette.totalBet, roulette.hasWon, roulette.bets.length, addWinnings, addGameResult, wallet.userId]);
  
  // Get color class for a number
  const getNumberColor = (num: RouletteNumber) => {
    const color = NUMBER_COLORS[num];
    switch (color) {
      case 'red': return 'bg-red-600 text-white';
      case 'black': return 'bg-gray-900 text-white';
      case 'green': return 'bg-green-600 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };
  
  // Render the roulette wheel result
  const renderResult = () => {
    if (roulette.result === null) return null;
    
    const resultColor = getNumberColor(roulette.result);
    
    return (
      <div className="text-center mb-6">
        <h3 className="text-xl mb-2">Result:</h3>
        <div className={`inline-block w-16 h-16 rounded-full ${resultColor} flex items-center justify-center text-2xl font-bold`}>
          {roulette.result}
        </div>
      </div>
    );
  };
  
  // Bet selection options
  const betOptions = [
    { type: 'red', numbers: ROULETTE_NUMBERS.filter(n => NUMBER_COLORS[n] === 'red'), label: 'Red' },
    { type: 'black', numbers: ROULETTE_NUMBERS.filter(n => NUMBER_COLORS[n] === 'black'), label: 'Black' },
    { type: 'even', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n > 0 && n % 2 === 0), label: 'Even' },
    { type: 'odd', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n > 0 && n % 2 === 1), label: 'Odd' },
    { type: 'low', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n >= 1 && n <= 18), label: '1-18' },
    { type: 'high', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n >= 19 && n <= 36), label: '19-36' },
    // First dozen (1-12)
    { type: 'dozen', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n >= 1 && n <= 12), label: '1st Dozen (1-12)' },
    // Second dozen (13-24)
    { type: 'dozen', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n >= 13 && n <= 24), label: '2nd Dozen (13-24)' },
    // Third dozen (25-36)
    { type: 'dozen', numbers: ROULETTE_NUMBERS.filter(n => typeof n === 'number' && n >= 25 && n <= 36), label: '3rd Dozen (25-36)' },
  ] as const;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Roulette</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            {/* Roulette Wheel */}
            <div className="bg-green-900/50 p-6 rounded-lg text-center">
              {roulette.isSpinning ? (
                <div className="text-2xl font-bold animate-pulse">Spinning...</div>
              ) : renderResult()}
              
              {/* Previous results */}
              {roulette.previousResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm mb-2">Previous Results:</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {roulette.previousResults.map((num, idx) => (
                      <div 
                        key={`prev-${idx}`} 
                        className={`w-8 h-8 rounded-full ${getNumberColor(num)} flex items-center justify-center text-xs font-bold`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Game Status */}
            {!roulette.isSpinning && roulette.result !== null && (
              <div className="text-center">
                {roulette.hasWon ? (
                  <div className="text-green-500 text-2xl font-bold">You Won {roulette.winAmount.toFixed(2)} tokens!</div>
                ) : (
                  <div className="text-red-500 text-2xl font-bold">You Lost</div>
                )}
              </div>
            )}
            
            {/* Betting Options */}
            <div className="bg-green-900/50 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Place Your Bets</h3>
              
              {/* Bet selection grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {betOptions.map((option, idx) => (
                  <Button 
                    key={`bet-option-${idx}`}
                    variant={selectedBet?.label === option.label ? "default" : "outline"}
                    className={selectedBet?.label === option.label ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => setSelectedBet(option as any)}
                    disabled={roulette.isSpinning}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              {/* Individual numbers grid */}
              <h4 className="text-md mb-2">Single Numbers (35:1 payout)</h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-4">
                {/* Zero and double zero */}
                <Button 
                  className={`${getNumberColor(0)} text-xs`}
                  onClick={() => setSelectedBet({ type: 'straight', numbers: [0], label: '0' })}
                  disabled={roulette.isSpinning}
                >
                  0
                </Button>
                <Button 
                  className={`${getNumberColor('00')} text-xs`}
                  onClick={() => setSelectedBet({ type: 'straight', numbers: ['00'], label: '00' })}
                  disabled={roulette.isSpinning}
                >
                  00
                </Button>
                
                {/* Numbers 1-36 */}
                {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                  <Button 
                    key={`num-${num}`}
                    className={`${getNumberColor(num as RouletteNumber)} text-xs`}
                    onClick={() => setSelectedBet({ type: 'straight', numbers: [num as RouletteNumber], label: `${num}` })}
                    disabled={roulette.isSpinning}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              
              {/* Current bets */}
              {roulette.bets.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md mb-2">Your Bets</h4>
                  <div className="space-y-2">
                    {roulette.bets.map((bet, idx) => (
                      <div key={`active-bet-${idx}`} className="flex justify-between items-center bg-gray-800/70 p-2 rounded">
                        <div>
                          <span className="text-sm font-medium">
                            {bet.type === 'straight' ? `Number ${bet.numbers[0]}` : 
                             bet.type === 'red' ? 'Red' :
                             bet.type === 'black' ? 'Black' :
                             bet.type === 'even' ? 'Even' :
                             bet.type === 'odd' ? 'Odd' :
                             bet.type === 'low' ? '1-18' :
                             bet.type === 'high' ? '19-36' :
                             bet.type === 'dozen' ? `Dozen (${Math.min(...bet.numbers as number[])}-${Math.max(...bet.numbers as number[])})` : 
                             bet.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm">{bet.amount} tokens</span>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => roulette.removeBet(bet.id)}
                            disabled={roulette.isSpinning}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          {/* Game Controls */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={betAmount}
                onChange={handleBetChange}
                min={1}
                max={wallet.balance}
                className="w-24"
                disabled={roulette.isSpinning}
              />
              <Button 
                onClick={handlePlaceBet} 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                disabled={roulette.isSpinning || selectedBet === null}
              >
                Place Bet
              </Button>
              <Button 
                onClick={handleSpin} 
                variant="default" 
                className="bg-red-600 hover:bg-red-700"
                disabled={roulette.isSpinning || roulette.bets.length === 0}
              >
                Spin
              </Button>
              <Button 
                onClick={roulette.clearBets} 
                variant="outline"
                disabled={roulette.isSpinning || roulette.bets.length === 0}
              >
                Clear Bets
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Bet: {roulette.totalBet.toFixed(2)} tokens</p>
              <p className="text-sm text-gray-400">Your Balance: {wallet.balance.toFixed(2)} tokens</p>
            </div>
          </div>
          
          {/* Game status text */}
          {roulette.isSpinning && (
            <div className="text-center text-yellow-500">
              No more bets! Wheel is spinning...
            </div>
          )}
          
          {/* New game button after winning */}
          {!roulette.isSpinning && roulette.result !== null && (
            <Button 
              onClick={roulette.newRound} 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Round
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Game Rules */}
      <Card className="w-full max-w-4xl mx-auto mt-6 bg-black/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Roulette Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>The roulette wheel has 38 numbers: 1-36, 0, and 00.</li>
            <li>Numbers 1-36 are either red or black, while 0 and 00 are green.</li>
            <li>You can place various types of bets with different odds of winning:</li>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Straight (Single Number): 35:1 payout</li>
              <li>Red/Black, Odd/Even, High/Low: 1:1 payout (even money)</li>
              <li>Dozen (1-12, 13-24, 25-36): 2:1 payout</li>
            </ul>
            <li>After all bets are placed, the wheel is spun and a ball lands on one number.</li>
            <li>If your bet includes the winning number, you win according to the payout ratio.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouletteGame;