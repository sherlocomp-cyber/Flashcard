import type { Pattern } from './patterns';

export interface Theme {
  id: string;
  name: string;
  color: string;
  tint: string;
  ink: string;
  /** Warna kedua untuk pola pita; sama dengan `color` pada tema polos. */
  accent: string;
  /** Pola pita tipis di tepi atas dan bawah kartu ('none' = tanpa pita). */
  pattern: Pattern;
  ornament: 'diamond' | 'star' | 'moon' | string;
  border: 'dotted' | 'double' | 'dashed' | 'solid';
  fallbackIcon: string;
}

const DEFAULT_COLOR = '#14b8a6';

/** Terima #rgb atau #rrggbb; selain itu pakai warna bawaan. Hasil selalu #rrggbb huruf kecil. */
function normalizeHex(input: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return DEFAULT_COLOR;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h;
}

function mapChannels(hex: string, fn: (c: number) => number): string {
  const out = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.max(0, Math.min(255, Math.round(fn(c)))).toString(16).padStart(2, '0');
  });
  return '#' + out.join('');
}

/** Warna muda untuk latar hiasan: 85% menuju putih. */
const tintOf = (hex: string): string => mapChannels(hex, (c) => c + (255 - c) * 0.85);
/** Warna tinta gelap untuk teks: 40% dari kecerahan warna. */
const inkOf = (hex: string): string => mapChannels(hex, (c) => c * 0.4);

function make(
  id: string,
  name: string,
  color: string,
  ornament: Theme['ornament'],
  border: Theme['border'],
  fallbackIcon: string,
  pattern: Pattern = 'none',
  accent?: string,
): Theme {
  const c = normalizeHex(color);
  return {
    id,
    name,
    color: c,
    tint: tintOf(c),
    ink: inkOf(c),
    accent: accent === undefined ? c : normalizeHex(accent),
    pattern,
    ornament,
    border,
    fallbackIcon,
  };
}

export const THEMES: Theme[] = [
  make('tosca', 'Tosca', '#14b8a6', 'diamond', 'dotted', 'book'),
  make('koral', 'Koral', '#f4685b', 'star', 'double', 'pen'),
  make('ungu', 'Ungu', '#8b5cf6', 'moon', 'dashed', 'moon'),
  make('biru-laut', 'Biru Laut', '#0ea5e9', 'wave', 'solid', 'water'),
  make('hijau-daun', 'Hijau Daun', '#22a06b', 'leaf', 'dotted', 'tree'),
  make('emas-klasik', 'Emas Klasik', '#c9971c', 'arch', 'double', 'mosque'),
  make('merah-muda', 'Merah Muda', '#ec6fa8', 'heart', 'dashed', 'house'),
  make('langit-malam', 'Langit Malam', '#2c3e8f', 'sparkle', 'solid', 'star'),
  // Tema bermotif: pita pola di tepi atas dan bawah, tengah tetap putih.
  make('zamrud-madinah', 'Zamrud Madinah', '#047857', 'star8', 'double', 'mosque', 'stars', '#d4a017'),
  make('mozaik-biru', 'Mozaik Biru', '#1d4ed8', 'tile', 'solid', 'water', 'diamonds', '#38bdf8'),
  make('pelangi-ceria', 'Pelangi Ceria', '#f97316', 'flower', 'dashed', 'star', 'dots', '#ec4899'),
  make('lemon-segar', 'Lemon Segar', '#eab308', 'sun', 'dotted', 'tree', 'zigzag', '#16a34a'),
  make('merah-delima', 'Merah Delima', '#be123c', 'lantern', 'double', 'book', 'scallop', '#fda4af'),
  make('cokelat-hangat', 'Cokelat Hangat', '#92400e', 'crescent', 'solid', 'moon', 'arches', '#f59e0b'),
  // Tema estetik: warna lembut berdebu (muted) dipadukan dengan satu aksen hangat atau emas.
  make('sage-lembut', 'Sage Lembut', '#5f8a6a', 'leaf', 'double', 'tree', 'scallop', '#d8c394'),
  make('lavender-senja', 'Lavender Senja', '#8b73c4', 'sparkle', 'dotted', 'moon', 'dots', '#f2b5d4'),
  make('mawar-pastel', 'Mawar Pastel', '#c4647f', 'heart', 'double', 'house', 'scallop', '#f4c7a9'),
  make('dongker-emas', 'Dongker Emas', '#1e3a6e', 'star8', 'double', 'mosque', 'stars', '#d4a73a'),
  make('terakota', 'Terakota', '#bf5b38', 'tile', 'solid', 'house', 'arches', '#e8b86a'),
  make('mocha-latte', 'Mocha Latte', '#85654f', 'crescent', 'dotted', 'book', 'diamonds', '#d8b799'),
  make('hijau-malam', 'Hijau Malam', '#115e59', 'lantern', 'double', 'moon', 'zigzag', '#f0c75e'),
  make('pesisir-pagi', 'Pesisir Pagi', '#3590a8', 'wave', 'dashed', 'water', 'dots', '#f4a58a'),
];

/** Tema kustom dari satu warna pilihan pengguna. */
export function customTheme(color: string): Theme {
  return make('custom', 'Kustom', color, 'diamond', 'dotted', 'star');
}
