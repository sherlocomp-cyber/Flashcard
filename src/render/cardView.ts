import { splitBidi } from '../core/bidi';
import { isMostlyArabic } from '../core/columns';
import { fitFontSize } from '../core/fit';
import type { Card, Line } from '../core/types';
import { iconFor, keywordIcon } from '../themes/icons';
import { layoutSpec } from '../themes/layouts';
import type { LayoutSpec } from '../themes/layouts';
import { ornamentSvg } from '../themes/ornaments';
import { patternBand } from '../themes/patterns';
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
const LATIN_FONT = "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Batas atas ukuran huruf utama (px CSS) supaya kata pendek tidak tampil raksasa di samping kata panjang. */
const MAX_PX_LATIN = 44;
const MAX_PX_ARABIC = 60;
const MIN_PX = 12;
/** Huruf utama ikut membesar pada kartu besar supaya terbaca dari setengah meter; ukuran kecil tetap seperti semula. */
const maxMainPx = (arabic: boolean, heightMm: number): number =>
  arabic ? Math.max(MAX_PX_ARABIC, Math.round(heightMm * 0.9)) : Math.max(MAX_PX_LATIN, Math.round(heightMm * 0.5));
/** Baris pendukung tidak boleh lebih kecil dari ini (px CSS) agar tetap terbaca di kertas. */
const MIN_SUB_PX = 14;

/**
 * Kata tidak pernah dipecah di tengah: kata yang terlalu panjang dibiarkan meluap
 * sehingga pengukur luapan mengecilkan huruf (bukan memotong kata menjadi "sekola" + "h").
 */
export const LINE_WRAP_CSS = 'max-width:100%;overflow-wrap:normal;word-break:normal;';

function dirFor(text: string): 'rtl' | 'ltr' | 'auto' {
  if (!HAS_ARABIC.test(text)) return 'ltr';
  return isMostlyArabic(text) ? 'rtl' : 'auto';
}

/**
 * Baris Latin murni: tiap kata dibungkus <span class="fc-w"> tanpa pemecahan baris, supaya kata
 * berhubung seperti "laki-laki" tidak patah di tanda hubung. Garis miring yang berdiri sendiri
 * ("Insinyur / Arsitek") dilekatkan ke kata sebelumnya. Teks (textContent) tidak berubah.
 */
function fillLatin(el: HTMLElement, text: string): void {
  type Tok = { t: string; ws: boolean };
  const toks: Tok[] = text
    .split(/(\s+)/)
    .filter((p) => p !== '')
    .map((p) => ({ t: p, ws: /^\s+$/.test(p) }));
  const out: Tok[] = [];
  for (const tk of toks) {
    const n = out.length;
    if (!tk.ws && tk.t === '/' && n >= 2 && out[n - 1].ws && !out[n - 2].ws) {
      out.splice(n - 2, 2, { t: out[n - 2].t + out[n - 1].t + '/', ws: false });
    } else {
      out.push(tk);
    }
  }
  for (const tk of out) {
    if (tk.ws) {
      el.appendChild(document.createTextNode(tk.t));
    } else {
      const span = document.createElement('span');
      span.className = 'fc-w';
      span.style.cssText = 'white-space:nowrap;';
      span.textContent = tk.t;
      el.appendChild(span);
    }
  }
}

function fillText(el: HTMLElement, text: string): void {
  if (!HAS_ARABIC.test(text)) {
    fillLatin(el, text);
    return;
  }
  if (!HAS_LATIN_OR_DIGIT.test(text)) {
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

function buildLine(line: Line, harakat: boolean, spec: LayoutSpec | null): HTMLElement {
  const el = document.createElement('div');
  const arabic = HAS_ARABIC.test(line.text);
  const main = line.role === 'main';
  el.className = `fc-line fc-${line.role}`;
  el.setAttribute('lang', line.lang);
  el.setAttribute('dir', dirFor(line.text));
  fillText(el, harakat ? line.text : line.text.replace(HARAKAT, ''));

  let family = arabic ? ARABIC_FONT : LATIN_FONT;
  if (spec && main && !arabic && spec.mainFamily) family = spec.mainFamily;
  const weight = main && !arabic ? (spec ? spec.mainWeight : 700) : 400;
  const color = spec && main ? `color:${spec.mainColor};` : '';
  const extra = spec ? spec.lineCss + (main ? spec.mainCss : '') : '';
  el.style.cssText =
    `font-family:${family};` +
    `line-height:${arabic ? 1.9 : 1.25};` +
    `font-weight:${weight};` +
    color +
    extra +
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

/**
 * Pita pola tipis di tepi atas atau bawah, di antara hiasan sudut. Tengah kartu tidak disentuh
 * (teks tetap di atas putih agar terbaca). Mengembalikan null untuk tema tanpa pola.
 */
function band(theme: Theme, pos: 'top' | 'bottom'): HTMLElement | null {
  const image = patternBand(theme.pattern, theme.color, theme.accent);
  if (image === '') return null;
  const el = document.createElement('div');
  el.className = `fc-band fc-band-${pos}`;
  el.setAttribute('data-pattern', theme.pattern);
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText =
    `position:absolute;left:10mm;right:10mm;height:3.2mm;${pos}:2.4mm;pointer-events:none;` +
    `background-image:${image};background-repeat:repeat-x;background-size:auto 100%;background-position:center;`;
  return el;
}

/**
 * Penanda kategori kecil untuk gaya non-klasik: tab di tepi bawah (permainan) atau
 * lambang di sudut kanan bawah (pop). Null bila gaya tidak memakainya.
 */
function categoryMark(theme: Theme, spec: LayoutSpec): HTMLElement | null {
  if (spec.mark === 'none') return null;
  const el = document.createElement('div');
  el.className = `fc-mark fc-mark-${spec.mark}`;
  el.setAttribute('aria-hidden', 'true');
  const glyph = document.createElement('span');
  glyph.innerHTML = ornamentSvg(theme.ornament, spec.markColor);
  if (spec.mark === 'tab') {
    el.style.cssText =
      'position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:16mm;height:4.6mm;' +
      `background:${theme.tint};border-radius:2mm 2mm 0 0;display:flex;align-items:center;justify-content:center;`;
    glyph.style.cssText = 'display:block;width:3.2mm;height:3.2mm;';
  } else {
    el.style.cssText = 'position:absolute;right:3.5mm;bottom:3mm;width:5mm;height:5mm;opacity:0.9;';
    glyph.style.cssText = 'display:block;width:5mm;height:5mm;';
  }
  el.appendChild(glyph);
  return el;
}

/** Kotak gambar untuk gaya non-klasik (bentuk, latar, dan warna ikon ditentukan gaya). */
interface VisualBox {
  w: number;
  h: number;
  spec: LayoutSpec;
}

function buildVisual(
  image: string | undefined,
  iconKey: string,
  theme: Theme,
  diameterMm: number,
  box?: VisualBox,
): HTMLElement {
  const circle = document.createElement('div');
  circle.className = 'fc-visual';
  circle.style.cssText = box
    ? `width:${box.w}mm;height:${box.h}mm;border-radius:${box.spec.visualRadius(box.w, box.h)};flex:none;` +
      `border:${box.spec.visualBorder};background:${box.spec.visualBg};overflow:hidden;` +
      'display:flex;align-items:center;justify-content:center;box-sizing:border-box;'
    : `width:${diameterMm}mm;height:${diameterMm}mm;border-radius:50%;flex:none;` +
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
    span.style.cssText = `width:60%;height:60%;color:${box ? box.spec.iconColor : theme.color};display:block;`;
    circle.appendChild(span);
  }
  return circle;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

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
  // null untuk tema klasik: jalur render lama tidak berubah.
  const spec = layoutSpec(theme);

  const root = document.createElement('div');
  root.className = 'fc-card';
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-type', card.type);
  root.setAttribute('data-side', side);
  if (spec) {
    root.setAttribute('data-layout', spec.layout);
    root.style.cssText =
      `position:relative;box-sizing:border-box;width:${w}mm;height:${h}mm;overflow:hidden;` +
      `color:${spec.textColor};${spec.rootCss}`;
  } else {
    root.style.cssText =
      `position:relative;box-sizing:border-box;width:${w}mm;height:${h}mm;background:#ffffff;` +
      `border:1.4mm ${theme.border} ${theme.color};border-radius:4mm;overflow:hidden;color:${theme.ink};`;
    for (const pos of ['tl', 'tr', 'bl', 'br'] as const) root.appendChild(corner(theme, pos));
    for (const pos of ['top', 'bottom'] as const) {
      const b = band(theme, pos);
      if (b) root.appendChild(b);
    }
  }

  const inner = document.createElement('div');
  inner.className = 'fc-inner';
  inner.style.cssText = spec
    ? `position:absolute;top:${spec.padTop}mm;bottom:${spec.padBottom}mm;left:${spec.padSide}mm;` +
      `right:${spec.padSide}mm;display:flex;flex-direction:column;align-items:center;overflow:hidden;` +
      `text-align:${spec.start ? 'start' : 'center'};`
    : 'position:absolute;top:8mm;bottom:8mm;left:7mm;right:7mm;display:flex;' +
      'flex-direction:column;align-items:center;overflow:hidden;text-align:center;';
  const stack = document.createElement('div');
  stack.className = 'fc-stack';
  stack.style.cssText =
    'margin:auto 0;width:100%;display:flex;flex-direction:column;align-items:center;' +
    `gap:${spec ? spec.gap : 2}mm;`;

  // Visual hanya tampil bila ada gambar unggahan, atau kata cocok dengan ikon kata kunci,
  // atau sisi ini tidak punya teks sama sekali (kartu gambar tebak kata: jangan dibiarkan kosong,
  // jadi ikon cadangan tema dipakai). Kartu bersisi teks tanpa gambar tidak diberi ikon cadangan.
  const iconKey = data.iconKey;
  const hasKeywordIcon = iconKey !== undefined && keywordIcon(iconKey) !== null;
  const onlyVisual = data.lines.length === 0;
  const hasVisual = Boolean(data.image) || hasKeywordIcon || (iconKey !== undefined && onlyVisual);
  let visualEl: HTMLElement | null = null;
  if (hasVisual) {
    if (spec) {
      // Kotak gambar mengikuti ukuran kartu: lebar penuh area isi; tinggi sebagian area isi
      // (seluruhnya bila sisi ini hanya gambar). Bingkai dihitung kira-kira 2 mm per sisi.
      const bw = 2;
      const vw = Math.max(12, w - 2 * bw - 2 * spec.padSide);
      const innerH = h - 2 * bw - spec.padTop - spec.padBottom;
      const vh = Math.max(12, onlyVisual ? innerH : innerH * spec.visualShare);
      visualEl = buildVisual(data.image, iconKey ?? '', theme, 0, { w: round1(vw), h: round1(vh), spec });
    } else {
      const diameter = onlyVisual ? Math.min(w - 20, h - 20) : Math.round(h * 0.3);
      visualEl = buildVisual(data.image, iconKey ?? '', theme, Math.max(12, diameter));
    }
  }

  if (visualEl && (!spec || spec.visualFirst)) stack.appendChild(visualEl);
  const lineEls = data.lines.map((l) => buildLine(l, opts.harakat, spec));
  for (const el of lineEls) stack.appendChild(el);
  if (visualEl && spec && !spec.visualFirst) stack.appendChild(visualEl);
  inner.appendChild(stack);
  root.appendChild(inner);
  if (spec) {
    const m = categoryMark(theme, spec);
    if (m) root.appendChild(m);
  }

  if (lineEls.length > 0) {
    const apply = (px: number): void => {
      lineEls.forEach((el) => {
        el.style.fontSize = (el.classList.contains('fc-main') ? px : Math.max(MIN_SUB_PX, Math.round(px * 0.5))) + 'px';
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
    const maxPx = maxMainPx(HAS_ARABIC.test(data.lines[0].text), h);
    const fit = fitFontSize(
      (px) => {
        apply(px);
        return { overflow: measureOverflow(inner) };
      },
      maxPx,
      MIN_PX,
    );
    apply(fit.px);
    host.removeChild(root);
    document.body.removeChild(host);
    if (fit.overflow) root.setAttribute('data-overflow', 'true');
  }
  return root;
}
