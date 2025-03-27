import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import GamesSection from '@/components/GamesSection';
import FeaturedGameSection from '@/components/FeaturedGameSection';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardsSection from '@/components/RewardsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <HeroSection />
        {/* Minimal Game List */}
        <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
          <Link href="/games/crash">
            <div className="bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#252525] transition-colors">
              <h3 className="font-semibold mb-1">Crypto Crash</h3>
              <p className="text-sm text-gray-400">Bet and cash out before the crash</p>
            </div>
          </Link>
          <Link href="/games/prizebuilder">
            <div className="bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#252525] transition-colors">
              <h3 className="font-semibold mb-1">Prize Builder</h3>
              <p className="text-sm text-gray-400">Join prize pools and win big</p>
            </div>
          </Link>
          <Link href="/games/slots">
            <div className="bg-[#1a1a1a] p-4 rounded-lg hover:bg-[#252525] transition-colors">
              <h3 className="font-semibold mb-1">Slots</h3>
              <p className="text-sm text-gray-400">Classic slot machine game</p>
            </div>
          </Link>
        </div>
        <LeaderboardSection />
        <RewardsSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;