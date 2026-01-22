/**
 * Price Fetcher for Ekubo Protocol
 * Fetches fresh token prices from Ekubo Quoter API
 */

const STARKNET_MAINNET_USDC = "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
// Try both endpoints - the quoter-api might be deprecated
const API_ENDPOINT_QUOTER = "https://starknet-mainnet-quoter-api.ekubo.org";
const API_ENDPOINT_MAIN = "https://starknet-mainnet-api.ekubo.org";

export interface TokenPrice {
  token: string;
  price: number;
}

export interface PriceResponse {
  prices: TokenPrice[];
}

/**
 * Normalize token address to hex format
 */
function normalizeAddress(address: string | bigint): string {
  if (typeof address === "string") {
    if (address.startsWith("0x")) {
      return address.toLowerCase();
    }
    return "0x" + BigInt(address).toString(16);
  }
  return "0x" + address.toString(16);
}

/**
 * Fetch all prices from Ekubo API
 */
export async function fetchEkuboPrices(): Promise<Map<string, number>> {
  const maxRetries = 3;
  const timeout = 10000; // 10 seconds
  
  // Try both endpoints - quoter-api first (legacy), then main API
  const endpoints = [
    { url: `${API_ENDPOINT_QUOTER}/prices/${STARKNET_MAINNET_USDC}`, name: 'quoter-api' },
    { url: `${API_ENDPOINT_MAIN}/prices/${STARKNET_MAINNET_USDC}`, name: 'main-api' }
  ];
  
  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching prices from ${endpoint.name}: ${endpoint.url} (attempt ${attempt}/${maxRetries})`);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(endpoint.url, {
          headers: {
            Accept: "application/json",
            'User-Agent': 'Ekubo-Slippage-Dashboard/1.0',
          },
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Body: ${errorText.substring(0, 200)}`);
      }

      const data: PriceResponse = await response.json();
      console.log(`✅ Received ${data.prices?.length || 0} prices from API`);
      
      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error(`Invalid API response format. Expected prices array, got: ${JSON.stringify(data).substring(0, 200)}`);
      }

      const priceMap = new Map<string, number>();

      for (const tokenPrice of data.prices) {
        const normalizedAddress = normalizeAddress(tokenPrice.token);
        priceMap.set(normalizedAddress, tokenPrice.price);
      }

        console.log(`✅ Mapped ${priceMap.size} prices successfully from ${endpoint.name}`);
        return priceMap;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isLastEndpoint = endpoint === endpoints[endpoints.length - 1];
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`⏱️ Request timeout on ${endpoint.name} (attempt ${attempt}/${maxRetries})`);
        } else if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo'))) {
          console.warn(`🌐 DNS/Network error on ${endpoint.name} (attempt ${attempt}/${maxRetries}): ${errorMsg}`);
          // If DNS fails, skip to next endpoint immediately
          if (isLastAttempt && !isLastEndpoint) {
            console.log(`⏭️ Skipping to next endpoint...`);
            break;
          }
        } else {
          console.warn(`❌ API fetch failed on ${endpoint.name} (attempt ${attempt}/${maxRetries}): ${errorMsg}`);
        }
        
        if (isLastAttempt && isLastEndpoint) {
          console.error("❌ All endpoints and attempts failed. Falling back to database prices (may be stale).");
          console.error("Full error:", error);
          return new Map();
        }
        
        // Wait before retry (exponential backoff)
        if (!isLastAttempt) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  return new Map();
}

/**
 * Adjust raw API price to USD price
 * 
 * Ekubo API returns prices as: "How much quote token (USDC) for 1 unit of this token"
 * The price is in terms of the quote token's smallest unit.
 * 
 * Formula: price_USD = api_price × 10^(token_decimals - quote_decimals)
 * 
 * Example:
 * - ETH (18 decimals) with api_price = 3.04e-9
 * - USD price = 3.04e-9 × 10^(18-6) = 3.04e-9 × 10^12 = 3,040 USD
 */
export function adjustApiPriceToUSD(
  rawApiPrice: number,
  tokenDecimals: number,
  quoteDecimals: number = 6 // USDC has 6 decimals
): number {
  if (!isFinite(rawApiPrice) || rawApiPrice <= 0) {
    return 0;
  }

  // Handle very small or very large prices (likely errors)
  if (rawApiPrice < 1e-30 || rawApiPrice > 1e30) {
    return 0;
  }

  // Formula from Ekubo codebase: price_USD = api_price × 10^(token_decimals - quote_decimals)
  const adjustment = Math.pow(10, tokenDecimals - quoteDecimals);
  const usdPrice = rawApiPrice * adjustment;
  
  return usdPrice;
}
