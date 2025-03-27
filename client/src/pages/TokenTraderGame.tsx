import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TokenTrader from '@/components/ui/TokenTrader';
import { useGamesContext } from '@/context/GamesContext';
import { ArrowRightIcon, ShieldIcon } from '@/lib/icons';

const TokenTraderPage: React.FC = () => {
  const { getGameById } = useGamesContext();
  const game = getGameById('tokentrader');

  // If game is not found in context, use fallback data
  const gameData = game || {
    name: 'Token Trader',
    description: 'Trade crypto tokens to build your portfolio and make profit before time runs out.',
    rtp: 95
  };

  // Set title
  useEffect(() => {
    document.title = `${gameData.name} | BEARiSH Casino`;
  }, [gameData.name]);

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <Link href="/#games">
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <ArrowRightIcon className="w-4 h-4 mr-2 rotate-180" />
              <span>Back to Games</span>
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">{gameData.name}</h1>
          <p className="text-gray-400 mb-4 max-w-3xl">{gameData.description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <ShieldIcon className="w-4 h-4 text-green-500" />
            <span>Provably Fair</span>
            <span className="mx-2">•</span>
            <span>RTP: {gameData.rtp}%</span>
          </div>
        </div>

        <TokenTrader />
      </main>
      <Footer />
    </>
  );
};

export default TokenTraderPage;