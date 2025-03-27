#!/bin/bash
# Script to deploy contracts to Abstract Network
# Usage: ./scripts/run-deploy.sh [simulation]

# Set script to exit on any error
set -e

# Check if the .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with the required environment variables."
    exit 1
fi

# Check if the PRIVATE_KEY is set in the .env file
if ! grep -q "PRIVATE_KEY" .env; then
    echo "Error: PRIVATE_KEY environment variable not found in .env file!"
    exit 1
fi

# Check if the ABSTRACT_RPC_URL is set in the .env file
if ! grep -q "ABSTRACT_RPC_URL" .env && ! grep -q "RPC_URL" .env; then
    echo "Error: Neither ABSTRACT_RPC_URL nor RPC_URL environment variable found in .env file!"
    exit 1
fi

# Check if first argument is "simulation"
if [ "$1" = "simulation" ]; then
    echo "Running in simulation mode..."
    export SIMULATION_MODE=true
else
    echo "Running in production mode... (Will deploy real contracts to the blockchain)"
    export SIMULATION_MODE=false
    
    # Confirmation prompt for production deployment
    read -p "Are you sure you want to deploy contracts to Abstract Network? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Compile contracts first
echo "Compiling contracts..."
node scripts/compile-contracts.js

# Deploy contracts
echo "Deploying contracts..."
node scripts/deploy-contracts.js

echo "Deployment process completed!"