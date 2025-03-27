import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TwitterIcon, 
  TelegramIcon, 
  DiscordIcon, 
  InstagramIcon,
  SendIcon
} from '@/lib/icons';
import bearishLogo from '@assets/bearishshs.png';
import tailsLogo from '@assets/taills.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a1a1a] pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/">
              <div className="flex items-center mb-6 cursor-pointer">
                <img src={bearishLogo} alt="Bearish Logo" className="h-8 mr-2" />
                <span className="font-poppins font-bold text-xl text-white">
                  BEARiSH <span className="text-[#FFD700]">Casino</span>
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6">
              The most exciting crypto casino platform with provably fair games and instant payouts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all">
                <TelegramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all">
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/#games" className="text-gray-400 hover:text-[#FFD700] transition-colors">Games</a></li>
              <li><a href="/#leaderboard" className="text-gray-400 hover:text-[#FFD700] transition-colors">Leaderboard</a></li>
              <li><a href="/#rewards" className="text-gray-400 hover:text-[#FFD700] transition-colors">Rewards</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">VIP Program</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for updates and exclusive offers.
            </p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-[#222222] border border-gray-700 rounded-l-lg px-4 py-2 focus:outline-none focus:border-[#FFD700] w-full rounded-r-none"
                />
                <Button 
                  type="submit" 
                  className="bg-[#FFD700] text-black px-4 rounded-r-lg hover:bg-opacity-90 transition-all rounded-l-none"
                >
                  <SendIcon className="w-5 h-5" />
                </Button>
              </div>
            </form>
            <div className="text-sm text-gray-500">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; 2023 BEARiSH Casino. All rights reserved.
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">Secured by Abstract Mainnet</span>
            <img src={tailsLogo} alt="Abstract Logo" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
