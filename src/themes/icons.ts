import { normalizeKey } from '../core/images';

const svg = (body: string): string =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  body +
  '</svg>';

/** Ikon bawaan (SVG kecil tertanam, berwarna sesuai `currentColor`). */
export const ICONS: Record<string, string> = {
  book: svg('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/>'),
  pen: svg('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>'),
  house: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  door: svg('<rect x="6" y="3" width="12" height="18" rx="1"/><circle cx="15" cy="12" r="1"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  star: svg('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  tree: svg('<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 21h6"/>'),
  water: svg('<path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/>'),
  mosque: svg('<path d="M5 21v-8a7 7 0 0 1 14 0v8"/><path d="M12 3v3"/><path d="M10 21v-4h4v4"/>'),
  bag: svg('<rect x="4" y="8" width="16" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
};

// Kata kunci sederhana (kunci sudah dinormalkan: huruf kecil, tanpa harakat dan spasi).
const KEYWORDS: Record<string, string> = {
  buku: 'book', kitab: 'book', book: 'book', 'كتاب': 'book',
  pena: 'pen', pensil: 'pen', pen: 'pen', pencil: 'pen', 'قلم': 'pen',
  rumah: 'house', house: 'house', 'بيت': 'house',
  pintu: 'door', door: 'door', 'باب': 'door',
  matahari: 'sun', sun: 'sun', 'شمس': 'sun',
  bulan: 'moon', moon: 'moon', 'قمر': 'moon',
  bintang: 'star', star: 'star', 'نجمة': 'star',
  pohon: 'tree', tree: 'tree', 'شجرة': 'tree',
  air: 'water', water: 'water', 'ماء': 'water',
  masjid: 'mosque', mosque: 'mosque', 'مسجد': 'mosque',
  tas: 'bag', bag: 'bag', 'حقيبة': 'bag',
};

/** Ikon dari kata kunci, atau null bila kata tidak dikenali (tanpa ikon cadangan). */
export function keywordIcon(word: string): { name: string; svg: string } | null {
  const name = KEYWORDS[normalizeKey(word)];
  return name && ICONS[name] ? { name, svg: ICONS[name] } : null;
}

/** Pilih ikon dari kata kunci; bila tak dikenali, pakai ikon cadangan tema. */
export function iconFor(word: string, fallback: string): { name: string; svg: string } {
  const name = KEYWORDS[normalizeKey(word)] ?? fallback;
  const chosen = ICONS[name] ? name : 'star';
  return { name: chosen, svg: ICONS[chosen] };
}
