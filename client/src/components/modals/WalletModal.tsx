import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/context/WalletContext';
import { formatAddress } from '@/lib/utils';
import headImg from '@assets/head.png';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, disconnectWallet } = useWalletContext();

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222222] rounded-2xl p-6 w-full max-w-md">
        <DialogHeader className="flex justify-between items-center mb-6">
          <DialogTitle className="font-poppins font-bold text-xl">Wallet Connected</DialogTitle>
          <DialogClose className="text-gray-400 hover:text-white" />
        </DialogHeader>
        
        <div className="mb-6">
          <div className="flex items-center p-4 bg-[#1a1a1a] rounded-xl mb-4">
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mr-4">
              <img src={headImg} alt="Wallet" className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Connected Account</div>
              <div className="font-medium">{formatAddress(wallet.address)}</div>
            </div>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-xl text-center">
            <div className="text-sm text-gray-400 mb-2">Available Balance</div>
            <div className="font-poppins font-bold text-2xl mb-1">{wallet.balance.toFixed(2)} ATOM</div>
            <div className="text-[#FFD700] text-sm">≈ ${(wallet.balance * 9.8).toFixed(2)} USD</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            className="p-3 bg-[#FFD700] text-black rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            Deposit
          </Button>
          <Button 
            variant="outline"
            className="p-3 bg-[#1a1a1a] rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M7 17l9.2-9.2"></path>
              <path d="M17 17V7H7"></path>
            </svg>
            Withdraw
          </Button>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <Button 
            variant="outline"
            className="w-full p-3 bg-[#1a1a1a] rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
            onClick={handleDisconnect}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Disconnect Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
