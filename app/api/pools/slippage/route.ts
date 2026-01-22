import { NextResponse } from 'next/server';
import { fetchPoolsData } from '@/lib/database';
import { estimateSimpleSlippage } from '@/lib/slippage';
import { fetchEkuboPrices, adjustApiPriceToUSD } from '@/lib/price-fetcher';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

interface PoolWithSlippage {
  poolKeyId: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Address: string;
  token1Address: string;
  token0Price: number;
  token1Price: number;
  fee: string;
  feePercent: number;
  tickSpacing: number;
  currentTick: number;
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

export async function GET() {
  try {
    // Fetch fresh prices from Ekubo API
    console.log('Fetching prices from Ekubo API...');
    const ekuboPrices = await fetchEkuboPrices();
    console.log(`Fetched ${ekuboPrices.size} prices from Ekubo API`);
    
    // Helper to normalize address for lookup
    const normalizeAddress = (address: string | bigint): string => {
      if (typeof address === "string") {
        if (address.startsWith("0x")) {
          return address.toLowerCase();
        }
        return "0x" + BigInt(address).toString(16);
      }
      return "0x" + address.toString(16);
    };
    
    const pools = await fetchPoolsData();
    console.log(`Processing ${pools.length} pools`);
    
    const poolsWithSlippage: PoolWithSlippage[] = pools.map(pool => {
      // Get fresh prices from Ekubo API
      const token0AddressHex = normalizeAddress(pool.token0);
      const token1AddressHex = normalizeAddress(pool.token1);
      
      const token0RawPrice = ekuboPrices.get(token0AddressHex) || 0;
      const token1RawPrice = ekuboPrices.get(token1AddressHex) || 0;
      
      // Log if prices not found (for debugging)
      if (token0RawPrice === 0 && ekuboPrices.size > 0) {
        console.warn(`Price not found for token0 ${pool.token0_symbol} (${token0AddressHex})`);
      }
      if (token1RawPrice === 0 && ekuboPrices.size > 0) {
        console.warn(`Price not found for token1 ${pool.token1_symbol} (${token1AddressHex})`);
      }
      
      // Convert raw API prices to USD prices
      let token0PriceUsd: number;
      let token1PriceUsd: number;
      let usingApiPrices = false;
      
      if (token0RawPrice > 0 && token1RawPrice > 0) {
        // Use API prices
        token0PriceUsd = adjustApiPriceToUSD(token0RawPrice, pool.token0_decimals);
        token1PriceUsd = adjustApiPriceToUSD(token1RawPrice, pool.token1_decimals);
        usingApiPrices = true;
      } else {
        // Fallback to database prices
        token0PriceUsd = pool.token0_price_usd || 0;
        token1PriceUsd = pool.token1_price_usd || 0;
        console.warn(`Using database prices for ${pool.token0_symbol}/${pool.token1_symbol} - API prices not found`);
      }
      
      // Log price comparison for first few pools
      if (pools.indexOf(pool) < 3) {
        console.log(`Pool ${pools.indexOf(pool) + 1}: ${pool.token0_symbol}/${pool.token1_symbol}`);
        console.log(`  Token0 (${pool.token0_symbol}): ${usingApiPrices ? 'API' : 'DB'} price=${token0PriceUsd.toFixed(2)}, raw=${token0RawPrice}`);
        console.log(`  Token1 (${pool.token1_symbol}): ${usingApiPrices ? 'API' : 'DB'} price=${token1PriceUsd.toFixed(2)}, raw=${token1RawPrice}`);
      }
      
      // Recalculate TVL using fresh prices and actual balances
      let tvl = 0;
      if (pool.balance0 && pool.balance1 && token0PriceUsd > 0 && token1PriceUsd > 0) {
        const balance0Decimal = Number(pool.balance0) / Math.pow(10, pool.token0_decimals);
        const balance1Decimal = Number(pool.balance1) / Math.pow(10, pool.token1_decimals);
        const token0ValueUsd = balance0Decimal * token0PriceUsd;
        const token1ValueUsd = balance1Decimal * token1PriceUsd;
        tvl = token0ValueUsd + token1ValueUsd;
      } else {
        // Fallback to database TVL if we don't have fresh prices or balances
        tvl = Number(pool.tvl_usd) || 0;
      }
      
      // Calculate fee percentage: (fee / fee_denominator) * 100
      const feeNum = Number(pool.fee);
      const feeDenom = Number(pool.fee_denominator);
      const feePercent = (feeNum / feeDenom) * 100;
      const feeBps = feePercent * 100; // Convert to basis points (0.3% = 30 bps)
      
      // Calculate slippage for different USD amounts
      const slippage1000 = estimateSimpleSlippage(1000, tvl, feeBps);
      const slippage5000 = estimateSimpleSlippage(5000, tvl, feeBps);
      const slippage10000 = estimateSimpleSlippage(10000, tvl, feeBps);
      const slippage50000 = estimateSimpleSlippage(50000, tvl, feeBps);
      
      // Calculate liquidity needed for each amount (±0.5% band = 1% range = 100x efficiency)
      const calculateLiquidityNeeded = (amount: number) => {
        const targetSlippage = 0.5;
        const targetPriceImpact = targetSlippage - feePercent;
        
        if (targetPriceImpact <= 0) return 0; // Fee too high, can't achieve excellent
        
        const requiredEffectiveTVL = (amount * 100) / targetPriceImpact;
        const additionalEffectiveTVL = Math.max(0, requiredEffectiveTVL - tvl);
        const capitalEfficiency = 100; // ±0.5% band = 100x efficiency
        const liquidityNeeded = additionalEffectiveTVL / capitalEfficiency;
        
        return liquidityNeeded;
      };
      
      return {
        poolKeyId: pool.pool_key_id,
        token0Symbol: pool.token0_symbol || 'Unknown',
        token1Symbol: pool.token1_symbol || 'Unknown',
        token0Address: pool.token0,
        token1Address: pool.token1,
        token0Price: token0PriceUsd,
        token1Price: token1PriceUsd,
        fee: pool.fee,
        feePercent: feePercent,
        tickSpacing: pool.tick_spacing,
        currentTick: pool.current_tick,
        tvlUsd: tvl,
        slippage1000: Math.min(slippage1000, 100),
        slippage5000: Math.min(slippage5000, 100),
        slippage10000: Math.min(slippage10000, 100),
        slippage50000: Math.min(slippage50000, 100),
        liquidityNeeded1000: calculateLiquidityNeeded(1000),
        liquidityNeeded5000: calculateLiquidityNeeded(5000),
        liquidityNeeded10000: calculateLiquidityNeeded(10000),
        liquidityNeeded50000: calculateLiquidityNeeded(50000),
      };
    });
    
    // Sort by TVL descending
    poolsWithSlippage.sort((a, b) => b.tvlUsd - a.tvlUsd);
    
    return NextResponse.json({
      pools: poolsWithSlippage,
      timestamp: new Date().toISOString(),
      count: poolsWithSlippage.length
    });
  } catch (error) {
    console.error('Error fetching pools with slippage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pool data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
