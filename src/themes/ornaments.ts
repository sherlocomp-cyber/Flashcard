const PATHS: Record<string, string> = {
  diamond: '<path d="M12 2l6 10-6 10-6-10z"/>',
  star: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  wave: '<path d="M2 12c3-5 5 5 8 0s5 5 8 0l4 0v8H2z"/>',
  leaf: '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/>',
  arch: '<path d="M4 22V10a8 8 0 0 1 16 0v12z"/>',
  heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
  sparkle: '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
  // Khatam: bintang segi delapan.
  star8:
    '<path d="M12 2l2.4 4.2L19 5l-1.2 4.6L22 12l-4.2 2.4L19 19l-4.6-1.2L12 22l-2.4-4.2L5 19l1.2-4.6L2 12l4.2-2.4L5 5l4.6 1.2z"/>',
  // Ubin empat lengkung (quatrefoil) khas mozaik.
  tile:
    '<circle cx="12" cy="7" r="4.5"/><circle cx="17" cy="12" r="4.5"/><circle cx="12" cy="17" r="4.5"/><circle cx="7" cy="12" r="4.5"/>',
  // Bunga enam kelopak.
  flower:
    '<circle cx="12" cy="6.5" r="4"/><circle cx="17.2" cy="10.3" r="4"/><circle cx="15.2" cy="16.4" r="4"/><circle cx="8.8" cy="16.4" r="4"/><circle cx="6.8" cy="10.3" r="4"/><circle cx="12" cy="12" r="3.5"/>',
  // Matahari: cakram dengan delapan sinar.
  sun:
    '<circle cx="12" cy="12" r="5.2"/><path d="M12 1l2 5h-4zM12 23l-2-5h4zM1 12l5-2v4zM23 12l-5 2v-4z"/><g transform="rotate(45 12 12)"><path d="M12 1l2 5h-4zM12 23l-2-5h4zM1 12l5-2v4zM23 12l-5 2v-4z"/></g>',
  // Lampion (fanus).
  lantern:
    '<path d="M10 2h4v2h-4zM8 5h8l1.5 3c0 4-1.5 6-2.5 8h-6c-1-2-2.5-4-2.5-8zM9.5 17h5l-1 2.5h-3zM11 20h2v2h-2z"/>',
  // Bulan sabit dengan bintang kecil.
  crescent:
    '<path d="M14 3a9 9 0 1 0 6 14.5A7.5 7.5 0 0 1 14 3z"/><path d="M19 4l.9 2 2.1.3-1.6 1.4.5 2.1L19 8.7l-1.9 1.1.5-2.1L16 6.3l2.1-.3z"/>',
  // Teratai: tiga kelopak di atas alas.
  lotus:
    '<path d="M12 3c3 3 4 6 0 11-4-5-3-8 0-11z"/><path d="M4 8c4 0 7 2 8 6-4 1-7-1-8-6z"/><path d="M20 8c-4 0-7 2-8 6 4 1 7-1 8-6z"/><path d="M5 17h14v2H5z"/>',
  // Awan lembut.
  cloud: '<path d="M7 19a4.5 4.5 0 0 1-.7-8.9A6 6 0 0 1 18 9.8 4.6 4.6 0 0 1 17.5 19z"/>',
  // Pita simpul.
  bow: '<path d="M12 12L3 6v12zM12 12l9-6v12z"/><circle cx="12" cy="12" r="2.6"/>',
  // Mahkota.
  crown: '<path d="M3 18V7l5 5 4-7 4 7 5-5v11zM3 20h18v2H3z"/>',
  // Vas tanah liat.
  vase:
    '<path d="M9 2h6v3c0 1-1 2-1 3 3 1 5 4 5 8 0 3-2 6-7 6s-7-3-7-6c0-4 2-7 5-8 0-1-1-2-1-3z"/>',
  // Cangkir dengan gagang.
  cup:
    '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2v-1.5h2a1 1 0 0 0 0-2h-2z"/>',
  // Pohon cemara.
  pine: '<path d="M12 2l6 9h-3l4 6h-5v5h-4v-5H5l4-6H6z"/>',
  // Kerang: kipas dengan alas.
  shell: '<path d="M12 21L4 12c0-5 3.5-9 8-9s8 4 8 9z"/>',
  // Penanda kategori untuk gaya kartu baru (permainan, pop, minimal, rimba, pil).
  // Petir.
  bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
  // Bola lampu.
  bulb:
    '<path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 19h6v2H9zM10 22h4v1h-4z"/>',
  // Bendera.
  flag: '<path d="M5 2h2v20H5zM8 3h12l-3.5 5 3.5 5H8z"/>',
  // Roket.
  rocket:
    '<path d="M12 2c4 3 6 7 5 12l-3 3h-4l-3-3c-1-5 1-9 5-12z"/><path d="M6 15l-3 5 5-2zM18 15l3 5-5-2z"/>',
  // Telapak kaki hewan.
  paw:
    '<circle cx="6" cy="10" r="2.4"/><circle cx="10" cy="6" r="2.4"/><circle cx="14" cy="6" r="2.4"/><circle cx="18" cy="10" r="2.4"/><path d="M12 11c-3.5 0-6 3.5-6 6 0 2 1.5 3 3 3 1.2 0 2-.5 3-.5s1.8.5 3 .5c1.5 0 3-1 3-3 0-2.5-2.5-6-6-6z"/>',
  // Balon percakapan.
  bubble:
    '<path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>',
  // Segi enam.
  hex: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/>',
  // Tetes air.
  drop: '<path d="M12 2c3 4 7 8 7 13a7 7 0 0 1-14 0c0-5 4-9 7-13z"/>',
  // Cincin.
  ring:
    '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/>',
  // Ikan.
  fish: '<path d="M2 12c4-6 10-7 14-4l6-4v16l-6-4c-4 3-10 2-14-4z"/>',
  // Segitiga.
  triangle: '<path d="M12 3l10 18H2z"/>',
  // Tunas.
  sprout: '<path d="M11 21V12C6 12 3 9 3 4c5 0 8 3 8 7V9c0-4 3-7 8-7 0 5-3 8-8 8v11z"/>',
  // Jangkar.
  anchor:
    '<path d="M11 2h2v3.2A2.5 2.5 0 0 1 12 10a2.5 2.5 0 0 1-1-4.8zM11 10h2v9.5c3-.5 5-2.5 5.5-5.5H21c-.5 5-4.5 8-9 8s-8.5-3-9-8h2.5c.5 3 2.5 5 5.5 5.5z"/>',
};

/** SVG hiasan sudut berwarna `color`; ornamen tak dikenal memakai berlian. */
export function ornamentSvg(kind: string, color: string): string {
  const body = PATHS[kind] ?? PATHS.diamond;
  return `<svg viewBox="0 0 24 24" fill="${color}" aria-hidden="true">${body}</svg>`;
}
