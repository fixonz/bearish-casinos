import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import bearPatternImg from '@assets/aeasd.png';

const HeroSection: React.FC = () => {
  const { wallet, connectWallet } = useWalletContext();
  const { toast } = useToast();

  const handlePlayNow = async () => {
    if (!wallet.isConnected) {
      const connected = await connectWallet();
      if (connected) {
        toast({
          title: "Wallet connected",
          description: "You are ready to play!",
          duration: 3000,
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      // Redirect to games section
      window.location.href = '#games';
    }
  };

  const handleHowItWorks = () => {
    toast({
      title: "How It Works",
      description: "Our games use provably fair local randomization to ensure fair gameplay.",
      duration: 5000,
    });
  };

  return (
    <section className="py-8 md:py-16 text-center relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-10">
        {/* Background pattern of bear logos */}
        <div 
          className="w-full h-full" 
          style={{ 
            backgroundImage: `url(${bearPatternImg})`, 
            backgroundSize: 'cover' 
          }}
        ></div>
      </div>
      
      <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-4">
        <span className="text-white">Play to </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FF4081]">Win</span>
      </h1>
      <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
        Experience the thrill of crypto casino games with our provably fair local randomization system. No smart contracts, just pure fun!
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
        <Button 
          className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-full font-medium text-black hover:shadow-lg transition-all"
          onClick={handlePlayNow}
        >
          Play Now
        </Button>
        <Button 
          className="px-6 py-3 bg-transparent border-2 border-[#FFD700] rounded-full font-medium hover:bg-[#FFD700] hover:bg-opacity-10 transition-all"
          onClick={handleHowItWorks}
        >
          How It Works
        </Button>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-[#222222] rounded-xl p-6">
          <div className="text-3xl font-bold text-[#FFD700] mb-2">$1.2M+</div>
          <div className="text-gray-400">Total Winnings</div>
        </div>
        <div className="bg-[#222222] rounded-xl p-6">
          <div className="text-3xl font-bold text-[#FFD700] mb-2">12,400+</div>
          <div className="text-gray-400">Active Players</div>
        </div>
        <div className="bg-[#222222] rounded-xl p-6">
          <div className="text-3xl font-bold text-[#FFD700] mb-2">100%</div>
          <div className="text-gray-400">Provably Fair</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
