import { formatUSD, formatPercent, formatFee, getSlippageColor, getSlippageBgColor, shortenAddress, timeAgo, isValidDatabaseUrl } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatUSD', () => {
    it('should format small amounts', () => {
      expect(formatUSD(123.45)).toBe('$123.45');
      expect(formatUSD(0.01)).toBe('$0.01');
    });

    it('should format thousands with K suffix', () => {
      expect(formatUSD(1000)).toBe('$1.00K');
      expect(formatUSD(5000)).toBe('$5.00K');
    });

    it('should format millions with M suffix', () => {
      expect(formatUSD(1000000)).toBe('$1.00M');
      expect(formatUSD(5000000)).toBe('$5.00M');
    });

    it('should format billions with B suffix', () => {
      expect(formatUSD(1000000000)).toBe('$1.00B');
    });

    it('should handle zero', () => {
      expect(formatUSD(0)).toBe('$0.00');
    });
  });

  describe('formatPercent', () => {
    it('should format percentages correctly', () => {
      expect(formatPercent(0.5)).toBe('0.500%');
      expect(formatPercent(1.234)).toBe('1.234%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercent(0.01)).toBe('0.010%');
      // formatPercent returns '<0.001%' only for values < 0.001
      expect(formatPercent(0.0005)).toBe('<0.001%');
      expect(formatPercent(0.001)).toBe('0.001%'); // Exactly 0.001 is not < 0.001
    });

    it('should cap at 100%', () => {
      expect(formatPercent(100)).toBe('≥100%');
      expect(formatPercent(150)).toBe('≥100%');
    });
  });

  describe('formatFee', () => {
    it('should format fees correctly', () => {
      // Fee is stored as bigint, formatFee converts it
      const fee = '3000000000000'; // Example fee value
      const result = formatFee(fee);
      expect(result).toContain('%');
    });
  });

  describe('getSlippageColor', () => {
    it('should return green for excellent slippage', () => {
      expect(getSlippageColor(0.3)).toContain('green');
      expect(getSlippageColor(0.49)).toContain('green');
    });

    it('should return yellow for good slippage', () => {
      expect(getSlippageColor(0.5)).toContain('yellow');
      expect(getSlippageColor(1.99)).toContain('yellow');
    });

    it('should return orange for moderate slippage', () => {
      expect(getSlippageColor(2.0)).toContain('orange');
      expect(getSlippageColor(4.99)).toContain('orange');
    });

    it('should return red for high slippage', () => {
      expect(getSlippageColor(5.0)).toContain('red');
      expect(getSlippageColor(10.0)).toContain('red');
    });
  });

  describe('getSlippageBgColor', () => {
    it('should return green background for excellent', () => {
      expect(getSlippageBgColor(0.3)).toContain('green');
    });

    it('should return yellow background for good', () => {
      expect(getSlippageBgColor(1.0)).toContain('yellow');
    });

    it('should return orange background for moderate', () => {
      expect(getSlippageBgColor(3.0)).toContain('orange');
    });

    it('should return red background for high', () => {
      expect(getSlippageBgColor(10.0)).toContain('red');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const shortened = shortenAddress(address);
      expect(shortened).toContain('...');
      expect(shortened.length).toBeLessThan(address.length);
    });

    it('should not shorten short addresses', () => {
      const address = '0x1234';
      expect(shortenAddress(address)).toBe(address);
    });
  });

  describe('timeAgo', () => {
    it('should format seconds ago', () => {
      const timestamp = new Date(Date.now() - 30 * 1000).toISOString();
      expect(timeAgo(timestamp)).toContain('s ago');
    });

    it('should format minutes ago', () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(timeAgo(timestamp)).toContain('m ago');
    });

    it('should format hours ago', () => {
      const timestamp = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      expect(timeAgo(timestamp)).toContain('h ago');
    });
  });

  describe('isValidDatabaseUrl', () => {
    it('should validate postgresql URLs', () => {
      expect(isValidDatabaseUrl('postgresql://user:pass@host:5432/db')).toBe(true);
      expect(isValidDatabaseUrl('postgres://user:pass@host:5432/db')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidDatabaseUrl('http://example.com')).toBe(false);
      expect(isValidDatabaseUrl('not-a-url')).toBe(false);
    });
  });
});
