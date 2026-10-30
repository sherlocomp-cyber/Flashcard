/** Pola pita tepi kartu. Tengah kartu tetap putih supaya teks terbaca; pola hanya di pita tipis atas dan bawah. */
export const PATTERNS = ['stars', 'diamonds', 'dots', 'zigzag', 'scallop', 'arches'] as const;
export type DrawnPattern = (typeof PATTERNS)[number];
export type Pattern = 'none' | DrawnPattern;

interface Tile {
  w: number;
  h: number;
  body: (c: string, a: string) => string;
}

/** Tiap ubin setinggi 8 satuan; pita menskalakan tinggi ubin ke tinggi pita. Semua ubin memakai warna tema dan aksen. */
const TILES: Record<DrawnPattern, Tile> = {
  // Khatam (bintang segi delapan dari dua persegi) berselang titik aksen.
  stars: {
    w: 16,
    h: 8,
    body: (c, a) =>
      `<rect x="1.6" y="1.6" width="4.8" height="4.8" fill="${c}"/>` +
      `<rect x="1.6" y="1.6" width="4.8" height="4.8" fill="${c}" transform="rotate(45 4 4)"/>` +
      `<circle cx="12" cy="4" r="1.2" fill="${a}"/>`,
  },
  // Belah ketupat besar berselang belah ketupat kecil aksen.
  diamonds: {
    w: 16,
    h: 8,
    body: (c, a) =>
      `<path d="M4 .5l3.5 3.5L4 7.5.5 4z" fill="${c}"/>` + `<path d="M12 2l2 2-2 2-2-2z" fill="${a}"/>`,
  },
  // Titik bergantian warna tema dan aksen.
  dots: {
    w: 12,
    h: 8,
    body: (c, a) => `<circle cx="3" cy="4" r="1.7" fill="${c}"/><circle cx="9" cy="4" r="1.7" fill="${a}"/>`,
  },
  // Gigi gergaji dengan titik aksen di lekuknya.
  zigzag: {
    w: 8,
    h: 8,
    body: (c, a) =>
      `<path d="M0 6.5L2 1.5 4 6.5 6 1.5 8 6.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<circle cx="4" cy="1.4" r=".9" fill="${a}"/>`,
  },
  // Lengkung bergelombang seperti sisik atau tepi renda.
  scallop: {
    w: 8,
    h: 8,
    body: (c, a) =>
      `<path d="M0 7a4 4 0 0 1 8 0" fill="none" stroke="${c}" stroke-width="1.4"/>` +
      `<circle cx="4" cy="3" r=".9" fill="${a}"/>`,
  },
  // Deretan lengkung masjid.
  arches: {
    w: 8,
    h: 8,
    body: (c, a) =>
      `<path d="M.7 8V5a3.3 3.3 0 0 1 6.6 0v3" fill="none" stroke="${c}" stroke-width="1.3"/>` +
      `<circle cx="4" cy="5.6" r=".9" fill="${a}"/>`,
  },
};

/** Nilai CSS `background-image` untuk pita pola; string kosong untuk 'none'. */
export function patternBand(pattern: Pattern, color: string, accent: string): string {
  if (pattern === 'none') return '';
  const t = TILES[pattern];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.w} ${t.h}" width="${t.w}" height="${t.h}">` +
    t.body(color, accent) +
    '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
