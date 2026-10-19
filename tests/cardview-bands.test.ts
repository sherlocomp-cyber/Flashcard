// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import type { Card } from '../src/core/types';
import { renderCardSide } from '../src/render/cardView';
import { THEMES } from '../src/themes/themes';

const card: Card = {
  id: 'c1',
  type: 'vocab',
  front: { lines: [{ text: 'كتاب', lang: 'ar', role: 'main' }], iconKey: '' },
  back: { lines: [{ text: 'buku', lang: 'id', role: 'main' }] },
};
const opts = { harakat: true, measureOverflow: () => false };

describe('pita pola di tepi kartu', () => {
  it('tema_berpola_memasang_pita_atas_dan_bawah', () => {
    const theme = THEMES.find((t) => t.id === 'zamrud-madinah')!;
    const el = renderCardSide(card, 'front', theme, opts);
    const bands = el.querySelectorAll('.fc-band');
    expect(bands.length).toBe(2);
    bands.forEach((b) => expect(b.getAttribute('data-pattern')).toBe(theme.pattern));
    expect(el.querySelector('.fc-band-top')).not.toBeNull();
    expect(el.querySelector('.fc-band-bottom')).not.toBeNull();
  });

  it('pita_ada_di_sisi_belakang_juga', () => {
    const theme = THEMES.find((t) => t.id === 'mozaik-biru')!;
    const el = renderCardSide(card, 'back', theme, opts);
    expect(el.querySelectorAll('.fc-band').length).toBe(2);
  });

  it('tema_tanpa_pola_tidak_memasang_pita', () => {
    const theme = THEMES.find((t) => t.id === 'tosca')!;
    const el = renderCardSide(card, 'front', theme, opts);
    expect(el.querySelectorAll('.fc-band').length).toBe(0);
  });

  it('pita_tidak_menutupi_teks_tengah_kartu', () => {
    const theme = THEMES.find((t) => t.id === 'pelangi-ceria')!;
    const el = renderCardSide(card, 'front', theme, opts);
    const band = el.querySelector<HTMLElement>('.fc-band')!;
    expect(band.style.pointerEvents).toBe('none');
    expect(el.querySelector('.fc-inner')).not.toBeNull();
  });
});
