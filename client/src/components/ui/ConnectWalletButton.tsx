import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';

interface ConnectWalletButtonProps {
  className?: string;
  showBalance?: boolean;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  className = '',
  showBalance = true 
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If the authentication is loading, we show a loading button
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain;
        
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal} 
                    className="bg-[#FFD700] text-black hover:bg-[#F0C800] rounded-lg px-4 py-2 font-medium"
                  >
                    Connect Wallet
                  </Button>
                );
              }
              
              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal} 
                    className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 font-medium"
                  >
                    Wrong Network
                  </Button>
                );
              }
              
              return (
                <div className="flex items-center gap-3">
                  {showBalance && (
                    <Button
                      onClick={openAccountModal}
                      className="bg-[#2a2a2a] text-white hover:bg-[#333333] rounded-lg px-4 py-2 font-medium"
                    >
                      {account.displayBalance ? account.displayBalance : ''}
                    </Button>
                  )}
                  
                  <Button
                    onClick={openAccountModal}
                    className="bg-[#FFD700] text-black hover:bg-[#F0C800] rounded-lg px-4 py-2 font-medium"
                  >
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;