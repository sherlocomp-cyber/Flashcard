import type { Card } from './types';

const HARAKAT = /[\u064B-\u065F\u0670\u0640]/g; // harakat dan tatwil
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/;

/** Kunci pencocokan: NFC, tanpa harakat, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis. */
export function normalizeKey(s: string): string {
  return s
    .normalize('NFC')
    .replace(HARAKAT, '')
    .toLowerCase()
    .trim()
    .replace(IMAGE_EXT, '')
    .replace(/[\s_-]+/g, '');
}

function candidateKeys(card: Card): string[] {
  const raw = [
    card.imageKey ?? '',
    card.front.iconKey ?? '',
    card.back.iconKey ?? '',
    ...card.front.lines.map((l) => l.text),
    ...card.back.lines.map((l) => l.text),
  ];
  const keys: string[] = [];
  for (const r of raw) {
    const k = normalizeKey(r);
    if (k !== '' && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

export interface ImageFile {
  name: string;
  dataUrl: string;
}

/**
 * Cocokkan gambar ke kartu lewat nama berkas. Urutan kunci: kolom gambar atau kata utama
 * (`imageKey`), lalu kata kunci ikon, lalu teks tiap baris kartu. Gambar ditaruh di sisi yang
 * punya `iconKey` (jenis vocab dan picture); kartu materi tidak diberi gambar.
 */
export function matchImages(
  cards: Card[],
  files: ImageFile[],
): { cards: Card[]; unmatched: string[] } {
  const byKey = new Map<string, ImageFile>();
  for (const f of files) {
    const k = normalizeKey(f.name);
    if (k !== '' && !byKey.has(k)) byKey.set(k, f);
  }
  const usedKeys = new Set<string>();

  const out = cards.map((card): Card => {
    const slot =
      card.front.iconKey !== undefined ? 'front' : card.back.iconKey !== undefined ? 'back' : null;
    if (slot === null) return card;
    for (const key of candidateKeys(card)) {
      const file = byKey.get(key);
      if (!file) continue;
      usedKeys.add(key);
      return slot === 'front'
        ? { ...card, front: { ...card.front, image: file.dataUrl } }
        : { ...card, back: { ...card.back, image: file.dataUrl } };
    }
    return card;
  });

  const unmatched = files.filter((f) => !usedKeys.has(normalizeKey(f.name))).map((f) => f.name);
  return { cards: out, unmatched };
}

/** Ukuran baru dengan sisi terpanjang paling besar `maxPx`; tidak pernah memperbesar. */
export function scaledSize(w: number, h: number, maxPx: number): { w: number; h: number } {
  const scale = Math.min(1, maxPx / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

/**
 * Perkecil gambar unggahan lewat kanvas. Hasil PNG bila ada piksel transparan,
 * selain itu JPEG. Kanvas dilepas setelah dipakai supaya memori tidak menumpuk.
 * (Memerlukan browser; diuji lewat alur antarmuka dan uji manual, bukan jsdom.)
 */
export async function downscale(file: File, maxPx = 800): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const { w, h } = scaledSize(img.naturalWidth, img.naturalHeight, maxPx);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Kanvas tidak tersedia di perangkat ini.');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let transparent = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        transparent = true;
        break;
      }
    }
    const result = canvas.toDataURL(transparent ? 'image/png' : 'image/jpeg', 0.85);
    canvas.width = 0;
    canvas.height = 0;
    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}
