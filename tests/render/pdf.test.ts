import { describe, it, expect } from 'vitest';
import { exportPdf } from '../../src/render/pdf';
import type { PdfOptions, Rasterizer } from '../../src/render/pdf';
import { buildCards } from '../../src/core/cards';
import { THEMES } from '../../src/themes/themes';
import type { Card } from '../../src/core/types';

// JPEG 8 x 8 putih yang valid, supaya jsPDF bisa membacanya tanpa kanvas.
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0CiiigD//2Q==';

function makeCards(n: number): Card[] {
  const rows = Array.from({ length: n }, (_, i) => ['كتاب', 'arti-' + i]);
  return buildCards({ headers: ['arab', 'arti'], rows }, { arab: 0, indonesia: 1 }, 'vocab', false);
}

function opts(over: Partial<PdfOptions> = {}): PdfOptions {
  return { perPage: 4, theme: THEMES[0], harakat: true, sides: 'both', cutMarks: false, ...over };
}

describe('exportPdf: tempat render kartu', () => {
  it('cards_are_not_rendered_inside_a_visibility_hidden_host', async () => {
    const seen: string[] = [];
    const rasterize: Rasterizer = async (el) => {
      seen.push(el.parentElement?.style.visibility ?? 'tanpa-induk');
      return { dataUrl: JPEG, release: () => undefined };
    };
    await exportPdf(makeCards(2), opts({ sides: 'front' }), { rasterize });
    expect(seen.length).toBe(2);
    for (const v of seen) expect(v).not.toBe('hidden');
  });
});

function fakeRasterizer() {
  const state = { live: 0, maxLive: 0, calls: 0, seen: [] as string[] };
  const rasterize: Rasterizer = async (el) => {
    state.calls++;
    state.live++;
    state.maxLive = Math.max(state.maxLive, state.live);
    state.seen.push(el.textContent ?? '');
    return {
      dataUrl: JPEG,
      release: () => {
        state.live--;
      },
    };
  };
  return { rasterize, state };
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('gagal membaca blob'));
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      let text = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        text += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      resolve(text);
    };
    reader.readAsArrayBuffer(blob);
  });
}

const pageCount = (pdf: string): number => (pdf.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;

describe('exportPdf', () => {
  it('pdf_has_expected_page_count_and_a4_size', async () => {
    const { rasterize } = fakeRasterizer();
    const blob = await exportPdf(makeCards(5), opts(), { rasterize });
    expect(blob.type).toBe('application/pdf');
    const pdf = await readBlob(blob);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    expect(pageCount(pdf)).toBe(4); // 2 lembar depan + 2 lembar belakang
    const boxes = [...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
    expect(boxes.length >= 4).toBe(true);
    for (const m of boxes) {
      // A4 = 595,28 x 841,89 pt = 210 x 297 mm
      expect(Math.abs(parseFloat(m[1]) / 72 * 25.4 - 210) < 0.2).toBe(true);
      expect(Math.abs(parseFloat(m[2]) / 72 * 25.4 - 297) < 0.2).toBe(true);
    }
  });

  it('side_selection_controls_page_count', async () => {
    const counts: number[] = [];
    for (const sides of ['front', 'back', 'both'] as const) {
      const { rasterize } = fakeRasterizer();
      const pdf = await readBlob(await exportPdf(makeCards(5), opts({ sides }), { rasterize }));
      counts.push(pageCount(pdf));
    }
    expect(counts).toEqual([2, 2, 4]);
  });

  it('reports_progress_per_page', async () => {
    const { rasterize } = fakeRasterizer();
    const calls: [number, number][] = [];
    await exportPdf(makeCards(5), opts({ onProgress: (d, t) => calls.push([d, t]) }), { rasterize });
    expect(calls).toEqual([[1, 4], [2, 4], [3, 4], [4, 4]]);
  });

  it('releases_canvas_between_pages', async () => {
    const { rasterize, state } = fakeRasterizer();
    let progress = 0;
    await exportPdf(makeCards(200), opts({ onProgress: () => progress++ }), { rasterize });
    expect(progress).toBe(100); // 50 lembar depan + 50 belakang
    expect(state.calls).toBe(400); // 200 kartu x 2 sisi
    expect(state.maxLive).toBe(1); // tak pernah dua kanvas hidup bersamaan
    expect(state.live).toBe(0); // semua dilepas
    expect(document.querySelectorAll('.fc-card')).toHaveLength(0);
  }, 60000);

  it('back_pages_render_in_mirrored_order', async () => {
    const rows = [['أ', 'satu'], ['ب', 'dua'], ['ج', 'tiga'], ['د', 'empat']];
    const cards = buildCards({ headers: ['arab', 'arti'], rows }, { arab: 0, indonesia: 1 }, 'vocab', false);
    const { rasterize, state } = fakeRasterizer();
    await exportPdf(cards, opts({ sides: 'back' }), { rasterize });
    expect(state.seen).toEqual(['dua', 'satu', 'empat', 'tiga']);
    const f = fakeRasterizer();
    await exportPdf(cards, opts({ sides: 'front' }), { rasterize: f.rasterize });
    expect(f.state.seen).toEqual(['أ', 'ب', 'ج', 'د']);
  });

  it('cut_marks_option_adds_drawing_to_each_page', async () => {
    const a = fakeRasterizer();
    const b = fakeRasterizer();
    const without = await exportPdf(makeCards(4), opts({ cutMarks: false }), { rasterize: a.rasterize });
    const withMarks = await exportPdf(makeCards(4), opts({ cutMarks: true }), { rasterize: b.rasterize });
    expect(withMarks.size > without.size).toBe(true);
  });

  it('rejects_empty_deck_with_a_clear_indonesian_message', async () => {
    let message = '';
    try {
      await exportPdf([], opts(), { rasterize: fakeRasterizer().rasterize });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message.includes('kartu')).toBe(true);
  });

  it('cleans_up_the_offscreen_host_when_rendering_fails', async () => {
    const before = document.body.children.length;
    const failing: Rasterizer = async () => {
      throw new Error('render gagal');
    };
    let message = '';
    try {
      await exportPdf(makeCards(2), opts(), { rasterize: failing });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toBe('render gagal');
    expect(document.body.children.length).toBe(before);
  });
});
