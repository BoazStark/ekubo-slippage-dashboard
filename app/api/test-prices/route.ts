import { NextResponse } from 'next/server';
import { fetchEkuboPrices, adjustApiPriceToUSD } from '@/lib/price-fetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prices = await fetchEkuboPrices();
    
    // Test with known addresses
    const wbtcAddress = "0x" + BigInt("1806018566677800621296032626439935115720767031724401394291089442012247156652").toString(16);
    const ethAddress = "0x" + BigInt("2087021424722619777119509474943472645767659996348769578120564519014510906823").toString(16);
    
    const wbtcRaw = prices.get(wbtcAddress.toLowerCase()) || 0;
    const ethRaw = prices.get(ethAddress.toLowerCase()) || 0;
    
    const wbtcUsd = wbtcRaw > 0 ? adjustApiPriceToUSD(wbtcRaw, 8) : 0;
    const ethUsd = ethRaw > 0 ? adjustApiPriceToUSD(ethRaw, 18) : 0;
    
    return NextResponse.json({
      totalPrices: prices.size,
      wbtc: {
        address: wbtcAddress,
        rawPrice: wbtcRaw,
        usdPrice: wbtcUsd,
        found: wbtcRaw > 0
      },
      eth: {
        address: ethAddress,
        rawPrice: ethRaw,
        usdPrice: ethUsd,
        found: ethRaw > 0
      },
      samplePrices: Array.from(prices.entries()).slice(0, 5).map(([addr, price]) => ({
        address: addr,
        price: price
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
