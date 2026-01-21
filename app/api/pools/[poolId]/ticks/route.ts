import { NextResponse } from 'next/server';
import { fetchTickLiquidities } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { poolId: string } }
) {
  try {
    const poolKeyId = params.poolId;
    
    if (!poolKeyId) {
      return NextResponse.json(
        { error: 'Pool ID is required' },
        { status: 400 }
      );
    }
    
    const ticks = await fetchTickLiquidities(poolKeyId);
    
    return NextResponse.json({
      poolKeyId,
      ticks: ticks.map(t => ({
        tick: t.tick,
        liquidityDelta: t.liquidity_delta.toString()
      })),
      count: ticks.length
    });
  } catch (error) {
    console.error('Error fetching tick liquidities:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tick liquidity data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
