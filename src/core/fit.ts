/**
 * Cari ukuran huruf (px, bilangan bulat) terbesar antara `min` dan `max` yang tidak meluap.
 * Bila `min` pun meluap, kembalikan `min` dengan `overflow: true` (kartu diberi peringatan,
 * teks tidak dipotong diam-diam).
 */
export function fitFontSize(
  measure: (px: number) => { overflow: boolean },
  max: number,
  min: number,
): { px: number; overflow: boolean } {
  let lo = Math.round(min);
  let hi = Math.max(lo, Math.round(max));
  if (measure(lo).overflow) return { px: lo, overflow: true };
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(mid).overflow) hi = mid - 1;
    else lo = mid;
  }
  return { px: lo, overflow: false };
}
