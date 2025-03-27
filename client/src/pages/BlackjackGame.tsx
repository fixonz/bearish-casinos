import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useWalletContext } from '@/context/WalletContext';
import { useGamesContext } from '@/context/GamesContext';
import useBlackjack, { Card as BlackjackCard } from '@/hooks/useBlackjack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BlackjackGame = () => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { addGameResult } = useGamesContext();
  const [betAmount, setBetAmount] = useState(10);
  const blackjack = useBlackjack(betAmount);
  
  // Display cards
  const renderCard = (card: BlackjackCard) => {
    if (card.hidden) {
      return (
        <div className="w-14 h-20 bg-gray-800 rounded-md border-2 border-gray-700 flex items-center justify-center text-xl">
          <span className="text-gray-600">?</span>
        </div>
      );
    }
    
    const suit = card.suit;
    const value = card.value;
    
    const suitSymbol = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    }[suit];
    
    const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-200';
    
    return (
      <div className="w-14 h-20 bg-white rounded-md border-2 border-gray-300 flex flex-col items-center justify-between p-1">
        <span className="text-sm font-bold">{value}</span>
        <span className={`text-2xl ${suitColor}`}>{suitSymbol}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
    );
  };
  
  // Handle game actions
  const handleStartGame = () => {
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
    
    blackjack.startGame(betAmount);
  };
  
  // Handle bet input change
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value);
  };
  
  // Collect winnings when game is over
  useEffect(() => {
    if (blackjack.gameStatus !== 'playing' && blackjack.gameStatus !== 'idle' && blackjack.winAmount > 0) {
      addWinnings(blackjack.winAmount);
      
      // Record game result
      const isWin = blackjack.gameStatus === 'playerWin' || blackjack.gameStatus === 'dealerBusted';
      addGameResult({
        gameId: 'blackjack',
        userId: wallet.userId,
        betAmount: blackjack.betAmount,
        winAmount: blackjack.winAmount,
        multiplier: blackjack.winAmount / blackjack.betAmount,
        outcome: isWin ? 'win' : blackjack.gameStatus === 'push' ? 'push' : 'loss'
      });
      
      // Show toast
      if (isWin) {
        toast({
          title: "You won!",
          description: `You won ${blackjack.winAmount.toFixed(2)} tokens!`,
          variant: "default"
        });
      } else if (blackjack.gameStatus === 'push') {
        toast({
          title: "Push!",
          description: "It's a tie! Your bet has been returned.",
          variant: "default"
        });
      }
    }
  }, [blackjack.gameStatus, blackjack.winAmount, blackjack.betAmount, addWinnings, addGameResult, wallet.userId]);
  
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
          <CardTitle className="text-2xl text-center">Blackjack</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            {/* Dealer's Hand */}
            <div className="bg-green-900/50 p-6 rounded-lg">
              <h3 className="text-xl mb-2">Dealer: {blackjack.dealerScore}</h3>
              <div className="flex gap-2 flex-wrap">
                {blackjack.dealerHand.map((card, index) => (
                  <div key={`dealer-card-${index}`} className="transition-all duration-300">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Game Status */}
            <div className="text-center">
              {blackjack.gameStatus === 'playerWin' && (
                <div className="text-green-500 text-2xl font-bold">You Win!</div>
              )}
              {blackjack.gameStatus === 'dealerWin' && (
                <div className="text-red-500 text-2xl font-bold">Dealer Wins</div>
              )}
              {blackjack.gameStatus === 'playerBusted' && (
                <div className="text-red-500 text-2xl font-bold">Busted! You Lose</div>
              )}
              {blackjack.gameStatus === 'dealerBusted' && (
                <div className="text-green-500 text-2xl font-bold">Dealer Busted! You Win</div>
              )}
              {blackjack.gameStatus === 'push' && (
                <div className="text-yellow-500 text-2xl font-bold">Push! It's a Tie</div>
              )}
            </div>
            
            {/* Player's Hand */}
            <div className="bg-green-900/50 p-6 rounded-lg">
              <h3 className="text-xl mb-2">Your Hand: {blackjack.playerScore}</h3>
              <div className="flex gap-2 flex-wrap">
                {blackjack.playerHand.map((card, index) => (
                  <div key={`player-card-${index}`} className="transition-all duration-300">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          {/* Game Controls */}
          {blackjack.gameStatus === 'idle' ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={handleBetChange}
                  min={1}
                  max={wallet.balance}
                  className="w-32"
                />
                <Button onClick={handleStartGame} variant="default" className="bg-green-600 hover:bg-green-700">
                  Deal Cards
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Balance: {wallet.balance.toFixed(2)} tokens</p>
              </div>
            </div>
          ) : blackjack.gameStatus === 'playing' ? (
            <div className="w-full flex flex-wrap gap-2">
              <Button onClick={blackjack.hit} disabled={blackjack.isDealing} variant="default" className="bg-blue-600 hover:bg-blue-700">
                Hit
              </Button>
              <Button onClick={blackjack.stand} disabled={blackjack.isDealing} variant="default" className="bg-red-600 hover:bg-red-700">
                Stand
              </Button>
              {blackjack.playerHand.length === 2 && (
                <Button onClick={blackjack.doubleDown} disabled={blackjack.isDealing || wallet.balance < blackjack.betAmount} variant="default" className="bg-purple-600 hover:bg-purple-700">
                  Double Down (×2 Bet)
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => handleStartGame()} variant="default" className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Bet: {blackjack.betAmount.toFixed(2)} | Win: {blackjack.winAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Your Balance: {wallet.balance.toFixed(2)} tokens</p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Game Rules */}
      <Card className="w-full max-w-4xl mx-auto mt-6 bg-black/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Blackjack Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>The goal is to have a hand value closer to 21 than the dealer without going over.</li>
            <li>Number cards (2-10) are worth their face value, face cards (J, Q, K) are worth 10, and Aces are worth 1 or 11.</li>
            <li>If your first two cards total 21 (an Ace and a 10-value card), you have a Blackjack and win 1.5x your bet.</li>
            <li>The dealer must hit until their hand is worth 17 or more.</li>
            <li>If you go over 21, you "bust" and lose your bet.</li>
            <li>If the dealer busts, you win.</li>
            <li>Double Down: Double your bet and receive exactly one more card.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlackjackGame;