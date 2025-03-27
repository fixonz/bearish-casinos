import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartIcon } from '@/lib/icons';
import { useGamesContext } from '@/context/GamesContext';
import { Game } from '@/types';

// Game categories with emojis
const CATEGORIES = [
  { id: 'trending', name: 'Trending', emoji: '🔥' },
  { id: 'dice', name: 'Dice', emoji: '🎲' },
  { id: 'slots', name: 'Slots', emoji: '🎰' },
  { id: 'coinflip', name: 'Coin Flip', emoji: '🪙' },
  { id: 'cards', name: 'Cards', emoji: '🃏' },
  { id: 'crash', name: 'Crash', emoji: '🎯' }
];

const GamesSection: React.FC = () => {
  const { games, getGameById, getCategoryGames, getTrendingGames } = useGamesContext();
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [displayedGames, setDisplayedGames] = useState<Game[]>(getTrendingGames());

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'trending') {
      setDisplayedGames(getTrendingGames());
    } else {
      setDisplayedGames(getCategoryGames(categoryId));
    }
  };

  return (
    <section id="games" className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-poppins font-bold text-3xl">Popular Games</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="p-2 bg-[#222222] rounded-full hover:bg-opacity-80 transition-all"
          >
            <span className="sr-only">Previous</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="p-2 bg-[#222222] rounded-full hover:bg-opacity-80 transition-all"
          >
            <span className="sr-only">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Game Categories */}
      <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar">
        {CATEGORIES.map(category => (
          <Button
            key={category.id}
            variant="outline"
            className={`px-4 py-2 rounded-full mr-3 whitespace-nowrap flex items-center ${
              selectedCategory === category.id 
                ? 'border-2 border-[#FFD700]' 
                : 'hover:bg-opacity-80 transition-all'
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <span className="mr-2">{category.emoji}</span> {category.name}
          </Button>
        ))}
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Game Cards */}
        {displayedGames.map(game => (
          <Link key={game.id} href={game.path}>
            <div className="game-card relative bg-[#222222] rounded-xl overflow-hidden cursor-pointer group">
              <div className={`h-48 bg-gradient-to-br ${
                game.id === 'coinflip' ? 'from-yellow-600 to-yellow-800' :
                game.id === 'dice' ? 'from-green-600 to-green-800' :
                game.id === 'slots' ? 'from-purple-600 to-purple-900' :
                'from-red-600 to-red-900'
              } flex items-center justify-center overflow-hidden`}>
                <img 
                  src={game.imageSrc} 
                  alt={game.name} 
                  className="w-24 h-24 transition-transform group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-poppins font-semibold text-lg">{game.name}</h3>
                  {game.isPopular && (
                    <Badge className="bg-[#FF4081] bg-opacity-20 text-[#FF4081] px-2 py-1 rounded-md text-xs">
                      Popular
                    </Badge>
                  )}
                  {game.isNew && (
                    <Badge className="bg-[#FFD700] bg-opacity-20 text-[#FFD700] px-2 py-1 rounded-md text-xs">
                      New
                    </Badge>
                  )}
                  {game.isHot && (
                    <Badge className="bg-[#FF4081] bg-opacity-20 text-[#FF4081] px-2 py-1 rounded-md text-xs">
                      Hot
                    </Badge>
                  )}
                  {game.isTrending && !game.isPopular && !game.isNew && !game.isHot && (
                    <Badge className="bg-[#FFD700] bg-opacity-20 text-[#FFD700] px-2 py-1 rounded-md text-xs">
                      Trending
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-3">{game.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    <span className="text-[#FFD700]">{game.rtp}%</span> RTP
                  </div>
                  <Button 
                    size="sm"
                    className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm font-medium hover:bg-opacity-90 transition-all"
                  >
                    Play Now
                  </Button>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-[#222222] bg-opacity-80 rounded-full p-2">
                <HeartIcon className="w-4 h-4 text-gray-300 hover:text-[#FF4081] transition-colors" />
              </div>
            </div>
          </Link>
        ))}
        
        {/* "See All Games" Card */}
        <div className="game-card relative bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-700 flex items-center justify-center h-full">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#222222] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#FFD700]">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </div>
            <h3 className="font-poppins font-semibold text-lg mb-2">See All Games</h3>
            <p className="text-gray-400 text-sm">
              Explore our full collection of 20+ games
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
