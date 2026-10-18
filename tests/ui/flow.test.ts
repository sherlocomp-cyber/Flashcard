import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { buildAiPrompt } from '../../src/core/aiPrompt';
import { mount } from '../../src/ui/main';

const VOCAB =
  '| arab | arti | inggris |\n|---|---|---|\n| كِتَابٌ | buku | book |\n| مَدْرَسَةٌ | sekolah | school |\n| سَلَامٌ | salam | peace |';
const UNKNOWN_COLUMNS = '| kata | makna |\n|---|---|\n| كتاب | buku |';
const PNG = 'data:image/png;base64,AAAA';

function setup() {
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app = mount(root);
  return { root, app };
}

function paste(root: HTMLElement, text: string): void {
  const box = root.querySelector<HTMLTextAreaElement>('#paste')!;
  box.value = text;
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

const count = (root: HTMLElement): string => root.querySelector('[data-role="count"]')?.textContent ?? '';
const firstLine = (root: HTMLElement): string =>
  root.querySelector('#preview .fc-card .fc-line')?.textContent ?? '';

describe('alur tempel sampai cetak', () => {
  it('paste_builds_cards_without_extra_clicks', () => {
    const { root } = setup();
    paste(root, VOCAB);
    expect(count(root)).toContain('3 kartu');
    expect(root.querySelectorAll('#preview .fc-card')).toHaveLength(3);
  });

  it('mapping_step_shows_only_when_columns_unknown', () => {
    const { root } = setup();
    paste(root, VOCAB);
    expect(root.querySelector('#mapping')).toBeNull();
    paste(root, UNKNOWN_COLUMNS);
    expect(root.querySelector('#mapping')).not.toBeNull();
  });

  it('theme_change_updates_preview', () => {
    const { root } = setup();
    paste(root, VOCAB);
    expect(root.querySelector('#preview .fc-card[data-theme="tosca"]')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('[data-theme-id="koral"]')!.click();
    expect(root.querySelector('#preview .fc-card[data-theme="koral"]')).not.toBeNull();
    expect(root.querySelector('#preview .fc-card[data-theme="tosca"]')).toBeNull();
  });

  it('flip_toggle_swaps_preview_sides', () => {
    const { root } = setup();
    paste(root, VOCAB);
    expect(firstLine(root)).toBe('كِتَابٌ');
    root.querySelector<HTMLInputElement>('#flip')!.click();
    expect(firstLine(root)).toBe('buku');
  });

  it('unmatched_images_are_listed', () => {
    const { root, app } = setup();
    paste(root, VOCAB);
    app.addImages([
      { name: 'buku.png', dataUrl: PNG },
      { name: 'tak-ada.png', dataUrl: PNG },
    ]);
    const listed = root.querySelector('#unmatched')?.textContent ?? '';
    expect(listed).toContain('tak-ada.png');
    expect(listed).not.toContain('buku.png');
    expect(root.querySelector('#preview img')).not.toBeNull();
  });

  it('editing_a_card_updates_the_deck', () => {
    const { root } = setup();
    paste(root, VOCAB);
    const input = root.querySelector<HTMLInputElement>('.card-row[data-index="0"] .edit-front')!;
    input.value = 'جَدِيدٌ';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(firstLine(root)).toBe('جَدِيدٌ');
  });

  it('add_delete_reorder_cards_update_preview', () => {
    const { root } = setup();
    paste(root, VOCAB);
    root.querySelector<HTMLButtonElement>('#card-add')!.click();
    expect(count(root)).toContain('4 kartu');
    root.querySelector<HTMLButtonElement>('.card-row[data-index="0"] .card-del')!.click();
    expect(count(root)).toContain('3 kartu');
    expect(firstLine(root)).toBe('مَدْرَسَةٌ');
    root.querySelector<HTMLButtonElement>('.card-row[data-index="0"] .card-down')!.click();
    expect(firstLine(root)).toBe('سَلَامٌ');
  });

  it('export_then_import_restores_deck', () => {
    const a = setup();
    paste(a.root, VOCAB);
    a.root.querySelector<HTMLButtonElement>('[data-theme-id="koral"]')!.click();
    const json = a.app.exportJson();

    const b = setup();
    expect(b.app.importJson(json)).toBe(true);
    expect(count(b.root)).toContain('3 kartu');
    expect(b.root.querySelector('#preview .fc-card[data-theme="koral"]')).not.toBeNull();
  });

  it('import_rejects_invalid_file_with_indonesian_message', () => {
    const { root, app } = setup();
    expect(app.importJson('bukan json')).toBe(false);
    expect(root.querySelector('#message')?.textContent ?? '').toContain('Berkas dek tidak valid');
  });

  it('pdf_buttons_are_disabled_until_cards_exist', () => {
    const { root } = setup();
    const save = root.querySelector<HTMLButtonElement>('#save-pdf')!;
    const print = root.querySelector<HTMLButtonElement>('#print')!;
    expect(save.disabled).toBe(true);
    expect(print.disabled).toBe(true);
    paste(root, VOCAB);
    expect(save.disabled).toBe(false);
    expect(print.disabled).toBe(false);
  });

  it('copy_prompt_button_copies_text', () => {
    const { root } = setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    root.querySelector<HTMLButtonElement>('#copy-prompt')!.click();
    expect(writeText).toHaveBeenCalledWith(buildAiPrompt());
  });
});
