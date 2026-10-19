import { describe, expect, it } from 'vitest';
import { sheetScale } from '../../src/ui/scale';

const A4_W = (210 / 25.4) * 96;
const A4_H = (297 / 25.4) * 96;

describe('sheetScale', () => {
  it('fits_the_width_when_height_is_ample', () => {
    expect(sheetScale(400, 5000)).toBeCloseTo(400 / A4_W, 5);
  });

  it('never_enlarges_beyond_actual_size', () => {
    expect(sheetScale(3000, 5000)).toBe(1);
  });

  it('is_limited_by_the_height_so_the_whole_sheet_stays_in_view', () => {
    expect(sheetScale(900, 500)).toBeCloseTo(500 / A4_H, 5);
  });

  it('does_not_shrink_below_a_readable_floor', () => {
    expect(sheetScale(900, 50)).toBe(0.35);
  });

  it('returns_null_without_a_measurable_width', () => {
    expect(sheetScale(0, 800)).toBeNull();
  });

  it('ignores_an_unknown_height', () => {
    expect(sheetScale(400, 0)).toBeCloseTo(400 / A4_W, 5);
  });
});
