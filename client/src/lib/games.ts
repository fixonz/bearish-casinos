import { Game } from '../types';

// Import the images using the @assets alias
import headImg from '@assets/head.png';
import tailsImg from '@assets/taills.png';
import bearImg from '@assets/Y2HmxLIx_400x400.jpg';
import darkBearImg from '@assets/processed-nft-33-1-dark (1).png';

export const GAMES: Game[] = [
  {
    id: 'coinflip',
    name: 'Coin Flip',
    description: 'Flip a coin and double your bet with a 50% chance.',
    imageSrc: headImg,
    rtp: 98,
    category: 'Coin Flip',
    isPopular: true,
    isNew: false,
    isTrending: true,
    isHot: false,
    path: '/games/coinflip',
    maxWin: 2
  },
  {
    id: 'dice',
    name: 'Dice Roll',
    description: 'Roll the dice and win up to 6x your bet. Choose your odds.',
    imageSrc: tailsImg,
    rtp: 97,
    category: 'Dice',
    isPopular: false,
    isNew: true,
    isTrending: true,
    isHot: false,
    path: '/games/dice',
    maxWin: 6
  },
  {
    id: 'slots',
    name: 'Bear Slots',
    description: 'Spin the slots to match symbols and win up to 100x your bet.',
    imageSrc: bearImg,
    rtp: 96,
    category: 'Slots',
    isPopular: false,
    isNew: false,
    isTrending: false,
    isHot: true,
    path: '/games/slots',
    maxWin: 100
  },
  {
    id: 'crash',
    name: 'Crypto Crash',
    description: 'Watch the multiplier grow and cash out before it crashes!',
    imageSrc: darkBearImg,
    rtp: 99,
    category: 'Crash',
    isPopular: false,
    isNew: false,
    isTrending: true,
    isHot: false,
    path: '/games/crash',
    maxWin: 1000
  }
];

// Return games by category
export const getGamesByCategory = (category: string): Game[] => {
  return GAMES.filter(game => game.category === category);
};

// Return trending games
export const getTrendingGames = (): Game[] => {
  return GAMES.filter(game => game.isTrending);
};

// Return popular games
export const getPopularGames = (): Game[] => {
  return GAMES.filter(game => game.isPopular);
};

// Return game by ID
export const getGameById = (id: string): Game | undefined => {
  return GAMES.find(game => game.id === id);
};
