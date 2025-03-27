import { useState, useCallback } from 'react';

// Card suit and value types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  value: CardValue;
  hidden?: boolean;
}

export type PokerHand = 
  | 'high-card' 
  | 'pair' 
  | 'two-pair' 
  | 'three-of-a-kind' 
  | 'straight' 
  | 'flush' 
  | 'full-house' 
  | 'four-of-a-kind' 
  | 'straight-flush' 
  | 'royal-flush';

export interface PokerState {
  playerHand: Card[];
  communityCards: Card[];
  dealerHand: Card[];
  deck: Card[];
  phase: 'idle' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  gameStatus: 'waiting' | 'playing' | 'playerWin' | 'dealerWin' | 'push';
  potAmount: number;
  anteAmount: number;
  betAmount: number;
  playerBet: number;
  dealerBet: number;
  winAmount: number;
  isDealing: boolean;
  playerHandRank: PokerHand | null;
  dealerHandRank: PokerHand | null;
  hasFolded: boolean;
}

// Card values for calculating hand ranks
const cardValues: Record<CardValue, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
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

// Evaluate a poker hand (5 cards)
const evaluateHand = (hand: Card[]): PokerHand => {
  if (hand.length !== 5) {
    throw new Error('Poker hand must have exactly 5 cards');
  }

  // Sort by card value for easier evaluation
  const sortedHand = [...hand].sort((a, b) => cardValues[a.value] - cardValues[b.value]);
  
  // Check for flush (all same suit)
  const isFlush = sortedHand.every(card => card.suit === sortedHand[0].suit);

  // Check for straight (consecutive values)
  let isStraight = true;
  for (let i = 1; i < sortedHand.length; i++) {
    if (cardValues[sortedHand[i].value] !== cardValues[sortedHand[i-1].value] + 1) {
      isStraight = false;
      break;
    }
  }

  // Special case for A-2-3-4-5 straight
  if (!isStraight && sortedHand[4].value === 'A' && sortedHand[0].value === '2' && sortedHand[1].value === '3' &&
      sortedHand[2].value === '4' && sortedHand[3].value === '5') {
    isStraight = true;
  }

  // Check for royal flush
  if (isFlush && isStraight && sortedHand[0].value === '10') {
    return 'royal-flush';
  }

  // Check for straight flush
  if (isFlush && isStraight) {
    return 'straight-flush';
  }

  // Count occurrences of each value
  const valueCounts: Record<string, number> = {};
  for (const card of sortedHand) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }

  const counts = Object.values(valueCounts);

  // Check for four of a kind
  if (counts.includes(4)) {
    return 'four-of-a-kind';
  }

  // Check for full house (three of a kind + pair)
  if (counts.includes(3) && counts.includes(2)) {
    return 'full-house';
  }

  // Check for flush
  if (isFlush) {
    return 'flush';
  }

  // Check for straight
  if (isStraight) {
    return 'straight';
  }

  // Check for three of a kind
  if (counts.includes(3)) {
    return 'three-of-a-kind';
  }

  // Check for two pair
  if (counts.filter(count => count === 2).length === 2) {
    return 'two-pair';
  }

  // Check for pair
  if (counts.includes(2)) {
    return 'pair';
  }

  // High card
  return 'high-card';
};

// Find the best 5-card poker hand from 7 cards
const findBestHand = (cards: Card[]): { hand: Card[], rank: PokerHand } => {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to find best hand');
  }

  // Get all possible 5-card combinations
  const combinations: Card[][] = [];
  const combination = new Array(5).fill(0);

  const generateCombinations = (start: number, index: number) => {
    if (index === 5) {
      combinations.push(combination.map(i => cards[i]));
      return;
    }

    for (let i = start; i <= cards.length - 5 + index; i++) {
      combination[index] = i;
      generateCombinations(i + 1, index + 1);
    }
  };

  generateCombinations(0, 0);

  // Evaluate each combination and find the best
  let bestRankIndex = -1;
  let bestRank: PokerHand = 'high-card';
  const handRanks: PokerHand[] = [
    'high-card', 'pair', 'two-pair', 'three-of-a-kind', 'straight', 
    'flush', 'full-house', 'four-of-a-kind', 'straight-flush', 'royal-flush'
  ];

  combinations.forEach((hand, index) => {
    const rank = evaluateHand(hand);
    const rankIndex = handRanks.indexOf(rank);
    
    if (rankIndex > bestRankIndex) {
      bestRankIndex = rankIndex;
      bestRank = rank;
    }
  });

  // Return best 5-card hand and its rank
  return {
    hand: combinations[0], // For simplicity, just returning the first combo (would need to improve)
    rank: bestRank
  };
};

// Compare poker hands to determine winner
const compareHands = (playerRank: PokerHand, dealerRank: PokerHand): 'player' | 'dealer' | 'push' => {
  const handRanks: PokerHand[] = [
    'high-card', 'pair', 'two-pair', 'three-of-a-kind', 'straight', 
    'flush', 'full-house', 'four-of-a-kind', 'straight-flush', 'royal-flush'
  ];

  const playerRankIndex = handRanks.indexOf(playerRank);
  const dealerRankIndex = handRanks.indexOf(dealerRank);

  if (playerRankIndex > dealerRankIndex) {
    return 'player';
  } else if (dealerRankIndex > playerRankIndex) {
    return 'dealer';
  } else {
    // In case of tie, would need to compare high cards, but simplified for now
    return 'push';
  }
};

// Hook for Texas Hold'em Poker game
export const usePoker = (initialAnte: number = 5) => {
  const [state, setState] = useState<PokerState>({
    playerHand: [],
    communityCards: [],
    dealerHand: [],
    deck: createDeck(),
    phase: 'idle',
    gameStatus: 'waiting',
    potAmount: 0,
    anteAmount: initialAnte,
    betAmount: initialAnte * 2, // Typically bet is 2x ante
    playerBet: 0,
    dealerBet: 0,
    winAmount: 0,
    isDealing: false,
    playerHandRank: null,
    dealerHandRank: null,
    hasFolded: false
  });

  // Start a new game
  const startGame = useCallback((anteAmount: number) => {
    const newDeck = createDeck();
    
    // Deal 2 cards to player and dealer (hidden)
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const dealerHand = [
      { ...newDeck.pop()!, hidden: true }, 
      { ...newDeck.pop()!, hidden: true }
    ];
    
    setState({
      playerHand,
      dealerHand,
      communityCards: [],
      deck: newDeck,
      phase: 'pre-flop',
      gameStatus: 'playing',
      potAmount: anteAmount * 2, // Both player and dealer pay ante
      anteAmount,
      betAmount: anteAmount * 2,
      playerBet: anteAmount,
      dealerBet: anteAmount,
      winAmount: 0,
      isDealing: false,
      playerHandRank: null,
      dealerHandRank: null,
      hasFolded: false
    });
  }, []);

  // Player places a bet (call or raise)
  const placeBet = useCallback((amount: number) => {
    if (state.phase === 'showdown' || state.isDealing || state.hasFolded) return;

    setState(prev => {
      const newPlayerBet = prev.playerBet + amount;
      const newPotAmount = prev.potAmount + amount;
      
      // Determine new phase
      let newPhase = prev.phase;
      
      if (prev.phase === 'pre-flop' && prev.communityCards.length === 0) {
        newPhase = 'flop';
      } else if (prev.phase === 'flop' && prev.communityCards.length === 3) {
        newPhase = 'turn';
      } else if (prev.phase === 'turn' && prev.communityCards.length === 4) {
        newPhase = 'river';
      } else if (prev.phase === 'river' && prev.communityCards.length === 5) {
        newPhase = 'showdown';
      }
      
      return {
        ...prev,
        playerBet: newPlayerBet,
        potAmount: newPotAmount,
        phase: newPhase,
        isDealing: true
      };
    });
    
    // Deal community cards based on new phase
    setTimeout(() => {
      setState(prev => {
        const newDeck = [...prev.deck];
        let newCommunityCards = [...prev.communityCards];
        let newDealerHand = prev.dealerHand;
        let newPhase = prev.phase;
        let newGameStatus = prev.gameStatus;
        let newDealerBet = prev.dealerBet;
        let newPotAmount = prev.potAmount;
        let winAmount = 0;
        
        // Deal community cards based on phase
        if (newPhase === 'flop' && newCommunityCards.length === 0) {
          // Deal 3 cards for the flop
          newCommunityCards = [newDeck.pop()!, newDeck.pop()!, newDeck.pop()!];
        } else if (newPhase === 'turn' && newCommunityCards.length === 3) {
          // Deal 1 card for the turn
          newCommunityCards = [...newCommunityCards, newDeck.pop()!];
        } else if (newPhase === 'river' && newCommunityCards.length === 4) {
          // Deal 1 card for the river
          newCommunityCards = [...newCommunityCards, newDeck.pop()!];
        } else if (newPhase === 'showdown') {
          // Reveal dealer's cards
          newDealerHand = newDealerHand.map(card => ({ ...card, hidden: false }));
          
          // Dealer matches the bet (simplified)
          const dealerCall = prev.playerBet - prev.dealerBet;
          newDealerBet += dealerCall;
          newPotAmount += dealerCall;
          
          // Determine winner
          const playerAllCards = [...prev.playerHand, ...newCommunityCards];
          const dealerAllCards = [...newDealerHand.map(card => ({ ...card, hidden: false })), ...newCommunityCards];
          
          const playerBestHand = findBestHand(playerAllCards);
          const dealerBestHand = findBestHand(dealerAllCards);
          
          const winner = compareHands(playerBestHand.rank, dealerBestHand.rank);
          
          if (winner === 'player') {
            newGameStatus = 'playerWin';
            winAmount = newPotAmount;
          } else if (winner === 'dealer') {
            newGameStatus = 'dealerWin';
          } else {
            newGameStatus = 'push';
            winAmount = prev.playerBet; // Return player's bet on push
          }
          
          return {
            ...prev,
            communityCards: newCommunityCards,
            dealerHand: newDealerHand,
            deck: newDeck,
            phase: newPhase,
            gameStatus: newGameStatus,
            dealerBet: newDealerBet,
            potAmount: newPotAmount,
            winAmount,
            isDealing: false,
            playerHandRank: playerBestHand.rank,
            dealerHandRank: dealerBestHand.rank
          };
        }
        
        return {
          ...prev,
          communityCards: newCommunityCards,
          deck: newDeck,
          isDealing: false
        };
      });
    }, 1000);
  }, [state.phase, state.isDealing, state.hasFolded]);

  // Player folds
  const fold = useCallback(() => {
    if (state.phase === 'showdown' || state.isDealing || state.hasFolded) return;
    
    setState(prev => ({
      ...prev,
      gameStatus: 'dealerWin',
      hasFolded: true,
      isDealing: false
    }));
  }, [state.phase, state.isDealing, state.hasFolded]);

  // Player checks (no bet)
  const check = useCallback(() => {
    if (state.phase === 'showdown' || state.isDealing || state.hasFolded) return;
    
    // In poker, check is equivalent to calling with amount 0
    placeBet(0);
  }, [state.phase, state.isDealing, state.hasFolded, placeBet]);

  return {
    ...state,
    startGame,
    placeBet,
    fold,
    check
  };
};

export default usePoker;