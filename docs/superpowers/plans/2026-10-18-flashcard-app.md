# Aplikasi Flashcard Siap Print: Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplikasi web (GitHub Pages) dan APK Android yang mengubah tabel tempelan menjadi flashcard A4 siap cetak untuk kelas bahasa Arab.

**Architecture:** Satu aplikasi web statis (Vite + TypeScript, tanpa server). Logika murni (parse, pemetaan kolom, pembentukan kartu, tata letak halaman) dipisah dari tampilan supaya bisa diuji. Kartu dirender oleh browser sebagai DOM (sehingga huruf Arab bersambung dan harakat benar), difoto menjadi gambar beresolusi tinggi, lalu disusun ke PDF A4. APK adalah pembungkus Capacitor dari kode yang sama, dibuat oleh GitHub Actions.

**Tech Stack:** Vite, TypeScript, Vitest + jsdom, html-to-image, jsPDF, idb-keyval, @fontsource/amiri (font Arab tertanam), Capacitor (Android), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-18-flashcard-design.md` (baca bersama rencana ini).

## Global Constraints

- Kertas A4: 210 × 297 mm. Resolusi render kartu setara 300 dpi.
- Kartu per lembar: pilihan 2, 4, 6, 8, 9; bawaan 4.
- Minimal 8 tema; tengah kartu putih, hiasan di tepi; ada pemilih warna untuk tema kustom.
- Tiga jenis kartu: `vocab`, `picture`, `material`. Bahasa: `ar`, `id`, `en`.
- Arab: kanan-ke-kiri, harakat jelas, saklar tampil/sembunyi harakat; arah teks dideteksi per bidang.
- Jalan tanpa internet setelah dibuka sekali (font, ikon, tema tertanam).
- Tanpa akun, server, atau data keluar perangkat. Dek nyaman sampai sekitar 200 kartu; gambar diperkecil saat diunggah.
- Antarmuka berbahasa Indonesia.
- Android minimum 8 (API 26). Jalur utama dari APK: simpan atau bagikan PDF.
- Repo publik: tidak ada kunci atau rahasia di dalamnya.
- Cetak bolak-balik: sisi belakang dicerminkan agar sejajar.

## Review Focus

Masukan dan kondisi yang paling mungkin menggigit pengguna, tidak disebut spek. Tiap baris punya tes di tugas pemiliknya.

1. Tempelan dari Excel/Word berisi akhir baris Windows (CRLF), baris kosong, sel ber-tanda-kutip berisi koma, atau pemisah di akhir baris: tetap menjadi tabel yang benar (Task 2).
2. Nama file gambar berbeda huruf besar/kecil, ekstensi, spasi, atau berhuruf Arab dengan/tanpa harakat: tetap cocok dengan kata yang benar (Task 5).
3. Jumlah kartu tidak habis dibagi kartu per lembar: lembar terakhir punya slot kosong, dan cerminan sisi belakang tidak menggeser kartu (Task 7).
4. Satu kata Arab sangat panjang atau materi jauh di atas 40 kata: teks mengecil sampai batas bawah lalu kartu diberi peringatan, tanpa terpotong diam-diam (Task 6).
5. Dek 200 kartu dengan gambar besar: ekspor PDF selesai tanpa kehabisan memori dan antarmuka tidak membeku (Task 8).

## Struktur berkas

```
src/core/      parse.ts columns.ts cards.ts images.ts layout.ts fit.ts aiPrompt.ts types.ts
src/themes/    themes.ts
src/render/    cardView.ts pdf.ts
src/store/     decks.ts
src/ui/        main.ts + satu berkas per layar (paste, map, style, images, preview)
tests/         cermin dari src/
android/       dibuat oleh Capacitor
.github/workflows/  pages.yml  release.yml
```

Tipe bersama di `src/core/types.ts`:

```ts
export type CardType = 'vocab' | 'picture' | 'material';
export type Field = 'arab' | 'indonesia' | 'inggris' | 'gambar' | 'judul' | 'penjelasan';
export type ColumnMap = Partial<Record<Field, number>>;
export interface Table { headers: string[]; rows: string[][] }
export interface Line { text: string; lang: 'ar' | 'id' | 'en'; role: 'main' | 'sub' }
export interface Side { lines: Line[]; image?: string; iconKey?: string }
export interface Card { id: string; type: CardType; front: Side; back: Side; imageKey?: string }
export type PerPage = 2 | 4 | 6 | 8 | 9;
export interface Page { slots: (Card | null)[]; side: 'front' | 'back' }
```

---

### Task 1: Kerangka proyek dan halaman web

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/ui/main.ts`, `src/core/types.ts`, `tests/smoke.test.ts`, `.github/workflows/pages.yml`, `.gitignore`
- Modify: `HANDOFF.md`

**Interfaces:**
- Produces: perintah `npm run dev|build|test`; basis `base: './'` di Vite agar jalan di GitHub Pages dan di Capacitor.

- [ ] **Step 1:** Tulis tes `smoke.test.ts` bernama `test_app_mounts` yang memuat `main.ts` di jsdom dan menegaskan `document.querySelector('#app')` tidak kosong.
- [ ] **Step 2:** Jalankan `npm test`; harus gagal (belum ada berkas).
- [ ] **Step 3:** Inisialisasi Vite + TS + Vitest + jsdom; `main.ts` mengekspor `mount(root: HTMLElement): void`. Berkas `types.ts` berisi tipe di atas.
- [ ] **Step 4:** `npm test` lulus dan `npm run build` menghasilkan `dist/`.
- [ ] **Step 5:** `pages.yml`: pada push ke `main`, jalankan test, build, lalu `actions/deploy-pages`. Coba aktifkan Pages dengan `gh api -X POST repos/sherlocomp-cyber/Flashcard/pages -f build_type=workflow`; bila ditolak, catat di `HANDOFF.md` sebagai tindakan pemilik (Settings → Pages → Source: GitHub Actions).
- [ ] **Step 6:** Commit `chore: scaffold app and pages workflow`.

### Task 2: Parser tabel tempelan

**Files:** Create `src/core/parse.ts`; Test `tests/core/parse.test.ts`

**Interfaces:** Produces `parseTable(input: string): Table`

- [ ] **Step 1:** Tes (nama dan tegasan):
  - `parses_markdown_table`: `'| arab | arti |\n|---|---|\n| كتاب | buku |'` → `headers ['arab','arti']`, `rows [['كتاب','buku']]` (baris pemisah `---` dibuang).
  - `parses_tab_separated`: hasil salin Excel dengan `\t`.
  - `parses_csv_with_quoted_commas`: `'arab,arti\n"أ, ب","a, b"'` → satu baris dua sel.
  - `handles_crlf_blank_lines_and_trailing_pipes` (Review Focus 1): CRLF, baris kosong dilewati, `|` di ujung tidak membuat kolom kosong.
  - `trims_cells_and_keeps_harakat`: spasi dibuang, harakat dipertahankan.
  - `returns_empty_table_for_blank_input`.
- [ ] **Step 2:** Jalankan; harus gagal.
- [ ] **Step 3:** Implementasi `parseTable`: deteksi pemisah dari baris pertama (pipa, tab, koma; urutan prioritas itu), parser CSV sendiri yang memahami tanda kutip ganda.
- [ ] **Step 4:** Tes lulus.
- [ ] **Step 5:** Commit `feat: parse pasted tables`.

### Task 3: Pemetaan kolom dan teks perintah AI

**Files:** Create `src/core/columns.ts`, `src/core/aiPrompt.ts`; Test `tests/core/columns.test.ts`

**Interfaces:**
- Consumes: `Table`, `ColumnMap`
- Produces: `guessColumns(table: Table): ColumnMap`, `buildAiPrompt(): string`

- [ ] **Step 1:** Tes:
  - `maps_by_header_aliases`: `arab/ar` → `arab`; `indonesia/arti/indo` → `indonesia`; `inggris/english/en` → `inggris`; `gambar/image/foto` → `gambar`; `judul/title/topik` → `judul`; `penjelasan/isi/keterangan` → `penjelasan` (tak peka huruf besar).
  - `maps_by_script_when_headers_unknown`: kolom yang mayoritas hurufnya Arab menjadi `arab`.
  - `leaves_unrecognised_columns_unmapped`.
  - `ai_prompt_lists_exact_column_names`: `buildAiPrompt()` memuat setiap nama kolom kanonik dan kata "tabel".
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi keduanya; teks perintah berbahasa Indonesia, meminta tabel Markdown dengan nama kolom persis, harakat disertakan.
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: column mapping and AI prompt`.

### Task 4: Pembentukan kartu (tiga jenis, tukar sisi)

**Files:** Create `src/core/cards.ts`; Test `tests/core/cards.test.ts`

**Interfaces:**
- Consumes: `Table`, `ColumnMap`
- Produces: `buildCards(table: Table, map: ColumnMap, type: CardType, flip: boolean): Card[]`

- [ ] **Step 1:** Tes:
  - `vocab_front_arabic_back_id_and_en`: depan satu baris `ar` utama; belakang `id` utama dan `en` pendamping.
  - `picture_front_image_only_back_arabic_and_meaning`: depan tanpa teks; belakang `ar` dan arti.
  - `material_front_title_back_body`.
  - `flip_swaps_sides_for_all_types`.
  - `skips_rows_with_no_content_and_tolerates_missing_columns`: baris kosong dibuang; kolom Inggris tak ada tidak membuat kartu rusak.
  - `assigns_stable_unique_ids`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi sesuai bagian 12 spek; `imageKey` diisi dari kolom `gambar` atau kata utama.
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: build cards from table`.

### Task 5: Pencocokan dan pengecilan gambar

**Files:** Create `src/core/images.ts`; Test `tests/core/images.test.ts`

**Interfaces:**
- Consumes: `Card`
- Produces: `normalizeKey(s: string): string`, `matchImages(cards: Card[], files: { name: string; dataUrl: string }[]): { cards: Card[]; unmatched: string[] }`, `downscale(file: File, maxPx: number): Promise<string>`

- [ ] **Step 1:** Tes (Review Focus 2):
  - `normalize_ignores_case_extension_spaces`: `'Buku .PNG'` dan `'buku'` sama.
  - `normalize_strips_harakat_and_applies_nfc`: `'كِتَابٌ.jpg'` dan `'كتاب'` sama.
  - `matches_by_image_key_or_main_word`.
  - `reports_unmatched_file_names`.
  - `keeps_cards_without_images_unchanged`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi; `downscale` memakai canvas ke sisi terpanjang `maxPx` (bawaan 800) dan mengembalikan data URL JPEG/PNG (PNG bila ada transparansi).
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: image matching and downscale`.

### Task 6: Tema dan penampil kartu

**Files:** Create `src/themes/themes.ts`, `src/render/cardView.ts`, `src/core/fit.ts`, `src/ui/fonts.css`; Test `tests/themes.test.ts`, `tests/render/cardView.test.ts`, `tests/core/fit.test.ts`

**Interfaces:**
- Produces:
  - `interface Theme { id: string; name: string; color: string; tint: string; ink: string; ornament: 'diamond'|'star'|'moon'|string; border: 'dotted'|'double'|'dashed'|'solid'; fallbackIcon: string }`
  - `THEMES: Theme[]`, `customTheme(color: string): Theme`
  - `renderCardSide(card: Card, side: 'front'|'back', theme: Theme, opts: { harakat: boolean }): HTMLElement`
  - `fitFontSize(measure: (px: number) => { overflow: boolean }, max: number, min: number): { px: number; overflow: boolean }`

- [ ] **Step 1:** Tes:
  - `has_at_least_eight_distinct_themes`: `THEMES.length >= 8`, id unik, warna unik, tidak semua ornamen sama.
  - `custom_theme_derives_tint_and_ink_from_color`.
  - `fit_returns_largest_fitting_size`, `fit_flags_overflow_at_min` (Review Focus 4: `measure` selalu overflow → `{ px: min, overflow: true }`).
  - `arabic_field_is_rtl_and_latin_field_is_ltr`: elemen berisi Arab punya `dir="rtl"`, bidang campuran memakai `dir="auto"`.
  - `harakat_toggle_strips_marks_only_when_off`: teks Arab tanpa harakat saat `harakat:false`, utuh saat `true`.
  - `card_without_image_uses_theme_fallback_icon`.
  - `overflowing_card_gets_warning_attribute`: `data-overflow="true"`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi. Tema awal: tosca (berlian), koral (bintang), ungu (bulan sabit), biru laut, hijau daun, emas klasik, merah muda, langit malam; masing-masing motif bingkai dan ornamen sudut berbeda; tengah kartu selalu putih. Font Arab dari `@fontsource/amiri` (subset Arab) diimpor di `fonts.css`. Ikon: kumpulan SVG kecil tertanam, dipilih dari kata kunci sederhana, jatuh ke `fallbackIcon` tema.
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: themes and card renderer`.

### Task 7: Tata letak halaman dan cetak bolak-balik

**Files:** Create `src/core/layout.ts`; Test `tests/core/layout.test.ts`

**Interfaces:**
- Consumes: `Card`, `PerPage`, `Page`
- Produces:
  - `gridFor(perPage: PerPage): { cols: number; rows: number; cardW: number; cardH: number; marginX: number; marginY: number }` (milimeter, di dalam 210 × 297)
  - `paginate(cards: Card[], perPage: PerPage): Page[]` (sisi depan)
  - `backPages(front: Page[], perPage: PerPage): Page[]` (sisi belakang, tiap baris dibalik kiri-kanan)
  - `cutMarks(perPage: PerPage): { x1: number; y1: number; x2: number; y2: number }[]`

- [ ] **Step 1:** Tes:
  - `grid_fits_inside_a4_for_every_perpage`: untuk tiap `PerPage`, `cols*cardW + 2*marginX <= 210` dan `rows*cardH + 2*marginY <= 297`.
  - `default_four_gives_2x2`.
  - `paginate_pads_last_page_with_null` (Review Focus 3): 5 kartu, 4 per lembar → 2 lembar, lembar kedua 1 kartu + 3 `null`.
  - `back_pages_mirror_each_row`: pada 2×2, kartu `[A,B,C,D]` menjadi `[B,A,D,C]`; pada 3×3, tiap baris dibalik.
  - `mirror_keeps_card_identity_with_nulls`: slot `null` ikut dicerminkan, tidak ada kartu bergeser baris.
  - `cut_marks_lie_on_grid_lines`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi (kolom × baris: 2→1×2, 4→2×2, 6→2×3, 8→2×4, 9→3×3).
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: A4 layout and duplex mirroring`.

### Task 8: Ekspor PDF (risiko Arab dan memori)

**Files:** Create `src/render/pdf.ts`; Test `tests/render/pdf.test.ts`, `scripts/verify-pdf.mjs`

**Interfaces:**
- Consumes: `renderCardSide`, `paginate`, `backPages`, `gridFor`, `cutMarks`
- Produces: `exportPdf(cards: Card[], opts: { perPage: PerPage; theme: Theme; harakat: boolean; sides: 'front'|'back'|'both'; cutMarks: boolean; onProgress?: (done: number, total: number) => void }): Promise<Blob>`

- [ ] **Step 1:** Tes `pdf_has_expected_page_count_and_a4_size`: 5 kartu, 4 per lembar, `both` → 4 halaman, tiap halaman 210 × 297 mm. Tes `reports_progress_per_page` dan `releases_canvas_between_pages` (Review Focus 5): proses 200 kartu palsu dan tegaskan `onProgress` dipanggil per halaman dan kanvas dilepas (ukuran dipantau lewat fungsi render yang dipalsukan).
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi: per halaman, render setiap slot dengan `html-to-image` (`pixelRatio` setara 300 dpi), tempel ke jsPDF sebagai JPEG, beri jeda ke antarmuka (`await` satu frame) tiap halaman, lepaskan kanvas. Halaman belakang memakai `backPages`.
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Bukti visual risiko 1 dan 3: `verify-pdf.mjs` memuat kartu contoh (Arab dengan harakat, Arab campur Latin, teks panjang) di browser tanpa kepala, mengekspor PDF, mengubahnya menjadi PNG dengan `pdftoppm`, lalu buka PNG dengan alat Read untuk memastikan huruf bersambung, harakat tepat, dan sisi belakang sejajar. Bila browser tidak bisa diunduh di ruang kerja, jalankan skrip ini sebagai job CI `verify-pdf` yang mengunggah PNG sebagai artefak lalu unduh dengan `gh run download`.
- [ ] **Step 6:** Commit `feat: A4 pdf export`.

### Task 9: Penyimpanan dek

**Files:** Create `src/store/decks.ts`; Test `tests/store/decks.test.ts`

**Interfaces:**
- Produces: `interface Deck { id: string; name: string; cards: Card[]; themeId: string; perPage: PerPage; type: CardType; flip: boolean; harakat: boolean; updatedAt: number }`, `saveDeck(d: Deck): Promise<void>`, `listDecks(): Promise<Pick<Deck,'id'|'name'|'updatedAt'>[]>`, `loadDeck(id: string): Promise<Deck | undefined>`, `deleteDeck(id: string): Promise<void>`, `exportDeckJson(d: Deck): string`, `importDeckJson(json: string): Deck`

- [ ] **Step 1:** Tes: `save_then_load_roundtrips`, `list_is_sorted_newest_first`, `delete_removes`, `export_import_roundtrips_including_image_data`, `import_rejects_invalid_json_with_clear_error` (pesan berbahasa Indonesia).
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi dengan `idb-keyval`; di tes pakai IndexedDB palsu (`fake-indexeddb`).
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** Commit `feat: deck storage`.

### Task 10: Alur antarmuka (tempel sampai cetak)

**Files:** Create `src/ui/*.ts`, `src/ui/app.css`; Modify `src/ui/main.ts`; Test `tests/ui/flow.test.ts`

**Interfaces:**
- Consumes: semua modul inti, tema, `exportPdf`, penyimpanan dek.
- Produces: `mount(root)` menjalankan satu layar utama dengan kotak tempel besar, langkah pemetaan hanya bila kolom tak dikenali, pemilih jenis kartu dan tema dengan pratinjau langsung, unggah gambar massal (laporan file tak cocok), pratinjau halaman persis hasil cetak, sunting, tambah, hapus, dan urut ulang kartu, pilihan sisi cetak (depan, belakang, keduanya) dan tanda potong, saklar harakat, tombol salin teks perintah AI, daftar dek tersimpan dengan tombol ekspor dan impor berkas dek, tombol "Cetak" dan "Simpan PDF".

- [ ] **Step 1:** Tes alur di jsdom: `paste_builds_cards_without_extra_clicks` (tempel tabel Markdown → pratinjau menampilkan jumlah kartu yang benar tanpa langkah tambahan), `mapping_step_shows_only_when_columns_unknown`, `theme_change_updates_preview`, `flip_toggle_swaps_preview_sides`, `unmatched_images_are_listed`, `editing_a_card_updates_the_deck`, `add_delete_reorder_cards_update_preview`, `export_then_import_restores_deck`, `copy_prompt_button_copies_text`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Implementasi. Desain mengikuti spek: tampilan bersih dan profesional, pemilih tema berupa kartu pratinjau berwarna, semua teks Indonesia, kalimat huruf kecil di label, tanpa istilah teknis. Terapkan skill desain yang ada (`impeccable:impeccable`) pada tampilan akhir.
- [ ] **Step 4:** Lulus; periksa tangkapan layar layar utama, pratinjau, dan pemilih tema di lebar ponsel dan desktop.
- [ ] **Step 5:** Commit `feat: end-to-end ui flow`.

### Task 11: Mode luring dan APK

**Files:** Create `public/manifest.webmanifest`, `src/sw.ts` (atau konfigurasi `vite-plugin-pwa`), `capacitor.config.ts`, `.github/workflows/release.yml`; Modify `package.json`; Test `tests/pwa.test.ts`

**Interfaces:**
- Produces: tag `v*` memicu rilis berisi `flashcard-<tag>.apk`; `shareOrSavePdf(blob: Blob, name: string): Promise<void>` di `src/render/share.ts` (Capacitor Filesystem + Share di Android, unduhan biasa di web).

- [ ] **Step 1:** Tes `precache_manifest_includes_fonts_and_icons` (semua aset font dan ikon ada di daftar pra-simpan) dan `share_uses_download_on_web`.
- [ ] **Step 2:** Jalankan; gagal.
- [ ] **Step 3:** Tambah PWA (pra-simpan semua aset), Capacitor Android (`minSdkVersion 26`), `shareOrSavePdf`. Hubungkan tombol "Simpan PDF".
- [ ] **Step 4:** Lulus.
- [ ] **Step 5:** `release.yml`: dipicu tag `v*`; `setup-java` 17, build web, `npx cap sync android`, `./gradlew assembleRelease`. Tanda tangan memakai rahasia `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`; bila belum ada, bangun dengan kunci debug dan beri nama `...-debug.apk` serta catatan jelas di rilis. Unggah APK ke GitHub Release.
- [ ] **Step 6:** Pasang tag `v0.1.0` dan pastikan Release berisi APK. Bila APK belum bisa diuji di perangkat nyata, tulis itu terus terang di `HANDOFF.md`.
- [ ] **Step 7:** Commit `feat: offline pwa and android release`.

### Task 12: Serah-terima dan verifikasi akhir

**Files:** Modify `HANDOFF.md`, `README.md` (buat)

- [ ] **Step 1:** Jalankan `npm test` dan `npm run build`; semua lulus.
- [ ] **Step 2:** Buka halaman Pages hasil sebaran dan jalankan alur: tempel tabel contoh 20 kata (campur harakat), pilih tema, ekspor PDF, lalu periksa PNG hasil rasterisasi untuk huruf bersambung dan sisi belakang sejajar.
- [ ] **Step 3:** `README.md` (Indonesia): cara pakai singkat, tautan Pages, tautan unduh APK, cara memasang rahasia kunci.
- [ ] **Step 4:** Perbarui `HANDOFF.md`: status tiap tugas, tindakan pemilik yang tersisa (aktivasi Pages, rahasia kunci, uji APK di ponsel), langkah berikutnya, dan prompt lanjutan terbaru.
- [ ] **Step 5:** Commit `docs: handoff and readme`.
