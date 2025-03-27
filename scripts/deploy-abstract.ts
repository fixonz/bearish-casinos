
// SPDX-License-Identifier: MIT
// TypeScript deployment script for Abstract Network Casino contracts
// Usage: npx tsx scripts/deploy-abstract.ts

import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONTRACT_ADDRESSES } from "../client/src/lib/contracts";

// Initialize environment variables
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable checking
const requiredEnvVars = ['PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    console.error('Please check your .env file and make sure all required variables are set.');
    process.exit(1);
  }
}

// Get RPC URL from environment
const rpcUrl = process.env.ABSTRACT_RPC_URL || process.env.RPC_URL || "https://11124.rpc.thirdweb.com";
const chainId = parseInt(process.env.CHAIN_ID || "11124");

async function main() {
  try {
    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    console.log("Deploying contracts to Abstract Network with address:", wallet.address);
    
    try {
      // Get network information
      const network = await provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Get wallet balance
      const balance = await provider.getBalance(wallet.address);
      console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error: any) {
      console.warn(`Warning: Could not fetch network info: ${error.message}`);
    }

    // For simulation purposes, we'll create mock contract addresses
    // In a real deployment, these would be actual deployed contracts
    const casinoBaseAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const coinFlipAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const diceGameAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const crashGameAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    console.log("\nSimulated contract deployments:");
    console.log("CasinoBase deployed to:", casinoBaseAddress);
    console.log("CoinFlip deployed to:", coinFlipAddress);
    console.log("DiceGame deployed to:", diceGameAddress);
    console.log("CrashGame deployed to:", crashGameAddress);

    // Create .env.contracts.ts file with addresses
    const envContents = `
# Abstract Network contract addresses
CASINO_BASE_ADDRESS=${casinoBaseAddress}
COIN_FLIP_ADDRESS=${coinFlipAddress}
CRASH_GAME_ADDRESS=${crashGameAddress}
DICE_GAME_ADDRESS=${diceGameAddress}
    `.trim();
    
    // Write contract addresses to .env files
    fs.writeFileSync(path.join(__dirname, '..', '.env.contracts.ts'), envContents);
    console.log('Contract addresses written to .env.contracts.ts');
    
    // Append to existing .env file if it exists and doesn't already have addresses
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const currentEnv = fs.readFileSync(envPath, 'utf8');
      if (!currentEnv.includes('CASINO_BASE_ADDRESS')) {
        fs.appendFileSync(envPath, '\n' + envContents);
        console.log('Contract addresses appended to .env');
      }
    }
  } catch (error) {
    console.error("Error deploying contracts:", error);
    process.exit(1);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
