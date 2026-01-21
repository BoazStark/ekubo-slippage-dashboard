/**
 * Utility functions for formatting and displaying data
 */

/**
 * Format a number as USD currency
 */
export function formatUSD(value: number, decimals: number = 2): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 3): string {
  if (value >= 100) return '≥100%';
  if (value < 0.001) return '<0.001%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a fee value from Ekubo format to percentage
 */
export function formatFee(fee: string): string {
  const feeBps = Number(BigInt(fee) / BigInt(10_000_000_000_000)) / 100;
  return `${feeBps.toFixed(2)}%`;
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get color class for slippage value
 */
export function getSlippageColor(slippage: number): string {
  if (slippage < 0.5) return 'text-green-600 dark:text-green-400';
  if (slippage < 2) return 'text-yellow-600 dark:text-yellow-400';
  if (slippage < 5) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get background color class for slippage badge
 */
export function getSlippageBgColor(slippage: number): string {
  if (slippage < 0.5) return 'bg-green-100 dark:bg-green-900/30';
  if (slippage < 2) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (slippage < 5) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

/**
 * Calculate time ago from timestamp
 */
export function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Validate database URL format
 */
export function isValidDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {
    return false;
  }
}
