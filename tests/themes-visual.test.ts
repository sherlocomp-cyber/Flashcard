import { describe, expect, it } from 'vitest';
import { ornamentSvg } from '../src/themes/ornaments';
import { PATTERNS } from '../src/themes/patterns';
import { THEMES } from '../src/themes/themes';
import { ICONS } from '../src/themes/icons';

const NEW_IDS = ['zamrud-madinah', 'mozaik-biru', 'pelangi-ceria', 'lemon-segar', 'merah-delima', 'cokelat-hangat'];
const HEX = /^#[0-9a-f]{6}$/;

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
const contrastOnWhite = (hex: string): number => 1.05 / (luminance(hex) + 0.05);

describe('tema bermotif', () => {
  it('enam_tema_baru_ada_dan_berpola', () => {
    for (const id of NEW_IDS) {
      const t = THEMES.find((x) => x.id === id);
      expect(t, `tema ${id} harus ada`).toBeDefined();
      expect(t!.pattern).not.toBe('none');
      expect(PATTERNS).toContain(t!.pattern);
      expect(t!.accent).not.toBe(t!.color);
    }
  });

  it('setiap_tema_punya_aksen_hex_dan_pola_yang_dikenal', () => {
    for (const t of THEMES) {
      expect(HEX.test(t.accent)).toBe(true);
      expect(t.pattern === 'none' || (PATTERNS as readonly string[]).includes(t.pattern)).toBe(true);
    }
  });

  it('tema_baru_memakai_ikon_cadangan_yang_dikenal', () => {
    for (const id of NEW_IDS) {
      const t = THEMES.find((x) => x.id === id)!;
      expect(ICONS[t.fallbackIcon] !== undefined).toBe(true);
    }
  });

  it('ornamen_tiap_tema_digambar_sendiri_bukan_berlian_cadangan', () => {
    const diamond = ornamentSvg('diamond', '#000000');
    for (const t of THEMES) {
      if (t.ornament === 'diamond') continue;
      expect(ornamentSvg(t.ornament, '#000000')).not.toBe(diamond);
    }
  });

  it('teks_tema_terbaca_di_atas_putih_kontras_minimal_4_5', () => {
    for (const t of THEMES) expect(contrastOnWhite(t.ink)).toBeGreaterThanOrEqual(4.5);
  });
});
