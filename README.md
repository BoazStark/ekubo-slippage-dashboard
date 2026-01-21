# Ekubo Pool Slippage Dashboard

A real-time dashboard displaying slippage estimates for Ekubo protocol pools on Starknet.

## Features

- Display all active Ekubo pools
- Calculate slippage for swap sizes: $1,000, $5,000, and $10,000 USD
- Real-time pool data from Ekubo indexer
- Beautiful, responsive UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure database connection:
Create a `.env.local` file with:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

The dashboard connects to the Ekubo indexer database to fetch:
- Pool configurations (tokens, fees, tick spacing)
- Current pool states (liquidity, price, tick)
- Token prices in USD

It then calculates expected slippage for specified USD amounts by:
1. Converting USD to token amounts using current prices
2. Simulating swaps through the concentrated liquidity curve
3. Calculating price impact percentage

## Tech Stack

- Next.js 14 (React framework)
- TypeScript
- PostgreSQL (Ekubo indexer database)
- Tailwind CSS (styling)
- Starknet.js (blockchain integration)
