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

  it('rejects_negative_and_nan_widths', () => {
    expect(sheetScale(-5, 800)).toBeNull();
    expect(sheetScale(Number.NaN, 800)).toBeNull();
  });

  it('uses_the_tighter_of_width_and_height', () => {
    expect(sheetScale(A4_W, A4_H / 2)).toBeCloseTo(0.5, 5);
    expect(sheetScale(A4_W * 0.6, A4_H * 2)).toBeCloseTo(0.6, 5);
  });

  it('floors_at_0_35_for_both_width_and_height', () => {
    expect(sheetScale(A4_W * 0.1, 0)).toBe(0.35);
    expect(sheetScale(A4_W, A4_H * 0.1)).toBe(0.35);
  });

  it('never_exceeds_1_even_with_ample_room', () => {
    expect(sheetScale(A4_W * 3, A4_H * 3)).toBe(1);
  });
});
