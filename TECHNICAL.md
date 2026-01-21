# Ekubo Slippage Dashboard - Technical Documentation

## Architecture

### Overview
This dashboard is built with Next.js 14 using the App Router and React Server Components for optimal performance. It connects directly to the Ekubo indexer PostgreSQL database to fetch real-time pool data.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Ekubo indexer)
- **Database Client**: node-postgres (pg)

## Directory Structure

```
slippage-dashboard/
├── app/
│   ├── api/
│   │   └── pools/
│   │       └── slippage/
│   │           └── route.ts          # API endpoint for pool data
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Main dashboard page
├── lib/
│   ├── database.ts                    # Database queries
│   └── slippage.ts                    # Slippage calculation logic
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Database Schema

The dashboard relies on the following tables from the Ekubo indexer:

### `pool_keys`
Stores unique pool identifiers and configurations:
- `pool_key_id`: Unique identifier
- `token0`, `token1`: Token addresses
- `fee`: Pool fee (in wei-like units)
- `tick_spacing`: Distance between ticks

### `pool_states`
Current state of each pool:
- `pool_key_id`: Reference to pool_keys
- `tick`: Current price tick
- `sqrt_ratio`: Square root of price ratio
- `liquidity`: Current active liquidity

### `tokens`
Token metadata and prices:
- `address`: Token contract address
- `symbol`: Token ticker (e.g., ETH, USDC)
- `decimals`: Token decimals
- `current_price_usd`: Current USD price

### `pool_tvl`
Total value locked per pool:
- `pool_key_id`: Reference to pool_keys
- `tvl_usd`: Total value in USD

### `per_pool_per_tick_liquidity`
Liquidity distribution across ticks:
- `pool_key_id`: Reference to pool_keys
- `tick`: Tick position
- `liquidity_delta`: Change in liquidity at this tick

## Slippage Calculation

### Simple Estimation (Current Implementation)
For quick approximation, we use:

```typescript
slippage ≈ (amountIn / poolTVL) * 100 + feePercentage
```

This provides:
- **Fast calculation** (no complex math)
- **Reasonable approximation** for small trades
- **Conservative estimates** (tends to overestimate)

### Advanced Calculation (Available but not used)
The `lib/slippage.ts` file includes a full concentrated liquidity simulation:

1. Start at current tick/price
2. Calculate swap within current tick range
3. Cross ticks as needed, updating liquidity
4. Track cumulative output
5. Calculate price impact

This is more accurate but computationally expensive.

## API Endpoints

### `GET /api/pools/slippage`
Returns all pools with slippage estimates.

**Response:**
```json
{
  "pools": [
    {
      "poolKeyId": "1",
      "token0Symbol": "ETH",
      "token1Symbol": "USDC",
      "token0Price": 2000,
      "token1Price": 1,
      "fee": "3000000000000000",
      "tvlUsd": 1000000,
      "slippage1000": 0.1,
      "slippage5000": 0.5,
      "slippage10000": 1.0
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "count": 1
}
```

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database

# Optional
CHAIN_ID=starknet-mainnet  # Filter by chain ID
```

### Database Connection
The connection pool is configured in `lib/database.ts`:
- Max 20 connections
- 30s idle timeout
- 2s connection timeout

## Performance Optimizations

1. **Database Indexing**: Queries use indexed columns (pool_key_id, chain_id)
2. **Data Limiting**: Returns top 100 pools by TVL
3. **Client-side Caching**: 30s revalidation on API routes
4. **Auto-refresh**: Dashboard refreshes every 60s

## Extending the Dashboard

### Adding More Swap Amounts
Edit `app/api/pools/slippage/route.ts`:

```typescript
const slippage2000 = estimateSimpleSlippage(2000, tvl, feeBps);
// Add to response object
```

### Using Advanced Slippage Calculation
Replace `estimateSimpleSlippage` with `calculateSwapOutput`:

```typescript
import { calculateSwapOutput } from '@/lib/slippage';

// Fetch tick liquidities
const ticks = await fetchTickLiquidities(pool.pool_key_id);

// Calculate precise slippage
const result = calculateSwapOutput(
  amountIn,
  true, // zeroForOne
  BigInt(pool.sqrt_ratio),
  pool.current_tick,
  BigInt(pool.liquidity),
  pool.tick_spacing,
  ticks.map(t => ({ tick: t.tick, liquidityDelta: BigInt(t.liquidity_delta) }))
);
```

### Adding Filters
Add UI controls in `app/page.tsx`:
- Minimum TVL filter
- Token type filter (stablecoins, etc.)
- Fee tier filter

## Troubleshooting

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check network connectivity to database
3. Ensure database has required tables
4. Check user permissions

### No Data Showing
1. Verify pools exist in database
2. Check pools have current_price_usd set
3. Verify pool_states has liquidity > 0

### High Slippage Values
- Check pool TVL (low TVL = high slippage)
- Verify token prices are current
- Consider using advanced calculation for accuracy

## Future Enhancements

1. **Historical Slippage Tracking**: Store and chart slippage over time
2. **Route Optimization**: Multi-hop routing for better prices
3. **Real-time Updates**: WebSocket connection for live data
4. **Price Charts**: Integrate TradingView or similar
5. **Alerts**: Notify when slippage exceeds thresholds
6. **Export Data**: CSV/JSON download functionality
