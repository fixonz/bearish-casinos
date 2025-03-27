#!/bin/bash

echo "Starting Abstract Network contract compilation process..."
echo "-------------------------------------------------------"

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the compilation script
echo "Compiling contracts..."
node scripts/compile-contracts.js

# Check if the compilation was successful
if [ $? -eq 0 ]; then
  echo "Compilation completed successfully!"
  
  # Check if build directory exists
  if [ -d "build" ]; then
    echo "Contract artifacts are available in the build directory:"
    ls -la build/
  fi
else
  echo "Compilation failed. Please check the logs for errors."
  exit 1
fi

echo "-------------------------------------------------------"
echo "Next steps:"
echo "1. Deploy the compiled contracts using './scripts/run-deploy.sh'"
echo "2. Update your application to use the new contract addresses"
echo "-------------------------------------------------------"