import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import { PWA_GLOB_PATTERNS, PWA_MANIFEST } from './pwa.config';

export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: false },
  plugins: process.env.VITEST
    ? []
    : [
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg'],
          manifest: PWA_MANIFEST,
          workbox: {
            globPatterns: PWA_GLOB_PATTERNS,
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            navigateFallback: 'index.html',
          },
        }),
      ],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
