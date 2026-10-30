import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { Card, CardType, PerPage } from '../core/types';

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  themeId: string;
  perPage: PerPage;
  type: CardType;
  flip: boolean;
  harakat: boolean;
  updatedAt: number;
}

export type DeckSummary = Pick<Deck, 'id' | 'name' | 'updatedAt'>;

const PREFIX = 'deck:';
const META_PREFIX = 'meta:';
const FORMAT = 'flashcard-deck';
const VERSION = 1;
const PER_PAGE: readonly number[] = [2, 4, 6, 8, 9];
const CARD_TYPES: readonly string[] = ['vocab', 'picture', 'material'];
const LANGS: readonly string[] = ['ar', 'id', 'en'];
const ROLES: readonly string[] = ['main', 'sub'];
/** Batas wajar agar berkas dek asing tidak membekukan peramban. */
const MAX_CARDS = 1000;
const MAX_LINES = 12;
const MAX_TEXT = 2000;
const MAX_IMAGE_CHARS = 8_000_000;
/** Gambar hanya boleh tertanam (data URL): alamat luar membuat peramban mengirim permintaan keluar. */
const DATA_IMAGE = /^data:image\/[a-z0-9.+-]+;base64,/i;

// Dibuat saat pertama dipakai (bukan saat modul dimuat) agar aman di lingkungan tanpa IndexedDB.
let store: UseStore | undefined;
function db(): UseStore {
  store ??= createStore('flashcard', 'decks');
  return store;
}

export async function saveDeck(d: Deck): Promise<void> {
  const summary: DeckSummary = { id: d.id, name: d.name, updatedAt: d.updatedAt };
  await set(PREFIX + d.id, d, db());
  await set(META_PREFIX + d.id, summary, db());
  void requestPersistence();
}

export async function loadDeck(id: string): Promise<Deck | undefined> {
  return get<Deck>(PREFIX + id, db());
}

export async function deleteDeck(id: string): Promise<void> {
  await del(PREFIX + id, db());
  await del(META_PREFIX + id, db());
}

/** Minta peramban menjaga data dek agar tidak dihapus otomatis saat penyimpanan penuh. */
async function requestPersistence(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // tidak didukung: abaikan
  }
}

/**
 * Ringkasan semua dek, terbaru dulu. Hanya ringkasan kecil yang dibaca; kartu dan gambarnya tidak
 * ikut dimuat. Dek lama yang belum punya ringkasan dibaca sekali lalu ringkasannya dibuatkan.
 */
export async function listDecks(): Promise<DeckSummary[]> {
  const all = (await keys(db())).filter((k): k is string => typeof k === 'string');
  const metaIds = new Set(all.filter((k) => k.startsWith(META_PREFIX)).map((k) => k.slice(META_PREFIX.length)));
  const deckIds = all.filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));
  const out: DeckSummary[] = [];
  for (const id of deckIds) {
    let summary = metaIds.has(id) ? await get<DeckSummary>(META_PREFIX + id, db()) : undefined;
    if (!summary) {
      const d = await get<Deck>(PREFIX + id, db());
      if (!d) continue;
      summary = { id: d.id, name: d.name, updatedAt: d.updatedAt };
      await set(META_PREFIX + id, summary, db());
    }
    out.push({ id: summary.id, name: summary.name, updatedAt: summary.updatedAt });
  }
  for (const id of metaIds) {
    // ringkasan yatim (dek sudah tidak ada) dibersihkan
    if (!deckIds.includes(id)) await del(META_PREFIX + id, db());
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Dek sebagai teks JSON berversi (gambar tertanam sebagai data URL). */
export function exportDeckJson(d: Deck): string {
  return JSON.stringify({ format: FORMAT, version: VERSION, deck: d });
}

function invalid(why: string): Error {
  return new Error(`Berkas dek tidak valid: ${why}`);
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function checkLine(l: unknown, where: string): void {
  if (!isObject(l) || typeof l.text !== 'string' || l.text.length > MAX_TEXT) {
    throw invalid(`${where} berisi baris teks yang rusak atau terlalu panjang.`);
  }
  if (typeof l.lang !== 'string' || !LANGS.includes(l.lang)) throw invalid(`bahasa pada ${where} tidak dikenal.`);
  if (typeof l.role !== 'string' || !ROLES.includes(l.role)) throw invalid(`peran baris pada ${where} tidak dikenal.`);
}

function checkSide(side: unknown, where: string): void {
  if (!isObject(side) || !Array.isArray(side.lines)) throw invalid(`${where} tidak lengkap.`);
  if (side.lines.length > MAX_LINES) throw invalid(`${where} punya terlalu banyak baris.`);
  side.lines.forEach((l) => checkLine(l, where));
  if (side.image !== undefined) {
    if (typeof side.image !== 'string' || !DATA_IMAGE.test(side.image) || side.image.length > MAX_IMAGE_CHARS) {
      throw invalid(`gambar pada ${where} bukan gambar tertanam yang aman atau terlalu besar.`);
    }
  }
  if (side.iconKey !== undefined && typeof side.iconKey !== 'string') {
    throw invalid(`kunci ikon pada ${where} rusak.`);
  }
}

function checkCard(c: unknown, i: number): void {
  if (!isObject(c) || typeof c.id !== 'string') throw invalid(`kartu ke-${i + 1} rusak.`);
  if (typeof c.type !== 'string' || !CARD_TYPES.includes(c.type)) {
    throw invalid(`jenis kartu ke-${i + 1} tidak dikenal.`);
  }
  checkSide(c.front, `sisi depan kartu ke-${i + 1}`);
  checkSide(c.back, `sisi belakang kartu ke-${i + 1}`);
}

/** Baca dek dari teks JSON. Melempar galat berbahasa Indonesia bila bentuknya salah. */
export function importDeckJson(json: string): Deck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw invalid('isinya bukan JSON.');
  }
  if (!isObject(parsed) || parsed.format !== FORMAT || !isObject(parsed.deck)) {
    throw invalid('ini bukan berkas dek flashcard.');
  }
  if (typeof parsed.version !== 'number' || parsed.version > VERSION) {
    throw invalid('dibuat oleh versi aplikasi yang lebih baru. Perbarui aplikasi lalu coba lagi.');
  }
  const d = parsed.deck;
  if (typeof d.id !== 'string' || d.id === '') throw invalid('nomor dek hilang.');
  if (typeof d.name !== 'string') throw invalid('nama dek hilang.');
  if (!Array.isArray(d.cards)) throw invalid('daftar kartu hilang.');
  if (typeof d.themeId !== 'string') throw invalid('tema hilang.');
  if (typeof d.perPage !== 'number' || !PER_PAGE.includes(d.perPage)) {
    throw invalid('jumlah kartu per lembar tidak dikenal.');
  }
  if (typeof d.type !== 'string' || !CARD_TYPES.includes(d.type)) throw invalid('jenis kartu tidak dikenal.');
  if (typeof d.flip !== 'boolean' || typeof d.harakat !== 'boolean') throw invalid('pengaturan tidak lengkap.');
  if (typeof d.updatedAt !== 'number') throw invalid('waktu pembaruan hilang.');
  if (d.cards.length > MAX_CARDS) throw invalid(`terlalu banyak kartu (maksimal ${MAX_CARDS}).`);
  d.cards.forEach(checkCard);
  const ids = new Set((d.cards as { id: string }[]).map((c) => c.id));
  if (ids.size !== d.cards.length) throw invalid('ada kartu dengan nomor yang sama.');
  return d as unknown as Deck;
}
