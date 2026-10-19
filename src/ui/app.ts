import { buildAiPrompt } from '../core/aiPrompt';
import { buildCards } from '../core/cards';
import { FIELDS, guessColumns } from '../core/columns';
import { downscale, matchImages, type ImageFile } from '../core/images';
import { backPages, gridFor, paginate } from '../core/layout';
import { parseTable } from '../core/parse';
import type { Card, CardType, ColumnMap, Field, PerPage, Table } from '../core/types';
import { renderCardSide } from '../render/cardView';
import type { PdfOptions } from '../render/pdf';
import {
  deleteDeck,
  exportDeckJson,
  importDeckJson,
  listDecks,
  loadDeck,
  saveDeck,
  type Deck,
  type DeckSummary,
} from '../store/decks';
import { THEMES, customTheme, type Theme } from '../themes/themes';
import { h, icon } from './dom';
import { sheetScale } from './scale';

/** Semua efek samping masuk lewat sini supaya alur bisa diuji tanpa peramban nyata. */
export interface AppDeps {
  store: {
    saveDeck(d: Deck): Promise<void>;
    loadDeck(id: string): Promise<Deck | undefined>;
    deleteDeck(id: string): Promise<void>;
    listDecks(): Promise<DeckSummary[]>;
  };
  readImages(files: File[]): Promise<ImageFile[]>;
  readText(file: File): Promise<string>;
  saveFile(name: string, data: string | Blob, mime: string): Promise<void>;
  printBlob(blob: Blob): Promise<void>;
  writeClipboard(text: string): Promise<void>;
  exportPdf(cards: Card[], opts: PdfOptions): Promise<Blob>;
}

export interface AppHandle {
  getDeck(): Deck;
}

const FIELD_LABEL: Record<Field, string> = {
  arab: 'Kata Arab',
  indonesia: 'Arti Indonesia',
  inggris: 'Arti Inggris',
  gambar: 'Nama gambar',
  judul: 'Judul materi',
  penjelasan: 'Penjelasan materi',
};
const TYPE_LABEL: Record<CardType, string> = {
  vocab: 'Kosakata dan arti',
  picture: 'Gambar tebak kata',
  material: 'Materi dan penjelasan',
};
const PER_PAGE: PerPage[] = [2, 4, 6, 8, 9];
/** Bantalan kiri+kanan `.sheet-wrap` (0,75rem × 2) yang tidak tersedia untuk lembar. */
const WRAP_PADDING_PX = 24;
/** Ruang di layar lebar untuk kepala, alat, dan tombol cetak di sekitar lembar pratinjau. */
const STAGE_CHROME_PX = 300;

/** Tabel contoh: enam kosakata dasar, supaya guru bisa langsung melihat hasilnya tanpa menyiapkan tabel. */
const SAMPLE_TABLE = [
  '| arab | arti | inggris |',
  '| كِتَابٌ | buku | book |',
  '| قَلَمٌ | pena | pen |',
  '| مَدْرَسَةٌ | sekolah | school |',
  '| بَيْتٌ | rumah | house |',
  '| مُعَلِّمٌ | guru | teacher |',
  '| طَالِبٌ | siswa | student |',
].join('\n');

function defaultDeps(): AppDeps {
  return {
    store: { saveDeck, loadDeck, deleteDeck, listDecks },
    readImages: async (files) => {
      const done = await Promise.all(
        files.map((f) =>
          downscale(f, 800).then(
            (dataUrl): ImageFile => ({ name: f.name, dataUrl }),
            () => null,
          ),
        ),
      );
      return done.filter((x): x is ImageFile => x !== null);
    },
    readText: (file) => file.text(),
    saveFile: async (name, data, mime) => {
      const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    printBlob: async (blob) => {
      const url = URL.createObjectURL(blob);
      const frame = h('iframe', { src: url, class: 'print-frame', 'aria-hidden': 'true' });
      frame.addEventListener('load', () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => {
          frame.remove();
          URL.revokeObjectURL(url);
        }, 60_000);
      });
      document.body.appendChild(frame);
    },
    writeClipboard: async (text) => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const area = h('textarea', { value: text, class: 'offscreen', 'aria-hidden': 'true' });
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      if (!ok) throw new Error('Peramban menolak menyalin.');
    },
    exportPdf: async (cards, opts) => {
      const mod = await import('../render/pdf');
      return mod.exportPdf(cards, opts);
    },
  };
}

const message = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'dek';

let counter = 0;
const newId = (prefix: string): string => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

interface State {
  deckId: string;
  name: string;
  tableText: string;
  table: Table | null;
  map: ColumnMap;
  needsMap: boolean;
  type: CardType;
  flip: boolean;
  harakat: boolean;
  themeId: string;
  perPage: PerPage;
  sides: PdfOptions['sides'];
  cutMarks: boolean;
  cards: Card[];
  images: ImageFile[];
  unmatched: string[];
  pageIndex: number;
  previewSide: 'front' | 'back';
  busy: boolean;
}

export function createApp(root: HTMLElement, partial: Partial<AppDeps> = {}): AppHandle {
  const deps: AppDeps = { ...defaultDeps(), ...partial };
  const s: State = {
    deckId: newId('d'),
    name: 'Dek baru',
    tableText: '',
    table: null,
    map: {},
    needsMap: false,
    type: 'vocab',
    flip: false,
    harakat: true,
    themeId: THEMES[0].id,
    perPage: 4,
    sides: 'both',
    cutMarks: true,
    cards: [],
    images: [],
    unmatched: [],
    pageIndex: 0,
    previewSide: 'front',
    busy: false,
  };

  // ---------- helpers ----------
  const theme = (): Theme => {
    if (s.themeId.startsWith('custom')) return customTheme(s.themeId.split(':')[1] ?? '');
    return THEMES.find((t) => t.id === s.themeId) ?? THEMES[0];
  };

  const getDeck = (): Deck => ({
    id: s.deckId,
    name: s.name.trim() || 'Dek baru',
    cards: s.cards,
    themeId: s.themeId,
    perPage: s.perPage,
    type: s.type,
    flip: s.flip,
    harakat: s.harakat,
    updatedAt: Date.now(),
  });

  // ---------- pesan ----------
  const messages = h('div', { id: 'messages', 'aria-live': 'polite' });
  const clearMessages = (): void => messages.replaceChildren();
  const showError = (text: string): void => {
    clearMessages();
    messages.append(h('p', { class: 'msg msg-error', role: 'alert' }, text));
  };
  const showNotice = (text: string): void => {
    clearMessages();
    messages.append(h('p', { class: 'msg msg-ok', role: 'status' }, text));
  };

  // ---------- bagian tempel ----------
  const pasteBox = h('textarea', {
    id: 'paste-input',
    rows: 6,
    spellcheck: 'false',
    placeholder: 'Tempel tabel di sini: dari Excel, Google Sheets, atau hasil AI.\n\n| arab | arti | inggris |\n| كتاب | buku | book |',
    'aria-describedby': 'paste-hint',
    onInput: () => onPaste(),
  });
  const copyPrompt = h(
    'button',
    { id: 'copy-prompt', type: 'button', class: 'btn btn-quiet', onClick: () => void onCopyPrompt() },
    icon('copy'),
    'Salin teks perintah untuk AI',
  );
  const exampleBtn = h(
    'button',
    { id: 'load-example', type: 'button', class: 'btn', onClick: () => onExample() },
    'Coba dengan tabel contoh',
  );
  const mapSlot = h('div', { id: 'map-slot' });

  // ---------- gaya ----------
  const typeButtons = new Map<CardType, HTMLButtonElement>();
  const typeGroup = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Jenis kartu' });
  (Object.keys(TYPE_LABEL) as CardType[]).forEach((t) => {
    const b = h('button', { type: 'button', role: 'radio', class: 'seg-btn', 'data-type': t, onClick: () => onType(t) }, TYPE_LABEL[t]);
    typeButtons.set(t, b);
    typeGroup.append(b);
  });

  const themeButtons = new Map<string, HTMLButtonElement>();
  const themeGroup = h('div', { class: 'themes', role: 'group', 'aria-label': 'Tema kartu' });
  THEMES.forEach((t) => {
    const b = h(
      'button',
      { type: 'button', class: 'theme-chip', 'data-theme-id': t.id, 'aria-pressed': 'false', onClick: () => onTheme(t.id) },
      h('span', { class: 'swatch', style: `--c:${t.color};--t:${t.tint}`, 'aria-hidden': 'true' }),
      h('span', { class: 'theme-name' }, t.name),
    );
    themeButtons.set(t.id, b);
    themeGroup.append(b);
  });
  const customColor = h('input', {
    id: 'custom-color',
    type: 'color',
    value: '#14b8a6',
    'aria-label': 'Warna sendiri',
    onInput: () => onTheme(`custom:${customColor.value}`),
  });
  themeGroup.append(h('label', { class: 'theme-chip theme-custom' }, customColor, h('span', { class: 'theme-name' }, 'Warna sendiri')));

  const flipBox = h('input', { id: 'flip', type: 'checkbox', onChange: () => onFlip() });
  const harakatBox = h('input', { id: 'harakat', type: 'checkbox', checked: true, onChange: () => onHarakat() });

  // ---------- pratinjau ----------
  const countEl = h('span', { id: 'deck-count', class: 'count' }, '0 kartu');
  const sheetsEl = h('span', { class: 'muted' });
  const sheetLabel = h('span', { id: 'sheet-label', class: 'muted' });
  const prevBtn = h('button', { id: 'sheet-prev', type: 'button', class: 'btn btn-icon', 'aria-label': 'Lembar sebelumnya', onClick: () => onSheet(-1) }, icon('left'));
  const nextBtn = h('button', { id: 'sheet-next', type: 'button', class: 'btn btn-icon', 'aria-label': 'Lembar berikutnya', onClick: () => onSheet(1) }, icon('right'));
  const sideBtns = new Map<'front' | 'back', HTMLButtonElement>();
  const sideGroup = h('div', { class: 'seg seg-small', role: 'radiogroup', 'aria-label': 'Sisi yang dilihat' });
  (['front', 'back'] as const).forEach((side) => {
    const b = h('button', { type: 'button', role: 'radio', class: 'seg-btn', 'data-preview-side': side, onClick: () => onPreviewSide(side) }, side === 'front' ? 'Depan' : 'Belakang');
    sideBtns.set(side, b);
    sideGroup.append(b);
  });
  const sheet = h('div', { class: 'sheet' });
  const sheetFrame = h('div', { class: 'sheet-frame' }, sheet);
  const sheetWrap = h('div', { class: 'sheet-wrap' }, sheetFrame);
  const previewEmpty = h(
    'div',
    { id: 'preview-empty', class: 'preview-empty' },
    h('strong', {}, 'Lembar A4 muncul di sini'),
    h('p', {}, 'Tempel tabel di kolom kiri, atau pakai tabel contoh untuk melihat hasilnya dalam sekejap.'),
  );
  const overflowNote = h('p', { id: 'overflow-note', class: 'msg msg-warn', role: 'status', hidden: true });

  // ---------- cetak ----------
  const perPageSel = h(
    'select',
    { id: 'per-page', onChange: () => onPerPage() },
    ...PER_PAGE.map((n) => h('option', { value: String(n), selected: n === s.perPage }, `${n} kartu per lembar`)),
  );
  const sidesSel = h(
    'select',
    { id: 'sides', onChange: () => onSides() },
    h('option', { value: 'both', selected: true }, 'Depan dan belakang (bolak-balik)'),
    h('option', { value: 'front' }, 'Depan saja'),
    h('option', { value: 'back' }, 'Belakang saja'),
  );
  const cutBox = h('input', { id: 'cut-marks', type: 'checkbox', checked: true, onChange: () => { s.cutMarks = cutBox.checked; } });
  const savePdfBtn = h('button', { id: 'save-pdf', type: 'button', class: 'btn btn-primary', onClick: () => void onSavePdf() }, icon('download'), 'Simpan PDF');
  const printBtn = h('button', { id: 'print', type: 'button', class: 'btn', onClick: () => void onPrint() }, icon('print'), 'Cetak');
  const progressEl = h('p', { id: 'progress', class: 'muted', 'aria-live': 'polite' });

  // ---------- gambar ----------
  const imageInput = h('input', {
    id: 'image-input',
    type: 'file',
    accept: 'image/*',
    multiple: true,
    class: 'file-input',
    onChange: () => void onImages(),
  });
  const unmatchedSlot = h('div', { id: 'unmatched-slot' });

  // ---------- daftar kartu ----------
  const rowsEl = h('ol', { class: 'rows' });
  const addBtn = h('button', { id: 'add-card', type: 'button', class: 'btn', onClick: () => onAdd() }, icon('plus'), 'Tambah kartu');

  // ---------- dek ----------
  const nameInput = h('input', { id: 'deck-name', type: 'text', value: s.name, 'aria-label': 'Nama dek', onInput: () => { s.name = nameInput.value; } });
  const saveBtn = h('button', { id: 'save-deck', type: 'button', class: 'btn', onClick: () => void onSaveDeck() }, icon('save'), 'Simpan di perangkat');
  const exportBtn = h('button', { id: 'export-deck', type: 'button', class: 'btn', onClick: () => void onExportDeck() }, icon('download'), 'Ekspor berkas dek');
  const importInput = h('input', { id: 'import-input', type: 'file', accept: '.json,application/json', class: 'file-input', onChange: () => void onImport() });
  const savedList = h('ul', { class: 'saved-list' });

  // ---------- rangka halaman ----------
  const panel = (area: string, title: string, ...kids: (Node | string | null)[]): HTMLElement =>
    h('section', { class: `panel ${area}` }, h('h2', {}, title), ...kids);

  const shell = h(
    'div',
    { class: 'app' },
    h('header', { class: 'topbar' }, h('h1', {}, 'Flashcard Arab'), h('p', {}, 'Tempel tabel, pilih tema, cetak kartu A4.')),
    messages,
    h(
      'main',
      { class: 'layout' },
      h(
        'section',
        { class: 'panel area-paste' },
        h('h2', {}, 'Tempel tabel'),
        h('p', { id: 'paste-hint', class: 'hint' }, 'Kartu langsung terbentuk begitu tabel ditempel. Satu baris sama dengan satu kartu.'),
        pasteBox,
        h('div', { class: 'row-end' }, exampleBtn, copyPrompt),
      ),
      h('div', { class: 'area-map' }, mapSlot),
      h(
        'section',
        { class: 'panel area-style' },
        h('h2', {}, 'Gaya kartu'),
        h('div', { class: 'field' }, h('span', { class: 'label' }, 'Jenis kartu'), typeGroup),
        h('div', { class: 'field' }, h('span', { class: 'label' }, 'Tema'), themeGroup),
        h(
          'div',
          { class: 'checks' },
          h('label', { class: 'check' }, flipBox, h('span', {}, 'Tukar sisi: siswa menebak kata Arabnya')),
          h('label', { class: 'check' }, harakatBox, h('span', {}, 'Tampilkan harakat')),
        ),
      ),
      h(
        'section',
        { class: 'panel area-layout' },
        h('h2', {}, 'Tata letak cetak'),
        h(
          'div',
          { class: 'print-opts' },
          h('label', { class: 'field-inline' }, h('span', { class: 'label' }, 'Jumlah per lembar'), perPageSel),
          h('label', { class: 'field-inline' }, h('span', { class: 'label' }, 'Sisi yang dicetak'), sidesSel),
          h('label', { class: 'check' }, cutBox, h('span', {}, 'Tanda potong di tepi kertas')),
        ),
      ),
      h(
        'section',
        { class: 'stage' },
        h(
          'div',
          { class: 'stage-head' },
          h('h2', {}, 'Pratinjau'),
          h('p', { class: 'stage-count' }, countEl, sheetsEl),
        ),
        h('div', { class: 'row-end stage-actions' }, printBtn, savePdfBtn),
        progressEl,
        h('div', { class: 'stage-tools' }, sideGroup, h('div', { class: 'pager' }, prevBtn, sheetLabel, nextBtn)),
        previewEmpty,
        sheetWrap,
        overflowNote,
      ),
      panel(
        'area-images',
        'Gambar (opsional)',
        h('p', { class: 'hint' }, 'Beri nama berkas sama dengan katanya, misalnya buku.png. Kartu tanpa gambar memakai ikon bawaan.'),
        h('label', { class: 'btn' }, icon('image'), 'Pilih gambar', imageInput),
        unmatchedSlot,
      ),
      h('section', { class: 'panel area-cards' }, h('div', { class: 'panel-head' }, h('h2', {}, 'Daftar kartu'), addBtn), rowsEl),
      panel(
        'area-deck',
        'Dek',
        h('label', { class: 'field' }, h('span', { class: 'label' }, 'Nama dek'), nameInput),
        h('div', { class: 'row-end row-start' }, saveBtn, exportBtn, h('label', { class: 'btn' }, icon('upload'), 'Impor berkas dek', importInput)),
        h('h3', {}, 'Tersimpan di perangkat ini'),
        savedList,
      ),
    ),
  );
  root.replaceChildren(shell);

  // ---------- render ----------
  function renderControls(): void {
    typeButtons.forEach((b, t) => b.setAttribute('aria-checked', String(t === s.type)));
    sideBtns.forEach((b, side) => b.setAttribute('aria-checked', String(side === s.previewSide)));
    themeButtons.forEach((b, id) => b.setAttribute('aria-pressed', String(id === s.themeId)));
    flipBox.checked = s.flip;
    harakatBox.checked = s.harakat;
    perPageSel.value = String(s.perPage);
    sidesSel.value = s.sides;
    cutBox.checked = s.cutMarks;
    nameInput.value = s.name;
    if (s.themeId.startsWith('custom')) customColor.value = s.themeId.split(':')[1] || customColor.value;
  }

  function renderMap(): void {
    if (!s.needsMap || !s.table) {
      mapSlot.replaceChildren();
      return;
    }
    const table = s.table;
    const selects = table.headers.map((header, idx) => {
      const current = (Object.keys(s.map) as Field[]).find((f) => s.map[f] === idx) ?? '';
      const sel = h(
        'select',
        { 'data-col': String(idx), 'aria-label': `Isi kolom ${header}` },
        h('option', { value: '' }, 'Abaikan'),
        ...FIELDS.map((f) => h('option', { value: f, selected: f === current }, FIELD_LABEL[f])),
      );
      sel.addEventListener('change', () => {
        const next: ColumnMap = {};
        selects.forEach((x, i) => {
          const v = x.value as Field | '';
          if (v !== '') next[v] = i;
        });
        s.map = next;
        rebuild();
        renderRows();
        renderPreview();
      });
      return sel;
    });
    mapSlot.replaceChildren(
      h(
        'section',
        { class: 'panel', 'data-step': 'map' },
        h('h2', {}, 'Cocokkan kolom'),
        h('p', { class: 'hint' }, 'Ada kolom yang belum dikenali. Pilih isi tiap kolom supaya kartu terbentuk.'),
        h('div', { class: 'map-grid' }, ...table.headers.map((header, i) => h('label', { class: 'map-row' }, h('span', { class: 'map-name' }, header || `Kolom ${i + 1}`), selects[i]))),
      ),
    );
  }

  function renderUnmatched(): void {
    if (s.unmatched.length === 0) {
      unmatchedSlot.replaceChildren();
      return;
    }
    unmatchedSlot.replaceChildren(
      h('p', { class: 'msg msg-warn' }, 'Gambar ini tidak cocok dengan kartu mana pun:'),
      h('ul', { class: 'unmatched-list' }, ...s.unmatched.map((n) => h('li', {}, n))),
    );
  }

  function renderPreview(): void {
    const t = theme();
    const g = gridFor(s.perPage);
    const front = paginate(s.cards, s.perPage);
    const pages = s.previewSide === 'front' ? front : backPages(front, s.perPage);
    const total = Math.max(1, pages.length);
    s.pageIndex = Math.min(Math.max(0, s.pageIndex), total - 1);

    const empty = s.cards.length === 0;
    exampleBtn.hidden = !empty;
    previewEmpty.hidden = !empty;
    sheetWrap.hidden = empty;

    countEl.textContent = `${s.cards.length} kartu`;
    sheetsEl.textContent = s.cards.length > 0 ? ` · ${front.length} lembar` : '';
    sheetLabel.textContent = `Lembar ${s.pageIndex + 1} dari ${total}`;
    prevBtn.disabled = s.pageIndex <= 0;
    nextBtn.disabled = s.pageIndex >= total - 1;

    sheet.replaceChildren();
    sheet.style.gridTemplateColumns = `repeat(${g.cols}, ${g.cardW}mm)`;
    sheet.style.gridAutoRows = `${g.cardH}mm`;
    sheet.style.padding = `${g.marginY}mm ${g.marginX}mm`;
    sheet.classList.toggle('sheet-empty', empty);

    let tooLong = 0;
    const page = pages[s.pageIndex];
    if (!empty && page) {
      for (const card of page.slots) {
        if (!card) {
          sheet.append(h('div', { class: 'slot-free' }));
          continue;
        }
        const el = renderCardSide(card, page.side, t, { harakat: s.harakat, widthMm: g.cardW, heightMm: g.cardH });
        if (el.getAttribute('data-overflow') === 'true') tooLong++;
        sheet.append(el);
      }
    }
    overflowNote.hidden = tooLong === 0;
    overflowNote.textContent =
      tooLong === 0 ? '' : `${tooLong} kartu di lembar ini terlalu panjang dan hurufnya sudah sekecil mungkin. Persingkat teksnya.`;
    fitSheet();
  }

  function fitSheet(): void {
    // Layar lebar: pratinjau menempel di kanan, jadi tinggi layar ikut membatasi supaya satu lembar utuh terlihat.
    // Ponsel: satu kolom yang digulir, jadi hanya lebar yang membatasi.
    const wide = typeof matchMedia === 'function' && matchMedia('(min-width: 64rem)').matches;
    const availH = wide ? window.innerHeight - STAGE_CHROME_PX : 0;
    const scale = sheetScale(sheetWrap.clientWidth - WRAP_PADDING_PX, availH);
    if (scale !== null) sheetWrap.style.setProperty('--s', String(scale));
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitSheet).observe(sheetWrap);
  window.addEventListener('resize', fitSheet);

  function rowFor(card: Card, i: number, total: number): HTMLElement {
    const front = card.front.lines[0];
    const back = card.back.lines[0];
    const extra = card.back.lines.slice(1).map((l) => l.text).filter(Boolean);
    const frontInput = h('input', {
      class: 'edit-front',
      type: 'text',
      value: front?.text ?? '',
      disabled: !front,
      placeholder: front ? '' : 'Gambar',
      'aria-label': `Sisi depan kartu ${i + 1}`,
      dir: 'auto',
    });
    frontInput.addEventListener('input', () => editLine(card.id, 'front', frontInput.value));
    const backInput = h('textarea', {
      class: 'edit-back',
      rows: 1,
      disabled: !back,
      'aria-label': `Sisi belakang kartu ${i + 1}`,
      dir: 'auto',
    });
    backInput.value = back?.text ?? '';
    backInput.addEventListener('input', () => editLine(card.id, 'back', backInput.value));
    return h(
      'li',
      { class: 'card-row', 'data-card-id': card.id },
      h('span', { class: 'row-no' }, String(i + 1)),
      h('div', { class: 'row-fields' }, frontInput, h('div', { class: 'row-back' }, backInput, extra.length ? h('span', { class: 'row-extra' }, `+ ${extra.join(' / ')}`) : null)),
      h(
        'div',
        { class: 'row-actions' },
        h('button', { type: 'button', class: 'btn btn-icon btn-up', 'aria-label': `Naikkan kartu ${i + 1}`, disabled: i === 0, onClick: () => moveCard(card.id, -1) }, icon('up')),
        h('button', { type: 'button', class: 'btn btn-icon btn-down', 'aria-label': `Turunkan kartu ${i + 1}`, disabled: i === total - 1, onClick: () => moveCard(card.id, 1) }, icon('down')),
        h('button', { type: 'button', class: 'btn btn-icon btn-delete', 'aria-label': `Hapus kartu ${i + 1}`, onClick: () => deleteCard(card.id) }, icon('trash')),
      ),
    );
  }

  function renderRows(): void {
    if (s.cards.length === 0) {
      rowsEl.replaceChildren(h('li', { class: 'rows-empty' }, 'Belum ada kartu. Tempel tabel di atas atau tambah kartu satu per satu.'));
      return;
    }
    rowsEl.replaceChildren(...s.cards.map((c, i) => rowFor(c, i, s.cards.length)));
  }

  async function refreshSaved(): Promise<void> {
    let list: DeckSummary[] = [];
    try {
      list = await deps.store.listDecks();
    } catch {
      /* penyimpanan tidak tersedia: daftar kosong */
    }
    list.sort((a, b) => b.updatedAt - a.updatedAt);
    if (list.length === 0) {
      savedList.replaceChildren(h('li', { class: 'rows-empty' }, 'Belum ada dek tersimpan.'));
      return;
    }
    savedList.replaceChildren(
      ...list.map((d) =>
        h(
          'li',
          { class: 'saved-deck', 'data-deck-id': d.id },
          h('span', { class: 'saved-name' }, d.name),
          h('span', { class: 'muted' }, new Date(d.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })),
          h('button', { type: 'button', class: 'btn btn-open', onClick: () => void onOpen(d.id) }, icon('folder'), 'Buka'),
          h('button', { type: 'button', class: 'btn btn-icon btn-remove-saved', 'aria-label': `Hapus dek ${d.name}`, onClick: () => void onRemoveSaved(d.id) }, icon('trash')),
        ),
      ),
    );
  }

  function renderAll(): void {
    renderControls();
    renderMap();
    renderUnmatched();
    renderRows();
    renderPreview();
  }

  // ---------- logika ----------
  function rebuild(): void {
    // Dek yang dibuka dari penyimpanan tidak punya tabel: kartunya dibiarkan, tidak dibangun ulang.
    if (!s.table) return;
    let cards = buildCards(s.table, s.map, s.type, s.flip);
    if (s.images.length > 0) {
      const r = matchImages(cards, s.images);
      cards = r.cards;
      s.unmatched = r.unmatched;
    } else {
      s.unmatched = [];
    }
    s.cards = cards;
  }

  function onPaste(): void {
    s.tableText = pasteBox.value;
    clearMessages();
    const table = parseTable(s.tableText);
    if (table.headers.length === 0) {
      s.table = null;
      s.map = {};
      s.needsMap = false;
      s.cards = [];
      s.unmatched = [];
    } else {
      s.table = table;
      s.map = guessColumns(table);
      const used = Object.values(s.map);
      s.needsMap = table.headers.some((_, i) => !used.includes(i));
      const onlyMaterial = (s.map.judul !== undefined || s.map.penjelasan !== undefined) &&
        s.map.arab === undefined && s.map.indonesia === undefined && s.map.inggris === undefined;
      if (onlyMaterial) s.type = 'material';
    }
    s.pageIndex = 0;
    rebuild();
    renderAll();
  }

  function onExample(): void {
    pasteBox.value = SAMPLE_TABLE;
    onPaste();
  }

  function onType(t: CardType): void {
    s.type = t;
    rebuild();
    renderControls();
    renderRows();
    renderPreview();
  }

  function onTheme(id: string): void {
    s.themeId = id;
    renderControls();
    renderPreview();
  }

  function onFlip(): void {
    s.flip = flipBox.checked;
    s.cards = s.cards.map((c) => ({ ...c, front: c.back, back: c.front }));
    renderRows();
    renderPreview();
  }

  function onHarakat(): void {
    s.harakat = harakatBox.checked;
    renderPreview();
  }

  function onPerPage(): void {
    s.perPage = Number(perPageSel.value) as PerPage;
    s.pageIndex = 0;
    renderPreview();
  }

  function onSides(): void {
    s.sides = sidesSel.value as PdfOptions['sides'];
  }

  function onPreviewSide(side: 'front' | 'back'): void {
    s.previewSide = side;
    renderControls();
    renderPreview();
  }

  function onSheet(delta: number): void {
    s.pageIndex += delta;
    renderPreview();
  }

  function editLine(id: string, side: 'front' | 'back', text: string): void {
    s.cards = s.cards.map((c) => {
      if (c.id !== id || c[side].lines.length === 0) return c;
      const [first, ...rest] = c[side].lines;
      return { ...c, [side]: { ...c[side], lines: [{ ...first, text }, ...rest] } };
    });
    renderPreview();
  }

  function moveCard(id: string, delta: number): void {
    const i = s.cards.findIndex((c) => c.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= s.cards.length) return;
    const next = [...s.cards];
    [next[i], next[j]] = [next[j], next[i]];
    s.cards = next;
    renderRows();
    renderPreview();
  }

  function deleteCard(id: string): void {
    s.cards = s.cards.filter((c) => c.id !== id);
    renderRows();
    renderPreview();
  }

  function onAdd(): void {
    const line = (lang: 'ar' | 'id'): Card['front']['lines'][number] => ({ text: '', lang, role: 'main' });
    let card: Card;
    if (s.type === 'picture') {
      card = { id: newId('n'), type: 'picture', front: { lines: [], iconKey: '' }, back: { lines: [line('ar')] } };
    } else if (s.type === 'material') {
      card = { id: newId('n'), type: 'material', front: { lines: [line('id')] }, back: { lines: [line('id')] } };
    } else {
      card = { id: newId('n'), type: 'vocab', front: { lines: [line('ar')], iconKey: '' }, back: { lines: [line('id')] } };
    }
    if (s.flip) card = { ...card, front: card.back, back: card.front };
    s.cards = [...s.cards, card];
    renderRows();
    renderPreview();
    rowsEl.querySelector<HTMLInputElement>('.card-row:last-child .edit-front')?.focus();
  }

  async function onImages(): Promise<void> {
    const files = Array.from(imageInput.files ?? []);
    if (files.length === 0) return;
    clearMessages();
    try {
      const read = await deps.readImages(files);
      if (read.length < files.length) showError(`${files.length - read.length} gambar tidak bisa dibaca dan dilewati.`);
      const byName = new Map(s.images.map((f) => [f.name, f]));
      read.forEach((f) => byName.set(f.name, f));
      s.images = [...byName.values()];
      const r = matchImages(s.cards, s.images);
      s.cards = r.cards;
      s.unmatched = r.unmatched;
      renderUnmatched();
      renderPreview();
    } catch (e) {
      showError(message(e));
    }
    imageInput.value = '';
  }

  async function onCopyPrompt(): Promise<void> {
    try {
      await deps.writeClipboard(buildAiPrompt());
      showNotice('Teks perintah tersalin. Tempel ke AI bersama isi bukunya.');
    } catch (e) {
      showError(`Gagal menyalin: ${message(e)}`);
    }
  }

  function setBusy(busy: boolean): void {
    s.busy = busy;
    savePdfBtn.disabled = busy;
    printBtn.disabled = busy;
    if (!busy) progressEl.textContent = '';
  }

  async function makePdf(): Promise<Blob | null> {
    if (s.busy) return null;
    clearMessages();
    setBusy(true);
    try {
      return await deps.exportPdf(s.cards, {
        perPage: s.perPage,
        theme: theme(),
        harakat: s.harakat,
        sides: s.sides,
        cutMarks: s.cutMarks,
        onProgress: (done, total) => {
          progressEl.textContent = `Membuat lembar ${done} dari ${total}…`;
        },
      });
    } catch (e) {
      showError(message(e));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onSavePdf(): Promise<void> {
    const blob = await makePdf();
    if (!blob) return;
    try {
      await deps.saveFile('flashcard.pdf', blob, 'application/pdf');
      showNotice('PDF siap. Cetak dua sisi dengan balik di sisi panjang kertas.');
    } catch (e) {
      showError(message(e));
    }
  }

  async function onPrint(): Promise<void> {
    const blob = await makePdf();
    if (!blob) return;
    try {
      await deps.printBlob(blob);
    } catch (e) {
      showError(message(e));
    }
  }

  async function onSaveDeck(): Promise<void> {
    try {
      await deps.store.saveDeck(getDeck());
      await refreshSaved();
      showNotice('Dek tersimpan di perangkat ini.');
    } catch (e) {
      showError(`Gagal menyimpan: ${message(e)}`);
    }
  }

  async function onExportDeck(): Promise<void> {
    try {
      await deps.saveFile(`${slug(s.name)}.json`, exportDeckJson(getDeck()), 'application/json');
    } catch (e) {
      showError(message(e));
    }
  }

  function applyDeck(d: Deck): void {
    s.deckId = d.id;
    s.name = d.name;
    s.cards = d.cards;
    s.themeId = d.themeId;
    s.perPage = d.perPage;
    s.type = d.type;
    s.flip = d.flip;
    s.harakat = d.harakat;
    s.table = null;
    s.map = {};
    s.needsMap = false;
    s.images = [];
    s.unmatched = [];
    s.pageIndex = 0;
    pasteBox.value = '';
    renderAll();
  }

  async function onImport(): Promise<void> {
    const file = importInput.files?.[0];
    if (!file) return;
    clearMessages();
    try {
      applyDeck(importDeckJson(await deps.readText(file)));
      showNotice('Dek berhasil dibuka dari berkas.');
    } catch (e) {
      showError(message(e));
    }
    importInput.value = '';
  }

  async function onOpen(id: string): Promise<void> {
    try {
      const d = await deps.store.loadDeck(id);
      if (!d) throw new Error('Dek tidak ditemukan.');
      applyDeck(d);
    } catch (e) {
      showError(message(e));
    }
  }

  async function onRemoveSaved(id: string): Promise<void> {
    try {
      await deps.store.deleteDeck(id);
      await refreshSaved();
    } catch (e) {
      showError(message(e));
    }
  }

  renderAll();
  void refreshSaved();
  return { getDeck };
}
