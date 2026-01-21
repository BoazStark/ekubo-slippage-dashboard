'use client';

import { useEffect, useState } from 'react';
import { formatUSD, formatPercent } from '@/lib/utils';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface Pool {
  poolKeyId: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Price: number;
  token1Price: number;
  feePercent: number;
  tvlUsd: number;
}

interface ApiResponse {
  pools: Pool[];
}

export default function Simulate() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [swapAmount, setSwapAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(true);
  const [slippage, setSlippage] = useState<number | null>(null);
  const [targetSlippage, setTargetSlippage] = useState<string>('0.5');
  const [rangeWidth, setRangeWidth] = useState<string>('0.5');

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('/api/pools/slippage');
        if (response.ok) {
          const data: ApiResponse = await response.json();
          setPools(data.pools);
          if (data.pools.length > 0) {
            setSelectedPoolId(data.pools[0].poolKeyId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  const selectedPool = pools.find(p => p.poolKeyId === selectedPoolId);

  useEffect(() => {
    if (selectedPool && swapAmount) {
      const amount = parseFloat(swapAmount);
      if (!isNaN(amount) && amount > 0) {
        // Simple slippage calculation: (amountIn / poolTVL) * 100 + fee
        const priceImpact = (amount / selectedPool.tvlUsd) * 100;
        const totalSlippage = priceImpact + selectedPool.feePercent;
        setSlippage(Math.min(totalSlippage, 100));
      } else {
        setSlippage(null);
      }
    }
  }, [selectedPool, swapAmount]);

  // Calculate required concentrated liquidity for target slippage
  // Uses configurable band around current price for concentrated liquidity
  const calculateRequiredLiquidity = () => {
    if (!selectedPool || !swapAmount) return null;
    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0) return null;

    const targetSlippageValue = parseFloat(targetSlippage) || 0.5;
    const targetPriceImpact = targetSlippageValue - selectedPool.feePercent;
    
    // If fee is already >= target slippage, we can't reach the target
    if (targetPriceImpact <= 0) {
      return null;
    }

    // For concentrated liquidity with configurable band:
    // Capital efficiency multiplier ≈ 1 / (range width)
    const rangeWidthValue = parseFloat(rangeWidth) || 0.5;
    const rangeWidthDecimal = (rangeWidthValue / 100) * 2; // Convert ±X% to decimal total range
    const capitalEfficiencyMultiplier = 1 / rangeWidthDecimal;
    
    // Calculate required price impact reduction
    // Current price impact = (swapAmount / currentTVL) * 100
    const currentPriceImpact = (amount / selectedPool.tvlUsd) * 100;
    
    // We need to reduce price impact from current to target
    // New price impact with added liquidity: (swapAmount / newTVL) * 100 = targetPriceImpact
    // For concentrated liquidity, the effective TVL is actual TVL * efficiency multiplier (within range)
    
    // Required effective TVL = swapAmount * 100 / targetPriceImpact
    const requiredEffectiveTVL = (amount * 100) / targetPriceImpact;
    
    // Additional effective TVL needed beyond current pool TVL
    const additionalEffectiveTVL = Math.max(0, requiredEffectiveTVL - selectedPool.tvlUsd);
    
    // Convert to actual capital needed in the specified range
    const additionalCapitalNeeded = additionalEffectiveTVL / capitalEfficiencyMultiplier;
    
    // Price bounds for the specified range
    const rangeMultiplier = 1 - (rangeWidthValue / 100);
    const lowerPrice = selectedPool.token0Price * rangeMultiplier;
    const upperPrice = selectedPool.token0Price * (2 - rangeMultiplier);

    return {
      capitalNeeded: additionalCapitalNeeded,
      efficiency: capitalEfficiencyMultiplier,
      rangeWidthPercent: rangeWidthValue,
      lowerPrice,
      upperPrice,
      currentPriceImpact,
      targetPriceImpact,
      targetSlippageValue
    };
  };

  const liquidityCalc = calculateRequiredLiquidity();

  const getSlippageColor = (slippage: number) => {
    if (slippage < 0.5) return 'text-green-600 dark:text-green-400';
    if (slippage < 1) return 'text-yellow-600 dark:text-yellow-400';
    if (slippage < 5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSlippageBackgroundColor = (slippage: number) => {
    if (slippage < 0.5) return 'bg-green-100 dark:bg-green-900/30';
    if (slippage < 1) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (slippage < 5) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getSlippageLabel = (slippage: number) => {
    if (slippage < 0.5) return 'Excellent';
    if (slippage < 1) return 'Good';
    if (slippage < 5) return 'Moderate';
    return 'High';
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Slippage Simulator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Estimate slippage for custom swap amounts
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
            className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400"
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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pools...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Pool Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Pool
              </label>
              <select
                value={selectedPoolId}
                onChange={(e) => setSelectedPoolId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pools.map((pool) => (
                  <option key={pool.poolKeyId} value={pool.poolKeyId}>
                    {pool.token0Symbol} / {pool.token1Symbol} - TVL: {formatUSD(pool.tvlUsd)}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Swap Amount (USD)
              </label>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="Enter amount in USD"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {[100, 500, 1000, 5000, 10000, 50000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSwapAmount(amount.toString())}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    ${amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">
                ⚙️ Liquidity Recommendation Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Target Slippage (%)
                  </label>
                  <input
                    type="number"
                    value={targetSlippage}
                    onChange={(e) => setTargetSlippage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0.01"
                    max="10"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                    Calculate liquidity needed to achieve this slippage
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Liquidity Range (±%)
                  </label>
                  <input
                    type="number"
                    value={rangeWidth}
                    onChange={(e) => setRangeWidth(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                    Width of concentrated liquidity position
                  </p>
                </div>
              </div>
            </div>

            {/* Pool Details */}
            {selectedPool && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pool Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Pool:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedPool.token0Symbol} / {selectedPool.token1Symbol}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">TVL:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {formatUSD(selectedPool.tvlUsd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedPool.feePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Prices:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedPool.token0Price >= 10 ? selectedPool.token0Price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : selectedPool.token0Price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {selectedPool.token1Price >= 10 ? selectedPool.token1Price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : selectedPool.token1Price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slippage Result */}
            {slippage !== null && (
              <div>
                <div className={`p-6 rounded-lg ${getSlippageBackgroundColor(slippage)} border-2 ${slippage < 0.5 ? 'border-green-300 dark:border-green-700' : slippage < 2 ? 'border-yellow-300 dark:border-yellow-700' : slippage < 5 ? 'border-orange-300 dark:border-orange-700' : 'border-red-300 dark:border-red-700'}`}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Estimated Slippage
                    </p>
                    <p className={`text-5xl font-bold ${getSlippageColor(slippage)}`}>
                      {formatPercent(slippage)}
                    </p>
                    <p className={`text-lg font-medium mt-2 ${getSlippageColor(slippage)}`}>
                      {getSlippageLabel(slippage)}
                    </p>
                  </div>
                </div>

                {/* Concentrated Liquidity Recommendation */}
                {liquidityCalc && slippage >= parseFloat(targetSlippage) && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <div className="w-full">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                          💡 Liquidity Recommendation for {liquidityCalc.targetSlippageValue}% Slippage
                        </p>
                        {liquidityCalc.capitalNeeded === 0 ? (
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            ✨ This pool already has sufficient liquidity for {liquidityCalc.targetSlippageValue}% slippage!
                          </p>
                        ) : selectedPool && selectedPool.feePercent >= liquidityCalc.targetSlippageValue ? (
                          <div className="text-sm text-orange-700 dark:text-orange-300">
                            ⚠️ The pool fee ({selectedPool.feePercent.toFixed(2)}%) is already ≥ {liquidityCalc.targetSlippageValue}%, so {liquidityCalc.targetSlippageValue}% slippage cannot be achieved regardless of liquidity added.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Main Recommendation */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-600 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">📊</span>
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                  Add Concentrated Liquidity
                                </p>
                              </div>
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {formatUSD(liquidityCalc.capitalNeeded)}
                              </p>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <p>• <strong>Range:</strong> ±{liquidityCalc.rangeWidthPercent}% from current price ({(liquidityCalc.rangeWidthPercent * 2).toFixed(1)}% total width)</p>
                                <p>• <strong>Price bounds:</strong> {liquidityCalc.lowerPrice >= 10 ? liquidityCalc.lowerPrice.toFixed(0) : liquidityCalc.lowerPrice.toFixed(2)} - {liquidityCalc.upperPrice >= 10 ? liquidityCalc.upperPrice.toFixed(0) : liquidityCalc.upperPrice.toFixed(2)} {selectedPool?.token1Symbol}</p>
                                <p>• <strong>Capital efficiency:</strong> ~{liquidityCalc.efficiency.toFixed(0)}x vs full-range</p>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="bg-blue-100/50 dark:bg-blue-900/30 p-3 rounded text-xs space-y-1">
                              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Position Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-blue-700 dark:text-blue-300">
                                <div>
                                  <span className="text-blue-500 dark:text-blue-400">Current price impact:</span>
                                  <br />
                                  <strong>{liquidityCalc.currentPriceImpact.toFixed(3)}%</strong>
                                </div>
                                <div>
                                  <span className="text-blue-500 dark:text-blue-400">Target price impact:</span>
                                  <br />
                                  <strong>{liquidityCalc.targetPriceImpact.toFixed(3)}%</strong>
                                </div>
                              </div>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                              💡 By concentrating liquidity in a narrow ±{liquidityCalc.rangeWidthPercent}% range, you achieve the same slippage reduction with ~{liquidityCalc.efficiency.toFixed(0)}x less capital than full-range liquidity.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> This is a simplified estimation based on current pool liquidity. 
                Actual slippage may vary depending on the exact execution path and market conditions.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
