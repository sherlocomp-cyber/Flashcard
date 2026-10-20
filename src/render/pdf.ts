import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { backPages, cutMarks, gridFor, paginate } from '../core/layout';
import type { Card, Page, PerPage } from '../core/types';
import type { Theme } from '../themes/themes';
import { renderCardSide } from './cardView';

export interface PdfOptions {
  perPage: PerPage;
  theme: Theme;
  harakat: boolean;
  sides: 'front' | 'back' | 'both';
  cutMarks: boolean;
  onProgress?: (done: number, total: number) => void;
}

/** Hasil mengubah satu kartu menjadi gambar; `release` melepas kanvas sesudah gambar ditempel. */
export interface Rasterized {
  dataUrl: string;
  release: () => void;
}
export type Rasterizer = (el: HTMLElement, pixelRatio: number) => Promise<Rasterized>;

/** 300 dpi dibagi 96 dpi CSS. */
const PIXEL_RATIO = 300 / 96;

// Kartu dirender oleh peramban (huruf Arab bersambung dan harakat benar) lalu dijadikan gambar.
const defaultRasterize: Rasterizer = async (el, pixelRatio) => {
  const canvas = await toCanvas(el, { pixelRatio, backgroundColor: '#ffffff' });
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    release: () => {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
};

// Beri antarmuka kesempatan menggambar ulang (bilah kemajuan) tanpa bergantung pada tab yang terlihat.
const yieldToUi = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function waitForFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  try {
    await Promise.all([fonts.load("400 40px 'Amiri'"), fonts.load("700 40px 'Amiri'")]);
    await fonts.ready;
  } catch {
    // font gagal dimuat: lanjut dengan font cadangan, jangan menggagalkan ekspor
  }
}

/** Urutan lembar. 'both' disisipkan depan lalu belakang per lembar fisik (urutan cetak dua sisi). */
function sheetOrder(front: Page[], back: Page[], sides: PdfOptions['sides']): Page[] {
  const pages: Page[] = [];
  for (let i = 0; i < front.length; i++) {
    if (sides !== 'back') pages.push(front[i]);
    if (sides !== 'front') pages.push(back[i]);
  }
  return pages;
}

export async function exportPdf(
  cards: Card[],
  opts: PdfOptions,
  deps: { rasterize?: Rasterizer } = {},
): Promise<Blob> {
  if (cards.length === 0) throw new Error('Belum ada kartu untuk dijadikan PDF.');
  const rasterize = deps.rasterize ?? defaultRasterize;
  const grid = gridFor(opts.perPage);
  const front = paginate(cards, opts.perPage);
  const pages = sheetOrder(front, backPages(front, opts.perPage), opts.sides);
  const marks = opts.cutMarks ? cutMarks(opts.perPage) : [];

  await waitForFonts();

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden;';
  document.body.appendChild(host);
  try {
    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      if (p > 0) doc.addPage('a4', 'portrait');
      for (let s = 0; s < page.slots.length; s++) {
        const card = page.slots[s];
        if (!card) continue;
        const col = s % grid.cols;
        const row = Math.floor(s / grid.cols);
        const el = renderCardSide(card, page.side === 'front' ? 'front' : 'back', opts.theme, {
          harakat: opts.harakat,
          widthMm: grid.cardW,
          heightMm: grid.cardH,
        });
        host.appendChild(el);
        let image: Rasterized | undefined;
        try {
          image = await rasterize(el, PIXEL_RATIO);
          doc.addImage(
            image.dataUrl,
            'JPEG',
            grid.marginX + col * grid.cardW,
            grid.marginY + row * grid.cardH,
            grid.cardW,
            grid.cardH,
          );
        } finally {
          image?.release();
          host.removeChild(el);
        }
      }
      if (marks.length > 0) {
        doc.setDrawColor(90);
        doc.setLineWidth(0.2);
        for (const m of marks) doc.line(m.x1, m.y1, m.x2, m.y2);
      }
      opts.onProgress?.(p + 1, pages.length);
      await yieldToUi();
    }
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } finally {
    document.body.removeChild(host);
  }
}
