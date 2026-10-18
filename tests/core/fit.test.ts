import { describe, it, expect } from 'vitest';
import { fitFontSize } from '../../src/core/fit';

describe('fitFontSize', () => {
  it('fit_returns_largest_fitting_size', () => {
    expect(fitFontSize((px) => ({ overflow: px > 37 }), 72, 12)).toEqual({ px: 37, overflow: false });
    expect(fitFontSize((px) => ({ overflow: px > 12 }), 72, 12)).toEqual({ px: 12, overflow: false });
  });

  it('fit_returns_max_when_everything_fits', () => {
    expect(fitFontSize(() => ({ overflow: false }), 72, 12)).toEqual({ px: 72, overflow: false });
  });

  it('fit_flags_overflow_at_min', () => {
    expect(fitFontSize(() => ({ overflow: true }), 72, 12)).toEqual({ px: 12, overflow: true });
    expect(fitFontSize((px) => ({ overflow: px > 5 }), 72, 12)).toEqual({ px: 12, overflow: true });
  });
});
