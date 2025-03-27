import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CoinFlip from '@/components/ui/CoinFlip';
import { useGamesContext } from '@/context/GamesContext';
import { ArrowRightIcon } from '@/lib/icons';
import { ShieldIcon } from '@/lib/icons';

const CoinFlipGame: React.FC = () => {
  const { getGameById } = useGamesContext();
  const gameData = getGameById('coinflip');

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <Link href="/">
            <a className="text-gray-400 hover:text-[#FFD700]">Home</a>
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link href="/#games">
            <a className="text-gray-400 hover:text-[#FFD700]">Games</a>
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-[#FFD700]">Coin Flip</span>
        </div>
        
        {/* Game Title */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2">Coin Flip</h1>
          <p className="text-gray-400 max-w-2xl">Flip a coin and double your bet with a 50% chance. Choose heads or tails and test your luck!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <CoinFlip />
          </div>
          
          {/* Game Info */}
          <div className="space-y-6">
            <div className="bg-[#222222] rounded-xl p-6">
              <h3 className="font-poppins font-semibold text-xl mb-4">How To Play</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</div>
                  <div>
                    <p>Set your bet amount using the input field</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</div>
                  <div>
                    <p>Choose Heads or Tails to place your bet</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="w-8 h-8 bg-[#FFD700] text-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</div>
                  <div>
                    <p>Watch the coin flip and see if you win!</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#222222] rounded-xl p-6">
              <h3 className="font-poppins font-semibold text-xl mb-4">Game Stats</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">House Edge</div>
                  <div className="font-semibold">2%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Win Chance</div>
                  <div className="font-semibold">50%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Max Win</div>
                  <div className="font-semibold">1,000 ATOM</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Plays</div>
                  <div className="font-semibold">45,276</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">Provably Fair</div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-[#00FF00] rounded-full mr-2"></span>
                    <span className="text-sm">Verified</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">Local Randomization</div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-[#00FF00] rounded-full mr-2"></span>
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#222222] rounded-xl p-6">
              <div className="flex mb-4">
                <div className="w-12 h-12 bg-[#FFD700] bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <ShieldIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Provably Fair</h3>
                  <p className="text-gray-400 text-sm">We use cryptographic randomization to ensure all outcomes are fair and cannot be manipulated.</p>
                </div>
              </div>
              
              <Button 
                className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-lg font-medium text-black hover:shadow-lg transition-all"
              >
                Verify Randomization
              </Button>
            </div>
            
            {/* More Games */}
            <div className="bg-[#222222] rounded-xl p-6">
              <h3 className="font-poppins font-semibold text-xl mb-4">More Games</h3>
              <div className="space-y-2">
                <Link href="/games/dice">
                  <Button variant="outline" className="w-full justify-between">
                    Dice Roll
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/games/slots">
                  <Button variant="outline" className="w-full justify-between">
                    Bear Slots
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/games/crash">
                  <Button variant="outline" className="w-full justify-between">
                    Crypto Crash
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoinFlipGame;
