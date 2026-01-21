/**
 * Slippage calculation for Uniswap V3 / Ekubo style concentrated liquidity pools
 */

export interface SlippageResult {
  expectedOutput: bigint;
  priceImpact: number; // percentage
  effectivePrice: number;
  slippageBps: number; // basis points (1 bps = 0.01%)
}

const Q96 = 2n ** 96n;
const Q128 = 2n ** 128n;

/**
 * Convert sqrt price to human-readable price
 * Price = (sqrtPriceX96 / 2^96)^2
 */
export function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const numerator = sqrtPriceX96 * sqrtPriceX96;
  const denominator = Q96 * Q96;
  const price = Number(numerator) / Number(denominator);
  
  // Adjust for token decimals
  const decimalAdjustment = 10 ** (decimals0 - decimals1);
  return price * decimalAdjustment;
}

/**
 * Calculate amount out for a given amount in, considering liquidity across ticks
 */
export function calculateSwapOutput(
  amountIn: bigint,
  zeroForOne: boolean, // true if swapping token0 for token1
  currentSqrtPrice: bigint,
  currentTick: number,
  currentLiquidity: bigint,
  tickSpacing: number,
  tickLiquidities: Array<{ tick: number; liquidityDelta: bigint }>
): SlippageResult {
  let amountInRemaining = amountIn;
  let amountOut = 0n;
  let sqrtPrice = currentSqrtPrice;
  let liquidity = currentLiquidity;
  let tick = currentTick;
  
  const initialPrice = sqrtPriceX96ToPrice(sqrtPrice, 18, 18); // Assuming 18 decimals for calculation
  
  // Sort tick liquidities for efficient traversal
  const sortedTicks = [...tickLiquidities].sort((a, b) => 
    zeroForOne ? b.tick - a.tick : a.tick - b.tick
  );
  
  let tickIndex = sortedTicks.findIndex(t => 
    zeroForOne ? t.tick <= tick : t.tick > tick
  );
  
  // Simulate the swap across ticks
  while (amountInRemaining > 0n && liquidity > 0n) {
    // Get next tick boundary
    let nextTick: number;
    let nextLiquidityDelta = 0n;
    
    if (tickIndex >= 0 && tickIndex < sortedTicks.length) {
      nextTick = sortedTicks[tickIndex].tick;
      nextLiquidityDelta = sortedTicks[tickIndex].liquidityDelta;
    } else {
      // No more ticks, use a far boundary
      nextTick = zeroForOne ? tick - 10000 : tick + 10000;
    }
    
    const nextSqrtPrice = tickToSqrtPrice(nextTick);
    
    // Calculate how much can be swapped in current tick range
    const { amountInUsed, amountOutReceived, newSqrtPrice } = computeSwapStep(
      sqrtPrice,
      nextSqrtPrice,
      liquidity,
      amountInRemaining,
      zeroForOne
    );
    
    amountInRemaining -= amountInUsed;
    amountOut += amountOutReceived;
    sqrtPrice = newSqrtPrice;
    
    // Cross the tick if we reached it
    if (sqrtPrice === nextSqrtPrice) {
      liquidity = zeroForOne 
        ? liquidity - nextLiquidityDelta 
        : liquidity + nextLiquidityDelta;
      tick = zeroForOne ? nextTick - tickSpacing : nextTick;
      tickIndex++;
    }
    
    // Safety: prevent infinite loops
    if (tickIndex > 1000) break;
  }
  
  const finalPrice = sqrtPriceX96ToPrice(sqrtPrice, 18, 18);
  const priceImpact = ((finalPrice - initialPrice) / initialPrice) * 100;
  const effectivePrice = Number(amountOut) / Number(amountIn);
  const slippageBps = Math.abs(priceImpact) * 100; // Convert to basis points
  
  return {
    expectedOutput: amountOut,
    priceImpact: Math.abs(priceImpact),
    effectivePrice,
    slippageBps
  };
}

/**
 * Compute a single swap step within a tick range
 */
function computeSwapStep(
  sqrtPriceCurrent: bigint,
  sqrtPriceTarget: bigint,
  liquidity: bigint,
  amountRemaining: bigint,
  zeroForOne: boolean
): { amountInUsed: bigint; amountOutReceived: bigint; newSqrtPrice: bigint } {
  if (liquidity === 0n) {
    return { amountInUsed: 0n, amountOutReceived: 0n, newSqrtPrice: sqrtPriceCurrent };
  }
  
  // Simplified calculation (in production, use exact formulas from Uniswap V3 whitepaper)
  const sqrtPriceDelta = zeroForOne 
    ? sqrtPriceCurrent - sqrtPriceTarget
    : sqrtPriceTarget - sqrtPriceCurrent;
  
  // Calculate max amount that can be swapped to target price
  const amountInMax = zeroForOne
    ? (liquidity * sqrtPriceDelta) / sqrtPriceCurrent
    : (liquidity * sqrtPriceDelta) / Q96;
  
  let amountInUsed: bigint;
  let newSqrtPrice: bigint;
  
  if (amountRemaining >= amountInMax) {
    // We cross the tick
    amountInUsed = amountInMax;
    newSqrtPrice = sqrtPriceTarget;
  } else {
    // We don't cross the tick
    amountInUsed = amountRemaining;
    
    // Calculate new sqrt price based on amount in
    if (zeroForOne) {
      const numerator = liquidity * Q96;
      const denominator = liquidity + (amountInUsed * Q96) / sqrtPriceCurrent;
      newSqrtPrice = numerator / denominator;
    } else {
      newSqrtPrice = sqrtPriceCurrent + (amountInUsed * Q96) / liquidity;
    }
  }
  
  // Calculate amount out
  const amountOutReceived = zeroForOne
    ? (liquidity * (sqrtPriceCurrent - newSqrtPrice)) / Q96
    : (liquidity * (newSqrtPrice - sqrtPriceCurrent)) / newSqrtPrice;
  
  return { amountInUsed, amountOutReceived, newSqrtPrice };
}

/**
 * Convert tick to sqrt price
 */
function tickToSqrtPrice(tick: number): bigint {
  // sqrtPrice = 1.0001^(tick/2) * 2^96
  const price = Math.pow(1.0001, tick / 2);
  return BigInt(Math.floor(price * Number(Q96)));
}

/**
 * Simple slippage estimation using constant product formula (for quick approximation)
 */
export function estimateSimpleSlippage(
  amountInUSD: number,
  tvlUSD: number,
  feeBps: number = 30 // 0.3% default fee
): number {
  if (tvlUSD === 0) return 100; // 100% slippage if no liquidity
  
  // Simplified: price impact ≈ (amountIn / tvl) * 100
  const priceImpact = (amountInUSD / tvlUSD) * 100;
  
  // Add fee impact
  const feeImpact = feeBps / 100;
  
  return priceImpact + feeImpact;
}
