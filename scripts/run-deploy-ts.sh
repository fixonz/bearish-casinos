#!/bin/bash

echo "Starting Abstract Network deployment process with TypeScript..."
echo "----------------------------------------------"

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check if ethers is installed (required for TS deployment)
if ! npm list ethers > /dev/null 2>&1; then
  echo "Installing ethers for deployment..."
  npm install ethers
fi

# Run the TypeScript deployment script
echo "Deploying contracts to Abstract Network..."
npx tsx scripts/deploy-abstract.ts

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment completed successfully!"
  echo "Please check the console output for contract addresses."
else
  echo "Deployment failed. Please check the logs for errors."
  exit 1
fi

echo "----------------------------------------------"
echo "To use these contracts in your application:"
echo "1. Update your .env file with the contract addresses"
echo "2. Set the following environment variables:"
echo "   - ABSTRACT_RPC_URL (Abstract Network RPC endpoint)"
echo "   - PRIVATE_KEY (Your deployment wallet's private key)"
echo "   - PYTH_ENTROPY_ADDRESS (Pyth Network Entropy address)"
echo "3. Restart your application"
echo "----------------------------------------------"