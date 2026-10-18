import type { Card, Page, PerPage } from './types';

const A4_W = 210;
const A4_H = 297;
const SAFE = 10; // margin aman printer (mm)
const TICK = 4; // panjang tanda potong (mm)
const GAP = 1; // jarak tanda potong dari tepi kartu (mm)

const SHAPE: Record<PerPage, { cols: number; rows: number }> = {
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
  8: { cols: 2, rows: 4 },
  9: { cols: 3, rows: 3 },
};

const floor1 = (v: number): number => Math.floor(v * 10 + 1e-9) / 10;
const floor2 = (v: number): number => Math.floor(v * 100 + 1e-9) / 100;

/** Kisi kartu pada kertas A4 (milimeter). Kartu rapat tanpa celah; margin selalu >= 10 mm. */
export function gridFor(perPage: PerPage): {
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  marginX: number;
  marginY: number;
} {
  const { cols, rows } = SHAPE[perPage];
  const cardW = floor1((A4_W - 2 * SAFE) / cols);
  const cardH = floor1((A4_H - 2 * SAFE) / rows);
  return {
    cols,
    rows,
    cardW,
    cardH,
    marginX: floor2((A4_W - cols * cardW) / 2),
    marginY: floor2((A4_H - rows * cardH) / 2),
  };
}

/** Bagi kartu menjadi lembar sisi depan; slot sisa di lembar terakhir diisi `null`. */
export function paginate(cards: Card[], perPage: PerPage): Page[] {
  const pages: Page[] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    const slots: (Card | null)[] = cards.slice(i, i + perPage);
    while (slots.length < perPage) slots.push(null);
    pages.push({ slots, side: 'front' });
  }
  return pages;
}

/** Lembar sisi belakang untuk cetak bolak-balik: tiap baris dibalik kiri-kanan, slot kosong ikut. */
export function backPages(front: Page[], perPage: PerPage): Page[] {
  const { cols } = SHAPE[perPage];
  return front.map((page) => {
    const slots: (Card | null)[] = [];
    for (let r = 0; r < page.slots.length; r += cols) {
      slots.push(...page.slots.slice(r, r + cols).reverse());
    }
    return { slots, side: 'back' as const };
  });
}

/** Tanda potong pendek di margin, tepat di perpanjangan garis kisi (milimeter). */
export function cutMarks(perPage: PerPage): { x1: number; y1: number; x2: number; y2: number }[] {
  const g = gridFor(perPage);
  const xs = Array.from({ length: g.cols + 1 }, (_, i) => g.marginX + i * g.cardW);
  const ys = Array.from({ length: g.rows + 1 }, (_, j) => g.marginY + j * g.cardH);
  const left = xs[0];
  const right = xs[g.cols];
  const top = ys[0];
  const bottom = ys[g.rows];
  const marks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const x of xs) {
    marks.push({ x1: x, y1: top - GAP - TICK, x2: x, y2: top - GAP });
    marks.push({ x1: x, y1: bottom + GAP, x2: x, y2: bottom + GAP + TICK });
  }
  for (const y of ys) {
    marks.push({ x1: left - GAP - TICK, y1: y, x2: left - GAP, y2: y });
    marks.push({ x1: right + GAP, y1: y, x2: right + GAP + TICK, y2: y });
  }
  return marks;
}
