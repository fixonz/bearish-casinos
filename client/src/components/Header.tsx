import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { MenuIcon, CloseIcon } from '@/lib/icons';
import { useWalletContext } from '@/context/WalletContext';
import WalletModal from './modals/WalletModal';
import bearishLogo from '@assets/bearishshs.png';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { wallet, connectWallet } = useWalletContext();

  const handleWalletConnect = async () => {
    if (wallet.isConnected) {
      setIsWalletModalOpen(true);
    } else {
      await connectWallet();
      setIsWalletModalOpen(true);
    }
  };

  return (
    <header className="relative z-30">
      <div className="bg-primary bg-opacity-95 backdrop-blur-sm shadow-md fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo (Made Bigger) */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img src={bearishLogo} alt="Bearish Logo" className="h-12 mr-3" />
              <span className="font-poppins font-bold text-2xl text-white">
                BEARiSH <span className="text-[#FFD700]">Casino</span>
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#games" className="font-medium hover:text-[#FFD700] transition-colors">
              Games
            </Link>
            <Link href="/#leaderboard" className="font-medium hover:text-[#FFD700] transition-colors">
              Leaderboard
            </Link>
            <Link href="/#rewards" className="font-medium hover:text-[#FFD700] transition-colors">
              Rewards
            </Link>
            <Button 
              className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-full font-medium hover:shadow-lg transition-all text-black"
              onClick={handleWalletConnect}
            >
              {wallet.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav fixed top-0 right-0 w-64 h-full bg-[#1a1a1a] transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} z-50 shadow-xl transition-transform md:hidden`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-poppins font-bold text-xl">Menu</span>
            <button 
              className="text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-6">
            <Link 
              href="/#games" 
              className="font-medium hover:text-[#FFD700] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Games
            </Link>
            <Link 
              href="/#leaderboard" 
              className="font-medium hover:text-[#FFD700] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link 
              href="/#rewards" 
              className="font-medium hover:text-[#FFD700] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rewards
            </Link>
            <Button 
              className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF4081] rounded-full font-medium hover:shadow-lg transition-all text-black"
              onClick={() => {
                handleWalletConnect();
                setIsMobileMenuOpen(false);
              }}
            >
              {wallet.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </Button>
          </nav>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
