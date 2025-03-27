import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useWalletContext } from '@/context/WalletContext';
import { useCrash } from '@/hooks/useRandomization';
import { useToast } from '@/hooks/use-toast';
import WinModal from '@/components/modals/WinModal';
import { formatNumber, cn } from '@/lib/utils';
import bearishshsImg from '@assets/bearishshs.png';
import { MessageSquareIcon, Users2Icon, Settings2Icon, SendIcon } from 'lucide-react';
import defaultAvatarImg from '@assets/head.png';

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
    candles,
    activeCandle,
    currentPlayers,
    chatMessages,
    gameStartCountdown,
    nextGameTimestamp,
    startGame, 
    cashOut,
    joinGame,
    playerCashOut,
    leaveGame,
    addChatMessage,
    changePlayerNickname,
    changePlayerProfilePicture
  } = useCrash();

  const [betAmount, setBetAmount] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'PENGU'>('ETH');
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

  // Toggle selected token
  const toggleToken = () => {
    setSelectedToken(prev => prev === 'ETH' ? 'PENGU' : 'ETH');
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
    if (!chartRef.current) return;

    const ctx = chartRef.current;
    const width = ctx.clientWidth;
    const height = ctx.clientHeight;

    if (isRunning) {
      // Update chart position based on multiplier with a logarithmic curve
      // This creates a more realistic trading chart pattern that starts steep and flattens
      const baseX = Math.min(multiplier * 12, width * 0.8);
      const logY = height - Math.min(Math.log(multiplier + 1) * 85, height - 30);

      ctx.style.setProperty('--x', `${baseX}px`);
      ctx.style.setProperty('--y', `${logY}px`);
    } else if (hasCrashed) {
      // When crashed, position at the crash point
      const baseX = Math.min(multiplier * 12, width * 0.8);
      const logY = height - Math.min(Math.log(multiplier + 1) * 85, height - 30);

      ctx.style.setProperty('--x', `${baseX}px`);
      ctx.style.setProperty('--y', `${logY}px`);
    } else {
      // Reset to starting position
      ctx.style.setProperty('--x', '0px');
      ctx.style.setProperty('--y', `${height}px`);
    }

  }, [multiplier, isRunning, hasCrashed]);

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
            {/* Background decoration - static candles */}
            {!isRunning && !hasCrashed && 
              Array.from({ length: 20 }).map((_, i) => {
                const isGreen = Math.random() > 0.4;
                const width = 6 + Math.random() * 4;
                const height = 10 + Math.random() * 60;
                return (
                  <div 
                    key={`bg-candle-${i}`} 
                    className="absolute"
                    style={{ 
                      bottom: '20px',
                      left: `${i * 15 + 10}px`, 
                      opacity: 0.4
                    }}
                  >
                    {/* Upper Wick */}
                    <div 
                      className="absolute mx-auto left-0 right-0 w-[1px]"
                      style={{
                        height: `${5 + Math.random() * 15}px`,
                        bottom: `${height + 5}px`,
                        backgroundColor: isGreen ? '#00FF00' : '#FF4081',
                        opacity: 0.8
                      }}
                    ></div>

                    {/* Candle body */}
                    <div 
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        position: 'absolute',
                        backgroundColor: isGreen ? '#00FF00' : '#FF4081',
                        opacity: isGreen ? 0.6 : 0.5
                      }}
                    ></div>

                    {/* Lower Wick */}
                    <div 
                      className="absolute mx-auto left-0 right-0 w-[1px]"
                      style={{
                        height: `${5 + Math.random() * 10}px`,
                        bottom: `0px`,
                        backgroundColor: isGreen ? '#00FF00' : '#FF4081',
                        opacity: 0.8
                      }}
                    ></div>
                  </div>
                );
              })
            }

            {/* Active candles from the candles array when game is running */}
            {isRunning && !hasCrashed && candles.map((candle, index) => (
              <div 
                key={`active-candle-${index}`}
                className={`absolute z-10 transition-all ${index === activeCandle ? 'duration-[2500ms]' : 'duration-100'}`}
                style={{
                  bottom: '20px',
                  left: `${candle.position}px`,
                  transform: 'translateX(-50%)',
                  opacity: index === activeCandle ? 1 : (index < activeCandle ? 0.8 : 0.4)
                }}
              >
                {/* Upper Wick */}
                <div 
                  className="absolute mx-auto left-0 right-0 w-[2px]"
                  style={{
                    height: `${Math.abs(candle.high - Math.max(candle.open, candle.close))}px`,
                    bottom: `${Math.max(candle.open, candle.close) + 20}px`,
                    backgroundColor: candle.isGreen ? '#00FF00' : '#FF4081',
                    opacity: 0.8
                  }}
                ></div>

                {/* Lower Wick */}
                <div 
                  className="absolute mx-auto left-0 right-0 w-[2px]"
                  style={{
                    height: `${Math.abs(Math.min(candle.open, candle.close) - candle.low)}px`,
                    bottom: `${candle.low + 20}px`,
                    backgroundColor: candle.isGreen ? '#00FF00' : '#FF4081',
                    opacity: 0.8
                  }}
                ></div>

                {/* Candle body */}
                <div 
                  className={`transition-all ${index === activeCandle ? 'shadow-[0_0_10px_rgba(0,255,0,0.7)]' : ''}`}
                  style={{
                    width: `${candle.width}px`,
                    height: `${Math.abs(candle.open - candle.close)}px`,
                    bottom: `${Math.min(candle.open, candle.close) + 20}px`,
                    position: 'absolute',
                    backgroundColor: candle.isGreen ? '#00FF00' : '#FF4081',
                    opacity: candle.isGreen ? 0.8 : 0.7
                  }}
                ></div>
              </div>
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
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="var(--x)"
                  cy="var(--y)"
                  r="4"
                  fill="#00FF00"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
              </svg>
            )}

            {/* Red crash candle when crashed */}
            {hasCrashed && !hasUserCashedOut && (
              <div className="absolute z-10" 
                style={{
                  bottom: '20px',
                  left: '70%',
                  transform: 'translateX(-50%)'
                }}
              >
                {/* Candle body */}
                <div 
                  className="shadow-[0_0_15px_rgba(255,64,129,0.7)]"
                  style={{
                    width: '12px',
                    height: `${Math.min(multiplier * 20, 190)}px`,
                    backgroundColor: '#FF4081',
                    opacity: 0.8
                  }}
                ></div>

                {/* Crash line */}
                <div 
                  className="absolute w-40 h-0.5 bg-[#FF4081] transform rotate-45 origin-left"
                  style={{
                    top: '0',
                    left: '12px',
                    boxShadow: '0 0 10px rgba(255,64,129,0.7)'
                  }}
                ></div>
              </div>
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
                  strokeWidth="2"
                  fill="none"
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
                You won {(betAmount * (cashOutMultiplier || 0)).toFixed(2)} {selectedToken}!
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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Button 
                  variant="ghost"
                  className="h-6 px-1 py-0 text-xs text-gray-400 hover:text-white"
                  onClick={toggleToken}
                  disabled={isRunning}
                >
                  {selectedToken}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Potential Win</label>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-[#FFD700] flex items-center h-10">
              {potentialWin.toFixed(2)} {selectedToken}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFD700] bg-opacity-10 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FF4081] bg-opacity-10 rounded-full"></div>
      </div>

      {/* Real-time Game Chat */}
      <Card className="mt-6 bg-[#1a1a1a] p-0 overflow-hidden shadow-xl relative">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Live Chat</h3>
            <Button variant="ghost" size="sm">
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
          <div className="h-[200px] overflow-y-auto mb-4 space-y-2">
            {/* Real chat messages will be rendered here */}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Type a message..." className="flex-1" />
            <Button>Send</Button>
          </div>
        </div>

          {/* Players Tab */}
          <TabsContent value="players" className="m-0">
            <div className="p-4">
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center text-xs font-medium text-gray-400 mb-3 px-2">
                <div>Player</div>
                <div>Bet</div>
                <div>Cash Out</div>
                <div>Profit</div>
              </div>

              <ScrollArea className="h-[280px]">
                {Array.from([...Array(10)].map((_, i) => ({
                  id: `player${i}`,
                  username: ['CryptoBull', 'MoonHodler', 'DiamondHands', 'BTCWhale', 'DegensUnite'][i % 5],
                  profilePicture: [
                    '/attached_assets/Y2HmxLIx_400x400.jpg',
                    '/attached_assets/processed-nft-33-1-dark (1).png',
                    '/attached_assets/bearishshs.png',
                    '/attached_assets/head.png',
                    '/attached_assets/image_1743101567935.png'
                  ][i % 5],
                  betAmount: (0.05 + i * 0.1).toFixed(2),
                  hasCashedOut: i % 3 === 0,
                  cashOutMultiplier: i % 3 === 0 ? (1.5 + i * 0.5).toFixed(2) : null,
                }))).map((player, index) => (
                  <div 
                    key={player.id}
                    className={cn(
                      "flex items-center gap-3 px-2 py-3 hover:bg-[#222222] rounded-lg",
                      index % 2 === 0 ? "bg-[#1d1d1d]" : "bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Avatar className="w-8 h-8 border border-[#333]">
                        <AvatarImage src={player.profilePicture} />
                        <AvatarFallback>
                          {player.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium truncate">{player.username}</div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">{player.betAmount}</span> 
                      <span className="text-gray-400 text-xs"> ETH</span>
                    </div>

                    <div className="text-sm">
                      {player.hasCashedOut ? (
                        <span className="text-[#00FF00] font-semibold">{player.cashOutMultiplier}x</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>

                    <div className="text-sm ml-auto">
                      {player.hasCashedOut ? (
                        <Badge className="bg-[#00AA00] hover:bg-[#00AA00]">
                          +{(parseFloat(player.betAmount) * parseFloat(player.cashOutMultiplier!)).toFixed(2)} ETH
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 border-gray-500">Waiting</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="m-0 p-0">
            <div className="flex flex-col h-[332px]">
              <ScrollArea className="flex-grow p-4">
                {Array.from([...Array(10)].map((_, i) => ({
                  id: `msg${i}`,
                  userId: `player${i % 5}`,
                  username: ['CryptoBull', 'MoonHodler', 'DiamondHands', 'BTCWhale', 'DegensUnite'][i % 5],
                  profilePicture: [
                    '/attached_assets/Y2HmxLIx_400x400.jpg',
                    '/attached_assets/processed-nft-33-1-dark (1).png',
                    '/attached_assets/bearishshs.png',
                    '/attached_assets/head.png',
                    '/attached_assets/image_1743101567935.png'
                  ][i % 5],
                  message: [
                    "Going all in on this one! 🚀",
                    "This is definitely mooning soon",
                    "I'm cashing out at 2x",
                    "Weak hands lose money 💎🙌",
                    "Who's in for the next round?",
                    "That was close!",
                    "RIP to those who didn't cash out",
                    "Just got liquidated...",
                    "Let's go! Finally some gains",
                    "Anyone know the ATH multiplier?"
                  ][i % 10],
                  timestamp: new Date(Date.now() - (i * 60000))
                }))).map((message, index) => (
                  <div 
                    key={message.id}
                    className="mb-4 last:mb-0"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="w-8 h-8 border border-[#333] mt-0.5">
                        <AvatarImage src={message.profilePicture} />
                        <AvatarFallback>
                          {message.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{message.username}</span>
                          <span className="text-gray-400 text-xs">
                            {message.timestamp.getHours().toString().padStart(2, '0')}:
                            {message.timestamp.getMinutes().toString().padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="p-4 border-t border-[#333] mt-auto">
                <form 
                  className="flex items-center gap-2"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    // Add chat message functionality
                  }}
                >
                  <Input 
                    className="bg-[#222] border-[#444]" 
                    placeholder="Type a message..." 
                  />
                  <Button size="icon" type="submit">
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Profile Settings Tab */}
          <TabsContent value="settings" className="m-0">
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-[#444]">
                  <AvatarImage src={wallet.isConnected ? defaultAvatarImg : undefined} />
                  <AvatarFallback>
                    {wallet.isConnected ? wallet.address.substring(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold">
                    {wallet.isConnected ? 
                      (wallet.username || `Player ${wallet.address.substring(0, 6)}`) : 
                      "Guest Player"}
                  </h3>
                  {wallet.isConnected && (
                    <p className="text-gray-400 text-sm truncate">{wallet.address}</p>
                  )}
                </div>
              </div>

              <Separator className="bg-[#333]" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Display Name</label>
                  <Input 
                    className="bg-[#222] border-[#444]" 
                    placeholder="Enter a nickname" 
                    defaultValue={wallet.username || ""}
                    disabled={!wallet.isConnected}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Profile Picture</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      '/attached_assets/Y2HmxLIx_400x400.jpg',
                      '/attached_assets/processed-nft-33-1-dark (1).png',
                      '/attached_assets/bearishshs.png',
                      '/attached_assets/head.png',
                      '/attached_assets/image_1743101567935.png'
                    ].map((imgSrc, i) => (
                      <Avatar 
                        key={i} 
                        className={cn(
                          "w-12 h-12 border border-[#444] cursor-pointer transition-all",
                          i === 0 ? "border-2 border-[#FFD700]" : ""
                        )}
                      >
                        <AvatarImage src={imgSrc} />
                      </Avatar>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100]" disabled={!wallet.isConnected}>
                  Save Profile
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Win Modal */}
      <WinModal 
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        amount={cashOutMultiplier ? betAmount * cashOutMultiplier : 0}
        currency={selectedToken}
        onPlayAgain={handlePlayAgain}
        onDoubleDown={handleDoubleDown}
      />
    </>
  );
};

export default CrashGame;