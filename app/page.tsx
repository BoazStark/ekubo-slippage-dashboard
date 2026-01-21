'use client';

import { useEffect, useState } from 'react';
import { formatUSD, formatPercent, formatFee, getSlippageColor } from '@/lib/utils';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface Pool {
  poolKeyId: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Price: number;
  token1Price: number;
  fee: string;
  feePercent: number;
  tvlUsd: number;
  slippage1000: number;
  slippage5000: number;
  slippage10000: number;
  slippage50000: number;
  liquidityNeeded1000: number;
  liquidityNeeded5000: number;
  liquidityNeeded10000: number;
  liquidityNeeded50000: number;
}

interface ApiResponse {
  pools: Pool[];
  timestamp: string;
  count: number;
}

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minTVL, setMinTVL] = useState<string>('');

  const fetchPools = async () => {
    try {
      // Don't set loading to true if we already have data (background refresh)
      if (pools.length === 0) {
        setLoading(true);
      }
      const response = await fetch('/api/pools/slippage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pool data');
      }
      
      const data: ApiResponse = await response.json();
      setPools(data.pools);
      setLastUpdate(new Date(data.timestamp).toLocaleString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPools, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.token0Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token1Symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const minTVLValue = parseFloat(minTVL) || 0;
    const matchesTVL = pool.tvlUsd >= minTVLValue;
    
    return matchesSearch && matchesTVL;
  });

  const getFeeBackgroundColor = (feePercent: number) => {
    if (feePercent < 0.5) return 'bg-green-100 dark:bg-green-900/30';
    if (feePercent < 2) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (feePercent < 5) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getSlippageBackgroundColor = (slippage: number) => {
    if (slippage < 0.5) return 'bg-green-100 dark:bg-green-900/30';
    if (slippage < 1) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (slippage < 5) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      'Pool',
      'Token0 Symbol',
      'Token1 Symbol',
      'Token0 Price',
      'Token1 Price',
      'TVL (USD)',
      'Fee (%)',
      '$1K Slippage (%)',
      '$1K Liquidity Needed (±0.5% band)',
      '$5K Slippage (%)',
      '$5K Liquidity Needed (±0.5% band)',
      '$10K Slippage (%)',
      '$10K Liquidity Needed (±0.5% band)',
      '$50K Slippage (%)',
      '$50K Liquidity Needed (±0.5% band)'
    ];

    // Create CSV rows
    const rows = filteredPools.map(pool => [
      `${pool.token0Symbol}/${pool.token1Symbol}`,
      pool.token0Symbol,
      pool.token1Symbol,
      pool.token0Price,
      pool.token1Price,
      pool.tvlUsd,
      pool.feePercent,
      pool.slippage1000,
      pool.liquidityNeeded1000,
      pool.slippage5000,
      pool.liquidityNeeded5000,
      pool.slippage10000,
      pool.liquidityNeeded10000,
      pool.slippage50000,
      pool.liquidityNeeded50000
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ekubo-pools-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ekubo Pool Slippage Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time slippage estimates for Ekubo protocol pools on Starknet
              </p>
              {pools.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Showing {filteredPools.length} {filteredPools.length === 1 ? 'pool' : 'pools'} {searchTerm && `of ${pools.length} total`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/docs"
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm flex items-center gap-2"
              >
                📚 Docs
              </a>
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <a
            href="/"
            className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400"
          >
            Dashboard
          </a>
          <a
            href="/simulate"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent"
          >
            Simulate
          </a>
        </div>

        {/* Color Guide */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Slippage Color Guide:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">&lt; 0.5% (Excellent)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-600 dark:text-gray-400">0.5% - 1% (Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-gray-600 dark:text-gray-400">1% - 5% (Moderate)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600 dark:text-gray-400">&gt; 5% (High)</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pools (e.g., ETH, USDC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-64">
              <input
                type="number"
                placeholder="Min TVL (USD)"
                value={minTVL}
                onChange={(e) => setMinTVL(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1000"
              />
              {minTVL && (
                <div className="mt-1 flex gap-2">
                  {[10000, 50000, 100000, 500000, 1000000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMinTVL(amount.toString())}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {formatUSD(amount)}
                    </button>
                  ))}
                  <button
                    onClick={() => setMinTVL('')}
                    className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-700 dark:text-red-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdate}
              </span>
            )}
            <button
              onClick={exportToCSV}
              disabled={filteredPools.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={fetchPools}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && pools.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pool data...</p>
          </div>
        )}

        {/* Pool Table */}
        {pools.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pool
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      TVL
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      $1K Slippage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      $5K Slippage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      $10K Slippage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      $50K Slippage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPools.map((pool) => (
                    <tr 
                      key={pool.poolKeyId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {pool.token0Symbol} / {pool.token1Symbol}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {pool.token0Price >= 10 ? pool.token0Price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : pool.token0Price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {pool.token1Price >= 10 ? pool.token1Price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : pool.token1Price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatUSD(pool.tvlUsd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {pool.feePercent.toFixed(2)}%
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getSlippageColor(pool.slippage1000)} ${getSlippageBackgroundColor(pool.slippage1000)}`}>
                        {formatPercent(pool.slippage1000)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getSlippageColor(pool.slippage5000)} ${getSlippageBackgroundColor(pool.slippage5000)}`}>
                        {formatPercent(pool.slippage5000)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getSlippageColor(pool.slippage10000)} ${getSlippageBackgroundColor(pool.slippage10000)}`}>
                        {formatPercent(pool.slippage10000)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getSlippageColor(pool.slippage50000)} ${getSlippageBackgroundColor(pool.slippage50000)}`}>
                        {formatPercent(pool.slippage50000)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredPools.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No pools found matching your search.
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">ℹ️ About Slippage Estimates</p>
              <p>Slippage values shown are <strong>simplified approximations</strong> using the formula: (Swap Amount / Pool TVL) × 100 + Fee. These estimates assume uniform liquidity distribution and may differ from actual execution due to concentrated liquidity positioning.</p>
              <p className="mt-2">For more precise calculations based on actual tick-by-tick liquidity data, use the <strong>Simulate</strong> tab.</p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Data updates every 60 seconds automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
