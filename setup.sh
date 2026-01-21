#!/bin/bash

echo "Setting up Ekubo Slippage Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "Warning: .env.local file not found!"
    echo "Please create a .env.local file with your database connection:"
    echo ""
    echo "DATABASE_URL=postgresql://user:password@localhost:5432/ekubo_indexer"
    echo ""
    echo "You can copy .env.example to .env.local and update the values."
    exit 1
fi

echo ""
echo "Setup complete! 🎉"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
