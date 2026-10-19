/** Pengaturan PWA dipisah dari vite.config.ts supaya bisa diuji tanpa menjalankan build. */

/** Semua berkas aplikasi (termasuk font dan ikon) disimpan di cache supaya jalan tanpa internet. */
export const PWA_GLOB_PATTERNS = ['**/*.{js,css,html,woff2,svg,webmanifest}'];

export const PWA_MANIFEST = {
  name: 'Flashcard Arab',
  short_name: 'Flashcard',
  description: 'Buat dan cetak flashcard kosakata Arab ukuran A4.',
  lang: 'id',
  display: 'standalone',
  start_url: './',
  scope: './',
  background_color: '#ffffff',
  theme_color: '#14b8a6',
  icons: [
    { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  ],
};
