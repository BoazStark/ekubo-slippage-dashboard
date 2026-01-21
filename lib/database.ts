import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export interface PoolData {
  pool_key_id: string;
  chain_id: string;
  token0: string;
  token1: string;
  token0_symbol: string;
  token1_symbol: string;
  token0_decimals: number;
  token1_decimals: number;
  token0_price_usd: number | null;
  token1_price_usd: number | null;
  fee: string;
  fee_denominator: string;
  tick_spacing: number;
  current_tick: number;
  sqrt_ratio: string;
  liquidity: string;
  tvl_usd: number | null;
}

export async function fetchPoolsData(): Promise<PoolData[]> {
  const pool = getPool();
  
  const query = `
    WITH latest_prices AS (
      SELECT DISTINCT ON (chain_id, token_address)
        chain_id,
        token_address,
        value as price_usd
      FROM erc20_tokens_usd_prices
      ORDER BY chain_id, token_address, timestamp DESC
    )
    SELECT 
      pk.pool_key_id,
      pk.chain_id,
      pk.token0,
      pk.token1,
      t0.token_symbol as token0_symbol,
      t1.token_symbol as token1_symbol,
      t0.token_decimals as token0_decimals,
      t1.token_decimals as token1_decimals,
      p0.price_usd as token0_price_usd,
      p1.price_usd as token1_price_usd,
      pk.fee,
      pk.fee_denominator,
      pk.tick_spacing,
      ps.tick as current_tick,
      ps.sqrt_ratio,
      ps.liquidity,
      COALESCE(
        (ptv.balance0 / POWER(10, t0.token_decimals)) * p0.price_usd +
        (ptv.balance1 / POWER(10, t1.token_decimals)) * p1.price_usd,
        0
      ) as tvl_usd
    FROM pool_keys pk
    INNER JOIN pool_states ps ON ps.pool_key_id = pk.pool_key_id
    LEFT JOIN erc20_tokens t0 ON t0.token_address = pk.token0 AND t0.chain_id = pk.chain_id
    LEFT JOIN erc20_tokens t1 ON t1.token_address = pk.token1 AND t1.chain_id = pk.chain_id
    LEFT JOIN latest_prices p0 ON p0.token_address = pk.token0 AND p0.chain_id = pk.chain_id
    LEFT JOIN latest_prices p1 ON p1.token_address = pk.token1 AND p1.chain_id = pk.chain_id
    LEFT JOIN pool_tvl ptv ON ptv.pool_key_id = pk.pool_key_id
    WHERE ps.liquidity > 0
      AND p0.price_usd IS NOT NULL
      AND p1.price_usd IS NOT NULL
      AND p0.price_usd > 0
      AND p1.price_usd > 0
      AND ptv.balance0 IS NOT NULL
      AND ptv.balance1 IS NOT NULL
      AND (
        (ptv.balance0 / POWER(10, t0.token_decimals)) * p0.price_usd +
        (ptv.balance1 / POWER(10, t1.token_decimals)) * p1.price_usd
      ) < 1000000000
    ORDER BY tvl_usd DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

export interface TickLiquidity {
  tick: number;
  liquidity_delta: string;
}

export async function fetchTickLiquidities(poolKeyId: string): Promise<TickLiquidity[]> {
  const pool = getPool();
  
  const query = `
    SELECT 
      tick,
      liquidity_delta
    FROM per_pool_per_tick_liquidity
    WHERE pool_key_id = $1
    ORDER BY tick ASC
  `;
  
  const result = await pool.query(query, [poolKeyId]);
  return result.rows;
}
