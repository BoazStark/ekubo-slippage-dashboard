# Ekubo Pool Slippage Dashboard - User Manual

## 📖 Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Tab](#dashboard-tab)
4. [Simulate Tab](#simulate-tab)
5. [Understanding Slippage](#understanding-slippage)
6. [Exporting Data](#exporting-data)
7. [Use Cases](#use-cases)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

### What is the Ekubo Pool Slippage Dashboard?

The Ekubo Pool Slippage Dashboard is a tool that helps you understand the price impact (slippage) when trading on Ekubo, a decentralized exchange (DEX) on Starknet.

**Key Features:**
- 📊 View slippage estimates for all Ekubo pools
- 🎯 Simulate custom swap amounts
- 💡 Get liquidity recommendations
- 📥 Export data to CSV
- 🔄 Auto-updates every 60 seconds

### Who is this for?

- **Traders**: Check slippage before executing large swaps
- **Liquidity Providers**: Identify pools that need more liquidity
- **Researchers**: Analyze liquidity distribution across Ekubo
- **Developers**: Access pool data for integration

---

## Getting Started

### Accessing the Dashboard

Simply visit the URL where the dashboard is deployed (e.g., `https://your-app.vercel.app`)

### Navigation

The dashboard has two main tabs:
- **Dashboard**: Overview of all pools with slippage data
- **Simulate**: Test custom swap amounts on specific pools

---

## Dashboard Tab

### Overview

The Dashboard shows a table of all active Ekubo pools, sorted by Total Value Locked (TVL) from highest to lowest.

![Dashboard Example](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Understanding the Table

Each row represents one liquidity pool with the following columns:

| Column | Description |
|--------|-------------|
| **Pool** | Token pair (e.g., ETH/USDC) with current prices |
| **TVL** | Total Value Locked in USD - total capital in the pool |
| **Fee** | Pool swap fee percentage (e.g., 0.30%) |
| **$1K Slippage** | Expected slippage for a $1,000 swap |
| **$5K Slippage** | Expected slippage for a $5,000 swap |
| **$10K Slippage** | Expected slippage for a $10,000 swap |
| **$50K Slippage** | Expected slippage for a $50,000 swap |

### Slippage Color Coding

Slippage cells are color-coded for easy interpretation:

- 🟢 **Green** (< 0.5%): **Excellent** - Very low slippage, ideal for trading
- 🟡 **Yellow** (0.5-1%): **Good** - Low slippage, acceptable for most trades
- 🟠 **Orange** (1-5%): **Moderate** - Noticeable slippage, consider for smaller amounts
- 🔴 **Red** (> 5%): **High** - Significant slippage, pool may lack liquidity

### Filtering Pools

#### Search by Token
Type in the search box to filter pools by token name:
- Search "ETH" → Shows all pools containing ETH
- Search "USDC" → Shows all pools containing USDC

#### Filter by Minimum TVL
Set a minimum TVL to hide smaller pools:
1. Enter a value in the "Min TVL (USD)" field
2. Or click quick filter buttons: $10K, $50K, $100K, $500K, $1M
3. Click "Clear" to remove the filter

### Refreshing Data

- Data auto-refreshes every **60 seconds**
- Click the **"Refresh"** button to update immediately
- Last update time is shown at the top

---

## Simulate Tab

### Overview

The Simulate tab lets you test custom swap amounts on any pool to see:
- Expected slippage
- How much liquidity is needed to improve slippage

### How to Use

#### Step 1: Select a Pool
Click the dropdown menu and choose a pool. The menu shows:
- Token pair names
- Current TVL for each pool

#### Step 2: Enter Swap Amount
You can:
- Type any USD amount in the input field
- Or click quick amount buttons: $100, $500, $1K, $5K, $10K, $50K

#### Step 3: View Results

The simulator shows:

**1. Pool Details Box** (gray background)
- Token pair and current prices
- Total Value Locked (TVL)
- Pool fee percentage

**2. Estimated Slippage** (large colored box)
- Shows the slippage percentage
- Color-coded by severity (green/yellow/orange/red)
- Label: Excellent, Good, Moderate, or High

**3. Liquidity Recommendation** (blue box)
This appears if slippage is ≥ 0.5% and shows:
- **Amount to add**: How much capital is needed
- **Range**: ±0.5% from current price (narrow concentrated position)
- **Price bounds**: Exact price range where liquidity should be added
- **Capital efficiency**: How much more efficient concentrated liquidity is (~100x)
- **Current vs. Target price impact**: Before and after comparison

### Understanding Concentrated Liquidity

**What does "±0.5% band" mean?**

Instead of spreading liquidity across all prices (like Uniswap V2), Ekubo allows you to concentrate liquidity in a narrow price range:

- **Full-range liquidity**: Active at all prices (capital inefficient)
- **Concentrated liquidity (±0.5%)**: Only active within ±0.5% of current price
- **Efficiency**: ~100x more capital efficient

**Example:**
- To achieve excellent slippage, you could add:
  - $10M in full-range liquidity, OR
  - $100K in a ±0.5% concentrated position

This is why the recommendation shows much smaller amounts than you might expect!

---

## Understanding Slippage

### What is Slippage?

**Slippage** is the difference between the expected price and the actual execution price of your trade.

**Example:**
- You want to buy ETH at $2,000
- Due to limited liquidity, you actually pay $2,020
- Slippage = 1% (you paid 1% more than expected)

### Why Does Slippage Happen?

1. **Pool Liquidity**: Less liquidity = higher slippage
2. **Trade Size**: Larger trades = higher slippage
3. **Pool Fee**: Fee is included in total slippage
4. **Market Volatility**: Prices may move during your trade

### What is Good Slippage?

| Slippage | Rating | Recommendation |
|----------|--------|----------------|
| < 0.5% | 🟢 Excellent | Trade freely |
| 0.5-1% | 🟡 Good | Generally acceptable |
| 1-5% | 🟠 Moderate | Consider splitting the trade |
| > 5% | 🔴 High | Use a different pool or add liquidity |

### Total Slippage Calculation

```
Total Slippage = Price Impact + Pool Fee

Where:
- Price Impact = Effect of your trade size on the price
- Pool Fee = Transaction fee (e.g., 0.30%)
```

**Example:**
- Your $10K trade creates 0.5% price impact
- Pool fee is 0.30%
- Total slippage = 0.5% + 0.30% = **0.80%**

---

## Exporting Data

### How to Export

1. Go to the **Dashboard** tab
2. (Optional) Apply filters to show only pools you're interested in
3. Click the green **"Export CSV"** button
4. A CSV file will download with name: `ekubo-pools-YYYY-MM-DD.csv`

### CSV File Contents

The exported file includes these columns for each pool:

**Basic Information:**
- Pool name (e.g., ETH/USDC)
- Token0 Symbol
- Token1 Symbol
- Token0 Price
- Token1 Price
- TVL (USD)
- Fee (%)

**Slippage Data:**
- $1K Slippage (%)
- $1K Liquidity Needed (±0.5% band)
- $5K Slippage (%)
- $5K Liquidity Needed (±0.5% band)
- $10K Slippage (%)
- $10K Liquidity Needed (±0.5% band)
- $50K Slippage (%)
- $50K Liquidity Needed (±0.5% band)

### What Can You Do With The CSV?

- **Excel/Google Sheets**: Open in spreadsheet software for analysis
- **Sort & Filter**: Find pools meeting specific criteria
- **Charts**: Create visualizations of slippage vs. TVL
- **Reports**: Share data with team members
- **Historical Tracking**: Compare exports over time to see changes

---

## Use Cases

### 1. Planning a Large Trade

**Scenario**: You want to swap $50K of USDC for ETH

**Steps:**
1. Go to Dashboard tab
2. Find ETH/USDC pools
3. Check the **$50K Slippage** column
4. Choose a pool with green or yellow slippage
5. Execute your trade on Ekubo with confidence

### 2. Providing Liquidity

**Scenario**: You want to earn fees by providing liquidity

**Steps:**
1. Go to Dashboard tab
2. Filter for pools with high TVL (e.g., > $100K)
3. Look for pools with orange/red slippage (they need liquidity)
4. Go to Simulate tab
5. Select the pool and enter typical trade amounts
6. Check the "Liquidity Needed" recommendation
7. Decide if you want to add liquidity in the recommended ±0.5% range

### 3. Market Research

**Scenario**: You're researching liquidity depth across Ekubo

**Steps:**
1. Go to Dashboard tab
2. Export CSV
3. Open in Excel/Google Sheets
4. Analyze:
   - Which pools have best liquidity (lowest slippage)?
   - How much capital is needed to improve slippage?
   - Which token pairs are most liquid?

### 4. Risk Assessment

**Scenario**: You're building a trading bot and need slippage data

**Steps:**
1. Export CSV from Dashboard
2. Filter pools by your criteria (e.g., TVL > $500K)
3. Check slippage columns for your typical trade sizes
4. Use the data in your bot's risk management logic

---

## Frequently Asked Questions

### General Questions

**Q: How often is the data updated?**  
A: The dashboard automatically refreshes every 60 seconds. You can also click "Refresh" to update immediately.

**Q: What blockchain is this for?**  
A: This dashboard shows data for Ekubo pools on **Starknet**.

**Q: Is the data real-time?**  
A: Yes, the data comes directly from the Ekubo indexer database and reflects the current state of all pools.

**Q: Can I use this dashboard for other DEXs?**  
A: No, this dashboard is specifically designed for Ekubo protocol on Starknet.

### Slippage Questions

**Q: Why does my actual slippage differ from the estimate?**  
A: Several reasons:
- Pool liquidity changed between your check and trade execution
- Other traders executed large swaps
- The calculation is a simplified approximation
- You may have split your trade across multiple pools

**Q: What's a safe slippage tolerance?**  
A: Generally:
- Small trades (< $1K): 1-2% is reasonable
- Medium trades ($1K-$10K): 0.5-1% recommended
- Large trades (> $10K): Aim for < 0.5% (excellent)

**Q: Why do some pools have 0% slippage?**  
A: Very small trade amounts relative to pool size result in negligible slippage (< 0.001%), displayed as ~0%.

**Q: Can slippage be negative?**  
A: No, you always pay at least the pool fee. Slippage is the adverse price movement from your trade.

### Liquidity Questions

**Q: What does "±0.5% band" mean?**  
A: It's a concentrated liquidity range:
- Your liquidity is only active when the price stays within ±0.5% of the current price
- Much more capital efficient than spreading liquidity across all prices
- Earns more fees per dollar of capital

**Q: Why is the "Liquidity Needed" amount so small?**  
A: The calculation assumes you're adding concentrated liquidity in a ±0.5% band, which is ~100x more efficient than full-range liquidity.

**Q: Should I add the recommended liquidity amount?**  
A: Consider these factors:
- **Profitability**: Will the fees earned justify the capital?
- **Risk**: Price may move outside your ±0.5% range
- **Opportunity cost**: Could you earn more elsewhere?
- **Commitment**: Are you comfortable managing the position?

### Technical Questions

**Q: How is slippage calculated?**  
A: Simplified formula:
```
Slippage = (Swap Amount / Pool TVL) × 100 + Fee %
```

For concentrated liquidity positions:
```
Liquidity Needed = (Required TVL - Current TVL) / 100
```
(100x efficiency for ±0.5% band)

**Q: What if a pool has no price data?**  
A: Pools without valid token prices are filtered out. They won't appear in the dashboard.

**Q: Why do some pools show ≥100% slippage?**  
A: The pool has very low liquidity relative to the trade size. The slippage display is capped at 100%.

**Q: Can I access historical slippage data?**  
A: Currently no, but you can export CSVs regularly and compare them over time.

### Data Export Questions

**Q: What format is the exported file?**  
A: CSV (Comma-Separated Values) - opens in Excel, Google Sheets, Numbers, etc.

**Q: Does the CSV include all pools?**  
A: It includes only the pools currently visible (respects your search/filter settings).

**Q: Can I automate CSV exports?**  
A: Not through the UI, but developers can access the API endpoint: `/api/pools/slippage`

**Q: How do I open the CSV file?**  
A: 
- **Windows**: Right-click → Open with → Excel
- **Mac**: Double-click (opens in Numbers/Excel)
- **Google Sheets**: File → Import → Upload

---

## Tips & Best Practices

### For Traders

✅ **DO:**
- Check slippage before large trades
- Compare multiple pools for the same token pair
- Split very large trades into smaller chunks
- Set appropriate slippage tolerance in your wallet
- Verify pool addresses on Ekubo.org

❌ **DON'T:**
- Trade large amounts in high slippage pools (red)
- Assume slippage is fixed (it changes with liquidity)
- Ignore the pool fee in your calculations

### For Liquidity Providers

✅ **DO:**
- Focus on pools with high volume and moderate slippage
- Use concentrated positions (±0.5%) for capital efficiency
- Monitor your position regularly
- Consider impermanent loss risk
- Understand the token pair you're providing for

❌ **DON'T:**
- Add liquidity without checking current slippage
- Forget to account for gas costs
- Set ranges too narrow (may go out of range quickly)
- Provide liquidity to unknown/suspicious tokens

### For Researchers

✅ **DO:**
- Export data regularly for historical tracking
- Compare pools by TVL, slippage, and volume
- Look for patterns in liquidity distribution
- Share findings with the community

❌ **DON'T:**
- Rely solely on TVL (check slippage too)
- Ignore pool fees in your analysis
- Assume all pools are equally liquid

---

## Support & Resources

### Need Help?

- **Ekubo Documentation**: [https://docs.ekubo.org](https://docs.ekubo.org)
- **Ekubo Discord**: Join for community support
- **GitHub Issues**: Report bugs or request features

### Learn More

- **Concentrated Liquidity**: [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
- **Starknet**: [https://starknet.io](https://starknet.io)
- **DeFi Education**: Understanding AMMs and slippage

---

## Glossary

**AMM (Automated Market Maker)**: A protocol that uses mathematical formulas to price assets and enable trading without traditional order books.

**Concentrated Liquidity**: A liquidity provision method where capital is allocated to specific price ranges instead of across all prices.

**DEX (Decentralized Exchange)**: A peer-to-peer marketplace where cryptocurrency traders transact directly without a centralized intermediary.

**Liquidity**: The amount of tokens available in a pool for trading.

**Pool**: A smart contract holding two tokens that traders can swap between.

**Price Impact**: The effect a trade has on the market price of an asset.

**Slippage**: The difference between the expected price and the actual execution price of a trade.

**TVL (Total Value Locked)**: The total value of all assets deposited in a pool, denominated in USD.

**Tick**: The smallest price increment in a concentrated liquidity pool.

---

## Version History

- **v1.0.0** (January 2026): Initial release
  - Dashboard with slippage estimates for $1K, $5K, $10K, $50K
  - Simulation tab with custom amounts
  - CSV export with liquidity recommendations
  - ±0.5% concentrated liquidity calculations

---

**Last Updated**: January 2026  
**Dashboard Version**: 1.0.0
