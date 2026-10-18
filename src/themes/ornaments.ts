const PATHS: Record<string, string> = {
  diamond: '<path d="M12 2l6 10-6 10-6-10z"/>',
  star: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  wave: '<path d="M2 12c3-5 5 5 8 0s5 5 8 0l4 0v8H2z"/>',
  leaf: '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/>',
  arch: '<path d="M4 22V10a8 8 0 0 1 16 0v12z"/>',
  heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
  sparkle: '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
};

/** SVG hiasan sudut berwarna `color`; ornamen tak dikenal memakai berlian. */
export function ornamentSvg(kind: string, color: string): string {
  const body = PATHS[kind] ?? PATHS.diamond;
  return `<svg viewBox="0 0 24 24" fill="${color}" aria-hidden="true">${body}</svg>`;
}
