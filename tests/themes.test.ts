import { describe, it, expect } from 'vitest';
import { THEMES, customTheme } from '../src/themes/themes';
import { ICONS, iconFor } from '../src/themes/icons';

describe('THEMES', () => {
  it('has_at_least_eight_distinct_themes', () => {
    expect(THEMES.length >= 8).toBe(true);
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    expect(new Set(THEMES.map((t) => t.color)).size).toBe(THEMES.length);
    // ornamen sudut berbeda untuk tiap tema, dan pasangan bingkai + ornamen juga unik
    expect(new Set(THEMES.map((t) => t.ornament)).size).toBe(THEMES.length);
    expect(new Set(THEMES.map((t) => t.border + '|' + t.ornament)).size).toBe(THEMES.length);
    expect(new Set(THEMES.map((t) => t.border)).size > 1).toBe(true);
  });

  it('every_theme_has_valid_colors_and_a_known_fallback_icon', () => {
    for (const t of THEMES) {
      for (const c of [t.color, t.tint, t.ink]) expect(/^#[0-9a-f]{6}$/.test(c)).toBe(true);
      expect(ICONS[t.fallbackIcon] !== undefined).toBe(true);
    }
  });
});

describe('customTheme', () => {
  it('custom_theme_derives_tint_and_ink_from_color', () => {
    const t = customTheme('#3366CC');
    expect(t.id).toBe('custom');
    expect(t.color).toBe('#3366cc');
    expect(t.tint).toBe('#e0e8f7');
    expect(t.ink).toBe('#142952');
  });

  it('custom_theme_accepts_short_hex_and_falls_back_on_invalid_input', () => {
    expect(customTheme('#fa0').color).toBe('#ffaa00');
    expect(customTheme('bukan-warna').color).toBe(THEMES[0].color);
  });
});

describe('iconFor', () => {
  it('keyword_icon_overrides_fallback_and_ignores_case_and_harakat', () => {
    expect(iconFor('Buku', 'star').name).toBe('book');
    expect(iconFor('كِتَابٌ', 'star').name).toBe('book');
    expect(iconFor('tidak dikenal', 'moon').name).toBe('moon');
    expect(iconFor('tidak dikenal', 'ikon-tak-ada').name).toBe('star');
  });
});
