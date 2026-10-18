import { describe, it, expect } from 'vitest';
import { backPages, cutMarks, gridFor, paginate } from '../../src/core/layout';
import type { Card, PerPage } from '../../src/core/types';

const ALL: PerPage[] = [2, 4, 6, 8, 9];
const EPS = 1e-6;

function mk(id: string): Card {
  return { id, type: 'vocab', front: { lines: [] }, back: { lines: [] } };
}
const ids = (slots: (Card | null)[]): (string | null)[] => slots.map((c) => (c ? c.id : null));

describe('gridFor', () => {
  it('grid_fits_inside_a4_for_every_perpage', () => {
    for (const p of ALL) {
      const g = gridFor(p);
      expect(g.cols * g.cardW + 2 * g.marginX <= 210 + EPS).toBe(true);
      expect(g.rows * g.cardH + 2 * g.marginY <= 297 + EPS).toBe(true);
      // margin aman untuk printer rumahan
      expect(g.marginX >= 10 - EPS && g.marginY >= 10 - EPS).toBe(true);
    }
  });

  it('default_four_gives_2x2', () => {
    const g = gridFor(4);
    expect([g.cols, g.rows]).toEqual([2, 2]);
  });

  it('columns_and_rows_match_the_plan_for_every_perpage', () => {
    const shape = ALL.map((p) => [gridFor(p).cols, gridFor(p).rows]);
    expect(shape).toEqual([[1, 2], [2, 2], [2, 3], [2, 4], [3, 3]]);
    for (const p of ALL) {
      const g = gridFor(p);
      expect(g.cols * g.rows).toBe(p);
    }
  });
});

describe('paginate', () => {
  it('paginate_pads_last_page_with_null', () => {
    const cards = ['A', 'B', 'C', 'D', 'E'].map(mk);
    const pages = paginate(cards, 4);
    expect(pages).toHaveLength(2);
    expect(pages[0].side).toBe('front');
    expect(ids(pages[0].slots)).toEqual(['A', 'B', 'C', 'D']);
    expect(ids(pages[1].slots)).toEqual(['E', null, null, null]);
  });

  it('paginate_gives_no_pages_for_no_cards_and_exact_fit_has_no_padding', () => {
    expect(paginate([], 4)).toHaveLength(0);
    const exact = paginate(['A', 'B', 'C', 'D'].map(mk), 4);
    expect(exact).toHaveLength(1);
    expect(ids(exact[0].slots)).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('backPages', () => {
  it('back_pages_mirror_each_row', () => {
    const front = paginate(['A', 'B', 'C', 'D'].map(mk), 4);
    const back = backPages(front, 4);
    expect(back[0].side).toBe('back');
    expect(ids(back[0].slots)).toEqual(['B', 'A', 'D', 'C']);

    const nine = paginate(['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(mk), 9);
    expect(ids(backPages(nine, 9)[0].slots)).toEqual(['3', '2', '1', '6', '5', '4', '9', '8', '7']);

    const two = paginate(['A', 'B'].map(mk), 2); // satu kolom: tidak ada yang bergeser
    expect(ids(backPages(two, 2)[0].slots)).toEqual(['A', 'B']);
  });

  it('mirror_keeps_card_identity_with_nulls', () => {
    const front = paginate(['A', 'B', 'C', 'D', 'E'].map(mk), 4);
    const back = backPages(front, 4);
    // slot kosong ikut dicerminkan; E tetap di barisnya, hanya pindah kolom
    expect(ids(back[1].slots)).toEqual([null, 'E', null, null]);
    expect(back[1].slots[1]).toBe(front[1].slots[0]);
    // kartu yang sama (objek yang sama) di depan dan belakang
    expect(back[0].slots[0]).toBe(front[0].slots[1]);
  });
});

describe('cutMarks', () => {
  it('cut_marks_lie_on_grid_lines_outside_the_cards', () => {
    for (const p of ALL) {
      const g = gridFor(p);
      const xs = Array.from({ length: g.cols + 1 }, (_, i) => g.marginX + i * g.cardW);
      const ys = Array.from({ length: g.rows + 1 }, (_, j) => g.marginY + j * g.cardH);
      const left = xs[0], right = xs[g.cols], top = ys[0], bottom = ys[g.rows];
      const marks = cutMarks(p);
      expect(marks).toHaveLength(2 * (g.cols + 1) + 2 * (g.rows + 1));
      for (const m of marks) {
        const vertical = Math.abs(m.x1 - m.x2) < EPS;
        const horizontal = Math.abs(m.y1 - m.y2) < EPS;
        expect(vertical !== horizontal).toBe(true);
        if (vertical) {
          expect(xs.some((x) => Math.abs(x - m.x1) < EPS)).toBe(true);
          // tanda ada di margin atas atau bawah, tidak masuk ke area kartu
          const inTop = Math.max(m.y1, m.y2) <= top + EPS;
          const inBottom = Math.min(m.y1, m.y2) >= bottom - EPS;
          expect(inTop || inBottom).toBe(true);
        } else {
          expect(ys.some((y) => Math.abs(y - m.y1) < EPS)).toBe(true);
          const inLeft = Math.max(m.x1, m.x2) <= left + EPS;
          const inRight = Math.min(m.x1, m.x2) >= right - EPS;
          expect(inLeft || inRight).toBe(true);
        }
        for (const v of [m.x1, m.x2]) expect(v >= 0 && v <= 210).toBe(true);
        for (const v of [m.y1, m.y2]) expect(v >= 0 && v <= 297).toBe(true);
      }
    }
  });
});
