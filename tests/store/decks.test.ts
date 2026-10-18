import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteDeck,
  exportDeckJson,
  importDeckJson,
  listDecks,
  loadDeck,
  saveDeck,
  type Deck,
} from '../../src/store/decks';
import type { Card } from '../../src/core/types';

function card(id: string, image?: string): Card {
  return {
    id,
    type: 'vocab',
    front: { lines: [{ text: 'كِتَابٌ', lang: 'ar', role: 'main' }], image, iconKey: 'buku' },
    back: {
      lines: [
        { text: 'buku', lang: 'id', role: 'main' },
        { text: 'book', lang: 'en', role: 'sub' },
      ],
    },
    imageKey: 'buku',
  };
}

function deck(id: string, updatedAt: number, cards: Card[] = [card(`${id}-1`)]): Deck {
  return {
    id,
    name: `Dek ${id}`,
    cards,
    themeId: 'tosca',
    perPage: 4,
    type: 'vocab',
    flip: false,
    harakat: true,
    updatedAt,
  };
}

beforeEach(async () => {
  for (const d of await listDecks()) await deleteDeck(d.id);
});

describe('deck storage', () => {
  it('save_then_load_roundtrips', async () => {
    const d = deck('a', 1000);
    await saveDeck(d);
    expect(await loadDeck('a')).toEqual(d);
  });

  it('load_returns_undefined_for_unknown_id', async () => {
    expect(await loadDeck('tidak-ada')).toBeUndefined();
  });

  it('saving_the_same_id_overwrites', async () => {
    await saveDeck(deck('a', 1000));
    await saveDeck({ ...deck('a', 2000), name: 'Baru' });
    const all = await listDecks();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Baru');
  });

  it('list_is_sorted_newest_first', async () => {
    await saveDeck(deck('lama', 1000));
    await saveDeck(deck('baru', 3000));
    await saveDeck(deck('tengah', 2000));
    const all = await listDecks();
    expect(all.map((d) => d.id)).toEqual(['baru', 'tengah', 'lama']);
    // hanya ringkasan, tanpa kartu
    expect(Object.keys(all[0]).sort()).toEqual(['id', 'name', 'updatedAt']);
  });

  it('delete_removes', async () => {
    await saveDeck(deck('a', 1000));
    await saveDeck(deck('b', 2000));
    await deleteDeck('a');
    expect(await loadDeck('a')).toBeUndefined();
    expect((await listDecks()).map((d) => d.id)).toEqual(['b']);
  });
});

describe('deck export and import', () => {
  it('export_import_roundtrips_including_image_data', async () => {
    const img = 'data:image/png;base64,' + 'iVBORw0KGgo'.repeat(5000);
    const d = deck('x', 5000, [card('x-1', img), card('x-2')]);
    const back = importDeckJson(exportDeckJson(d));
    expect(back).toEqual(d);
    expect(back.cards[0].front.image).toBe(img);
  });

  it('import_rejects_invalid_json_with_clear_error', () => {
    expect(() => importDeckJson('bukan json {')).toThrow(/Berkas dek tidak valid/);
    expect(() => importDeckJson('')).toThrow(/Berkas dek tidak valid/);
  });

  it('import_rejects_wrong_shape_with_clear_error', () => {
    expect(() => importDeckJson('[]')).toThrow(/Berkas dek tidak valid/);
    expect(() => importDeckJson('{"id":"a"}')).toThrow(/Berkas dek tidak valid/);
    const d = deck('a', 1);
    const bad = JSON.parse(exportDeckJson(d));
    bad.deck.perPage = 5;
    expect(() => importDeckJson(JSON.stringify(bad))).toThrow(/Berkas dek tidak valid/);
    const noCards = JSON.parse(exportDeckJson(d));
    noCards.deck.cards = 'bukan larik';
    expect(() => importDeckJson(JSON.stringify(noCards))).toThrow(/Berkas dek tidak valid/);
  });
});
