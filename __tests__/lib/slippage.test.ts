import { estimateSimpleSlippage, calculateSwapOutput } from '@/lib/slippage';

describe('Slippage Calculations', () => {
  describe('estimateSimpleSlippage', () => {
    it('should calculate slippage correctly for small swap', () => {
      const slippage = estimateSimpleSlippage(1000, 1000000, 30); // $1K swap, $1M TVL, 0.3% fee
      // Price impact: (1000 / 1000000) * 100 = 0.1%
      // Fee: 30 bps = 0.3%
      // Total: 0.1% + 0.3% = 0.4%
      expect(slippage).toBeCloseTo(0.4, 2);
    });

    it('should calculate slippage correctly for large swap', () => {
      const slippage = estimateSimpleSlippage(50000, 1000000, 30); // $50K swap, $1M TVL, 0.3% fee
      // Price impact: (50000 / 1000000) * 100 = 5%
      // Fee: 0.3%
      // Total: 5% + 0.3% = 5.3%
      expect(slippage).toBeCloseTo(5.3, 2);
    });

    it('should return 100% slippage for zero TVL', () => {
      const slippage = estimateSimpleSlippage(1000, 0, 30);
      expect(slippage).toBe(100);
    });

    it('should handle very small TVL', () => {
      const slippage = estimateSimpleSlippage(1000, 100, 30);
      // Price impact: (1000 / 100) * 100 = 1000%
      // Fee: 0.3%
      // Total: 1000.3% (but should be capped at 100% in practice)
      expect(slippage).toBeGreaterThan(100);
    });

    it('should use default fee if not provided', () => {
      const slippage = estimateSimpleSlippage(1000, 1000000);
      // Should use default 30 bps = 0.3%
      expect(slippage).toBeCloseTo(0.4, 2); // 0.1% + 0.3%
    });

    it('should handle different fee rates', () => {
      const slippage1 = estimateSimpleSlippage(1000, 1000000, 10); // 0.1% fee
      const slippage2 = estimateSimpleSlippage(1000, 1000000, 100); // 1% fee
      
      expect(slippage1).toBeCloseTo(0.2, 2); // 0.1% + 0.1% = 0.2%
      expect(slippage2).toBeCloseTo(1.1, 2); // 0.1% + 1% = 1.1%
    });
  });

  describe('calculateSwapOutput', () => {
    const Q96 = 2n ** 96n;
    
    it('should calculate swap output with liquidity', () => {
      const currentTick = 0;
      const currentSqrtPrice = Q96; // Price = 1.0
      const currentLiquidity = BigInt(1000000) * Q96;
      const tickSpacing = 1;
      const tickLiquidities: Array<{ tick: number; liquidityDelta: bigint }> = [];

      const result = calculateSwapOutput(
        BigInt(1000), // 1000 units
        true, // zeroForOne
        currentSqrtPrice,
        currentTick,
        currentLiquidity,
        tickSpacing,
        tickLiquidities
      );

      expect(result.expectedOutput).toBeGreaterThan(0n);
      expect(result.priceImpact).toBeGreaterThanOrEqual(0);
      expect(result.effectivePrice).toBeGreaterThan(0);
      expect(result.slippageBps).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero liquidity', () => {
      const result = calculateSwapOutput(
        BigInt(1000),
        true,
        Q96,
        0,
        0n,
        1,
        []
      );

      // With zero liquidity, should return minimal or zero output
      expect(result.expectedOutput).toBeDefined();
    });
  });
});
