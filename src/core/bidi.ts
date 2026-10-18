/**
 * Memisah teks campuran Arab dan Latin menjadi potongan, supaya potongan Latin/angka
 * (termasuk tanda kurung dan kutip yang menempel padanya) bisa dibungkus terisolasi
 * dengan arah kiri-ke-kanan. Tanpa isolasi, tanda kurung di batas Arab/Latin ikut
 * arah kanan-ke-kiri sehingga tampil terbalik ("(the" menjadi "the)").
 * Penyambungan semua `text` selalu menghasilkan teks asli.
 */
export interface BidiSegment {
  text: string;
  /** true bila potongan ini Latin/angka dan harus dibungkus terisolasi (kiri-ke-kanan). */
  ltr: boolean;
}

const ARABIC_BLOCKS = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
// Pembuka opsional, satu huruf Latin atau angka, lalu apa pun sampai huruf Arab berikutnya.
const LTR_RUN = new RegExp(
  `[(\\[{"'\\u201C\\u2018]*[A-Za-z\\u00C0-\\u024F0-9][^${ARABIC_BLOCKS}]*`,
  'g',
);

export function splitBidi(text: string): BidiSegment[] {
  const out: BidiSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(LTR_RUN)) {
    const start = m.index ?? 0;
    const run = m[0].replace(/\s+$/, '');
    if (start > last) out.push({ text: text.slice(last, start), ltr: false });
    out.push({ text: run, ltr: true });
    last = start + run.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), ltr: false });
  return out;
}
