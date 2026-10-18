import { describe, it, expect } from 'vitest';
import { buildCards } from '../../src/core/cards';
import type { ColumnMap, Table } from '../../src/core/types';

const vocabTable: Table = {
  headers: ['arab', 'indonesia', 'inggris'],
  rows: [
    ['كِتَابٌ', 'buku', 'book'],
    ['قَلَمٌ', 'pena', 'pen'],
  ],
};
const vocabMap: ColumnMap = { arab: 0, indonesia: 1, inggris: 2 };

describe('buildCards', () => {
  it('vocab_front_arabic_back_id_and_en', () => {
    const [card] = buildCards(vocabTable, vocabMap, 'vocab', false);
    expect(card.type).toBe('vocab');
    expect(card.front.lines).toEqual([{ text: 'كِتَابٌ', lang: 'ar', role: 'main' }]);
    expect(card.back.lines).toEqual([
      { text: 'buku', lang: 'id', role: 'main' },
      { text: 'book', lang: 'en', role: 'sub' },
    ]);
  });

  it('picture_front_image_only_back_arabic_and_meaning', () => {
    const table: Table = { headers: ['arab', 'arti'], rows: [['كتاب', 'buku']] };
    const [card] = buildCards(table, { arab: 0, indonesia: 1 }, 'picture', false);
    expect(card.type).toBe('picture');
    expect(card.front.lines).toEqual([]);
    expect(card.back.lines).toEqual([
      { text: 'كتاب', lang: 'ar', role: 'main' },
      { text: 'buku', lang: 'id', role: 'sub' },
    ]);
  });

  it('material_front_title_back_body', () => {
    const table: Table = {
      headers: ['judul', 'penjelasan'],
      rows: [['Kata kerja', 'Fi\u2019il adalah kata yang menunjukkan pekerjaan.']],
    };
    const [card] = buildCards(table, { judul: 0, penjelasan: 1 }, 'material', false);
    expect(card.front.lines).toEqual([{ text: 'Kata kerja', lang: 'id', role: 'main' }]);
    expect(card.back.lines).toEqual([
      { text: 'Fi\u2019il adalah kata yang menunjukkan pekerjaan.', lang: 'id', role: 'main' },
    ]);
  });

  it('flip_swaps_sides_for_all_types', () => {
    for (const type of ['vocab', 'picture'] as const) {
      const normal = buildCards(vocabTable, vocabMap, type, false)[0];
      const flipped = buildCards(vocabTable, vocabMap, type, true)[0];
      expect(flipped.front.lines).toEqual(normal.back.lines);
      expect(flipped.back.lines).toEqual(normal.front.lines);
    }
    const mat: Table = { headers: ['judul', 'isi'], rows: [['A', 'B']] };
    const normal = buildCards(mat, { judul: 0, penjelasan: 1 }, 'material', false)[0];
    const flipped = buildCards(mat, { judul: 0, penjelasan: 1 }, 'material', true)[0];
    expect(flipped.front.lines).toEqual(normal.back.lines);
    expect(flipped.back.lines).toEqual(normal.front.lines);
  });

  it('skips_rows_with_no_content_and_tolerates_missing_columns', () => {
    const table: Table = {
      headers: ['arab', 'arti'],
      rows: [
        ['كتاب', 'buku'],
        ['', ''],
        ['قلم', 'pena'],
      ],
    };
    // kolom Inggris tidak dipetakan: kartu tetap utuh
    const cards = buildCards(table, { arab: 0, indonesia: 1 }, 'vocab', false);
    expect(cards).toHaveLength(2);
    expect(cards[1].front.lines[0].text).toBe('قلم');
    expect(cards[1].back.lines).toEqual([{ text: 'pena', lang: 'id', role: 'main' }]);

    // satu kolom isi saja sudah cukup
    const one = buildCards({ headers: ['arab'], rows: [['كتاب']] }, { arab: 0 }, 'vocab', false);
    expect(one).toHaveLength(1);
    expect(one[0].front.lines[0].text).toBe('كتاب');
  });

  it('assigns_stable_unique_ids', () => {
    const dup: Table = {
      headers: ['arab', 'arti'],
      rows: [['كتاب', 'buku'], ['كتاب', 'buku'], ['قلم', 'pena']],
    };
    const a = buildCards(dup, { arab: 0, indonesia: 1 }, 'vocab', false);
    const b = buildCards(dup, { arab: 0, indonesia: 1 }, 'vocab', false);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
    expect(new Set(a.map((c) => c.id)).size).toBe(3);
  });

  it('image_key_from_image_column_else_main_word', () => {
    const table: Table = {
      headers: ['arab', 'arti', 'gambar'],
      rows: [['كتاب', 'buku', 'foto1.png'], ['قلم', 'pena', '']],
    };
    const cards = buildCards(table, { arab: 0, indonesia: 1, gambar: 2 }, 'vocab', false);
    expect(cards[0].imageKey).toBe('foto1.png');
    expect(cards[1].imageKey).toBe('قلم');
  });

  it('image_slot_marks_visual_side_and_follows_flip', () => {
    const normal = buildCards(vocabTable, vocabMap, 'vocab', false)[0];
    expect(normal.front.iconKey).toBe('buku');
    expect(normal.back.iconKey).toBeUndefined();
    const flipped = buildCards(vocabTable, vocabMap, 'vocab', true)[0];
    expect(flipped.front.iconKey).toBeUndefined();
    expect(flipped.back.iconKey).toBe('buku');
    const mat = buildCards(
      { headers: ['judul', 'isi'], rows: [['A', 'B']] },
      { judul: 0, penjelasan: 1 },
      'material',
      false,
    )[0];
    expect(mat.front.iconKey).toBeUndefined();
    expect(mat.back.iconKey).toBeUndefined();
  });
});
