/**
 * CoinGecko Price Fetcher
 * Fallback price source when Ekubo API is unavailable
 */

// Map of token symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  'WBTC': 'wrapped-bitcoin',
  'ETH': 'ethereum',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'STRK': 'starknet',
  'LORDS': 'lords',
  'UNI': 'uniswap',
  'LUSD': 'liquity-usd',
  'rETH': 'rocket-pool-eth',
  'wstETH': 'wrapped-steth',
  'wstETH-legacy': 'wrapped-steth',
  'tBTC': 'tbtc',
  'SolvBTC': 'solvbtc',
  'mRe7BTC': 'mre7btc',
  'xWBTC': 'wrapped-bitcoin',
  'xLBTC': 'lbtc',
  'LBTC': 'lbtc',
  'eBTC': 'ebtc',
  'xSTRK': 'starknet',
  'kSTRK': 'starknet',
  'xtBTC': 'tbtc',
  'xsBTC': 'solvbtc',
  'USN': 'usn',
  'sUSN': 'usn',
  'USDU': 'usdu',
  'CASH': 'cash',
  'EKUBO': 'ekubo',
  'TICKET': 'ticket',
  'DOG': 'dog',
  'ZEND': 'zend',
  'NSTR': 'nstr',
  'SOL': 'solana',
  'ALF': 'alf',
  'STAM': 'stam',
  'SLINK': 'slink',
  'TDGN5': 'tdgn5',
  'TDGN8': 'tdgn8',
  'TDGN21': 'tdgn21',
  'SURVIVOR': 'survivor',
  'SCHIZODIO': 'schizodio',
  'ROZ': 'roz',
  'TWC': 'twc',
  'CRM': 'crm',
  'DAIv0': 'dai',
  'rUSDC-stark': 'usd-coin',
  'USDC.e': 'usd-coin',
};

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetch prices from CoinGecko for multiple tokens
 */
export async function fetchCoinGeckoPrices(symbols: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  
  // Get unique CoinGecko IDs
  const ids = new Set<string>();
  const symbolToId = new Map<string, string>();
  
  for (const symbol of symbols) {
    const id = COINGECKO_IDS[symbol];
    if (id) {
      ids.add(id);
      symbolToId.set(symbol, id);
    }
  }
  
  if (ids.size === 0) {
    return priceMap;
  }
  
  try {
    const idsList = Array.from(ids).join(',');
    const url = `${COINGECKO_API}/simple/price?ids=${idsList}&vs_currencies=usd`;
    
    console.log(`Fetching prices from CoinGecko for ${ids.size} tokens...`);
    
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data: Record<string, { usd: number }> = await response.json();
    
    // Map back to symbols
    for (const [symbol, id] of symbolToId.entries()) {
      if (data[id]?.usd) {
        priceMap.set(symbol, data[id].usd);
      }
    }
    
    console.log(`✅ Fetched ${priceMap.size} prices from CoinGecko`);
    return priceMap;
  } catch (error) {
    console.error('Failed to fetch prices from CoinGecko:', error);
    return priceMap;
  }
}

/**
 * Get price for a single token symbol
 */
export async function getCoinGeckoPrice(symbol: string): Promise<number | null> {
  const prices = await fetchCoinGeckoPrices([symbol]);
  return prices.get(symbol) || null;
}
