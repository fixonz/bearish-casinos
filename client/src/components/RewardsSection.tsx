import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CoinsIcon, CrownIcon, GiftIcon } from '@/lib/icons';
import bearishLogo from '@assets/bearishshs.png';

const RewardsSection: React.FC = () => {
  const { toast } = useToast();

  const handleJoinRewards = () => {
    toast({
      title: "Welcome to Rewards Program",
      description: "You've successfully joined our rewards program. Start playing to earn points!",
      duration: 3000,
    });
  };

  const handleRedeemRewards = () => {
    toast({
      title: "Rewards Redemption",
      description: "You can redeem your points for bonuses and free spins in the rewards section.",
      duration: 3000,
    });
  };

  return (
    <section id="rewards" className="py-12">
      <div className="flex flex-col md:flex-row bg-[#222222] rounded-2xl overflow-hidden">
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="font-poppins font-bold text-3xl mb-4">Earn While You Play</h2>
          <p className="text-gray-300 mb-6">
            Join our rewards program and earn points for every bet you place. Redeem your points for exclusive rewards, bonuses, and even free spins!
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex">
              <div className="w-12 h-12 bg-[#FFD700] bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <CoinsIcon className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Loyalty Points</h3>
                <p className="text-gray-400 text-sm">Earn 1 point for every 10 ATOM wagered</p>
              </div>
            </div>
            <div className="flex">
              <div className="w-12 h-12 bg-[#FFD700] bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <CrownIcon className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">VIP Levels</h3>
                <p className="text-gray-400 text-sm">Unlock higher rewards as you progress through VIP tiers</p>
              </div>
            </div>
            <div className="flex">
              <div className="w-12 h-12 bg-[#FFD700] bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <GiftIcon className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Daily Bonuses</h3>
                <p className="text-gray-400 text-sm">Claim free spins and bonuses every day you log in</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-lg font-medium text-black hover:shadow-lg transition-all"
            onClick={handleJoinRewards}
          >
            Join Rewards Program
          </Button>
        </div>
        
        <div className="md:w-1/2 bg-gradient-to-br from-[#FFD700] to-[#FF4081] p-8 md:p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <img src={bearishLogo} alt="VIP Bear" className="w-full h-full" />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-[#FF4081]">
                <CrownIcon className="text-[#FFD700] w-5 h-5" />
              </div>
            </div>
            
            <div className="font-poppins font-bold text-2xl text-black mb-2">Gold VIP Status</div>
            <p className="text-gray-800 mb-6">You have earned 1,250 loyalty points</p>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-black font-medium">Progress to Platinum</span>
                <span className="text-sm text-black font-medium">1,250 / 5,000</span>
              </div>
              <Progress value={25} className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full"></div>
              </Progress>
            </div>
            
            <Button 
              className="px-6 py-3 bg-black bg-opacity-80 rounded-lg font-medium text-white hover:bg-opacity-90 transition-all"
              onClick={handleRedeemRewards}
            >
              Redeem Rewards
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsSection;
