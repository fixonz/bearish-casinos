import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useMemeRace, MemeCoin } from '@/hooks/useMemeRace';
import { useWalletContext } from '@/context/WalletContext';
import { formatNumber } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Progress bar component for race track visualization
const RaceTrack: React.FC<{ coin: MemeCoin }> = ({ coin }) => {
  const progressBarStyle = {
    width: `${coin.position}%`,
    backgroundColor: coin.color,
    transition: 'width 100ms linear'
  };

  return (
    <div className="flex items-center w-full mb-4">
      <div className="mr-3 text-2xl">{coin.icon}</div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="font-medium">{coin.symbol}</span>
          <span className="text-sm">{Math.min(100, Math.floor(coin.position))}%</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full" 
            style={progressBarStyle} 
          />
        </div>
      </div>
    </div>
  );
};

const MemeRace: React.FC = () => {
  const { 
    coins, 
    isRacing, 
    countdown, 
    finished, 
    winner, 
    currentBet, 
    raceHistory,
    placeBet,
    clearBet,
    startRace,
    resetRace,
    getCoinById,
    getWinningAmount
  } = useMemeRace();

  const { wallet, placeBet: placeWalletBet, addWinnings } = useWalletContext();
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const { toast } = useToast();
  
  // Calculate potential winnings
  const potentialWinnings = selectedCoin ? getWinningAmount(selectedCoin, betAmount) : 0;

  // Handle placing a bet
  const handlePlaceBet = useCallback(() => {
    if (!selectedCoin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a meme coin to bet on"
      });
      return;
    }

    if (betAmount <= 0 || betAmount > wallet.balance) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid bet amount"
      });
      return;
    }

    // Place wallet bet
    const success = placeWalletBet(betAmount);
    if (!success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Insufficient funds"
      });
      return;
    }

    // Place game bet
    placeBet(selectedCoin, betAmount);
    
    toast({
      title: "Bet Placed",
      description: `${betAmount} coins bet on ${getCoinById(selectedCoin)?.symbol}`
    });
  }, [selectedCoin, betAmount, placeWalletBet, placeBet, getCoinById, wallet.balance, toast]);

  // Handle starting the race
  const handleStartRace = useCallback(() => {
    if (!currentBet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please place a bet first"
      });
      return;
    }

    startRace();
  }, [currentBet, startRace, toast]);

  // Handle race completion
  useEffect(() => {
    if (finished && winner && currentBet) {
      if (currentBet.coinId === winner.id) {
        // Player won
        const winAmount = getWinningAmount(winner.id, currentBet.amount);
        addWinnings(winAmount);
        
        setTimeout(() => {
          toast({
            title: "You Won!",
            description: `Your ${currentBet.amount} coin bet on ${winner.symbol} won ${formatNumber(winAmount)} coins!`,
            variant: "default",
          });
        }, 1000);
      } else {
        // Player lost
        setTimeout(() => {
          toast({
            title: "You Lost",
            description: `${winner.symbol} won the race. Better luck next time!`,
            variant: "destructive",
          });
        }, 1000);
      }
    }
  }, [finished, winner, currentBet, getWinningAmount, addWinnings, toast]);
  
  // Format currency display
  const formatCurrency = (amount: number): string => {
    return formatNumber(amount);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left panel - Coin selection & betting */}
        <div className="lg:col-span-1">
          <Card className="w-full mb-4">
            <CardHeader>
              <CardTitle>Place Your Bet</CardTitle>
              <CardDescription>
                Select a meme coin and place your bet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Amount:</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min={1}
                    max={wallet.balance}
                    disabled={!!currentBet || isRacing || countdown !== null}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-400">Balance: {formatCurrency(wallet.balance)} coins</p>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Select a Meme Coin:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {coins.map((coin) => (
                      <div
                        key={coin.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedCoin === coin.id 
                            ? 'border-[#FFD700] bg-gray-800/50' 
                            : 'border-gray-700 hover:border-gray-500'
                        } ${currentBet || isRacing || countdown !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (!currentBet && !isRacing && countdown === null) {
                            setSelectedCoin(coin.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{coin.icon}</span>
                            <span>{coin.symbol}</span>
                          </div>
                          <span className="text-sm font-bold">{coin.odds}x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedCoin && (
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span>Potential Win:</span>
                      <span className="font-bold text-[#FFD700]">
                        {formatCurrency(potentialWinnings)} coins
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {betAmount} x {getCoinById(selectedCoin)?.odds || 0} = {formatCurrency(potentialWinnings)}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={handlePlaceBet}
                    disabled={!selectedCoin || betAmount <= 0 || !!currentBet || isRacing || countdown !== null}
                  >
                    Place Bet
                  </Button>
                  {currentBet && !isRacing && countdown === null && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={clearBet}
                    >
                      Clear Bet
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Race History</CardTitle>
            </CardHeader>
            <CardContent>
              {raceHistory.length === 0 ? (
                <p className="text-gray-400 text-center">No races yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {raceHistory.map((race, index) => (
                    <div key={index} className="p-2 border-b border-gray-700/30 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{race.winner.icon}</span>
                          <span>{race.winner.symbol} won</span>
                        </div>
                        <Badge variant={race.playerWon ? "default" : "secondary"}>
                          {race.playerWon ? 'Won' : 'Lost'}
                        </Badge>
                      </div>
                      {race.playerBet && (
                        <div className="text-sm text-gray-400 mt-1">
                          {race.playerWon 
                            ? `Won ${formatCurrency(race.winAmount)} coins!` 
                            : `Lost ${formatCurrency(race.playerBet.amount)} coins`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel - Race track visualization */}
        <div className="lg:col-span-2">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle>Meme Coin Race</CardTitle>
              {currentBet && (
                <CardDescription>
                  Betting {formatCurrency(currentBet.amount)} coins on {getCoinById(currentBet.coinId)?.symbol}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Countdown or race status */}
              {countdown !== null && (
                <div className="flex flex-col items-center justify-center mb-6">
                  <h2 className="text-4xl font-bold mb-2">Race starting in</h2>
                  <div className="text-8xl font-bold text-[#FFD700]">{countdown}</div>
                </div>
              )}
              
              {/* Winner announcement */}
              {finished && winner && (
                <div className="bg-gray-800/40 p-4 rounded-lg mb-6 text-center">
                  <h2 className="text-xl font-bold mb-2">
                    <span className="text-2xl mr-2">{winner.icon}</span>
                    {winner.symbol} wins the race!
                  </h2>
                  
                  {currentBet && (
                    <div className="mt-2">
                      {currentBet.coinId === winner.id ? (
                        <p className="text-green-500 font-bold text-lg">
                          You won {formatCurrency(getWinningAmount(winner.id, currentBet.amount))} coins!
                        </p>
                      ) : (
                        <p className="text-red-500 font-bold text-lg">
                          You lost {formatCurrency(currentBet.amount)} coins
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Race tracks */}
              <div className="flex-1 space-y-1">
                {coins.map((coin) => (
                  <RaceTrack key={coin.id} coin={coin} />
                ))}
              </div>
              
              {/* Race controls */}
              <div className="mt-4 flex justify-center">
                {!isRacing && countdown === null && (
                  <>
                    {finished ? (
                      <Button onClick={resetRace} className="w-32">
                        Race Again
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartRace} 
                        disabled={!currentBet} 
                        className="w-32"
                      >
                        Start Race
                      </Button>
                    )}
                  </>
                )}
                
                {(isRacing || countdown !== null) && (
                  <div className="animate-pulse font-bold text-lg">
                    {isRacing ? 'Race in progress...' : 'Get ready...'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemeRace;