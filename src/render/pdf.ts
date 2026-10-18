import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { backPages, cutMarks as cutMarkLines, gridFor, paginate } from '../core/layout';
import type { Card, Page, PerPage } from '../core/types';
import type { Theme } from '../themes/themes';
import { renderCardSide } from './cardView';

/** Hasil rasterisasi satu sisi kartu. `release` wajib dipanggil agar memori kanvas bebas. */
export interface Raster {
  dataUrl: string;
  release(): void;
}

/** Bagian yang bisa diganti (tes memalsukannya; bawaan memakai peramban nyata). */
export interface PdfDeps {
  rasterize(el: HTMLElement, widthMm: number, heightMm: number): Promise<Raster>;
  nextFrame(): Promise<void>;
}

export interface PdfOptions {
  perPage: PerPage;
  theme: Theme;
  harakat: boolean;
  sides: 'front' | 'back' | 'both';
  cutMarks: boolean;
  onProgress?: (done: number, total: number) => void;
  deps?: Partial<PdfDeps>;
}

const DPI = 300; // resolusi cetak
const CSS_DPI = 96; // 1 px CSS
const MM_PER_INCH = 25.4;
const JPEG_QUALITY = 0.9;

const mmToCssPx = (mm: number): number => (mm / MM_PER_INCH) * CSS_DPI;

/** Rasterisasi lewat peramban: kartu dipasang di luar layar, difoto 300 dpi, lalu dilepas. */
function makeDomRasterizer(): PdfDeps['rasterize'] {
  let warmed = false;
  return async (el, widthMm, heightMm) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none;';
    host.appendChild(el);
    document.body.appendChild(host);
    try {
      if (!warmed) {
        // Pastikan font Arab (Amiri) sudah termuat sebelum kartu pertama difoto.
        try {
          await document.fonts.ready;
        } catch {
          /* peramban lama: lanjut */
        }
      }
      const options = {
        pixelRatio: DPI / CSS_DPI,
        width: mmToCssPx(widthMm),
        height: mmToCssPx(heightMm),
        backgroundColor: '#ffffff',
      };
      if (!warmed) {
        // Foto pertama sering belum memuat font tertanam; buang hasilnya dan foto ulang.
        const warm = await toCanvas(el, options);
        warm.width = 0;
        warm.height = 0;
        warmed = true;
      }
      const canvas = await toCanvas(el, options);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      return {
        dataUrl,
        release: () => {
          canvas.width = 0;
          canvas.height = 0;
        },
      };
    } finally {
      document.body.removeChild(host);
    }
  };
}

/** Beri giliran ke antarmuka (satu frame, dengan batas waktu agar tab di latar tidak macet). */
function defaultNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (): void => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(finish);
    setTimeout(finish, 50);
  });
}

/** Urutan halaman cetak. 'both' = depan lalu belakang tiap lembar (urutan cetak bolak-balik). */
function buildPages(cards: Card[], perPage: PerPage, sides: PdfOptions['sides']): Page[] {
  const front = paginate(cards, perPage);
  const back = backPages(front, perPage);
  if (sides === 'front') return front;
  if (sides === 'back') return back;
  return front.flatMap((f, i) => [f, back[i]]);
}

/** Ekspor kartu menjadi PDF A4. Kartu dirender peramban (Arab bersambung benar), difoto per slot. */
export async function exportPdf(cards: Card[], opts: PdfOptions): Promise<Blob> {
  if (cards.length === 0) throw new Error('Tidak ada kartu untuk diekspor.');
  const rasterize = opts.deps?.rasterize ?? makeDomRasterizer();
  const nextFrame = opts.deps?.nextFrame ?? defaultNextFrame;

  const g = gridFor(opts.perPage);
  const pages = buildPages(cards, opts.perPage, opts.sides);
  const marks = opts.cutMarks ? cutMarkLines(opts.perPage) : [];
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: false });

  for (let p = 0; p < pages.length; p++) {
    if (p > 0) doc.addPage();
    const page = pages[p];
    for (let i = 0; i < page.slots.length; i++) {
      const card = page.slots[i];
      if (!card) continue;
      const x = g.marginX + (i % g.cols) * g.cardW;
      const y = g.marginY + Math.floor(i / g.cols) * g.cardH;
      const el = renderCardSide(card, page.side, opts.theme, {
        harakat: opts.harakat,
        widthMm: g.cardW,
        heightMm: g.cardH,
      });
      const raster = await rasterize(el, g.cardW, g.cardH);
      try {
        doc.addImage(raster.dataUrl, 'JPEG', x, y, g.cardW, g.cardH, undefined, 'FAST');
      } finally {
        raster.release();
      }
    }
    if (marks.length > 0) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      for (const m of marks) doc.line(m.x1, m.y1, m.x2, m.y2);
    }
    opts.onProgress?.(p + 1, pages.length);
    await nextFrame();
  }

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}
