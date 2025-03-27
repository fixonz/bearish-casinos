import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@/lib/icons';
import headImg from '@assets/head.png';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  onPlayAgain: () => void;
  onDoubleDown: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  currency = 'ETH',
  onPlayAgain, 
  onDoubleDown 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222222] rounded-2xl p-6 w-full max-w-md text-center">
        <div className="mb-6 relative">
          {/* Animated confetti effect (CSS animation would be added) */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="confetti-container"></div>
          </div>
          
          <div className="w-32 h-32 mx-auto relative">
            <img src={headImg} alt="Win" className="w-full h-full win-animation" />
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#00FF00] rounded-full flex items-center justify-center">
              <CheckIcon className="text-black w-6 h-6" />
            </div>
          </div>
          
          <h3 className="font-poppins font-bold text-2xl mt-4 text-[#00FF00]">You Won!</h3>
        </div>
        
        <div className="mb-8">
          <div className="text-5xl font-poppins font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FF4081] mb-2">
            +{amount.toFixed(2)} {currency}
          </div>
          <div className="text-gray-400">Your balance has been updated</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="p-3 bg-[#1a1a1a] rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
            onClick={onPlayAgain}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M1 4v6h6"></path>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Play Again
          </Button>
          <Button 
            className="p-3 bg-gradient-to-r from-[#FFD700] to-[#FF4081] text-black rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
            onClick={onDoubleDown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <circle cx="9" cy="6" r="6"></circle>
              <path d="M9 12h6"></path>
              <circle cx="15" cy="18" r="6"></circle>
            </svg>
            Double Down
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
