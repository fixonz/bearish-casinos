import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShieldIcon, WalletIcon, CoinsIcon, ArrowRightIcon } from '@/lib/icons';

const HowItWorksSection: React.FC = () => {
  const { toast } = useToast();

  const handleLearnMore = () => {
    toast({
      title: "Our Technology",
      description: "We use browser-based cryptographic randomization to ensure all game outcomes are fair and verifiable.",
      duration: 5000,
    });
  };

  return (
    <section className="py-12">
      <h2 className="font-poppins font-bold text-3xl mb-8 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#222222] rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-[#FFD700] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="w-8 h-8 text-[#FFD700]" />
          </div>
          <h3 className="font-poppins font-semibold text-xl mb-3">Provably Fair</h3>
          <p className="text-gray-400">
            Our local randomization system ensures every game outcome is completely fair and verifiable.
          </p>
        </div>
        
        <div className="bg-[#222222] rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-[#FFD700] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-8 h-8 text-[#FFD700]" />
          </div>
          <h3 className="font-poppins font-semibold text-xl mb-3">Easy Deposits</h3>
          <p className="text-gray-400">
            Connect your Abstract Mainnet wallet and start playing immediately with no delays.
          </p>
        </div>
        
        <div className="bg-[#222222] rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-[#FFD700] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CoinsIcon className="w-8 h-8 text-[#FFD700]" />
          </div>
          <h3 className="font-poppins font-semibold text-xl mb-3">Instant Payouts</h3>
          <p className="text-gray-400">
            All winnings are instantly credited to your account and available for withdrawal.
          </p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Button 
          variant="outline"
          className="px-6 py-3 bg-[#222222] rounded-lg hover:bg-opacity-80 transition-all inline-flex items-center"
          onClick={handleLearnMore}
        >
          <span>Learn More About Our Technology</span>
          <ArrowRightIcon className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};

export default HowItWorksSection;
