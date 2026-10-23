import { describe, it, expect } from 'vitest';
import { renderCardSide } from '../../src/render/cardView';
import { layoutSpec } from '../../src/themes/layouts';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

const card: Card = {
  id: 'c0',
  type: 'vocab',
  front: { lines: [{ text: 'كتاب', lang: 'ar', role: 'main' }], iconKey: 'buku' },
  back: { lines: [] },
};

const byLayout = (layout: string) => THEMES.filter((t) => t.layout === layout);
const LAYOUTS = ['game', 'minimal', 'pop', 'rimba', 'pill'] as const;

describe('gaya kartu', () => {
  it('every_new_layout_has_at_least_two_themes', () => {
    for (const l of LAYOUTS) expect(byLayout(l).length >= 2).toBe(true);
  });

  it('classic_themes_have_no_layout_spec', () => {
    expect(layoutSpec(THEMES[0])).toBeNull();
    expect(THEMES[0].layout === undefined || THEMES[0].layout === 'classic').toBe(true);
  });

  it('layout_themes_render_without_classic_corners_and_mark_the_layout', () => {
    for (const l of LAYOUTS) {
      const t = byLayout(l)[0];
      const el = renderCardSide(card, 'front', t, { harakat: true });
      expect(el.getAttribute('data-layout')).toBe(l);
      expect(el.querySelector('.fc-corner')).toBeNull();
      expect(el.querySelector('.fc-band')).toBeNull();
      expect(el.querySelector('.fc-visual')).not.toBeNull();
      expect(el.querySelectorAll('.fc-line')).toHaveLength(1);
    }
  });

  it('game_and_minimal_and_pop_put_text_above_the_picture', () => {
    for (const l of ['game', 'minimal', 'pop'] as const) {
      const el = renderCardSide(card, 'front', byLayout(l)[0], { harakat: true });
      const line = el.querySelector('.fc-line')!;
      const visual = el.querySelector('.fc-visual')!;
      expect(Boolean(line.compareDocumentPosition(visual) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    }
  });

  it('rimba_and_pill_put_the_picture_above_the_label', () => {
    for (const l of ['rimba', 'pill'] as const) {
      const el = renderCardSide(card, 'front', byLayout(l)[0], { harakat: true });
      const line = el.querySelector('.fc-line')!;
      const visual = el.querySelector('.fc-visual')!;
      expect(Boolean(visual.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    }
  });

  it('picture_front_without_text_still_shows_a_large_visual_in_every_layout', () => {
    const pic: Card = { id: 'p0', type: 'picture', front: { lines: [], iconKey: 'zzz' }, back: { lines: [] } };
    for (const l of LAYOUTS) {
      const el = renderCardSide(pic, 'front', byLayout(l)[0], { harakat: true });
      expect(el.querySelectorAll('.fc-line')).toHaveLength(0);
      expect(el.querySelector('.fc-visual')).not.toBeNull();
    }
  });

  it('pop_text_color_has_enough_contrast_on_its_background', () => {
    const kuning = THEMES.find((t) => t.id === 'pop-kuning')!;
    const anggur = THEMES.find((t) => t.id === 'pop-anggur')!;
    expect(layoutSpec(kuning)!.textColor).toBe('#1b1b1b');
    expect(layoutSpec(anggur)!.textColor).toBe('#ffffff');
  });

  it('layout_theme_keeps_arabic_rtl_and_harakat_toggle', () => {
    const c: Card = {
      id: 'c1',
      type: 'vocab',
      front: { lines: [{ text: 'كِتَابٌ', lang: 'ar', role: 'main' }] },
      back: { lines: [] },
    };
    const t = byLayout('pop')[0];
    const on = renderCardSide(c, 'front', t, { harakat: true });
    const off = renderCardSide(c, 'front', t, { harakat: false });
    expect(on.querySelector('.fc-line')!.getAttribute('dir')).toBe('rtl');
    expect(on.querySelector('.fc-line')!.textContent).toBe('كِتَابٌ');
    expect(off.querySelector('.fc-line')!.textContent).toBe('كتاب');
  });
});
