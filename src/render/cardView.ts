import { splitBidi } from '../core/bidi';
import { isMostlyArabic } from '../core/columns';
import { fitFontSize } from '../core/fit';
import type { Card, Line } from '../core/types';
import { iconFor, keywordIcon } from '../themes/icons';
import { ornamentSvg } from '../themes/ornaments';
import type { Theme } from '../themes/themes';

export interface RenderOptions {
  /** Tampilkan harakat (baris Arab). Bila false, harakat dibuang dari teks yang ditampilkan. */
  harakat: boolean;
  /** Ukuran kartu dalam milimeter (bawaan 90 × 65). */
  widthMm?: number;
  heightMm?: number;
  /** Pengukur luapan; bawaan memeriksa scrollHeight/scrollWidth (perlu tata letak peramban nyata). */
  measureOverflow?: (inner: HTMLElement) => boolean;
}

const HARAKAT = /[\u064B-\u065F\u0670]/g;
const HAS_ARABIC = /\p{Script=Arabic}/u;
const HAS_LATIN_OR_DIGIT = /[A-Za-z\u00C0-\u024F0-9]/;
const ARABIC_FONT = "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif";
const LATIN_FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/**
 * Kata tidak pernah dipecah di tengah: kata yang terlalu panjang dibiarkan meluap
 * sehingga pengukur luapan mengecilkan huruf (bukan memotong kata menjadi "sekola" + "h").
 */
export const LINE_WRAP_CSS = 'max-width:100%;overflow-wrap:normal;word-break:normal;';

function dirFor(text: string): 'rtl' | 'ltr' | 'auto' {
  if (!HAS_ARABIC.test(text)) return 'ltr';
  return isMostlyArabic(text) ? 'rtl' : 'auto';
}

function fillText(el: HTMLElement, text: string): void {
  if (!(HAS_ARABIC.test(text) && HAS_LATIN_OR_DIGIT.test(text))) {
    el.textContent = text;
    return;
  }
  // Teks campuran: potongan Latin/angka dibungkus <bdi dir="ltr"> agar tanda kurung
  // di batas Arab/Latin tidak terbalik.
  for (const seg of splitBidi(text)) {
    if (seg.ltr) {
      const bdi = document.createElement('bdi');
      bdi.setAttribute('dir', 'ltr');
      bdi.textContent = seg.text;
      el.appendChild(bdi);
    } else {
      el.appendChild(document.createTextNode(seg.text));
    }
  }
}

function buildLine(line: Line, harakat: boolean): HTMLElement {
  const el = document.createElement('div');
  const arabic = HAS_ARABIC.test(line.text);
  el.className = `fc-line fc-${line.role}`;
  el.setAttribute('lang', line.lang);
  el.setAttribute('dir', dirFor(line.text));
  fillText(el, harakat ? line.text : line.text.replace(HARAKAT, ''));
  el.style.cssText =
    `font-family:${arabic ? ARABIC_FONT : LATIN_FONT};` +
    `line-height:${arabic ? 1.9 : 1.25};` +
    `font-weight:${line.role === 'main' && !arabic ? 700 : 400};` +
    LINE_WRAP_CSS;
  return el;
}

function corner(theme: Theme, pos: 'tl' | 'tr' | 'bl' | 'br'): HTMLElement {
  const el = document.createElement('span');
  el.className = `fc-corner fc-${pos}`;
  el.innerHTML = ornamentSvg(theme.ornament, theme.color);
  const top = pos[0] === 't';
  const left = pos[1] === 'l';
  const flip = `${left ? 1 : -1},${top ? 1 : -1}`;
  el.style.cssText =
    `position:absolute;width:7mm;height:7mm;${top ? 'top' : 'bottom'}:1.6mm;` +
    `${left ? 'left' : 'right'}:1.6mm;transform:scale(${flip});opacity:0.9;`;
  return el;
}

function buildVisual(
  image: string | undefined,
  iconKey: string,
  theme: Theme,
  diameterMm: number,
): HTMLElement {
  const circle = document.createElement('div');
  circle.className = 'fc-visual';
  circle.style.cssText =
    `width:${diameterMm}mm;height:${diameterMm}mm;border-radius:50%;flex:none;` +
    `border:0.6mm solid ${theme.color};background:${theme.tint};overflow:hidden;` +
    'display:flex;align-items:center;justify-content:center;box-sizing:border-box;';
  if (image) {
    const img = document.createElement('img');
    img.src = image;
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    circle.appendChild(img);
  } else {
    const icon = iconFor(iconKey, theme.fallbackIcon);
    const span = document.createElement('span');
    span.className = 'fc-icon';
    span.setAttribute('data-icon', icon.name);
    span.innerHTML = icon.svg;
    span.style.cssText = `width:60%;height:60%;color:${theme.color};display:block;`;
    circle.appendChild(span);
  }
  return circle;
}

/** Render satu sisi kartu menjadi elemen DOM berukuran milimeter (siap dipasang atau diubah jadi gambar). */
export function renderCardSide(
  card: Card,
  side: 'front' | 'back',
  theme: Theme,
  opts: RenderOptions,
): HTMLElement {
  const data = card[side];
  const w = opts.widthMm ?? 90;
  const h = opts.heightMm ?? 65;

  const root = document.createElement('div');
  root.className = 'fc-card';
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-type', card.type);
  root.setAttribute('data-side', side);
  root.style.cssText =
    `position:relative;box-sizing:border-box;width:${w}mm;height:${h}mm;background:#ffffff;` +
    `border:1.4mm ${theme.border} ${theme.color};border-radius:4mm;overflow:hidden;color:${theme.ink};`;
  for (const pos of ['tl', 'tr', 'bl', 'br'] as const) root.appendChild(corner(theme, pos));

  const inner = document.createElement('div');
  inner.className = 'fc-inner';
  inner.style.cssText =
    'position:absolute;top:8mm;bottom:8mm;left:7mm;right:7mm;display:flex;' +
    'flex-direction:column;align-items:center;overflow:hidden;text-align:center;';
  const stack = document.createElement('div');
  stack.className = 'fc-stack';
  stack.style.cssText =
    'margin:auto 0;width:100%;display:flex;flex-direction:column;align-items:center;gap:2mm;';

  // Visual hanya tampil bila ada gambar unggahan, atau kata cocok dengan ikon kata kunci,
  // atau sisi ini tidak punya teks sama sekali (kartu gambar tebak kata: jangan dibiarkan kosong,
  // jadi ikon cadangan tema dipakai). Kartu bersisi teks tanpa gambar tidak diberi ikon cadangan.
  const iconKey = data.iconKey;
  const hasKeywordIcon = iconKey !== undefined && keywordIcon(iconKey) !== null;
  const onlyVisual = data.lines.length === 0;
  const hasVisual = Boolean(data.image) || hasKeywordIcon || (iconKey !== undefined && onlyVisual);
  if (hasVisual) {
    const diameter = onlyVisual ? Math.min(w - 20, h - 20) : Math.round(h * 0.3);
    stack.appendChild(buildVisual(data.image, iconKey ?? '', theme, Math.max(12, diameter)));
  }

  const lineEls = data.lines.map((l) => buildLine(l, opts.harakat));
  for (const el of lineEls) stack.appendChild(el);
  inner.appendChild(stack);
  root.appendChild(inner);

  if (lineEls.length > 0) {
    const apply = (px: number): void => {
      lineEls.forEach((el) => {
        el.style.fontSize = (el.classList.contains('fc-main') ? px : Math.max(11, Math.round(px * 0.5))) + 'px';
      });
    };
    // Luapan: tinggi ATAU lebar. Karena kata tidak dipecah, satu kata yang kepanjangan
    // membuat barisnya lebih lebar dari kotaknya; itu harus terdeteksi per baris.
    const measureOverflow =
      opts.measureOverflow ??
      ((el: HTMLElement): boolean =>
        el.scrollHeight > el.clientHeight + 1 ||
        el.scrollWidth > el.clientWidth + 1 ||
        lineEls.some((l) => l.scrollWidth > l.clientWidth + 1));

    // Ukur di dalam dokumen (di luar layar) supaya ukuran nyata bisa dibaca.
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden;';
    host.appendChild(root);
    document.body.appendChild(host);
    const fit = fitFontSize(
      (px) => {
        apply(px);
        return { overflow: measureOverflow(inner) };
      },
      72,
      12,
    );
    apply(fit.px);
    host.removeChild(root);
    document.body.removeChild(host);
    if (fit.overflow) root.setAttribute('data-overflow', 'true');
  }
  return root;
}
