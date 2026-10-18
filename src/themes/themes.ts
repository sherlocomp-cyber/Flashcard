export interface Theme {
  id: string;
  name: string;
  color: string;
  tint: string;
  ink: string;
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
): Theme {
  const c = normalizeHex(color);
  return { id, name, color: c, tint: tintOf(c), ink: inkOf(c), ornament, border, fallbackIcon };
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
];

/** Tema kustom dari satu warna pilihan pengguna. */
export function customTheme(color: string): Theme {
  return make('custom', 'Kustom', color, 'diamond', 'dotted', 'star');
}
