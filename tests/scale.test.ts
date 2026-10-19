import { describe, expect, it } from 'vitest';
import { sheetScale } from '../src/ui/scale';

const A4_W = (210 / 25.4) * 96;
const A4_H = (297 / 25.4) * 96;

describe('sheetScale', () => {
  it('mengembalikan null bila lebar belum bisa diukur', () => {
    expect(sheetScale(0, 800)).toBeNull();
    expect(sheetScale(-5, 800)).toBeNull();
    expect(sheetScale(Number.NaN, 800)).toBeNull();
  });

  it('tidak pernah memperbesar melebihi 1', () => {
    expect(sheetScale(A4_W * 3, 0)).toBe(1);
    expect(sheetScale(A4_W * 3, A4_H * 3)).toBe(1);
  });

  it('muat lebar tersedia saat tinggi tidak diketahui', () => {
    expect(sheetScale(A4_W / 2, 0)).toBeCloseTo(0.5, 5);
  });

  it('memakai batas yang lebih ketat antara lebar dan tinggi', () => {
    // lebar longgar, tinggi sempit: tinggi menentukan
    expect(sheetScale(A4_W, A4_H / 2)).toBeCloseTo(0.5, 5);
    // lebar sempit, tinggi longgar: lebar menentukan
    expect(sheetScale(A4_W * 0.6, A4_H * 2)).toBeCloseTo(0.6, 5);
  });

  it('tidak lebih kecil dari batas terbaca 0,35', () => {
    expect(sheetScale(A4_W * 0.1, 0)).toBe(0.35);
    expect(sheetScale(A4_W, A4_H * 0.1)).toBe(0.35);
  });
});
