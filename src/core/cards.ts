import { isMostlyArabic } from './columns';
import type { Card, CardType, ColumnMap, Field, Line, Side, Table } from './types';

type RawLine = Pick<Line, 'text' | 'lang'>;

const LANG: Record<'arab' | 'indonesia' | 'inggris', Line['lang']> = {
  arab: 'ar',
  indonesia: 'id',
  inggris: 'en',
};

function cell(row: string[], map: ColumnMap, field: Field): string {
  const idx = map[field];
  return idx === undefined ? '' : (row[idx] ?? '').trim();
}

function lines(row: string[], map: ColumnMap, fields: Field[]): RawLine[] {
  const out: RawLine[] = [];
  for (const field of fields) {
    const text = cell(row, map, field);
    if (text === '') continue;
    if (field === 'arab' || field === 'indonesia' || field === 'inggris') {
      out.push({ text, lang: LANG[field] });
    } else {
      // judul dan penjelasan: bahasa ditebak dari aksara
      out.push({ text, lang: isMostlyArabic(text) ? 'ar' : 'id' });
    }
  }
  return out;
}

function toSide(raw: RawLine[], visualKey?: string): Side {
  const side: Side = {
    lines: raw.map((l, i) => ({ text: l.text, lang: l.lang, role: i === 0 ? 'main' : 'sub' })),
  };
  if (visualKey !== undefined) side.iconKey = visualKey;
  return side;
}

// FNV-1a 32-bit: penanda isi baris yang stabil dan pendek.
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/**
 * Sisi yang memuat gambar/ikon (jenis vocab dan picture) ditandai dengan `iconKey`
 * (kata kunci, dipakai Task 5 untuk menaruh gambar dan Task 6 untuk memilih ikon).
 */
export function buildCards(table: Table, map: ColumnMap, type: CardType, flip: boolean): Card[] {
  const cards: Card[] = [];
  table.rows.forEach((row, i) => {
    let front: RawLine[];
    let back: RawLine[];
    if (type === 'vocab') {
      front = lines(row, map, ['arab']);
      back = lines(row, map, ['indonesia', 'inggris']);
    } else if (type === 'picture') {
      front = [];
      back = lines(row, map, ['arab', 'indonesia', 'inggris']);
    } else {
      front = lines(row, map, ['judul']);
      back = lines(row, map, ['penjelasan']);
    }
    // Hanya satu kolom isi: taruh teks pertama di depan supaya kartu tidak kosong.
    if (type !== 'picture' && front.length === 0 && back.length > 0) {
      front = [back[0]];
      back = back.slice(1);
    }
    if (front.length === 0 && back.length === 0) return;

    const word =
      cell(row, map, 'indonesia') || cell(row, map, 'inggris') || cell(row, map, 'arab');
    const mainWord =
      type === 'material'
        ? cell(row, map, 'judul')
        : cell(row, map, 'arab') || cell(row, map, 'indonesia') || cell(row, map, 'inggris');
    const imageKey = cell(row, map, 'gambar') || mainWord;

    // Gambar/ikon selalu dibangun di sisi depan bawaan, lalu ikut berpindah saat ditukar.
    const visual = type === 'material' ? undefined : word;
    let frontSide = toSide(front, visual);
    let backSide = toSide(back);
    if (flip) [frontSide, backSide] = [backSide, frontSide];
    cards.push({
      id: `c${i}-${hash(row.join('\u0001'))}`,
      type,
      front: frontSide,
      back: backSide,
      ...(imageKey ? { imageKey } : {}),
    });
  });
  return cards;
}
