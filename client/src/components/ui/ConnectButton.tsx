import React from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';

interface ConnectButtonProps {
  className?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
  className = ''
}) => {
  return (
    <RainbowConnectButton.Custom>
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
                    Connect Abstract Wallet
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
                  <Button
                    onClick={openChainModal}
                    className="bg-[#2a2a2a] text-white hover:bg-[#333333] rounded-lg px-4 py-2 font-medium"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>
                  
                  <Button
                    onClick={openAccountModal}
                    className="bg-[#FFD700] text-black hover:bg-[#F0C800] rounded-lg px-4 py-2 font-medium"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};

export default ConnectButton;