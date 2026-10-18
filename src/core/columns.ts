import type { ColumnMap, Field, Table } from './types';

export const FIELDS: Field[] = ['arab', 'indonesia', 'inggris', 'gambar', 'judul', 'penjelasan'];

const ALIASES: Record<Field, string[]> = {
  arab: ['arab', 'ar'],
  indonesia: ['indonesia', 'arti', 'indo'],
  inggris: ['inggris', 'english', 'en'],
  gambar: ['gambar', 'image', 'foto'],
  judul: ['judul', 'title', 'topik'],
  penjelasan: ['penjelasan', 'isi', 'keterangan'],
};

/** Benar bila lebih dari separuh huruf (tanpa harakat) berasal dari aksara Arab. */
export function isMostlyArabic(text: string): boolean {
  const letters = text.match(/\p{L}/gu);
  if (!letters) return false;
  const arabic = letters.filter((ch) => /\p{Script=Arabic}/u.test(ch)).length;
  return arabic * 2 > letters.length;
}

export function guessColumns(table: Table): ColumnMap {
  const map: ColumnMap = {};
  const used = new Set<number>();

  table.headers.forEach((header, idx) => {
    const name = header.trim().toLowerCase();
    for (const field of FIELDS) {
      if (map[field] === undefined && ALIASES[field].includes(name)) {
        map[field] = idx;
        used.add(idx);
        break;
      }
    }
  });

  // Nama kolom tak jelas: kolom bertulisan Arab dianggap kolom Arab.
  if (map.arab === undefined) {
    for (let idx = 0; idx < table.headers.length; idx++) {
      if (used.has(idx)) continue;
      const text = table.rows.map((r) => r[idx] ?? '').join(' ');
      if (isMostlyArabic(text)) {
        map.arab = idx;
        break;
      }
    }
  }
  return map;
}
