# Quick Start Guide - Ekubo Slippage Dashboard

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Node.js 18+ installed
- Access to Ekubo indexer PostgreSQL database

### Installation Steps

1. **Navigate to the directory**
   ```bash
   cd /Users/boazk/repo/slippage-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure database connection**
   
   Create a `.env.local` file:
   ```bash
   echo 'DATABASE_URL=postgresql://user:password@host:port/ekubo_indexer' > .env.local
   ```
   
   Replace with your actual database credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Visit: http://localhost:3000

### Alternative: Use Setup Script

```bash
./setup.sh
```

## 📊 What You'll See

The dashboard displays:
- All active Ekubo pools sorted by TVL
- Token pair names and current prices
- Pool fee tiers
- **Slippage estimates** for three swap sizes:
  - $1,000 USD
  - $5,000 USD  
  - $10,000 USD

### Color-Coded Slippage
- 🟢 Green: < 0.5% (Excellent liquidity)
- 🟡 Yellow: 0.5-2% (Good liquidity)
- 🟠 Orange: 2-5% (Moderate liquidity)
- 🔴 Red: > 5% (Lower liquidity)

## 🔧 Configuration

### Connect to Different Database

Edit `.env.local`:
```env
DATABASE_URL=postgresql://newuser:newpass@newhost:5432/database_name
```

### Filter by Chain ID

Add to `.env.local`:
```env
CHAIN_ID=starknet-mainnet
```

## 📖 Learn More

- **README.md**: Overview and features
- **TECHNICAL.md**: Architecture and API documentation
- **lib/slippage.ts**: Calculation algorithms

## 🐛 Troubleshooting

### "Failed to fetch pool data"
- Check DATABASE_URL is correct
- Verify database is accessible
- Ensure required tables exist

### No pools showing
- Database might be empty
- Check token prices are populated
- Verify pools have liquidity > 0

### Port already in use
```bash
npm run dev -- -p 3001  # Use different port
```

## 🎯 Next Steps

1. Customize swap amounts in `app/api/pools/slippage/route.ts`
2. Add filters for specific token pairs
3. Implement historical tracking
4. Set up alerts for high slippage

## 📞 Support

For issues or questions:
- Check the TECHNICAL.md documentation
- Review database schema requirements
- Verify Ekubo indexer is running and synced
