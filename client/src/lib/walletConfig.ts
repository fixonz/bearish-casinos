import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  mainnet,
  sepolia,
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Abstract Network chain using viem's defineChain
const abstractMainnet = defineChain({
  id: 433,
  name: 'Abstract',
  network: 'abstract-mainnet',
  nativeCurrency: {
    decimals: 6,
    name: 'ATOM',
    symbol: 'ATOM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.abstract.money'],
    },
    public: {
      http: ['https://rpc.abstract.money'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Abstract Explorer', 
      url: 'https://explorer.abstract.money' 
    },
  },
  testnet: false,
});

// Get WalletConnect Project ID from environment or use fallback if not available
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c8c9ef58cb78ea14a7a5c2d710f9ab6b';

// Create wagmi config with Rainbow Kit
export const wagmiConfig = getDefaultConfig({
  appName: 'Bear Casino',
  projectId: walletConnectProjectId,
  chains: [abstractMainnet, mainnet, sepolia],
  transports: {
    [abstractMainnet.id]: http('https://rpc.abstract.money'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});