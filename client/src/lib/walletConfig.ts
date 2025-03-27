import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  mainnet,
  sepolia,
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Abstract Network chain using viem's defineChain
export const abstractNetwork = defineChain({
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://11124.rpc.thirdweb.com'],
    },
    public: {
      http: ['https://11124.rpc.thirdweb.com'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'ThirdWeb Explorer', 
      url: 'https://11124.explorer.thirdweb.com' 
    },
  },
  testnet: true,
});

// Get WalletConnect Project ID from environment or use fallback if not available
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c8c9ef58cb78ea14a7a5c2d710f9ab6b';

// Create wagmi config with Rainbow Kit
export const wagmiConfig = getDefaultConfig({
  appName: 'Bear Casino',
  projectId: walletConnectProjectId,
  chains: [abstractNetwork, mainnet, sepolia],
  transports: {
    [abstractNetwork.id]: http('https://11124.rpc.thirdweb.com'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});