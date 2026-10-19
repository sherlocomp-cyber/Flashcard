import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../src/ui/main';
import type { Deck } from '../../src/store/decks';

type Handle = { getDeck(): Deck };
const mountApp = mount as unknown as (root: HTMLElement, deps?: Record<string, unknown>) => Handle;

function setup() {
  document.body.innerHTML = '<div id="root"></div>';
  const root = document.getElementById('root') as HTMLElement;
  const deps = {
    store: {
      saveDeck: vi.fn(async () => undefined),
      loadDeck: vi.fn(async () => undefined),
      deleteDeck: vi.fn(async () => undefined),
      listDecks: vi.fn(async () => []),
    },
    readImages: vi.fn(async () => []),
    readText: vi.fn(async () => ''),
    saveFile: vi.fn(async () => undefined),
    printBlob: vi.fn(async () => undefined),
    writeClipboard: vi.fn(async () => undefined),
    exportPdf: vi.fn(async () => new Blob(['%PDF'])),
  };
  const app = mountApp(root, deps);
  return { root, app };
}

const $ = <T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemen tidak ditemukan: ${sel}`);
  return el;
};

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('contoh dan keadaan kosong', () => {
  it('example_button_fills_the_sample_table_and_builds_cards', () => {
    const { root, app } = setup();
    $(root, '#load-example').click();
    expect($<HTMLTextAreaElement>(root, '#paste-input').value).toContain('|');
    expect(app.getDeck().cards).toHaveLength(6);
    expect($(root, '#deck-count').textContent).toBe('6 kartu');
  });

  it('example_button_is_visible_only_while_there_are_no_cards', () => {
    const { root } = setup();
    expect($(root, '#load-example').hidden).toBe(false);
    $(root, '#load-example').click();
    expect($(root, '#load-example').hidden).toBe(true);
  });

  it('empty_preview_shows_a_hint_instead_of_a_blank_page', () => {
    const { root } = setup();
    expect($(root, '#preview-empty').hidden).toBe(false);
    expect($(root, '.sheet-wrap').hidden).toBe(true);
    $(root, '#load-example').click();
    expect($(root, '#preview-empty').hidden).toBe(true);
    expect($(root, '.sheet-wrap').hidden).toBe(false);
  });
});

describe('tata letak', () => {
  it('print_options_live_in_their_own_panel_beside_the_style_not_under_the_preview', () => {
    const { root } = setup();
    expect(root.querySelector('.area-layout #per-page')).not.toBeNull();
    expect(root.querySelector('.area-layout #sides')).not.toBeNull();
    expect(root.querySelector('.area-layout #cut-marks')).not.toBeNull();
    expect(root.querySelector('.stage #per-page')).toBeNull();
  });

  it('primary_actions_sit_above_the_sheet_inside_the_preview', () => {
    const { root } = setup();
    const save = $(root, '.stage #save-pdf');
    const print = $(root, '.stage #print');
    const wrap = $(root, '.sheet-wrap');
    expect(save.compareDocumentPosition(wrap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(print.compareDocumentPosition(wrap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
