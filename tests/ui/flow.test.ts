import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../src/ui/main';
import type { Deck } from '../../src/store/decks';

// Kontrak antarmuka (Task 10): mount(root, deps?) mengembalikan { getDeck }.
// Semua efek samping (berkas, papan klip, PDF, penyimpanan) masuk lewat `deps` supaya bisa diuji di jsdom.
type Handle = { getDeck(): Deck };
const mountApp = mount as unknown as (root: HTMLElement, deps?: Record<string, unknown>) => Handle;

const TABLE = [
  '| arab | arti | inggris |',
  '|---|---|---|',
  '| كتاب | buku | book |',
  '| مدرسة | sekolah | school |',
  '| قلم | pena | pen |',
].join('\n');
const UNKNOWN = '| kata | makna |\n|---|---|\n| a | b |';
const PNG = 'data:image/png;base64,AAAA';

const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

function memoryStore() {
  const m = new Map<string, Deck>();
  return {
    saveDeck: vi.fn(async (d: Deck) => {
      m.set(d.id, d);
    }),
    loadDeck: vi.fn(async (id: string) => m.get(id)),
    deleteDeck: vi.fn(async (id: string) => {
      m.delete(id);
    }),
    listDecks: vi.fn(async () =>
      [...m.values()].map((d) => ({ id: d.id, name: d.name, updatedAt: d.updatedAt })),
    ),
  };
}

function makeDeps(over: Record<string, unknown> = {}) {
  return {
    store: memoryStore(),
    readImages: vi.fn(async () => [] as { name: string; dataUrl: string }[]),
    readText: vi.fn(async () => ''),
    saveFile: vi.fn(async () => undefined),
    printBlob: vi.fn(async () => undefined),
    writeClipboard: vi.fn(async () => undefined),
    exportPdf: vi.fn(async (cards: unknown[]) => {
      if (cards.length === 0) throw new Error('Tidak ada kartu untuk diekspor.');
      return new Blob(['%PDF'], { type: 'application/pdf' });
    }),
    ...over,
  };
}

function setup(over: Record<string, unknown> = {}) {
  document.body.innerHTML = '<div id="root"></div>';
  const root = document.getElementById('root') as HTMLElement;
  const deps = makeDeps(over);
  const app = mountApp(root, deps);
  return { root, deps, app };
}

const $ = <T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemen tidak ditemukan: ${sel}`);
  return el;
};
const $$ = (root: ParentNode, sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));

function paste(root: HTMLElement, text: string): void {
  const box = $<HTMLTextAreaElement>(root, '#paste-input');
  box.value = text;
  box.dispatchEvent(new Event('input', { bubbles: true }));
}
function choose(root: HTMLElement, sel: string, value: string): void {
  const el = $<HTMLSelectElement>(root, sel);
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
function setFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
const firstLine = (root: ParentNode): string => $(root, '.sheet .fc-card .fc-line').textContent ?? '';
const frontValues = (root: ParentNode): string[] =>
  $$(root, '.card-row .edit-front').map((e) => (e as HTMLInputElement).value);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('alur antarmuka', () => {
  it('empty_start_shows_zero_cards_and_a_big_paste_box', () => {
    const { root } = setup();
    expect($(root, '#paste-input')).toBeTruthy();
    expect($(root, '#deck-count').textContent).toBe('0 kartu');
  });

  it('paste_builds_cards_without_extra_clicks', () => {
    const { root } = setup();
    paste(root, TABLE);
    expect($(root, '#deck-count').textContent).toBe('3 kartu');
    expect($$(root, '.sheet .fc-card')).toHaveLength(3);
    expect(root.querySelector('[data-step="map"]')).toBeNull();
  });

  it('mapping_step_shows_only_when_columns_unknown', () => {
    const { root } = setup();
    paste(root, TABLE);
    expect(root.querySelector('[data-step="map"]')).toBeNull();
    paste(root, UNKNOWN);
    expect(root.querySelector('[data-step="map"]')).not.toBeNull();
    paste(root, TABLE);
    expect(root.querySelector('[data-step="map"]')).toBeNull();
  });

  it('theme_change_updates_preview', () => {
    const { root } = setup();
    paste(root, TABLE);
    expect($(root, '.sheet .fc-card').getAttribute('data-theme')).toBe('tosca');
    $(root, '[data-theme-id="koral"]').click();
    expect($(root, '.sheet .fc-card').getAttribute('data-theme')).toBe('koral');
  });

  it('flip_toggle_swaps_preview_sides', () => {
    const { root } = setup();
    paste(root, TABLE);
    expect(firstLine(root)).toBe('كتاب');
    const flip = $<HTMLInputElement>(root, '#flip');
    flip.checked = true;
    flip.dispatchEvent(new Event('change', { bubbles: true }));
    expect(firstLine(root)).toBe('buku');
    flip.checked = false;
    flip.dispatchEvent(new Event('change', { bubbles: true }));
    expect(firstLine(root)).toBe('كتاب');
  });

  it('unmatched_images_are_listed', async () => {
    const { root } = setup({
      readImages: vi.fn(async () => [
        { name: 'buku.png', dataUrl: PNG },
        { name: 'zzz.png', dataUrl: PNG },
      ]),
    });
    paste(root, TABLE);
    setFiles($<HTMLInputElement>(root, '#image-input'), [new File(['x'], 'buku.png', { type: 'image/png' })]);
    await tick();
    expect($$(root, '.unmatched-list li').map((li) => li.textContent)).toEqual(['zzz.png']);
    expect(root.querySelector('.sheet .fc-card img')).not.toBeNull();
  });

  it('editing_a_card_updates_the_deck', () => {
    const { root, app } = setup();
    paste(root, TABLE);
    const input = $<HTMLInputElement>(root, '.card-row .edit-front');
    input.value = 'قلم جديد';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(app.getDeck().cards[0].front.lines[0].text).toBe('قلم جديد');
    expect(firstLine(root)).toBe('قلم جديد');
  });

  it('add_card_updates_count_and_rows', () => {
    const { root } = setup();
    paste(root, TABLE);
    $(root, '#add-card').click();
    expect($(root, '#deck-count').textContent).toBe('4 kartu');
    expect($$(root, '.card-row')).toHaveLength(4);
  });

  it('delete_card_updates_preview', () => {
    const { root } = setup();
    paste(root, TABLE);
    $(root, '.card-row .btn-delete').click();
    expect($(root, '#deck-count').textContent).toBe('2 kartu');
    expect(frontValues(root)).toEqual(['مدرسة', 'قلم']);
    expect(firstLine(root)).toBe('مدرسة');
  });

  it('reorder_card_updates_preview', () => {
    const { root } = setup();
    paste(root, TABLE);
    $(root, '.card-row .btn-down').click();
    expect(frontValues(root)).toEqual(['مدرسة', 'كتاب', 'قلم']);
    expect(firstLine(root)).toBe('مدرسة');
  });

  it('export_then_import_restores_deck', async () => {
    const first = setup();
    paste(first.root, TABLE);
    $(first.root, '[data-theme-id="koral"]').click();
    $(first.root, '#export-deck').click();
    await tick();
    const saveFile = first.deps.saveFile as ReturnType<typeof vi.fn>;
    expect(saveFile).toHaveBeenCalledTimes(1);
    const [name, text] = saveFile.mock.calls[0] as [string, string];
    expect(name.endsWith('.json')).toBe(true);

    const second = setup({ readText: vi.fn(async () => text) });
    setFiles($<HTMLInputElement>(second.root, '#import-input'), [new File([text], name)]);
    await tick();
    expect(second.app.getDeck().cards).toHaveLength(3);
    expect(second.app.getDeck().themeId).toBe('koral');
    expect($(second.root, '#deck-count').textContent).toBe('3 kartu');
  });

  it('import_of_a_bad_file_shows_an_indonesian_error', async () => {
    const { root } = setup({ readText: vi.fn(async () => 'bukan json') });
    setFiles($<HTMLInputElement>(root, '#import-input'), [new File(['x'], 'rusak.json')]);
    await tick();
    expect($(root, '[role="alert"]').textContent).toContain('Berkas dek tidak valid');
  });

  it('copy_prompt_button_copies_text', async () => {
    const { root, deps } = setup();
    $(root, '#copy-prompt').click();
    await tick();
    const write = deps.writeClipboard as ReturnType<typeof vi.fn>;
    expect(write).toHaveBeenCalledTimes(1);
    expect(String(write.mock.calls[0][0])).toContain('tabel');
  });

  it('pdf_button_exports_with_chosen_options', async () => {
    const { root, deps } = setup();
    paste(root, TABLE);
    choose(root, '#per-page', '6');
    choose(root, '#sides', 'front');
    $(root, '#save-pdf').click();
    await tick();
    const exportPdf = deps.exportPdf as ReturnType<typeof vi.fn>;
    expect(exportPdf).toHaveBeenCalledTimes(1);
    const [cards, opts] = exportPdf.mock.calls[0] as [unknown[], Record<string, unknown>];
    expect(cards).toHaveLength(3);
    expect(opts).toMatchObject({ perPage: 6, sides: 'front', harakat: true, cutMarks: true });
    const saveFile = deps.saveFile as ReturnType<typeof vi.fn>;
    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(saveFile.mock.calls[0][0]).toBe('flashcard.pdf');
  });

  it('pdf_error_is_shown_in_indonesian', async () => {
    const { root } = setup();
    $(root, '#save-pdf').click();
    await tick();
    expect($(root, '[role="alert"]').textContent).toContain('Tidak ada kartu untuk diekspor.');
  });

  it('save_then_open_saved_deck', async () => {
    const store = memoryStore();
    const first = setup({ store });
    paste(first.root, TABLE);
    $(first.root, '#save-deck').click();
    await tick();
    expect(store.saveDeck).toHaveBeenCalledTimes(1);

    const second = setup({ store });
    await tick();
    expect($$(second.root, '.saved-deck')).toHaveLength(1);
    $(second.root, '.saved-deck .btn-open').click();
    await tick();
    expect(second.app.getDeck().cards).toHaveLength(3);
    expect($(second.root, '#deck-count').textContent).toBe('3 kartu');
  });
});
