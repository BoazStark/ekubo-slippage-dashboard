// Test database connection
const { Pool } = require('pg');

async function testConnection() {
  console.log('Testing database connection...\n');
  
  const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];
  
  if (!DATABASE_URL) {
    console.error('❌ Error: No DATABASE_URL provided');
    console.log('\nUsage: node test-db-connection.js "postgresql://user:pass@host:port/db"');
    process.exit(1);
  }
  
  console.log('Connection string:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('ssl=true') || DATABASE_URL.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : false,
  });
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('   Server time:', result.rows[0].now);
    
    // Test pool_keys table
    console.log('\n2. Testing pool_keys table...');
    const poolKeys = await pool.query('SELECT COUNT(*) FROM pool_keys');
    console.log('✅ pool_keys table exists');
    console.log('   Total pools:', poolKeys.rows[0].count);
    
    // Test erc20_tokens table
    console.log('\n3. Testing erc20_tokens table...');
    const tokens = await pool.query('SELECT COUNT(*) FROM erc20_tokens');
    console.log('✅ erc20_tokens table exists');
    console.log('   Total tokens:', tokens.rows[0].count);
    
    // Test pool_states table
    console.log('\n4. Testing pool_states table...');
    const poolStates = await pool.query('SELECT COUNT(*) FROM pool_states');
    console.log('✅ pool_states table exists');
    console.log('   Total pool states:', poolStates.rows[0].count);
    
    // Test erc20_tokens_usd_prices table
    console.log('\n5. Testing erc20_tokens_usd_prices table...');
    const prices = await pool.query('SELECT COUNT(*) FROM erc20_tokens_usd_prices');
    console.log('✅ erc20_tokens_usd_prices table exists');
    console.log('   Total price records:', prices.rows[0].count);
    
    // Test pool_tvl table
    console.log('\n6. Testing pool_tvl table...');
    const tvl = await pool.query('SELECT COUNT(*) FROM pool_tvl');
    console.log('✅ pool_tvl table exists');
    console.log('   Total TVL records:', tvl.rows[0].count);
    
    // Test a sample query like the dashboard uses
    console.log('\n7. Testing sample dashboard query...');
    const sampleQuery = `
      WITH latest_prices AS (
        SELECT DISTINCT ON (chain_id, token_address)
          chain_id,
          token_address,
          value as price_usd
        FROM erc20_tokens_usd_prices
        ORDER BY chain_id, token_address, timestamp DESC
      )
      SELECT COUNT(*) as pools_with_prices
      FROM pool_keys pk
      INNER JOIN pool_states ps ON ps.pool_key_id = pk.pool_key_id
      LEFT JOIN erc20_tokens t0 ON t0.token_address = pk.token0 AND t0.chain_id = pk.chain_id
      LEFT JOIN erc20_tokens t1 ON t1.token_address = pk.token1 AND t1.chain_id = pk.chain_id
      LEFT JOIN latest_prices p0 ON p0.token_address = pk.token0 AND p0.chain_id = pk.chain_id
      LEFT JOIN latest_prices p1 ON p1.token_address = pk.token1 AND p1.chain_id = pk.chain_id
      WHERE ps.liquidity > 0
        AND p0.price_usd IS NOT NULL
        AND p1.price_usd IS NOT NULL
        AND p0.price_usd > 0
        AND p1.price_usd > 0
    `;
    const sample = await pool.query(sampleQuery);
    console.log('✅ Dashboard query successful');
    console.log('   Pools with prices and liquidity:', sample.rows[0].pools_with_prices);
    
    console.log('\n✅ All tests passed! Database is ready for Vercel deployment.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
