// SPDX-License-Identifier: MIT
// Deploy script for Abstract Network Casino contracts
// Usage: node scripts/deploy-contracts.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is a placeholder for Abstract Network SDK
// In a real deployment, we would use the Abstract.js SDK
// For now, we'll just simulate the deployment
async function deployContract(name, args = []) {
  console.log(`Deploying ${name} with args:`, args);
  
  // Simulate the contract deployment
  const address = `0x${Math.random().toString(16).substr(2, 40)}`;
  console.log(`${name} deployed at address: ${address}`);
  
  return { address };
}

async function main() {
  try {
    console.log('Starting deployment to Abstract Network...');
    
    // Default values
    const houseEdge = 250; // 2.5%
    const minBet = '1000000000000000'; // 0.001 ETH in wei
    const maxBet = '5000000000000000000'; // 5 ETH in wei
    
    // Deploy AbstractCasinoBase contract first (not actually used directly)
    console.log('Deploying base contract infrastructure...');
    
    // Deploy game contracts
    console.log('Deploying game contracts...');
    
    // CoinFlipGame
    const coinFlip = await deployContract('CoinFlipGame', [houseEdge, minBet, maxBet]);
    
    // CrashGame
    const crashGame = await deployContract('CrashGame', [houseEdge, minBet, maxBet]);
    
    // DiceGame
    const diceGame = await deployContract('DiceGame', [houseEdge, minBet, maxBet]);
    
    // Create .env file with contract addresses
    const envContents = `
# Abstract Network contract addresses
CASINO_BASE_ADDRESS=${coinFlip.address} # Using same address for base for simulation
COIN_FLIP_ADDRESS=${coinFlip.address}
CRASH_GAME_ADDRESS=${crashGame.address}
DICE_GAME_ADDRESS=${diceGame.address}
    `.trim();
    
    // Write contract addresses to .env file
    fs.writeFileSync(path.join(__dirname, '..', '.env.contracts'), envContents);
    console.log('Contract addresses written to .env.contracts');
    
    // Append to existing .env file if it exists
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const currentEnv = fs.readFileSync(envPath, 'utf8');
      if (!currentEnv.includes('CASINO_BASE_ADDRESS')) {
        fs.appendFileSync(envPath, '\n' + envContents);
        console.log('Contract addresses appended to .env');
      }
    }
    
    console.log('Deployment complete!');
    console.log('Contract addresses:');
    console.log(`CoinFlipGame: ${coinFlip.address}`);
    console.log(`CrashGame: ${crashGame.address}`);
    console.log(`DiceGame: ${diceGame.address}`);
    
  } catch (error) {
    console.error('Error deploying contracts:', error);
    process.exit(1);
  }
}

// Run the deployment
main();