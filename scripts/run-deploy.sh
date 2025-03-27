#!/bin/bash

echo "Starting Abstract Network deployment process..."
echo "----------------------------------------------"

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the deployment script
echo "Deploying contracts to Abstract Network..."
node scripts/deploy-contracts.js

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment completed successfully!"
  
  # Check if .env.contracts exists
  if [ -f ".env.contracts" ]; then
    echo "Contract addresses are available in .env.contracts"
    cat .env.contracts
  fi
else
  echo "Deployment failed. Please check the logs for errors."
  exit 1
fi

echo "----------------------------------------------"
echo "To use these contracts in your application:"
echo "1. Update your .env file with the contract addresses"
echo "2. Restart your application"
echo "----------------------------------------------"