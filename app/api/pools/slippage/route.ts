import { NextResponse } from 'next/server';
import { fetchPoolsData } from '@/lib/database';
import { estimateSimpleSlippage } from '@/lib/slippage';

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
    const pools = await fetchPoolsData();
    
    const poolsWithSlippage: PoolWithSlippage[] = pools.map(pool => {
      const tvl = Number(pool.tvl_usd) || 0;
      
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
        token0Price: pool.token0_price_usd || 0,
        token1Price: pool.token1_price_usd || 0,
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
