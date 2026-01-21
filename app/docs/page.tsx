'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function Docs() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete guide to using the Ekubo Slippage Dashboard
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <a
            href="/"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent"
          >
            Dashboard
          </a>
          <a
            href="/simulate"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent"
          >
            Simulate
          </a>
          <a
            href="/docs"
            className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400"
          >
            Docs
          </a>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 prose prose-blue dark:prose-invert max-w-none">
          
          {/* Table of Contents */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold mb-3 mt-0">📑 Table of Contents</h2>
            <ul className="space-y-1 mb-0">
              <li><a href="#overview" className="text-blue-600 dark:text-blue-400 hover:underline">Overview</a></li>
              <li><a href="#getting-started" className="text-blue-600 dark:text-blue-400 hover:underline">Getting Started</a></li>
              <li><a href="#dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard Tab</a></li>
              <li><a href="#simulate" className="text-blue-600 dark:text-blue-400 hover:underline">Simulate Tab</a></li>
              <li><a href="#understanding" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Slippage</a></li>
              <li><a href="#liquidity" className="text-blue-600 dark:text-blue-400 hover:underline">Liquidity Recommendations</a></li>
              <li><a href="#troubleshooting" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting</a></li>
            </ul>
          </div>

          {/* Overview */}
          <section id="overview">
            <h2>🎯 Overview</h2>
            <p>
              The <strong>Ekubo Slippage Dashboard</strong> is a tool for analyzing and simulating slippage across Ekubo liquidity pools on Starknet. It helps traders assess potential price impacts and provides liquidity providers with recommendations for optimal capital deployment.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold mb-2">✨ Key Features:</p>
              <ul>
                <li><strong>Real-time pool monitoring</strong> with automatic updates every 60 seconds</li>
                <li><strong>Multi-amount slippage estimates</strong> ($1K, $5K, $10K, $50K)</li>
                <li><strong>Advanced filtering</strong> by TVL and token symbols</li>
                <li><strong>Custom simulation</strong> with precise tick-by-tick calculations</li>
                <li><strong>Liquidity recommendations</strong> for achieving target slippage</li>
                <li><strong>CSV export</strong> for external analysis</li>
                <li><strong>Dark mode</strong> for comfortable viewing</li>
              </ul>
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started">
            <h2>🚀 Getting Started</h2>
            <p>The dashboard consists of three main sections accessible via the top navigation:</p>
            <ol>
              <li><strong>Dashboard</strong> - Overview of all pools with slippage estimates</li>
              <li><strong>Simulate</strong> - Custom slippage calculator for specific pools and amounts</li>
              <li><strong>Docs</strong> - This documentation page</li>
            </ol>
            <p>Toggle between <strong>light</strong> and <strong>dark mode</strong> using the button in the top-right corner (☀️/🌙).</p>
          </section>

          {/* Dashboard Tab */}
          <section id="dashboard">
            <h2>📊 Dashboard Tab</h2>
            
            <h3>Overview Table</h3>
            <p>The main table displays all Ekubo pools sorted by TVL (Total Value Locked) in descending order. Each row shows:</p>
            <ul>
              <li><strong>Pool</strong> - Token pair (e.g., ETH/USDC)</li>
              <li><strong>TVL</strong> - Total Value Locked in USD</li>
              <li><strong>Fee</strong> - Pool swap fee percentage</li>
              <li><strong>$1K, $5K, $10K, $50K Slippage</strong> - Estimated slippage for each swap amount</li>
              <li><strong>Liquidity Needed (columns)</strong> - Capital required to achieve &lt;0.5% slippage with concentrated liquidity (±0.5% range)</li>
            </ul>

            <h3>Color-Coded Slippage</h3>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded border-2 border-green-400">
                <div className="font-semibold text-green-800 dark:text-green-200">🟢 Excellent (&lt;0.5%)</div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-0">Minimal price impact, ideal for trading</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border-2 border-yellow-400">
                <div className="font-semibold text-yellow-800 dark:text-yellow-200">🟡 Good (0.5% - 1%)</div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-0">Acceptable for most trades</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded border-2 border-orange-400">
                <div className="font-semibold text-orange-800 dark:text-orange-200">🟠 Moderate (1% - 5%)</div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-0">Noticeable impact, consider smaller trades</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded border-2 border-red-400">
                <div className="font-semibold text-red-800 dark:text-red-200">🔴 High (&gt;5%)</div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-0">Significant impact, use caution</p>
              </div>
            </div>

            <h3>Search and Filters</h3>
            <ul>
              <li><strong>Search</strong> - Type token symbols (e.g., "ETH", "USDC") to filter pools</li>
              <li><strong>Min TVL Filter</strong> - Set minimum TVL threshold with custom input or quick buttons ($10K, $100K, $1M, $10M)</li>
              <li>The pool count updates dynamically based on active filters</li>
            </ul>

            <h3>Export to CSV</h3>
            <p>Click the <strong>📥 Export to CSV</strong> button to download all visible pool data, including slippage estimates and liquidity recommendations, for analysis in Excel or other tools.</p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-2">ℹ️ About Dashboard Estimates</p>
              <p className="mb-0">Slippage values are <strong>simplified approximations</strong> using the formula: (Swap Amount / Pool TVL) × 100 + Fee. For precise calculations based on actual concentrated liquidity data, use the <strong>Simulate</strong> tab.</p>
            </div>
          </section>

          {/* Simulate Tab */}
          <section id="simulate">
            <h2>🎯 Simulate Tab</h2>
            
            <h3>Custom Slippage Calculator</h3>
            <p>The Simulate tab allows you to:</p>
            <ol>
              <li><strong>Select any pool</strong> from the dropdown</li>
              <li><strong>Enter a custom swap amount</strong> in USD (or use quick buttons: $100, $500, $1K, $5K, $10K, $50K)</li>
              <li><strong>Choose calculation method</strong> (Precise or Fast Estimate)</li>
              <li><strong>View detailed slippage results</strong></li>
              <li><strong>Get liquidity recommendations</strong> for achieving target slippage</li>
            </ol>

            <h3>Calculation Methods</h3>
            <div className="space-y-4 my-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎯 Precise Mode (Recommended)</div>
                <p className="mb-0 text-sm">Uses actual <strong>tick-by-tick concentrated liquidity data</strong> from the pool. Simulates the exact path your trade would take through different price ranges and liquidity levels. Most accurate but slightly slower.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">⚡ Fast Estimate</div>
                <p className="mb-0 text-sm">Quick approximation using the formula (Swap Amount / Pool TVL) × 100 + Fee. Assumes uniform liquidity distribution. Faster but less accurate.</p>
              </div>
            </div>

            <h3>Liquidity Recommendation Settings</h3>
            <p>Configure parameters for capital efficiency calculations:</p>
            <ul>
              <li><strong>Target Slippage (%)</strong> - Default: 0.5%. The slippage level you want to achieve.</li>
              <li><strong>Liquidity Range (±%)</strong> - Default: ±0.5%. Width of your concentrated liquidity position around the current price.</li>
            </ul>
            <p>A tighter range (e.g., ±0.5%) provides higher capital efficiency (~100x) but requires active management. A wider range (e.g., ±2%) is more passive but less efficient (~25x).</p>

            <h3>Understanding Results</h3>
            <p>After entering a swap amount, you'll see:</p>
            <ul>
              <li><strong>Estimated Slippage</strong> - Large number with color-coded classification</li>
              <li><strong>PRECISE badge</strong> - Appears when using precise mode</li>
              <li><strong>Liquidity Recommendation</strong> - Shows capital needed, price bounds, and capital efficiency for your settings</li>
            </ul>
          </section>

          {/* Understanding Slippage */}
          <section id="understanding">
            <h2>📚 Understanding Slippage</h2>
            
            <h3>What is Slippage?</h3>
            <p>
              <strong>Slippage</strong> is the difference between the expected price of a trade and the actual executed price. It occurs because executing your trade moves the market price, especially in pools with limited liquidity.
            </p>

            <h3>Components of Slippage</h3>
            <ol>
              <li><strong>Price Impact</strong> - Your trade consumes liquidity, moving the price. Larger trades = larger impact.</li>
              <li><strong>Trading Fees</strong> - Pool swap fees (e.g., 0.3%, 1%) are added to your cost.</li>
            </ol>
            <p><strong>Total Slippage = Price Impact + Trading Fee</strong></p>

            <h3>Factors Affecting Slippage</h3>
            <ul>
              <li><strong>Pool TVL</strong> - Higher TVL = lower slippage</li>
              <li><strong>Trade Size</strong> - Larger trades = higher slippage</li>
              <li><strong>Liquidity Distribution</strong> - Concentrated liquidity around current price = lower slippage</li>
              <li><strong>Pool Fee</strong> - Higher fees = higher total slippage</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold mb-2">⚠️ Important Note</p>
              <p className="mb-0">Slippage estimates are based on <strong>current pool state</strong>. Actual slippage may vary if:</p>
              <ul className="mb-0">
                <li>Pool liquidity changes before your trade</li>
                <li>Other traders execute transactions simultaneously</li>
                <li>Prices move significantly between estimation and execution</li>
              </ul>
            </div>
          </section>

          {/* Liquidity Recommendations */}
          <section id="liquidity">
            <h2>💧 Liquidity Recommendations</h2>
            
            <h3>How It Works</h3>
            <p>
              The dashboard calculates how much capital you would need to add to a pool (using <strong>concentrated liquidity</strong>) to reduce slippage to your target level (default: 0.5%).
            </p>

            <h3>Concentrated Liquidity Benefits</h3>
            <ul>
              <li><strong>Capital Efficiency</strong> - Concentrate your liquidity in a narrow price range for 10-1000x efficiency vs full-range</li>
              <li><strong>Lower Capital Requirement</strong> - Achieve the same slippage reduction with much less capital</li>
              <li><strong>Higher Fee Earnings</strong> - More of your capital is actively used when trades occur</li>
            </ul>

            <h3>Example Calculation</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="font-mono text-sm mb-2"><strong>Pool:</strong> ETH/USDC with $1M TVL</p>
              <p className="font-mono text-sm mb-2"><strong>Swap:</strong> $10,000 USDC → ETH</p>
              <p className="font-mono text-sm mb-2"><strong>Current Slippage:</strong> ~1.3% (1% price impact + 0.3% fee)</p>
              <p className="font-mono text-sm mb-2"><strong>Target:</strong> 0.5% total slippage</p>
              <p className="font-mono text-sm mb-4"><strong>Range:</strong> ±0.5% (100x efficiency)</p>
              <p className="font-mono text-sm mb-0"><strong>Capital Needed:</strong> ~$10,000 in a ±0.5% range</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 mb-0">(vs ~$1M needed for full-range liquidity)</p>
            </div>

            <h3>Interpretation</h3>
            <ul>
              <li><strong>$0 needed</strong> - Pool already has excellent liquidity for this trade size</li>
              <li><strong>Cannot achieve target</strong> - Pool fee is already ≥ your target slippage</li>
              <li><strong>Specific amount</strong> - Capital required in concentrated position to reach target</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-2">💡 Pro Tip</p>
              <p className="mb-0">Adjust the <strong>Liquidity Range</strong> parameter in the Simulate tab to see how different concentration levels affect capital requirements. Tighter ranges = higher efficiency but require more active management.</p>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting">
            <h2>🔧 Troubleshooting</h2>
            
            <h3>Common Issues</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">"Failed to fetch pool data"</h4>
                <p>The dashboard couldn't load pool data from the database.</p>
                <ul>
                  <li>Check your internet connection</li>
                  <li>Refresh the page</li>
                  <li>If persistent, the database may be temporarily unavailable</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Precise mode falls back to estimate</h4>
                <p>Some pools may not have complete tick liquidity data.</p>
                <ul>
                  <li>This is normal for newly created or low-liquidity pools</li>
                  <li>Use Fast Estimate mode or choose a different pool</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Slippage seems too high/low</h4>
                <p>Remember that estimates are based on current pool state.</p>
                <ul>
                  <li>Use Precise mode in the Simulate tab for accuracy</li>
                  <li>Consider pool fee in your calculations</li>
                  <li>Very large trades naturally have higher slippage</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Pool not showing in search</h4>
                <ul>
                  <li>Check your Min TVL filter - may be set too high</li>
                  <li>Clear the search box to see all pools</li>
                  <li>Pool may not have sufficient liquidity or price data</li>
                </ul>
              </div>
            </div>

            <h3>Need Help?</h3>
            <p>For additional support or to report issues:</p>
            <ul>
              <li>Check the <a href="https://github.com/BoazStark/ekubo-slippage-dashboard" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
              <li>Open an issue for bugs or feature requests</li>
              <li>Review the technical documentation in the repo</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Ekubo Slippage Dashboard</strong> | Built for the Starknet ecosystem
            </p>
            <p className="mt-2">
              Data updates automatically every 60 seconds | Version 1.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
