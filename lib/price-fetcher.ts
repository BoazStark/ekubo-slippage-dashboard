/**
 * Price Fetcher for Ekubo Protocol
 * Fetches fresh token prices from Ekubo Quoter API
 */

const STARKNET_MAINNET_USDC = "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const API_ENDPOINT = "https://starknet-mainnet-quoter-api.ekubo.org";

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
  try {
    const url = `${API_ENDPOINT}/prices/${STARKNET_MAINNET_USDC}`;
    console.log(`Fetching prices from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Remove next.js cache config for server-side fetch
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}. Body: ${errorText}`);
    }

    const data: PriceResponse = await response.json();
    console.log(`Received ${data.prices?.length || 0} prices from API`);
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error(`Invalid API response format. Expected prices array, got: ${JSON.stringify(data).substring(0, 200)}`);
    }

    const priceMap = new Map<string, number>();

    for (const tokenPrice of data.prices) {
      const normalizedAddress = normalizeAddress(tokenPrice.token);
      priceMap.set(normalizedAddress, tokenPrice.price);
    }

    console.log(`Mapped ${priceMap.size} prices`);
    return priceMap;
  } catch (error) {
    console.error("Failed to fetch prices from Ekubo API:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return new Map();
  }
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
