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
};

/** SVG hiasan sudut berwarna `color`; ornamen tak dikenal memakai berlian. */
export function ornamentSvg(kind: string, color: string): string {
  const body = PATHS[kind] ?? PATHS.diamond;
  return `<svg viewBox="0 0 24 24" fill="${color}" aria-hidden="true">${body}</svg>`;
}
