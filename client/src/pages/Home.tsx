import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import GamesSection from '@/components/GamesSection';
import FeaturedGameSection from '@/components/FeaturedGameSection';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardsSection from '@/components/RewardsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <HeroSection />
        <GamesSection />
        <FeaturedGameSection />
        <LeaderboardSection />
        <RewardsSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
