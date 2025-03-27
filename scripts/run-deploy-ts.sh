#!/bin/bash

echo "Starting Abstract Network contract deployment process (TypeScript)..."
echo "-------------------------------------------------------"

# Check environment variables
if [ -z "$PRIVATE_KEY" ]; then
  if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
  else
    echo "Error: PRIVATE_KEY environment variable is not set and .env file does not exist."
    exit 1
  fi
fi

if [ -z "$PRIVATE_KEY" ]; then
  echo "Error: PRIVATE_KEY environment variable is required for deployment."
  exit 1
fi

echo "Deploying contracts to Abstract Network testnet..."

# Run the TypeScript deployment script
npx tsx scripts/deploy-abstract.ts

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment completed successfully!"
  echo "Contract addresses have been updated in .env.contracts.ts file."
else
  echo "Deployment failed. Please check the logs for errors."
  exit 1
fi

echo "-------------------------------------------------------"
echo "Next steps:"
echo "1. Update your frontend to use the new contract addresses"
echo "2. Test the contracts on the Abstract Network testnet"
echo "-------------------------------------------------------"