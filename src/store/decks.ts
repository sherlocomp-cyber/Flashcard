import { createStore, del, get, getMany, keys, set, type UseStore } from 'idb-keyval';
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
const FORMAT = 'flashcard-deck';
const VERSION = 1;
const PER_PAGE: readonly number[] = [2, 4, 6, 8, 9];
const CARD_TYPES: readonly string[] = ['vocab', 'picture', 'material'];

// Dibuat saat pertama dipakai (bukan saat modul dimuat) agar aman di lingkungan tanpa IndexedDB.
let store: UseStore | undefined;
function db(): UseStore {
  store ??= createStore('flashcard', 'decks');
  return store;
}

export async function saveDeck(d: Deck): Promise<void> {
  await set(PREFIX + d.id, d, db());
}

export async function loadDeck(id: string): Promise<Deck | undefined> {
  return get<Deck>(PREFIX + id, db());
}

export async function deleteDeck(id: string): Promise<void> {
  await del(PREFIX + id, db());
}

/** Ringkasan semua dek, terbaru dulu. Kartu (dan gambarnya) tidak ikut dibawa. */
export async function listDecks(): Promise<DeckSummary[]> {
  const all = await keys(db());
  const wanted = all.filter((k): k is string => typeof k === 'string' && k.startsWith(PREFIX));
  const decks = await getMany<Deck>(wanted, db());
  return decks
    .filter((d): d is Deck => d !== undefined)
    .map((d) => ({ id: d.id, name: d.name, updatedAt: d.updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
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

function checkSide(side: unknown, where: string): void {
  if (!isObject(side) || !Array.isArray(side.lines)) throw invalid(`${where} tidak lengkap.`);
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
  d.cards.forEach(checkCard);
  return d as unknown as Deck;
}
