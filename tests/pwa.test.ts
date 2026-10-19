import { describe, it, expect } from 'vitest';
import { PWA_GLOB_PATTERNS, PWA_MANIFEST } from '../pwa.config';

describe('pwa', () => {
  it('precache_patterns_cover_fonts_icons_and_app_files', () => {
    const joined = PWA_GLOB_PATTERNS.join(',');
    for (const ext of ['js', 'css', 'html', 'woff2', 'svg', 'webmanifest']) {
      expect(joined).toContain(ext);
    }
  });

  it('manifest_is_standalone_indonesian_and_relative', () => {
    expect(PWA_MANIFEST).toMatchObject({
      name: 'Flashcard Arab',
      lang: 'id',
      display: 'standalone',
      start_url: './',
      scope: './',
    });
  });

  it('manifest_has_an_icon_that_is_embedded_in_the_app', () => {
    expect(PWA_MANIFEST.icons.some((i) => i.src === 'icon.svg' && i.type === 'image/svg+xml')).toBe(true);
  });
});
