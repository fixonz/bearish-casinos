// SPDX-License-Identifier: MIT
// Initialize script for Abstract Network Casino contracts
// This script syncs the contract addresses with the frontend
// Usage: node scripts/initialize-contracts.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  try {
    console.log('Initializing Abstract Network contract integration...');
    
    // Check if we have contract addresses
    let contractAddresses = {
      CASINO_BASE_ADDRESS: process.env.CASINO_BASE_ADDRESS || '',
      COIN_FLIP_ADDRESS: process.env.COIN_FLIP_ADDRESS || '',
      CRASH_GAME_ADDRESS: process.env.CRASH_GAME_ADDRESS || '',
      DICE_GAME_ADDRESS: process.env.DICE_GAME_ADDRESS || ''
    };
    
    // Check if any addresses are missing
    const missingAddresses = Object.entries(contractAddresses)
      .filter(([_, address]) => !address)
      .map(([name]) => name);
      
    if (missingAddresses.length > 0) {
      console.warn(`Missing contract addresses: ${missingAddresses.join(', ')}`);
      console.warn('Using placeholder addresses for development...');
      
      // Generate placeholder addresses for missing contracts
      missingAddresses.forEach(name => {
        contractAddresses[name] = `0x${Math.random().toString(16).substr(2, 40)}`;
      });
    }
    
    // Create or update contracts.json file
    const contractsDir = path.join(__dirname, '..', 'client', 'src', 'lib');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    const contractsJson = path.join(contractsDir, 'contracts.json');
    fs.writeFileSync(contractsJson, JSON.stringify(contractAddresses, null, 2));
    console.log(`Contract addresses written to ${contractsJson}`);
    
    // Update client/src/lib/contracts.ts if it exists
    const contractsTs = path.join(contractsDir, 'contracts.ts');
    if (fs.existsSync(contractsTs)) {
      let contractsContent = fs.readFileSync(contractsTs, 'utf8');
      
      // Replace contract addresses
      const addressBlockRegex = /export const CONTRACT_ADDRESSES = \{[^}]+\};/s;
      const newAddressBlock = `export const CONTRACT_ADDRESSES = {
  CASINO_BASE: '${contractAddresses.CASINO_BASE_ADDRESS}',
  COIN_FLIP: '${contractAddresses.COIN_FLIP_ADDRESS}',
  CRASH_GAME: '${contractAddresses.CRASH_GAME_ADDRESS}',
  DICE_GAME: '${contractAddresses.DICE_GAME_ADDRESS}',
};`;
      
      contractsContent = contractsContent.replace(addressBlockRegex, newAddressBlock);
      
      fs.writeFileSync(contractsTs, contractsContent);
      console.log(`Updated contract addresses in ${contractsTs}`);
    }
    
    console.log('Contract initialization complete!');
    console.log('Contract addresses:');
    Object.entries(contractAddresses).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('Error initializing contract integration:', error);
    process.exit(1);
  }
}

// Run the initialization
main();