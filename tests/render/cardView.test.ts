import { describe, it, expect } from 'vitest';
import { renderCardSide } from '../../src/render/cardView';
import { buildCards } from '../../src/core/cards';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

const theme = THEMES[0];

function card(front: string[], back: string[], lang: 'ar' | 'id' = 'ar'): Card {
  const line = (text: string, i: number) => ({ text, lang, role: (i === 0 ? 'main' : 'sub') as 'main' | 'sub' });
  return {
    id: 'c0',
    type: 'vocab',
    front: { lines: front.map(line) },
    back: { lines: back.map(line) },
  };
}

describe('renderCardSide', () => {
  it('arabic_field_is_rtl_and_latin_field_is_ltr', () => {
    const c = card(['كتاب', 'book', 'مرحبا hello world'], []);
    const lines = renderCardSide(c, 'front', theme, { harakat: true }).querySelectorAll('.fc-line');
    expect(lines).toHaveLength(3);
    expect(lines[0].getAttribute('dir')).toBe('rtl');
    expect(lines[1].getAttribute('dir')).toBe('ltr');
    expect(lines[2].getAttribute('dir')).toBe('auto');
  });

  it('harakat_toggle_strips_marks_only_when_off', () => {
    const c = card(['كِتَابٌ'], []);
    const on = renderCardSide(c, 'front', theme, { harakat: true });
    const off = renderCardSide(c, 'front', theme, { harakat: false });
    expect(on.querySelector('.fc-line')!.textContent).toBe('كِتَابٌ');
    expect(off.querySelector('.fc-line')!.textContent).toBe('كتاب');
  });

  it('card_with_text_and_no_image_or_keyword_has_no_icon', () => {
    const c = card(['مهندس'], ['insinyur']);
    c.front.iconKey = 'insinyur';
    const el = renderCardSide(c, 'front', theme, { harakat: true });
    expect(el.querySelector('[data-icon]')).toBeNull();
    expect(el.querySelector('.fc-visual')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelectorAll('.fc-line')).toHaveLength(1);
  });

  it('empty_iconkey_with_text_has_no_icon', () => {
    const c = card(['كتاب'], ['buku']);
    c.front.iconKey = '';
    const el = renderCardSide(c, 'front', theme, { harakat: true });
    expect(el.querySelector('.fc-visual')).toBeNull();
  });

  it('picture_front_without_image_or_keyword_keeps_fallback_icon_so_it_is_not_blank', () => {
    const [c] = buildCards(
      { headers: ['arab', 'arti'], rows: [['مهندس', 'insinyur']] },
      { arab: 0, indonesia: 1 },
      'picture',
      false,
    );
    const front = renderCardSide(c, 'front', theme, { harakat: true });
    expect(front.querySelectorAll('.fc-line')).toHaveLength(0);
    expect(front.querySelector(`[data-icon="${theme.fallbackIcon}"]`)).not.toBeNull();
  });

  it('keyword_icon_and_uploaded_image_are_used', () => {
    const c = card(['كتاب'], ['buku']);
    c.front.iconKey = 'buku';
    const withIcon = renderCardSide(c, 'front', theme, { harakat: true });
    expect(withIcon.querySelector('[data-icon="book"]') !== null).toBe(true);

    c.front.image = 'data:image/png;base64,AAAA';
    const withImage = renderCardSide(c, 'front', theme, { harakat: true });
    expect(withImage.querySelector('img') !== null).toBe(true);
    expect(withImage.querySelector('[data-icon]') === null).toBe(true);
  });

  it('picture_front_has_visual_and_no_text', () => {
    const [c] = buildCards(
      { headers: ['arab', 'arti'], rows: [['كتاب', 'buku']] },
      { arab: 0, indonesia: 1 },
      'picture',
      false,
    );
    const front = renderCardSide(c, 'front', theme, { harakat: true });
    expect(front.querySelectorAll('.fc-line')).toHaveLength(0);
    expect(front.querySelector('[data-icon]') !== null).toBe(true);
    const back = renderCardSide(c, 'back', theme, { harakat: true });
    expect(back.querySelectorAll('.fc-line')).toHaveLength(2);
    expect(back.querySelector('[data-icon]') === null).toBe(true);
  });

  it('overflowing_card_gets_warning_attribute', () => {
    const c = card(['كتاب'], []);
    const warned = renderCardSide(c, 'front', theme, { harakat: true, measureOverflow: () => true });
    expect(warned.getAttribute('data-overflow')).toBe('true');
    const fine = renderCardSide(c, 'front', theme, { harakat: true, measureOverflow: () => false });
    expect(fine.getAttribute('data-overflow')).toBe(null);
  });

  it('marks_theme_card_type_and_side_on_the_root', () => {
    const el = renderCardSide(card(['كتاب'], ['buku']), 'back', THEMES[1], { harakat: true });
    expect(el.getAttribute('data-theme')).toBe(THEMES[1].id);
    expect(el.getAttribute('data-type')).toBe('vocab');
    expect(el.getAttribute('data-side')).toBe('back');
  });

  it('is_not_left_attached_to_the_document', () => {
    renderCardSide(card(['كتاب'], []), 'front', theme, { harakat: true });
    expect(document.querySelectorAll('.fc-card')).toHaveLength(0);
  });
});

describe('renderCardSide: pembungkusan kata Latin', () => {
  const nowrap = (el: HTMLElement): boolean => /white-space:\s*nowrap/.test(el.getAttribute('style') ?? '');
  const units = (el: HTMLElement): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('.fc-line .fc-w'));

  it('latin_hyphenated_word_stays_in_one_nowrap_unit', () => {
    const el = renderCardSide(card(['Murid (laki-laki)'], [], 'id'), 'front', theme, { harakat: true });
    const unit = units(el).find((u) => u.textContent === 'laki-laki)');
    expect(unit).toBeDefined();
    expect(nowrap(unit as HTMLElement)).toBe(true);
  });

  it('lone_slash_sticks_to_the_previous_word', () => {
    const el = renderCardSide(card(['Insinyur / Arsitek'], [], 'id'), 'front', theme, { harakat: true });
    expect(units(el).map((u) => u.textContent)).toEqual(['Insinyur /', 'Arsitek']);
    expect(units(el).every(nowrap)).toBe(true);
  });

  it('word_wrapping_does_not_change_the_text', () => {
    const text = 'Pedagang / Pengusaha (laki-laki)';
    const el = renderCardSide(card([text], [], 'id'), 'front', theme, { harakat: true });
    expect(el.querySelector('.fc-line')!.textContent).toBe(text);
  });

  it('arabic_lines_are_not_split_into_word_units', () => {
    const el = renderCardSide(card(['ربة البيت'], []), 'front', theme, { harakat: true });
    expect(el.querySelector('.fc-w')).toBeNull();
    expect(el.querySelector('.fc-line')!.textContent).toBe('ربة البيت');
  });
});
