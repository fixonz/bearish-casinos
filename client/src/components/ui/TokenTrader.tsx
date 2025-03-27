import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { useTokenTrader, TokenData, Trade } from '@/hooks/useTokenTrader';
import { useWalletContext } from '@/context/WalletContext';
import { formatNumber } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const TokenTrader: React.FC = () => {
  const {
    tokens,
    selectedToken,
    userPortfolio,
    trades,
    priceHistory,
    isTrading,
    lastProfit,
    startTrading,
    stopTrading,
    selectToken,
    executeBuy,
    executeSell,
    getPortfolioValue,
    getPositionProfitLoss
  } = useTokenTrader();

  const { wallet, placeBet, addWinnings } = useWalletContext();
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<{ profit: number, isWin: boolean } | null>(null);

  // Format the time left for display
  const formatTimeLeft = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update time left each second when game is in progress
  useEffect(() => {
    if (!isPlaying || !endTime) return;

    const interval = setInterval(() => {
      const secondsRemaining = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) {
        // Game ended
        clearInterval(interval);
        endGame();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, endTime]);

  // Start the game with a bet
  const handleStartGame = () => {
    if (!wallet.isConnected) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    if (betAmount <= 0 || betAmount > wallet.balance) {
      setMessage({ type: 'error', text: 'Invalid bet amount' });
      return;
    }

    // Place bet
    const betSuccess = placeBet(betAmount);
    if (!betSuccess) {
      setMessage({ type: 'error', text: 'Failed to place bet' });
      return;
    }

    // Set up the game
    setIsPlaying(true);
    setFinalResult(null);
    setMessage({ type: 'info', text: 'Game started! Trade tokens to make a profit in 3 minutes.' });
    startTrading();

    // Set the end time to 3 minutes from now
    const end = new Date(Date.now() + 3 * 60 * 1000);
    setEndTime(end);
    setTimeLeft(3 * 60);
  };

  // End the game and calculate results
  const endGame = () => {
    setIsPlaying(false);
    stopTrading();

    // Calculate final portfolio value
    const finalValue = getPortfolioValue();
    const initialValue = 1000; // Starting virtual amount
    const profit = finalValue - initialValue;
    const isWin = profit > 0;

    setFinalResult({ profit, isWin });

    // Handle winnings
    if (isWin) {
      // Calculate winnings based on profit percentage
      const profitPercentage = profit / initialValue;
      const winMultiplier = Math.min(5, 1 + profitPercentage); // Cap at 5x
      const winAmount = betAmount * winMultiplier;
      
      addWinnings(winAmount);
      setMessage({ 
        type: 'success', 
        text: `You won ${formatNumber(winAmount)} coins! (${(winMultiplier).toFixed(2)}x)` 
      });
    } else {
      setMessage({ 
        type: 'error', 
        text: `You lost your ${betAmount} coin bet. Better luck next time!` 
      });
    }
  };

  // Handle buying tokens
  const handleBuy = () => {
    if (!selectedToken || !isPlaying) return;
    
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const success = executeBuy(selectedToken.symbol, amount);
    if (success) {
      setMessage({ type: 'success', text: `Bought ${amount} ${selectedToken.symbol}` });
      setBuyAmount('');
    } else {
      setMessage({ type: 'error', text: 'Failed to execute buy order' });
    }
  };

  // Handle selling tokens
  const handleSell = () => {
    if (!selectedToken || !isPlaying) return;
    
    const amount = parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const position = userPortfolio[selectedToken.symbol];
    if (!position || position.amount < amount) {
      setMessage({ type: 'error', text: `You don't have enough ${selectedToken.symbol} to sell` });
      return;
    }

    const result = executeSell(selectedToken.symbol, amount);
    if (result !== false) {
      setMessage({ type: 'success', text: `Sold ${amount} ${selectedToken.symbol}` });
      setSellAmount('');
    } else {
      setMessage({ type: 'error', text: 'Failed to execute sell order' });
    }
  };

  // Get color class based on price change
  const getPriceChangeColorClass = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  // Format percentage with color and sign
  const formatPercentage = (value: number): JSX.Element => {
    const colorClass = getPriceChangeColorClass(value);
    const sign = value > 0 ? '+' : '';
    return <span className={colorClass}>{sign}{value.toFixed(2)}%</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {/* Game Controls */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Token Trader</CardTitle>
            <CardDescription>
              Trade crypto tokens within a time limit to make a profit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isPlaying ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="font-medium">Bet Amount:</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min={1}
                    max={wallet.balance}
                    className="w-32"
                  />
                  <Button onClick={handleStartGame} disabled={!wallet.isConnected || isPlaying}>
                    Start Game
                  </Button>
                </div>
                {wallet.isConnected && (
                  <p className="text-sm">Balance: {formatNumber(wallet.balance)} coins</p>
                )}
                {finalResult && (
                  <div className={`p-4 rounded-md ${finalResult.isWin ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <h3 className="font-bold text-lg">Game Results</h3>
                    <p>
                      Your virtual portfolio {finalResult.isWin ? 'made' : 'lost'} {' '}
                      <span className={finalResult.isWin ? 'text-green-500' : 'text-red-500'}>
                        {formatNumber(Math.abs(finalResult.profit))} coins
                      </span>
                    </p>
                    <p className="mt-2">
                      {finalResult.isWin 
                        ? 'Congratulations! You won the bet.' 
                        : 'Better luck next time!'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Time Remaining:</p>
                  <p className="text-2xl font-bold">{formatTimeLeft(timeLeft)}</p>
                </div>
                <div>
                  <p className="font-medium">Portfolio Value:</p>
                  <p className="text-2xl font-bold">{formatNumber(getPortfolioValue())} coins</p>
                </div>
                <Button variant="destructive" onClick={endGame}>
                  End Game Early
                </Button>
              </div>
            )}
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                message.type === 'success' ? 'bg-green-900/30' :
                message.type === 'error' ? 'bg-red-900/30' : 'bg-blue-900/30'
              }`}>
                {message.text}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Game Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Token List */}
          <Card className="w-full lg:col-span-1">
            <CardHeader>
              <CardTitle>Available Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tokens.map((token) => (
                  <div 
                    key={token.symbol}
                    className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-800/50 flex justify-between items-center ${
                      selectedToken?.symbol === token.symbol ? 'bg-gray-800/70 border border-[#FFD700]/50' : ''
                    }`}
                    onClick={() => selectToken(token.symbol)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{token.icon}</div>
                      <div>
                        <p className="font-bold">{token.symbol}</p>
                        <p className="text-sm text-gray-400">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">${formatNumber(token.priceUSD)}</p>
                      <p className="text-sm">{formatPercentage(token.change24h)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trading Interface */}
          <Card className="w-full lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedToken ? `${selectedToken.name} (${selectedToken.symbol})` : 'Select a token'}
              </CardTitle>
              {selectedToken && (
                <div className="flex justify-between mt-2">
                  <p className="text-xl font-bold">${formatNumber(selectedToken.priceUSD)}</p>
                  <p className="text-lg">{formatPercentage(selectedToken.change24h)}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedToken && (
                <Tabs defaultValue="buy">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                    <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-medium">Amount to Buy:</label>
                        <Input
                          type="number"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          min={0.00001}
                          step={selectedToken.priceUSD < 1 ? 0.1 : 0.001}
                          disabled={!isPlaying}
                          placeholder={`Amount of ${selectedToken.symbol}`}
                        />
                        {buyAmount && !isNaN(parseFloat(buyAmount)) && (
                          <p className="text-sm text-gray-400">
                            Cost: {formatNumber(parseFloat(buyAmount) * selectedToken.priceUSD)} coins
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={handleBuy} 
                        disabled={!isPlaying || !buyAmount || isNaN(parseFloat(buyAmount)) || parseFloat(buyAmount) <= 0}
                        className="w-full"
                      >
                        Buy {selectedToken.symbol}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sell">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-medium">Amount to Sell:</label>
                        <Input
                          type="number"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                          min={0.00001}
                          step={selectedToken.priceUSD < 1 ? 0.1 : 0.001}
                          max={userPortfolio[selectedToken.symbol]?.amount || 0}
                          disabled={!isPlaying}
                          placeholder={`Amount of ${selectedToken.symbol}`}
                        />
                        {sellAmount && !isNaN(parseFloat(sellAmount)) && (
                          <p className="text-sm text-gray-400">
                            Value: {formatNumber(parseFloat(sellAmount) * selectedToken.priceUSD)} coins
                          </p>
                        )}
                        <p className="text-sm">
                          You own: {formatNumber(userPortfolio[selectedToken.symbol]?.amount || 0)} {selectedToken.symbol}
                        </p>
                      </div>
                      <Button 
                        onClick={handleSell} 
                        disabled={
                          !isPlaying || 
                          !sellAmount || 
                          isNaN(parseFloat(sellAmount)) || 
                          parseFloat(sellAmount) <= 0 ||
                          !userPortfolio[selectedToken.symbol] ||
                          parseFloat(sellAmount) > userPortfolio[selectedToken.symbol]?.amount
                        }
                        className="w-full"
                      >
                        Sell {selectedToken.symbol}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="portfolio">
                    <div className="space-y-4">
                      <h3 className="font-bold">Your Token Holdings</h3>
                      {Object.keys(userPortfolio).length === 0 ? (
                        <p className="text-gray-400">You don't own any tokens yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(userPortfolio).map(([symbol, position]) => {
                            const token = tokens.find(t => t.symbol === symbol);
                            const profitLoss = getPositionProfitLoss(symbol);
                            
                            if (!token) return null;
                            
                            return (
                              <div key={symbol} className="p-3 rounded-md bg-gray-800/30 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="text-xl">{token.icon}</div>
                                  <div>
                                    <p className="font-bold">{symbol}</p>
                                    <p className="text-sm">
                                      {formatNumber(position.amount)} @ ${formatNumber(position.avgBuyPrice)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono">${formatNumber(token.priceUSD * position.amount)}</p>
                                  {profitLoss && (
                                    <p className={`text-sm ${getPriceChangeColorClass(profitLoss.percentage)}`}>
                                      {profitLoss.percentage > 0 ? '+' : ''}
                                      {formatNumber(profitLoss.amount)} ({profitLoss.percentage.toFixed(2)}%)
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="pt-2 font-bold text-right">
                            Total: {formatNumber(getPortfolioValue())} coins
                          </div>
                        </div>
                      )}
                      
                      <h3 className="font-bold mt-6">Recent Trades</h3>
                      {trades.length === 0 ? (
                        <p className="text-gray-400">No trades yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {trades.slice(0, 10).map((trade, index) => (
                            <div key={index} className="py-2 border-b border-gray-700/50 flex justify-between items-center">
                              <div>
                                <p className={`font-medium ${trade.action === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                  {trade.action === 'buy' ? 'Bought' : 'Sold'} {formatNumber(trade.amount)} {trade.tokenSymbol}
                                </p>
                                <p className="text-xs text-gray-400">
                                  at ${formatNumber(trade.price)} per token
                                </p>
                              </div>
                              {trade.action === 'sell' && trade.profit !== undefined && (
                                <p className={getPriceChangeColorClass(trade.profit)}>
                                  {trade.profit > 0 ? '+' : ''}
                                  {formatNumber(trade.profit)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenTrader;