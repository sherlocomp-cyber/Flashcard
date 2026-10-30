import { describe, it, expect } from 'vitest';
import { renderCardSide } from '../../src/render/cardView';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

const theme = THEMES[0];
const noOverflow = { harakat: true, measureOverflow: () => false };

function card(front: string[], lang: 'ar' | 'id'): Card {
  const line = (text: string, i: number) => ({ text, lang, role: (i === 0 ? 'main' : 'sub') as 'main' | 'sub' });
  return { id: 'c0', type: 'vocab', front: { lines: front.map(line) }, back: { lines: [] } };
}

const px = (el: HTMLElement, sel: string): string => (el.querySelector(sel) as HTMLElement).style.fontSize;

describe('renderCardSide: batas ukuran huruf', () => {
  it('latin_main_font_is_capped_at_44px_so_short_words_are_not_huge', () => {
    const el = renderCardSide(card(['Pilot'], 'id'), 'front', theme, noOverflow);
    expect(px(el, '.fc-main')).toBe('44px');
  });

  it('arabic_main_font_is_capped_at_60px', () => {
    const el = renderCardSide(card(['طيار'], 'ar'), 'front', theme, noOverflow);
    expect(px(el, '.fc-main')).toBe('60px');
  });

  it('sub_line_is_half_of_the_capped_main_size', () => {
    const el = renderCardSide(card(['Pilot', 'Pilot'], 'id'), 'front', theme, noOverflow);
    expect(px(el, '.fc-sub')).toBe('22px');
  });

  it('arabic_main_font_grows_on_tall_cards_so_it_reads_from_afar', () => {
    const tall = { ...noOverflow, widthMm: 95, heightMm: 138.5 };
    const el = renderCardSide(card(['طيار'], 'ar'), 'front', theme, tall);
    expect(parseInt(px(el, '.fc-main'), 10)).toBeGreaterThan(100);
  });

  it('sub_line_never_drops_below_14px_unless_the_card_overflows', () => {
    const el = renderCardSide(card(['Pilot', 'Pilot'], 'id'), 'front', theme, { harakat: true, measureOverflow: () => true });
    expect(px(el, '.fc-sub')).toBe('14px');
  });

  it('cap_is_still_shrunk_when_the_text_overflows', () => {
    const el = renderCardSide(card(['Pilot'], 'id'), 'front', theme, { harakat: true, measureOverflow: () => true });
    expect(px(el, '.fc-main')).toBe('12px');
    expect(el.getAttribute('data-overflow')).toBe('true');
  });
});
