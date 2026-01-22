// Test Ekubo price API
const STARKNET_MAINNET_USDC = "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const API_ENDPOINT = "https://starknet-mainnet-quoter-api.ekubo.org";

async function testPrices() {
  try {
    const url = `${API_ENDPOINT}/prices/${STARKNET_MAINNET_USDC}`;
    console.log(`Fetching from: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Total prices: ${data.prices.length}\n`);
    
    // Find WBTC and ETH
    const wbtcAddress = "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3c5d3c18e3c6c6d3e8c"; // Common WBTC address
    const ethAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"; // Common ETH address
    
    // Also try the addresses from the pool
    const poolWbtc = "1806018566677800621296032626439935115720767031724401394291089442012247156652";
    const poolEth = "2087021424722619777119509474943472645767659996348769578120564519014510906823";
    
    function normalizeAddress(address) {
      if (typeof address === "string") {
        if (address.startsWith("0x")) {
          return address.toLowerCase();
        }
        return "0x" + BigInt(address).toString(16);
      }
      return "0x" + address.toString(16);
    }
    
    const poolWbtcHex = normalizeAddress(poolWbtc);
    const poolEthHex = normalizeAddress(poolEth);
    
    console.log(`Looking for WBTC: ${poolWbtcHex}`);
    console.log(`Looking for ETH: ${poolEthHex}\n`);
    
    const wbtcPrice = data.prices.find(p => normalizeAddress(p.token) === poolWbtcHex);
    const ethPrice = data.prices.find(p => normalizeAddress(p.token) === poolEthHex);
    
    if (wbtcPrice) {
      console.log(`WBTC found:`);
      console.log(`  Raw API price: ${wbtcPrice.price}`);
      console.log(`  Adjusted (18 dec): ${wbtcPrice.price * Math.pow(10, 18 - 6)}`);
      console.log(`  Adjusted (8 dec): ${wbtcPrice.price * Math.pow(10, 8 - 6)}`);
    } else {
      console.log(`WBTC not found in API response`);
      // Show first few prices to see format
      console.log(`\nFirst 5 prices:`);
      data.prices.slice(0, 5).forEach(p => {
        console.log(`  ${normalizeAddress(p.token)}: ${p.price}`);
      });
    }
    
    if (ethPrice) {
      console.log(`\nETH found:`);
      console.log(`  Raw API price: ${ethPrice.price}`);
      console.log(`  Adjusted (18 dec): ${ethPrice.price * Math.pow(10, 18 - 6)}`);
    } else {
      console.log(`\nETH not found in API response`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

testPrices();
