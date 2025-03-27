// SPDX-License-Identifier: MIT
// Compile script for Abstract Network Casino contracts
// Usage: node scripts/compile-contracts.js

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import solc
import solc from 'solc';

// Function to compile a Solidity contract using solc
async function compileContract(name) {
  console.log(`Compiling ${name}...`);
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contractPath = path.join(contractsDir, `${name}.sol`);
  console.log(`Reading contract from: ${contractPath}`);
  
  // Check if contract file exists
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file ${contractPath} does not exist`);
  }
  
  // Read the contract code
  const contractCode = fs.readFileSync(contractPath, 'utf8');
  console.log(`Contract ${name} has ${contractCode.split('\n').length} lines of code`);
  
  // Find imports in the contract
  const importRegex = /import\s+["'](.+?)["'];/g;
  let match;
  const sources = {};
  
  // Add the main contract to sources
  sources[`${name}.sol`] = { content: contractCode };
  
  // Find all imports and add them to sources
  while ((match = importRegex.exec(contractCode)) !== null) {
    const importPath = match[1];
    const importName = path.basename(importPath);
    const importFullPath = path.join(contractsDir, importPath);
    
    if (fs.existsSync(importFullPath)) {
      const importContent = fs.readFileSync(importFullPath, 'utf8');
      sources[importName] = { content: importContent };
      console.log(`Added import: ${importName}`);
    }
  }
  
  // Define compiler input
  const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  // Compile the contract
  console.log(`Compiling with solc version ${solc.version()}...`);
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  // Check for errors
  if (output.errors) {
    const hasError = output.errors.some(error => error.severity === 'error');
    if (hasError) {
      console.error('Compilation errors:');
      output.errors.forEach(error => {
        console.error(error.formattedMessage);
      });
      throw new Error('Contract compilation failed');
    } else {
      // Only warnings, log them but continue
      console.warn('Compilation warnings:');
      output.errors.forEach(warning => {
        console.warn(warning.formattedMessage);
      });
    }
  }
  
  // Extract ABI and bytecode from the output
  const contractOutput = output.contracts[`${name}.sol`][name];
  
  if (!contractOutput) {
    throw new Error(`Could not find compiled output for ${name}`);
  }
  
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;
  
  console.log(`${name} compiled successfully!`);
  
  return {
    abi,
    bytecode: `0x${bytecode}`
  };
}

async function main() {
  try {
    console.log('Starting compilation of Abstract Network contracts...');
    
    // Compile contracts
    const contracts = ['AbstractCasinoBase', 'CoinFlipGame', 'CrashGame', 'DiceGame'];
    const compiledContracts = {};
    
    for (const contract of contracts) {
      compiledContracts[contract] = await compileContract(contract);
    }
    
    // Create build directory if it doesn't exist
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }
    
    // Write compiled contracts to build directory
    for (const [contract, artifact] of Object.entries(compiledContracts)) {
      const artifactPath = path.join(buildDir, `${contract}.json`);
      fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
      console.log(`Artifact for ${contract} written to ${artifactPath}`);
    }
    
    console.log('Compilation complete!');
    
  } catch (error) {
    console.error('Error compiling contracts:', error);
    process.exit(1);
  }
}

// Run the compilation
main();