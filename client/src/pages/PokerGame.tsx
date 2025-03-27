import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useWalletContext } from '@/context/WalletContext';
import { useGamesContext } from '@/context/GamesContext';
import usePoker, { Card as PokerCard } from '@/hooks/usePoker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PokerGame = () => {
  const { wallet, placeBet, addWinnings } = useWalletContext();
  const { addGameResult } = useGamesContext();
  const [anteAmount, setAnteAmount] = useState(5);
  const poker = usePoker(anteAmount);
  
  // Display cards
  const renderCard = (card: PokerCard) => {
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
  
  // Format hand rank for display
  const formatHandRank = (rank: string | null) => {
    if (!rank) return '';
    
    return rank
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle game actions
  const handleStartGame = () => {
    if (anteAmount <= 0) {
      toast({
        title: "Invalid ante amount",
        description: "Please enter a valid ante amount greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    const betSuccess = placeBet(anteAmount);
    if (!betSuccess) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to place this ante.",
        variant: "destructive"
      });
      return;
    }
    
    poker.startGame(anteAmount);
  };
  
  // Handle bet
  const handleBet = () => {
    // Check if player has enough balance
    if (wallet.balance < poker.betAmount) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive"
      });
      return;
    }
    
    const betSuccess = placeBet(poker.betAmount);
    if (!betSuccess) {
      toast({
        title: "Failed to place bet",
        description: "There was an error placing your bet.",
        variant: "destructive"
      });
      return;
    }
    
    poker.placeBet(poker.betAmount);
  };
  
  // Handle check
  const handleCheck = () => {
    poker.check();
  };
  
  // Handle fold
  const handleFold = () => {
    poker.fold();
    
    toast({
      title: "Folded",
      description: "You folded your hand and lost your ante.",
      variant: "default"
    });
    
    // Record game result
    addGameResult({
      gameId: 'poker',
      userId: wallet.userId,
      betAmount: poker.anteAmount,
      winAmount: 0,
      multiplier: 0,
      outcome: 'loss'
    });
  };
  
  // Handle ante input change
  const handleAnteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAnteAmount(isNaN(value) ? 0 : value);
  };
  
  // Collect winnings when game is over
  useEffect(() => {
    if ((poker.gameStatus === 'playerWin' || poker.gameStatus === 'push') && 
        poker.phase === 'showdown' && poker.winAmount > 0 && !poker.isDealing) {
      addWinnings(poker.winAmount);
      
      // Record game result
      const isWin = poker.gameStatus === 'playerWin';
      addGameResult({
        gameId: 'poker',
        userId: wallet.userId,
        betAmount: poker.anteAmount + poker.playerBet,
        winAmount: poker.winAmount,
        multiplier: poker.winAmount / (poker.anteAmount + poker.playerBet),
        outcome: isWin ? 'win' : 'push'
      });
      
      // Show toast
      if (isWin) {
        toast({
          title: "You won!",
          description: `You won ${poker.winAmount.toFixed(2)} tokens with ${formatHandRank(poker.playerHandRank)}!`,
          variant: "default"
        });
      } else if (poker.gameStatus === 'push') {
        toast({
          title: "Push!",
          description: "It's a tie! Your bets have been returned.",
          variant: "default"
        });
      }
    } else if (poker.gameStatus === 'dealerWin' && poker.phase === 'showdown' && !poker.isDealing && !poker.hasFolded) {
      // Record loss
      addGameResult({
        gameId: 'poker',
        userId: wallet.userId,
        betAmount: poker.anteAmount + poker.playerBet,
        winAmount: 0,
        multiplier: 0,
        outcome: 'loss'
      });
      
      toast({
        title: "Dealer wins",
        description: `You lost with ${formatHandRank(poker.playerHandRank)} against dealer's ${formatHandRank(poker.dealerHandRank)}.`,
        variant: "destructive"
      });
    }
  }, [poker.gameStatus, poker.phase, poker.winAmount, poker.isDealing, poker.hasFolded, poker.anteAmount, poker.playerBet, poker.playerHandRank, poker.dealerHandRank, addWinnings, addGameResult, wallet.userId]);
  
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
          <CardTitle className="text-2xl text-center">Texas Hold'em Poker</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            {/* Dealer's Hand */}
            <div className="bg-green-900/50 p-6 rounded-lg">
              <h3 className="text-xl mb-2">Dealer's Hand {poker.dealerHandRank && <span className="text-amber-400">({formatHandRank(poker.dealerHandRank)})</span>}</h3>
              <div className="flex gap-2 flex-wrap">
                {poker.dealerHand.map((card, index) => (
                  <div key={`dealer-card-${index}`} className="transition-all duration-300">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Community Cards */}
            <div className="bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-xl mb-2">Community Cards</h3>
              <div className="flex gap-2 flex-wrap justify-center">
                {poker.communityCards.length > 0 ? poker.communityCards.map((card, index) => (
                  <div key={`community-card-${index}`} className="transition-all duration-300">
                    {renderCard(card)}
                  </div>
                )) : (
                  <div className="text-gray-500 italic">Waiting for the flop...</div>
                )}
              </div>
            </div>
            
            {/* Game Status */}
            <div className="text-center">
              <div className="text-xl">
                Pot: <span className="text-amber-400">{poker.potAmount.toFixed(2)}</span> tokens
              </div>
              
              {poker.phase === 'showdown' && (
                <div className="mt-2">
                  {poker.gameStatus === 'playerWin' && (
                    <div className="text-green-500 text-2xl font-bold">You Win!</div>
                  )}
                  {poker.gameStatus === 'dealerWin' && (
                    <div className="text-red-500 text-2xl font-bold">Dealer Wins</div>
                  )}
                  {poker.gameStatus === 'push' && (
                    <div className="text-yellow-500 text-2xl font-bold">Push! It's a Tie</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Player's Hand */}
            <div className="bg-green-900/50 p-6 rounded-lg">
              <h3 className="text-xl mb-2">Your Hand {poker.playerHandRank && <span className="text-amber-400">({formatHandRank(poker.playerHandRank)})</span>}</h3>
              <div className="flex gap-2 flex-wrap">
                {poker.playerHand.map((card, index) => (
                  <div key={`player-card-${index}`} className="transition-all duration-300">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          {/* Game Phase Indicator */}
          <div className="w-full text-center">
            <div className="text-sm text-gray-400">
              {poker.phase === 'idle' ? 'Ready to Play' :
               poker.phase === 'pre-flop' ? 'Pre-Flop' :
               poker.phase === 'flop' ? 'Flop' :
               poker.phase === 'turn' ? 'Turn' :
               poker.phase === 'river' ? 'River' :
               poker.phase === 'showdown' ? 'Showdown' : ''}
            </div>
          </div>
          
          {/* Game Controls */}
          {poker.phase === 'idle' ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={anteAmount}
                  onChange={handleAnteChange}
                  min={1}
                  max={wallet.balance}
                  className="w-32"
                />
                <Button onClick={handleStartGame} variant="default" className="bg-green-600 hover:bg-green-700">
                  Start Game (Ante)
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Balance: {wallet.balance.toFixed(2)} tokens</p>
              </div>
            </div>
          ) : poker.phase !== 'showdown' && !poker.hasFolded ? (
            <div className="w-full flex flex-wrap gap-2">
              <Button onClick={handleBet} disabled={poker.isDealing || wallet.balance < poker.betAmount} variant="default" className="bg-blue-600 hover:bg-blue-700">
                Bet {poker.betAmount.toFixed(2)}
              </Button>
              <Button onClick={handleCheck} disabled={poker.isDealing} variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                Check
              </Button>
              <Button onClick={handleFold} disabled={poker.isDealing} variant="default" className="bg-red-600 hover:bg-red-700">
                Fold
              </Button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleStartGame} variant="default" className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Ante: {poker.anteAmount.toFixed(2)} | Bet: {poker.playerBet.toFixed(2)} | Win: {poker.winAmount.toFixed(2)}
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
          <CardTitle className="text-xl">Poker Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>This is a simplified version of Texas Hold'em Poker played against the dealer.</li>
            <li>You start by placing an ante, and both you and the dealer receive 2 cards.</li>
            <li>After seeing your cards, you can either bet (2x your ante), check, or fold.</li>
            <li>The game progresses through the flop (3 community cards), turn (4th card), and river (5th card).</li>
            <li>The best 5-card poker hand wins. Hand rankings from highest to lowest:</li>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Royal Flush: A, K, Q, J, 10 of the same suit</li>
              <li>Straight Flush: Five sequential cards of the same suit</li>
              <li>Four of a Kind: Four cards of the same value</li>
              <li>Full House: Three of a kind plus a pair</li>
              <li>Flush: Five cards of the same suit</li>
              <li>Straight: Five sequential cards</li>
              <li>Three of a Kind: Three cards of the same value</li>
              <li>Two Pair: Two different pairs</li>
              <li>Pair: Two cards of the same value</li>
              <li>High Card: Highest card in your hand</li>
            </ol>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PokerGame;