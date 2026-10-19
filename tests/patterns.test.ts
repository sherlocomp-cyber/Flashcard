import { describe, expect, it } from 'vitest';
import { PATTERNS, patternBand } from '../src/themes/patterns';

const COLOR = '#14b8a6';
const ACCENT = '#c9971c';

function svgOf(css: string): string {
  // bentuk: url("data:image/svg+xml,<terenkode>")
  return decodeURIComponent(css.slice(css.indexOf(',') + 1, -2));
}

describe('patternBand', () => {
  it('pola_none_tidak_menghasilkan_gambar', () => {
    expect(patternBand('none', COLOR, ACCENT)).toBe('');
  });

  it('ada_enam_pola_yang_bisa_digambar', () => {
    expect(PATTERNS.length).toBe(6);
  });

  it('tiap_pola_adalah_data_uri_svg_yang_memakai_warna_tema_dan_aksen', () => {
    for (const p of PATTERNS) {
      const css = patternBand(p, COLOR, ACCENT);
      expect(css.startsWith('url("data:image/svg+xml,')).toBe(true);
      expect(css.endsWith('")')).toBe(true);
      const svg = svgOf(css);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain(COLOR);
      expect(svg).toContain(ACCENT);
    }
  });

  it('tiap_pola_tampil_berbeda', () => {
    const all = PATTERNS.map((p) => patternBand(p, COLOR, ACCENT));
    expect(new Set(all).size).toBe(PATTERNS.length);
  });
});
