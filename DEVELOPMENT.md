# Development Guide

## 🛠️ Development Setup

### Initial Setup
```bash
cd /Users/boazk/repo/slippage-dashboard
npm install
cp .env.example .env.local
# Edit .env.local with your database credentials
npm run dev
```

### Development Server
- Development URL: http://localhost:3000
- API endpoint: http://localhost:3000/api/pools/slippage
- Hot reload enabled (changes auto-refresh)

## 🏗️ Project Structure Explained

### `/app` Directory (Next.js App Router)
```
app/
├── api/                      # API routes (backend)
│   └── pools/
│       └── slippage/
│           └── route.ts      # GET endpoint for pool data
├── globals.css               # Global CSS + Tailwind
├── layout.tsx                # Root layout wrapper
└── page.tsx                  # Main dashboard page (client component)
```

### `/lib` Directory (Utilities)
```
lib/
├── database.ts               # PostgreSQL queries
├── slippage.ts               # Slippage calculation algorithms
└── utils.ts                  # Formatting and helper functions
```

## 📝 Code Conventions

### TypeScript
- **Strict mode** enabled
- Always define interfaces for API responses
- Use descriptive variable names
- Add JSDoc comments for exported functions

### React Components
- Use **functional components** with hooks
- Client components: `'use client'` directive
- Server components: default (no directive needed)
- Keep components focused (single responsibility)

### Styling
- **Tailwind CSS** for all styling
- Use dark mode variants: `dark:bg-gray-800`
- Responsive design: `md:flex-row`
- Consistent spacing: `p-4`, `mb-6`, etc.

## 🔧 Common Development Tasks

### Adding a New API Route
1. Create file: `app/api/[name]/route.ts`
2. Export async `GET`, `POST`, etc. functions
3. Return `NextResponse.json(data)`
4. Add error handling

Example:
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'message' }, { status: 500 });
  }
}
```

### Modifying Database Queries
Edit `lib/database.ts`:
```typescript
export async function fetchNewData() {
  const pool = getPool();
  const query = `SELECT ... FROM ...`;
  const result = await pool.query(query);
  return result.rows;
}
```

### Adding New UI Components
Create in `app/components/` (create folder if needed):
```typescript
// app/components/PoolCard.tsx
export function PoolCard({ pool }: { pool: Pool }) {
  return <div>...</div>;
}
```

Import in page:
```typescript
import { PoolCard } from './components/PoolCard';
```

### Modifying Slippage Calculation
Edit `lib/slippage.ts`:
- `estimateSimpleSlippage()`: Quick approximation
- `calculateSwapOutput()`: Advanced concentrated liquidity simulation

### Adding Environment Variables
1. Add to `.env.example`
2. Add to `.env.local` (your local copy)
3. Access in code: `process.env.VARIABLE_NAME`
4. Document in README.md

## 🧪 Testing

### Manual Testing
```bash
npm run dev
# Open http://localhost:3000
# Test all features manually
```

### Database Connection Test
```typescript
// Create test file: lib/test-connection.ts
import { getPool } from './database';

async function testConnection() {
  const pool = getPool();
  const result = await pool.query('SELECT NOW()');
  console.log('Connected:', result.rows[0]);
}
```

### API Testing
```bash
# Test API endpoint directly
curl http://localhost:3000/api/pools/slippage
```

## 🐛 Debugging

### Enable Verbose Logging
Add to `lib/database.ts`:
```typescript
console.log('Query:', query);
console.log('Result:', result.rows);
```

### Check Database Connection
```bash
# In terminal
psql $DATABASE_URL
# Run test query
SELECT COUNT(*) FROM pool_keys;
```

### React DevTools
- Install React DevTools browser extension
- Inspect component state and props
- Profile performance

### Next.js Debug Mode
```bash
NODE_OPTIONS='--inspect' npm run dev
# Open chrome://inspect in Chrome
```

## 📊 Database Schema Reference

### Key Tables
```sql
-- Pool configuration
pool_keys (pool_key_id, token0, token1, fee, tick_spacing)

-- Current pool state
pool_states (pool_key_id, tick, sqrt_ratio, liquidity)

-- Token metadata
tokens (address, symbol, decimals, current_price_usd)

-- Pool TVL
pool_tvl (pool_key_id, tvl_usd)

-- Liquidity distribution
per_pool_per_tick_liquidity (pool_key_id, tick, liquidity_delta)
```

### Useful Queries
```sql
-- Get all pools with prices
SELECT pk.*, ps.*, t0.symbol, t1.symbol, ptv.tvl_usd
FROM pool_keys pk
JOIN pool_states ps ON ps.pool_key_id = pk.pool_key_id
JOIN tokens t0 ON t0.address = pk.token0
JOIN tokens t1 ON t1.address = pk.token1
LEFT JOIN pool_tvl ptv ON ptv.pool_key_id = pk.pool_key_id
WHERE ps.liquidity > 0;
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `DATABASE_URL` securely (use connection pooling)
- Consider read-only database user
- Use environment-specific values

### Hosting Options
- **Vercel**: `vercel deploy` (recommended for Next.js)
- **Railway**: Connect to GitHub, auto-deploy
- **Docker**: Create Dockerfile, deploy anywhere

### Performance Optimization
1. Enable Next.js caching
2. Use database connection pooling
3. Add Redis for API caching (optional)
4. Optimize queries with proper indexes

## 🔍 Code Review Checklist

Before committing:
- [ ] TypeScript compiles without errors
- [ ] All functions have proper types
- [ ] API errors are handled gracefully
- [ ] UI is responsive on mobile
- [ ] No console.log statements left in
- [ ] Comments added for complex logic
- [ ] Environment variables documented

## 📚 Useful Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

### PostgreSQL
- [node-postgres](https://node-postgres.com/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

### Ekubo Protocol
- [Ekubo Docs](https://docs.ekubo.org/)
- Concentrated liquidity math (Uniswap V3 whitepaper)

## 🤝 Contributing Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Commit with clear message: `git commit -m "Add: new feature description"`
4. Push and create pull request
5. Review and merge

## 💡 Ideas for Contributions

- Add historical slippage charts
- Implement advanced filtering options
- Create mobile-optimized views
- Add export to CSV functionality
- Integrate with wallet for live trading
- Add unit tests
- Improve error handling
- Add loading skeletons
- Implement pagination for large pool lists
- Add dark/light theme toggle

---

Happy coding! 🎉
