import type { Theme } from './themes';

/**
 * Spesifikasi gaya kartu non-klasik. Semua ukuran dalam milimeter.
 * `layoutSpec` mengembalikan null untuk tema klasik (pakai jalur render lama).
 */
export interface LayoutSpec {
  layout: 'game' | 'minimal' | 'pop' | 'rimba' | 'pill';
  /** CSS tambahan untuk kartu: latar, bingkai, sudut. */
  rootCss: string;
  textColor: string;
  padTop: number;
  padBottom: number;
  padSide: number;
  gap: number;
  /** true: gambar di atas teks; false: teks (judul) di atas gambar. */
  visualFirst: boolean;
  /** Porsi tinggi area isi untuk gambar bila ada teks. */
  visualShare: number;
  visualRadius: (vw: number, vh: number) => string;
  visualBorder: string;
  visualBg: string;
  iconColor: string;
  /** Huruf untuk baris utama Latin; null = huruf bawaan. Arab selalu Amiri. */
  mainFamily: string | null;
  mainColor: string;
  mainWeight: number;
  /** CSS tambahan untuk semua baris. */
  lineCss: string;
  /** CSS tambahan hanya untuk baris utama (mis. kapsul). */
  mainCss: string;
  /** Rata awal (kiri untuk Latin, kanan untuk Arab) alih-alih tengah. */
  start: boolean;
  /** Penanda kategori kecil: tab di tepi bawah, di sudut, atau tanpa. */
  mark: 'tab' | 'corner' | 'none';
  markColor: string;
}

const DARK = '#1b1b1b';
const WHITE = '#ffffff';

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex(c: [number, number, number]): string {
  return (
    '#' +
    c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
  );
}

/** Gelapkan: kalikan tiap kanal dengan `f` (0..1). */
export function shade(hex: string, f: number): string {
  const [r, g, b] = rgb(hex);
  return toHex([r * f, g * f, b * f]);
}

/** Terangkan: geser `t` (0..1) menuju putih. */
export function lighten(hex: string, t: number): string {
  const [r, g, b] = rgb(hex);
  return toHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
}

function luminance(hex: string): number {
  const lin = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = rgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Warna teks (putih atau hampir hitam) dengan kontras terbaik di atas `bg`. */
export function contrastOn(bg: string): string {
  const l = luminance(bg);
  const white = 1.05 / (l + 0.05);
  const dark = (l + 0.05) / (luminance(DARK) + 0.05);
  return white >= dark ? WHITE : DARK;
}

const SERIF = "'Amiri', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const HEAVY_SANS = "'Nunito', 'Arial Black', 'Helvetica Neue', Arial, system-ui, sans-serif";
const HAND = "'Caveat', 'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Sans MS', cursive";

export function layoutSpec(theme: Theme): LayoutSpec | null {
  const layout = theme.layout ?? 'classic';
  if (layout === 'classic') return null;

  const deep = shade(theme.color, 0.72);

  if (layout === 'game') {
    return {
      layout,
      rootCss: `background:#ffffff;border:1.8mm solid ${theme.color};border-radius:5mm;`,
      textColor: theme.ink,
      padTop: 5,
      padBottom: 9,
      padSide: 5,
      gap: 3,
      visualFirst: false,
      visualShare: 0.6,
      visualRadius: () => '6mm',
      visualBorder: 'none',
      visualBg: theme.tint,
      iconColor: theme.color,
      mainFamily: null,
      mainColor: deep,
      mainWeight: 800,
      lineCss: '',
      mainCss: '',
      start: false,
      mark: 'tab',
      markColor: theme.color,
    };
  }

  if (layout === 'minimal') {
    return {
      layout,
      rootCss: `background:#ffffff;border:0.35mm solid ${lighten(theme.color, 0.6)};border-radius:4mm;`,
      textColor: theme.ink,
      padTop: 6,
      padBottom: 6,
      padSide: 6,
      gap: 3,
      visualFirst: false,
      visualShare: 0.62,
      visualRadius: (vw, vh) => {
        const r = Math.min(vw / 2, vh * 0.55);
        return `${r}mm ${r}mm 3mm 3mm`;
      },
      visualBorder: 'none',
      visualBg: theme.tint,
      iconColor: theme.color,
      mainFamily: SERIF,
      mainColor: theme.ink,
      mainWeight: 700,
      lineCss: '',
      mainCss: '',
      start: false,
      mark: 'none',
      markColor: theme.color,
    };
  }

  if (layout === 'pop') {
    const fg = contrastOn(theme.color);
    return {
      layout,
      rootCss: `background:${theme.color};border:none;border-radius:4mm;`,
      textColor: fg,
      padTop: 6,
      padBottom: 9,
      padSide: 6,
      gap: 3,
      visualFirst: false,
      visualShare: 0.6,
      visualRadius: () => '4mm',
      visualBorder: 'none',
      visualBg: fg === WHITE ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      iconColor: fg,
      mainFamily: HEAVY_SANS,
      mainColor: fg,
      mainWeight: 900,
      lineCss: 'align-self:stretch;text-align:start;',
      mainCss: '',
      start: true,
      mark: 'corner',
      markColor: fg,
    };
  }

  if (layout === 'rimba') {
    return {
      layout,
      rootCss: `background:#ffffff;border:0.6mm solid ${lighten(theme.color, 0.55)};border-radius:4mm;`,
      textColor: deep,
      padTop: 4.5,
      padBottom: 4.5,
      padSide: 4.5,
      gap: 2.5,
      visualFirst: true,
      visualShare: 0.66,
      visualRadius: () => '3mm 3mm 12mm 3mm',
      visualBorder: 'none',
      visualBg: theme.color,
      iconColor: '#ffffff',
      mainFamily: HAND,
      mainColor: deep,
      mainWeight: 700,
      lineCss: '',
      mainCss: '',
      start: false,
      mark: 'none',
      markColor: theme.color,
    };
  }

  // pill
  return {
    layout: 'pill',
    rootCss: `background:#ffffff;border:0.5mm solid ${lighten(theme.color, 0.6)};border-radius:4mm;`,
    textColor: theme.ink,
    padTop: 5,
    padBottom: 5,
    padSide: 5,
    gap: 2.5,
    visualFirst: true,
    visualShare: 0.66,
    visualRadius: () => '3mm',
    visualBorder: 'none',
    visualBg: lighten(theme.color, 0.6),
    iconColor: theme.color,
    mainFamily: null,
    mainColor: theme.ink,
    mainWeight: 700,
    lineCss: '',
    mainCss: `background:${theme.tint};border:0.35mm solid ${theme.color};border-radius:99mm;padding:0.6mm 4mm;`,
    start: false,
    mark: 'none',
    markColor: theme.color,
  };
}
