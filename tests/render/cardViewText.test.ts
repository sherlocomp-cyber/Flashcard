import { describe, it, expect } from 'vitest';
import { renderCardSide, LINE_WRAP_CSS } from '../../src/render/cardView';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

const theme = THEMES[0];

function card(text: string, lang: 'ar' | 'id' = 'ar'): Card {
  return {
    id: 'c0',
    type: 'vocab',
    front: { lines: [{ text, lang, role: 'main' }] },
    back: { lines: [] },
  };
}

describe('renderCardSide teks campuran dan pembungkusan', () => {
  it('mixed_line_wraps_latin_runs_in_ltr_isolates_and_keeps_text', () => {
    const text = 'الكِتَابُ (the book) رقم 12';
    const line = renderCardSide(card(text), 'front', theme, { harakat: true }).querySelector('.fc-line')!;
    const isolates = Array.from(line.querySelectorAll('bdi[dir="ltr"]')).map((e) => e.textContent);
    expect(isolates).toEqual(['(the book)', '12']);
    expect(line.textContent).toBe(text);
  });

  it('pure_arabic_and_pure_latin_lines_have_no_isolates', () => {
    const ar = renderCardSide(card('كتاب'), 'front', theme, { harakat: true });
    const lat = renderCardSide(card('school', 'id'), 'front', theme, { harakat: true });
    expect(ar.querySelectorAll('bdi')).toHaveLength(0);
    expect(lat.querySelectorAll('bdi')).toHaveLength(0);
  });

  it('line_wrap_never_breaks_inside_a_word', () => {
    expect(LINE_WRAP_CSS).toContain('overflow-wrap:normal');
    expect(LINE_WRAP_CSS).toContain('word-break:normal');
    expect(LINE_WRAP_CSS).not.toContain('anywhere');
  });
});
