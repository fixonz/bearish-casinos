import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useWalletContext } from '@/context/WalletContext';
import { formatNumber } from '@/lib/utils';
import { 
  useMiningGame, 
  MiningHardware, 
  MiningPool, 
  Cryptocurrency,
  MiningEvent
} from '@/hooks/useMiningGame';

const MiningGame: React.FC = () => {
  const {
    gameStarted,
    availableHardware,
    availablePools,
    availableCryptos,
    selectedPool,
    selectedCrypto,
    stats,
    balance,
    cycleCount,
    isMining,
    autoMining,
    miningEvents,
    miningSpeed,
    startGame,
    purchaseHardware,
    selectPool,
    selectCrypto,
    toggleMining,
    toggleAutoMining,
    setMiningSpeed,
    resetHardware,
    getHardwareDetails,
    getMostProfitableCrypto
  } = useMiningGame();

  const { toast } = useToast();
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [playTime, setPlayTime] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameEndTime, setGameEndTime] = useState<Date | null>(null);

  // Format currency display
  const formatCurrency = (amount: number): string => {
    return formatNumber(amount);
  };

  // Start the mining game with a bet
  const handleStartPlaying = () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to play.",
        variant: "destructive"
      });
      return;
    }

    if (betAmount <= 0 || betAmount > wallet.balance) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive"
      });
      return;
    }

    // Place bet
    const betSuccess = placeBet(betAmount);
    if (!betSuccess) {
      toast({
        title: "Bet Failed",
        description: "Failed to place your bet.",
        variant: "destructive"
      });
      return;
    }

    // Start the game
    startGame();
    setIsGameActive(true);
    
    // Set end time (3 minutes of gameplay)
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + 3);
    setGameEndTime(endTime);
    setPlayTime(3 * 60); // 3 minutes in seconds
    
    toast({
      title: "Game Started",
      description: "Build your mining operation to earn more than your initial bet!",
    });
  };

  // End the game and calculate results
  const handleEndGame = () => {
    setIsGameActive(false);
    
    // Calculate winnings based on balance
    if (balance > betAmount) {
      // Player made a profit
      const profit = balance - betAmount;
      const multiplier = 1 + (profit / betAmount);
      const winnings = betAmount * multiplier;
      
      addWinnings(winnings);
      
      toast({
        title: "You Won!",
        description: `You earned ${formatCurrency(winnings)} coins (${multiplier.toFixed(2)}x)`,
      });
    } else {
      toast({
        title: "You Lost",
        description: "Your mining operation wasn't profitable enough. Better luck next time!",
        variant: "destructive"
      });
    }
    
    // Reset game state
    resetHardware();
  };

  // Update remaining time
  useEffect(() => {
    if (!isGameActive || !gameEndTime) return;
    
    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((gameEndTime.getTime() - Date.now()) / 1000));
      setPlayTime(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
        handleEndGame();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isGameActive, gameEndTime]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle hardware purchase
  const handlePurchaseHardware = (hardwareId: string) => {
    const hardware = getHardwareDetails(hardwareId);
    if (!hardware) return;
    
    if (hardware.cost > balance) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${formatCurrency(hardware.cost)} coins to buy this hardware.`,
        variant: "destructive"
      });
      return;
    }
    
    const success = purchaseHardware(hardwareId);
    if (success) {
      toast({
        title: "Hardware Purchased",
        description: `You purchased a ${hardware.name}.`,
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {!gameStarted ? (
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>Crypto Mining Simulator</CardTitle>
            <CardDescription>
              Build and manage your mining operation to earn more than your initial investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <h3 className="text-lg font-bold mb-2">How to Play</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Place a bet to start the game</li>
                  <li>Purchase mining hardware with your funds</li>
                  <li>Choose cryptocurrencies and mining pools</li>
                  <li>Start mining to earn cryptocurrency</li>
                  <li>Cash out your earnings at the end of the game</li>
                  <li>If your final balance is higher than your bet, you win!</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="font-medium">Bet Amount:</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={10}
                  max={wallet.balance}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-32"
                />
                <Button onClick={handleStartPlaying} disabled={!wallet.isConnected}>
                  Start Mining
                </Button>
              </div>
              {wallet.isConnected && (
                <p className="text-sm">Balance: {formatCurrency(wallet.balance)} coins</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Game Header with Stats */}
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="space-y-1 mb-4 lg:mb-0">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">Balance:</span>
                    <span className="text-xl font-mono">{formatCurrency(balance)} coins</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">Initial Bet:</span>
                    <span>{formatCurrency(betAmount)} coins</span>
                    <span className="mx-2">•</span>
                    <span className="mr-2">Profit/Loss:</span>
                    <span className={balance > betAmount ? 'text-green-500' : 'text-red-500'}>
                      {balance > betAmount ? '+' : ''}{formatCurrency(balance - betAmount)} coins
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">Time Remaining:</span>
                    <span className="text-xl">{formatTimeRemaining(playTime)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                      style={{ width: `${(playTime / (3 * 60)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Game Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Panel - Navigation */}
            <div className="lg:col-span-1">
              <Card className="w-full">
                <CardContent className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full mb-4">
                      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                      <TabsTrigger value="hardware">Hardware</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="dashboard" className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Hash Rate</div>
                          <div className="text-lg font-bold">{stats.totalHashRate.toFixed(2)} TH/s</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Power Usage</div>
                          <div className="text-lg font-bold">{stats.energyConsumption}W</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Operating Cost</div>
                          <div className="text-lg font-bold">{formatCurrency(stats.operatingCosts)}/cycle</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Cycles</div>
                          <div className="text-lg font-bold">{cycleCount}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-bold">Mining Settings</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <span>Pool:</span>
                            <select 
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm flex-1"
                              value={selectedPool?.id || ''}
                              onChange={(e) => selectPool(e.target.value)}
                            >
                              {availablePools.map(pool => (
                                <option key={pool.id} value={pool.id}>
                                  {pool.icon} {pool.name} ({pool.fee}% fee)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Crypto:</span>
                            <select 
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm flex-1"
                              value={selectedCrypto?.id || ''}
                              onChange={(e) => selectCrypto(e.target.value)}
                            >
                              {availableCryptos.map(crypto => (
                                <option key={crypto.id} value={crypto.id}>
                                  {crypto.icon} {crypto.symbol} (${formatCurrency(crypto.marketPrice)})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Mining Speed:</span>
                          <div className="flex items-center space-x-2">
                            <Slider
                              value={[miningSpeed]}
                              min={0.5}
                              max={3}
                              step={0.5}
                              onValueChange={(value) => setMiningSpeed(value[0])}
                              className="w-24"
                            />
                            <span className="text-sm">{miningSpeed}x</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant={isMining ? "destructive" : "default"}
                            className="flex-1"
                            onClick={toggleMining}
                          >
                            {isMining ? 'Stop Mining' : 'Start Mining'}
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={handleEndGame}
                          >
                            Cash Out
                          </Button>
                        </div>
                      </div>
                      
                      {selectedCrypto && (
                        <div className="bg-gray-800/30 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{selectedCrypto.icon}</span>
                              <span>{selectedCrypto.name} ({selectedCrypto.symbol})</span>
                            </div>
                            <div className="font-mono">${formatCurrency(selectedCrypto.marketPrice)}</div>
                          </div>
                          <div className="text-sm text-gray-400">
                            <div>Difficulty: {selectedCrypto.difficulty.toFixed(2)}</div>
                            <div>Volatility: {(selectedCrypto.volatility * 100).toFixed(2)}%</div>
                            <div className="mt-1">
                              Mined: {(stats.totalMined[selectedCrypto.id] || 0).toFixed(8)} {selectedCrypto.symbol}
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="hardware" className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold">Your Hardware</h3>
                        {Object.entries(stats.hardware).length === 0 ? (
                          <p className="text-gray-400">No hardware purchased yet</p>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries(stats.hardware).map(([hwId, count]) => {
                              const hardware = getHardwareDetails(hwId);
                              if (!hardware || count <= 0) return null;
                              
                              const running = stats.runningHardware[hwId] || 0;
                              const offline = count - running;
                              
                              return (
                                <div key={hwId} className="p-3 bg-gray-800/30 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <span className="text-xl mr-2">{hardware.icon}</span>
                                      <div>
                                        <div>{hardware.name}</div>
                                        <div className="text-sm text-gray-400">
                                          {hardware.hashRate} TH/s • {hardware.powerConsumption}W
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Badge variant="outline">x{count}</Badge>
                                    </div>
                                  </div>
                                  {offline > 0 && (
                                    <div className="mt-1 text-sm text-red-500">
                                      {offline} units broken
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-bold">Available Hardware</h3>
                        <div className="space-y-2">
                          {availableHardware.map((hardware) => (
                            <div key={hardware.id} className="p-3 bg-gray-800/30 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">{hardware.icon}</span>
                                  <div>
                                    <div>{hardware.name}</div>
                                    <div className="text-sm text-gray-400">
                                      {hardware.hashRate} TH/s • {hardware.powerConsumption}W • Lifespan: {hardware.lifespan} cycles
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Badge variant="outline">{formatCurrency(hardware.cost)}</Badge>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full"
                                  disabled={hardware.cost > balance}
                                  onClick={() => handlePurchaseHardware(hardware.id)}
                                >
                                  Purchase
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Panel - Activity Log */}
            <div className="lg:col-span-2">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle>Mining Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto p-2">
                    {miningEvents.length === 0 ? (
                      <p className="text-gray-400 text-center">No mining activity yet</p>
                    ) : (
                      miningEvents.map((event, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border-l-4 ${
                            event.type === 'block' ? 'border-green-500 bg-green-900/10' :
                            event.type === 'payout' ? 'border-blue-500 bg-blue-900/10' :
                            event.type === 'breakdown' ? 'border-red-500 bg-red-900/10' :
                            'border-gray-500 bg-gray-800/20'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div>{event.description}</div>
                            <div className="text-sm text-gray-400">
                              {event.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          {event.amount && event.cryptoId && (
                            <div className="text-sm mt-1">
                              Value: {formatCurrency(event.amount * (
                                availableCryptos.find(c => c.id === event.cryptoId)?.marketPrice || 0
                              ))} coins
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningGame;