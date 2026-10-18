import { describe, it, expect } from 'vitest';
import { exportPdf, type PdfDeps, type Raster } from '../../src/render/pdf';
import { gridFor } from '../../src/core/layout';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

// JPEG 8x8 putih yang valid (supaya jsPDF bisa membaca dimensinya).
const JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0CiiigD//2Q==';

function mk(id: string): Card {
  return {
    id,
    type: 'vocab',
    front: { lines: [{ text: id, lang: 'ar', role: 'main' }] },
    back: { lines: [{ text: `arti ${id}`, lang: 'id', role: 'main' }] },
  };
}

interface Probe {
  deps: Partial<PdfDeps>;
  seen: { text: string; side: string | null; w: string; wMm: number; hMm: number }[];
  stats: { created: number; released: number; live: number; maxLive: number; frames: number };
}

/** Pemalsu rasterisasi: tidak memakai kanvas, tetapi menghitung pembuatan dan pelepasan. */
function probe(): Probe {
  const stats = { created: 0, released: 0, live: 0, maxLive: 0, frames: 0 };
  const seen: Probe['seen'] = [];
  const deps: Partial<PdfDeps> = {
    rasterize: async (el, wMm, hMm): Promise<Raster> => {
      seen.push({ text: el.textContent ?? '', side: el.getAttribute('data-side'), w: el.style.width, wMm, hMm });
      stats.created += 1;
      stats.live += 1;
      stats.maxLive = Math.max(stats.maxLive, stats.live);
      let done = false;
      return {
        dataUrl: JPEG,
        release: () => {
          if (done) return;
          done = true;
          stats.released += 1;
          stats.live -= 1;
        },
      };
    },
    nextFrame: async () => {
      stats.frames += 1;
    },
  };
  return { deps, seen, stats };
}

function readBinary(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsBinaryString(blob);
  });
}

const pageCount = (pdf: string): number => (pdf.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

const base = { perPage: 4 as const, theme: THEMES[0], harakat: true, sides: 'both' as const, cutMarks: false };

describe('exportPdf', () => {
  it('pdf_has_expected_page_count_and_a4_size', async () => {
    const { deps } = probe();
    const cards = ['A', 'B', 'C', 'D', 'E'].map(mk);
    const blob = await exportPdf(cards, { ...base, deps });
    expect(blob.type).toBe('application/pdf');
    const pdf = await readBinary(blob);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    // 5 kartu, 4 per lembar, depan + belakang = 2 lembar x 2 sisi = 4 halaman
    expect(pageCount(pdf)).toBe(4);
    const boxes = [...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
    expect(boxes).toHaveLength(4);
    for (const m of boxes) {
      // A4 = 210 x 297 mm = 595.28 x 841.89 pt
      expect(Math.abs(Number(m[1]) - 595.28) < 0.1).toBe(true);
      expect(Math.abs(Number(m[2]) - 841.89) < 0.1).toBe(true);
    }
  });

  it('sides_option_controls_which_pages_are_made', async () => {
    const cards = ['A', 'B', 'C', 'D', 'E'].map(mk);
    for (const [sides, pages] of [['front', 2], ['back', 2], ['both', 4]] as const) {
      const { deps } = probe();
      const pdf = await readBinary(await exportPdf(cards, { ...base, sides, deps }));
      expect(pageCount(pdf)).toBe(pages);
    }
  });

  it('empty_slots_are_skipped_and_card_size_comes_from_grid', async () => {
    const { deps, seen } = probe();
    await exportPdf(['A', 'B', 'C', 'D', 'E'].map(mk), { ...base, sides: 'front', deps });
    expect(seen).toHaveLength(5); // 3 slot kosong tidak dirender
    const g = gridFor(4);
    expect(seen[0].w).toBe(`${g.cardW}mm`);
    expect(seen[0].wMm).toBe(g.cardW);
    expect(seen[0].hMm).toBe(g.cardH);
  });

  it('back_side_is_rendered_mirrored_for_duplex', async () => {
    const { deps, seen } = probe();
    await exportPdf(['A', 'B', 'C', 'D'].map(mk), { ...base, deps });
    expect(seen).toHaveLength(8);
    // depan A,B,C,D lalu belakang dicerminkan per baris: B,A,D,C
    expect(seen.slice(0, 4).map((s) => s.side)).toEqual(['front', 'front', 'front', 'front']);
    expect(seen.slice(0, 4).map((s) => s.text)).toEqual(['A', 'B', 'C', 'D']);
    expect(seen.slice(4).map((s) => s.side)).toEqual(['back', 'back', 'back', 'back']);
    expect(seen.slice(4).map((s) => s.text)).toEqual(['arti B', 'arti A', 'arti D', 'arti C']);
  });

  it('reports_progress_per_page', async () => {
    const { deps } = probe();
    const calls: [number, number][] = [];
    await exportPdf(['A', 'B', 'C', 'D', 'E'].map(mk), {
      ...base,
      deps,
      onProgress: (done, total) => calls.push([done, total]),
    });
    expect(calls).toEqual([[1, 4], [2, 4], [3, 4], [4, 4]]);
  });

  it('releases_canvas_between_pages', async () => {
    const { deps, stats } = probe();
    const cards = Array.from({ length: 200 }, (_, i) => mk(`k${i}`));
    let pages = 0;
    await exportPdf(cards, { ...base, perPage: 9, sides: 'front', deps, onProgress: () => (pages += 1) });
    expect(pages).toBe(23); // ceil(200 / 9)
    expect(stats.created).toBe(200);
    expect(stats.released).toBe(200); // semua kanvas dilepas
    expect(stats.maxLive).toBe(1); // tidak pernah menumpuk
    expect(stats.frames).toBeGreaterThanOrEqual(23); // jeda ke antarmuka tiap halaman
  });

  it('cut_marks_are_drawn_only_when_requested', async () => {
    const cards = ['A', 'B', 'C', 'D'].map(mk);
    // Hitung operator garis ("x y l"); selisih on-off membatalkan kecocokan semu di data gambar.
    const lines = (pdf: string): number => (pdf.match(/\d\s+l\s/g) ?? []).length;
    const off = await readBinary(await exportPdf(cards, { ...base, sides: 'front', cutMarks: false, deps: probe().deps }));
    const on = await readBinary(await exportPdf(cards, { ...base, sides: 'front', cutMarks: true, deps: probe().deps }));
    expect(lines(on) - lines(off)).toBe(2 * (2 + 1) + 2 * (2 + 1)); // 12 tanda untuk kisi 2x2
  });

  it('rejects_an_empty_deck_with_a_clear_message', async () => {
    await expect(exportPdf([], { ...base, deps: probe().deps })).rejects.toThrow('Tidak ada kartu');
  });
});
