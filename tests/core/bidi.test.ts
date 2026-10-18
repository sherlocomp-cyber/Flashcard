import { describe, it, expect } from 'vitest';
import { splitBidi } from '../../src/core/bidi';

const join = (s: { text: string }[]) => s.map((x) => x.text).join('');

describe('splitBidi', () => {
  it('isolates_latin_phrase_with_its_parentheses_and_numbers', () => {
    const text = 'الكِتَابُ (the book) رقم 12';
    const segs = splitBidi(text);
    expect(join(segs)).toBe(text);
    expect(segs.filter((s) => s.ltr).map((s) => s.text)).toEqual(['(the book)', '12']);
  });

  it('pure_arabic_is_one_non_ltr_segment', () => {
    expect(splitBidi('كتاب')).toEqual([{ text: 'كتاب', ltr: false }]);
  });

  it('pure_latin_is_one_ltr_segment', () => {
    expect(splitBidi('school')).toEqual([{ text: 'school', ltr: true }]);
  });

  it('empty_text_gives_no_segments', () => {
    expect(splitBidi('')).toEqual([]);
  });
});
