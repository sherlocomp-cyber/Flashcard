import { describe, it, expect } from 'vitest';
import { matchImages, normalizeKey, scaledSize } from '../../src/core/images';
import { buildCards } from '../../src/core/cards';
import type { Table } from '../../src/core/types';

const table: Table = {
  headers: ['arab', 'arti', 'gambar'],
  rows: [
    ['كتاب', 'buku', 'foto1.png'],
    ['قَلَمٌ', 'pena', ''],
    ['باب', 'pintu', ''],
  ],
};
const map = { arab: 0, indonesia: 1, gambar: 2 };

describe('normalizeKey', () => {
  it('normalize_ignores_case_extension_spaces', () => {
    expect(normalizeKey('Buku .PNG')).toBe(normalizeKey('buku'));
    expect(normalizeKey('Ibu_Guru.jpeg')).toBe(normalizeKey('ibu guru'));
    expect(normalizeKey('a.b')).toBe('a.b'); // bukan ekstensi gambar: jangan dipotong
  });

  it('normalize_strips_harakat_and_applies_nfc', () => {
    expect(normalizeKey('كِتَابٌ.jpg')).toBe(normalizeKey('كتاب'));
    expect(normalizeKey('caf\u00e9')).toBe(normalizeKey('cafe\u0301'));
  });
});

describe('matchImages', () => {
  it('matches_by_image_key_or_main_word', () => {
    const cards = buildCards(table, map, 'vocab', false);
    const files = [
      { name: 'Foto1.PNG', dataUrl: 'data:A' }, // kolom gambar
      { name: 'قَلَمٌ.jpg', dataUrl: 'data:B' }, // kata Arab utama (tanpa harakat sama)
      { name: 'pintu.png', dataUrl: 'data:C' }, // kata Indonesia pada baris itu
    ];
    const { cards: out, unmatched } = matchImages(cards, files);
    expect(out.map((c) => c.front.image)).toEqual(['data:A', 'data:B', 'data:C']);
    expect(unmatched).toEqual([]);
  });

  it('reports_unmatched_file_names', () => {
    const cards = buildCards(table, map, 'vocab', false);
    const { unmatched } = matchImages(cards, [
      { name: 'buku.png', dataUrl: 'data:A' },
      { name: 'tidak-ada.png', dataUrl: 'data:B' },
    ]);
    expect(unmatched).toEqual(['tidak-ada.png']);
  });

  it('keeps_cards_without_images_unchanged', () => {
    const cards = buildCards(table, map, 'vocab', false);
    const { cards: out } = matchImages(cards, []);
    expect(out).toEqual(cards);
    const { cards: out2 } = matchImages(cards, [{ name: 'lain.png', dataUrl: 'data:X' }]);
    expect(out2).toEqual(cards);
  });

  it('puts_image_on_the_visual_side_and_skips_material_cards', () => {
    const files = [{ name: 'buku.png', dataUrl: 'data:A' }];
    const flipped = buildCards(table, map, 'vocab', true);
    const f = matchImages(flipped, files).cards[0];
    expect(f.front.image).toBeUndefined();
    expect(f.back.image).toBe('data:A');

    const mat = buildCards(
      { headers: ['judul', 'isi'], rows: [['buku', 'penjelasan']] },
      { judul: 0, penjelasan: 1 },
      'material',
      false,
    );
    const r = matchImages(mat, files);
    expect(r.cards).toEqual(mat);
    expect(r.unmatched).toEqual(['buku.png']);
  });
});

describe('scaledSize', () => {
  it('scales_longest_side_to_max_and_never_upscales', () => {
    expect(scaledSize(1600, 800, 800)).toEqual({ w: 800, h: 400 });
    expect(scaledSize(600, 1200, 800)).toEqual({ w: 400, h: 800 });
    expect(scaledSize(300, 200, 800)).toEqual({ w: 300, h: 200 });
    expect(scaledSize(5000, 1, 800)).toEqual({ w: 800, h: 1 });
  });
});
