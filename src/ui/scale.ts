const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;
const MIN_SCALE = 0.35;

/**
 * Skala lembar A4 di pratinjau: muat lebar tersedia, dan (bila tinggi diketahui) juga muat tinggi tersedia
 * supaya seluruh lembar terlihat tanpa menggulir. Tidak pernah memperbesar dan tidak lebih kecil dari batas terbaca.
 * Mengembalikan null bila lebar belum bisa diukur.
 */
export function sheetScale(widthPx: number, heightPx: number): number | null {
  if (!(widthPx > 0)) return null;
  let s = Math.min(1, widthPx / A4_WIDTH_PX);
  if (heightPx > 0) s = Math.min(s, heightPx / A4_HEIGHT_PX);
  return Math.max(MIN_SCALE, s);
}
