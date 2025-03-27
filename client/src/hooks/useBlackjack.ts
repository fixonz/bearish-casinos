import { useState, useCallback, useEffect } from 'react';

// Card suit and value types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  value: CardValue;
  hidden?: boolean;
}

export interface BlackjackState {
  playerHand: Card[];
  dealerHand: Card[];
  deck: Card[];
  gameStatus: 'idle' | 'playing' | 'playerBusted' | 'dealerBusted' | 'playerWin' | 'dealerWin' | 'push';
  playerScore: number;
  dealerScore: number;
  betAmount: number;
  winAmount: number;
  isDealing: boolean;
}

// Calculate the value of a blackjack hand
export const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (card.hidden) continue;

    if (card.value === 'A') {
      aceCount++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  // Adjust for aces if needed
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
};

// Create a standard deck of cards
const createDeck = (): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return shuffle(deck);
};

// Shuffle an array using Fisher-Yates algorithm
const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
};

// Hook for blackjack game
export const useBlackjack = (initialBet: number = 10) => {
  const [state, setState] = useState<BlackjackState>({
    playerHand: [],
    dealerHand: [],
    deck: createDeck(),
    gameStatus: 'idle',
    playerScore: 0,
    dealerScore: 0,
    betAmount: initialBet,
    winAmount: 0,
    isDealing: false
  });

  // Draw a card from the deck
  const drawCard = useCallback((hidden: boolean = false): Card => {
    setState(prev => {
      const newDeck = [...prev.deck];
      const card = newDeck.pop()!;
      card.hidden = hidden;
      
      // If deck is running low, shuffle in a new deck
      const finalDeck = newDeck.length < 10 ? [...newDeck, ...createDeck()] : newDeck;
      
      return {
        ...prev,
        deck: finalDeck
      };
    });
    
    // For immediate use
    const card = state.deck[state.deck.length - 1];
    return { ...card, hidden };
  }, [state.deck]);

  // Deal initial cards
  const dealCards = useCallback(() => {
    setState(prev => {
      const newDeck = [...prev.deck];
      
      // Player gets 2 face-up cards
      const playerCard1 = newDeck.pop()!;
      const playerCard2 = newDeck.pop()!;
      
      // Dealer gets 1 face-up and 1 face-down card
      const dealerCard1 = newDeck.pop()!;
      const dealerCard2 = { ...newDeck.pop()!, hidden: true };
      
      const playerHand = [playerCard1, playerCard2];
      const dealerHand = [dealerCard1, dealerCard2];
      
      const playerScore = calculateHandValue(playerHand);
      const dealerScore = calculateHandValue(dealerHand);
      
      return {
        ...prev,
        playerHand,
        dealerHand,
        deck: newDeck,
        gameStatus: 'playing',
        playerScore,
        dealerScore,
        isDealing: false
      };
    });
  }, []);

  // Start new game
  const startGame = useCallback((betAmount: number) => {
    setState({
      playerHand: [],
      dealerHand: [],
      deck: createDeck(),
      gameStatus: 'idle',
      playerScore: 0,
      dealerScore: 0,
      betAmount,
      winAmount: 0,
      isDealing: true
    });
    
    setTimeout(dealCards, 500);
  }, [dealCards]);

  // Player hits (takes another card)
  const hit = useCallback(() => {
    if (state.gameStatus !== 'playing' || state.isDealing) return;

    setState(prev => {
      const newPlayerHand = [...prev.playerHand, drawCard()];
      const newPlayerScore = calculateHandValue(newPlayerHand);
      
      let newGameStatus = prev.gameStatus;
      
      if (newPlayerScore > 21) {
        newGameStatus = 'playerBusted';
      }
      
      return {
        ...prev,
        playerHand: newPlayerHand,
        playerScore: newPlayerScore,
        gameStatus: newGameStatus
      };
    });
  }, [state.gameStatus, state.isDealing, drawCard]);

  // Player stands (dealer's turn)
  const stand = useCallback(() => {
    if (state.gameStatus !== 'playing' || state.isDealing) return;

    setState(prev => {
      // Reveal dealer's hidden card
      const newDealerHand = prev.dealerHand.map(card => ({ ...card, hidden: false }));
      let newDealerScore = calculateHandValue(newDealerHand);
      
      return {
        ...prev,
        dealerHand: newDealerHand,
        dealerScore: newDealerScore,
        isDealing: true
      };
    });
    
    // Simulate dealer play with delay
    setTimeout(() => {
      const dealerPlay = () => {
        setState(prev => {
          let newDealerHand = [...prev.dealerHand];
          let newDealerScore = calculateHandValue(newDealerHand);
          
          // Dealer hits until 17 or higher
          if (newDealerScore < 17) {
            const newCard = drawCard();
            newDealerHand = [...newDealerHand, newCard];
            newDealerScore = calculateHandValue(newDealerHand);
            
            setTimeout(dealerPlay, 700);
            
            return {
              ...prev,
              dealerHand: newDealerHand,
              dealerScore: newDealerScore
            };
          } else {
            // Determine game outcome
            let newGameStatus = prev.gameStatus;
            let winAmount = 0;
            
            if (newDealerScore > 21) {
              newGameStatus = 'dealerBusted';
              winAmount = prev.betAmount * 2;
            } else if (newDealerScore > prev.playerScore) {
              newGameStatus = 'dealerWin';
            } else if (newDealerScore < prev.playerScore) {
              newGameStatus = 'playerWin';
              winAmount = prev.betAmount * 2;
            } else {
              newGameStatus = 'push';
              winAmount = prev.betAmount;
            }
            
            return {
              ...prev,
              dealerHand: newDealerHand,
              dealerScore: newDealerScore,
              gameStatus: newGameStatus,
              winAmount,
              isDealing: false
            };
          }
        });
      };
      
      dealerPlay();
    }, 1000);
  }, [state.gameStatus, state.isDealing, drawCard]);

  // Double down
  const doubleDown = useCallback(() => {
    if (state.gameStatus !== 'playing' || state.playerHand.length !== 2 || state.isDealing) return;

    setState(prev => {
      const newBetAmount = prev.betAmount * 2;
      const newPlayerHand = [...prev.playerHand, drawCard()];
      const newPlayerScore = calculateHandValue(newPlayerHand);
      
      let newGameStatus = prev.gameStatus;
      
      if (newPlayerScore > 21) {
        newGameStatus = 'playerBusted';
      }
      
      return {
        ...prev,
        playerHand: newPlayerHand,
        playerScore: newPlayerScore,
        betAmount: newBetAmount,
        gameStatus: newGameStatus,
        isDealing: newGameStatus === 'playing'
      };
    });
    
    if (state.playerScore <= 21) {
      setTimeout(stand, 1000);
    }
  }, [state.gameStatus, state.playerHand.length, state.isDealing, state.playerScore, drawCard, stand]);

  // Update scores whenever hands change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      playerScore: calculateHandValue(prev.playerHand),
      dealerScore: calculateHandValue(prev.dealerHand)
    }));
  }, [state.playerHand, state.dealerHand]);

  // Check for natural blackjacks after initial deal
  useEffect(() => {
    if (state.gameStatus === 'playing' && 
        state.playerHand.length === 2 && 
        state.dealerHand.length === 2 &&
        !state.isDealing) {
      
      const playerScore = calculateHandValue(state.playerHand);
      
      // Check for player blackjack
      if (playerScore === 21) {
        // Reveal dealer's hidden card
        const revealedDealerHand = state.dealerHand.map(card => ({ ...card, hidden: false }));
        const dealerScore = calculateHandValue(revealedDealerHand);
        
        if (dealerScore === 21) {
          // Both have blackjack - push
          setState(prev => ({
            ...prev,
            dealerHand: revealedDealerHand,
            gameStatus: 'push',
            winAmount: prev.betAmount
          }));
        } else {
          // Player has blackjack, dealer doesn't - player wins 3:2
          setState(prev => ({
            ...prev,
            dealerHand: revealedDealerHand,
            gameStatus: 'playerWin',
            winAmount: prev.betAmount * 2.5
          }));
        }
      }
    }
  }, [state.gameStatus, state.playerHand, state.dealerHand, state.isDealing]);

  return {
    ...state,
    startGame,
    hit,
    stand,
    doubleDown
  };
};

export default useBlackjack;