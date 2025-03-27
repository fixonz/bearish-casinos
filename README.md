# Abstract Network Casino Platform

A cutting-edge web-based crypto gaming platform featuring blockchain-integrated casino games with unique bear-themed design and provably fair randomization techniques.

## Key Features

- Multiple casino games (Coin Flip, Dice, Crash Game, etc.)
- Blockchain wallet integration
- Provably fair randomization
- Custom berry-themed UI
- Abstract Network compatibility

## Getting Started

### Prerequisites

- Node.js (v16+)
- Abstract Network wallet credentials (for deployment)
- WalletConnect Project ID (for wallet integration)

### Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables:
   ```
   cp .env.example .env
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deploying Smart Contracts

### Method 1: Using JavaScript Deployment Script

This method uses a simulated deployment for local development:

```bash
# Run the deployment script
./scripts/run-deploy.sh
```

The script will:
1. Deploy simulated contracts
2. Generate contract addresses
3. Create a `.env.contracts` file with the addresses
4. Attempt to append these addresses to your `.env` file

### Method 2: Using TypeScript Deployment Script

For real Abstract Network deployment:

```bash
# Run the TypeScript deployment script
./scripts/run-deploy-ts.sh
```

Before running this script, you must set the following environment variables:
- `ABSTRACT_RPC_URL` - Abstract Network RPC endpoint
- `PRIVATE_KEY` - Your deployment wallet's private key
- `PYTH_ENTROPY_ADDRESS` - Pyth Network Entropy address (for randomization)

## Game Contracts

The platform includes several game contracts:

1. **AbstractCasinoBase.sol** - Base contract with shared functionality
2. **CoinFlipGame.sol** - Berry-themed coin flip game (Red Berry vs Blue Berry)
3. **CrashGame.sol** - Multiplier-based crash game with cashout mechanism
4. **DiceGame.sol** - Classic dice game with customizable over/under betting

## Client Integration

The contracts are accessed through the `contracts.ts` module in the client, which provides:

- Smart contract address management
- Contract ABIs
- Method interfaces for game interactions
- Provably fair verification

## Randomization

The platform uses multiple layers of randomization:

1. Local provably fair algorithms (development)
2. Abstract Network blockchain randomization (production)
3. Pyth Network Entropy integration (enhanced security)

## Environment Configuration

Key environment variables:

```
# Basic configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://...

# WalletConnect
WALLETCONNECT_PROJECT_ID=...

# Abstract Network
ABSTRACT_RPC_URL=...
CASINO_BASE_ADDRESS=...
COIN_FLIP_ADDRESS=...
CRASH_GAME_ADDRESS=...
DICE_GAME_ADDRESS=...

# Randomization
PYTH_ENTROPY_ADDRESS=...
```

## License

MIT