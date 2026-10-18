# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 (sesi 3, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja sekarang: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` hanya berisi Task 1 dan sudah usang; jangan dipakai lagi kecuali pemilik minta.
- **Task 1 selesai** (kerangka Vite + TS + Vitest, `mount()`, `types.ts`, `index.html`, `ci.yml`; CI #1 merah, #2 dan #3 hijau di `build/app`). Kerangka disalin ke `main` KECUALI `pages.yml` (sengaja: akan mencoba deploy ke Pages saat push ke `main` sebelum Pages diaktifkan).
- **Task 2 sampai 6 sudah didorong ke `main`** dengan urutan tes MERAH lalu kode HIJAU. Hasil CI yang DIHARAPKAN (BELUM dikonfirmasi pemilik; cek tab Actions, satu screenshot daftar run cukup):

  | Commit (awal judul) | Harapan |
  |---|---|
  | `ci: run tests and build on push (Task 2 MERAH` | merah |
  | `feat: parse pasted tables (Task 2 HIJAU` | hijau |
  | `test: column mapping and AI prompt (Task 3 MERAH` | merah |
  | `feat: column mapping (Task 3, 1/2` | merah |
  | `feat: AI prompt (Task 3, 2/2` | hijau |
  | `test: build cards from table (Task 4 MERAH` | merah |
  | `feat: build cards from table (Task 4 HIJAU` | hijau |
  | `test: image matching and downscale (Task 5 MERAH` | merah |
  | `feat: image matching and downscale (Task 5 HIJAU` | hijau |
  | `docs: handoff setelah Task 2-5` dan `docs: tandai HANDOFF-main.md usang` | hijau |
  | `test: fitFontSize (Task 6a MERAH` | merah |
  | `feat: fitFontSize (Task 6a HIJAU` | hijau |
  | `test: themes and icons (Task 6b MERAH` | merah |
  | `feat: built-in icons (Task 6b, 1/2` | merah |
  | `feat: themes and custom theme (Task 6b, 2/2` | hijau |
  | `chore: tambah dependensi @fontsource/amiri`, `chore: fonts.css ...`, `chore: impor fonts.css di main.ts` | hijau (risiko: nama berkas `@fontsource/amiri/400.css` dan `700.css` belum diuji; bila `npm run build` merah, periksa itu) |
  | `test: card renderer (Task 6d MERAH` | merah |
  | `feat: corner ornaments (Task 6d, 1/2` | merah |
  | `feat: card renderer (Task 6d, 2/2` | hijau (RISIKO TERTINGGI: uji DOM jsdom tidak bisa dijalankan di sandbox) |

  Bukti lokal: tes murni (parse, columns, cards, images, fit, themes: 38 tes) lulus di Node 22 dengan pengganti `describe/it/expect` buatan sendiri, dan `tsc` strict bersih untuk seluruh kode termasuk `cardView.ts`. Uji `tests/render/cardView.test.ts` (8 tes, butuh jsdom) BELUM pernah dijalankan. Tugas baru dianggap selesai bila tabel di atas terkonfirmasi di Actions.
- Task 7 sampai 12: belum dikerjakan. Mulai dari Task 7 (`layout.ts`, murni; bisa diuji lokal).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas, jadi satu tugas bisa terdiri dari beberapa commit; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit di daftar itu memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global ada di sandbox (`tsc -p` dengan stub modul `vitest` dan `*.css`); tes murni bisa dijalankan dengan `node --experimental-strip-types` memakai pengganti `describe/it/expect` (impor diberi akhiran `.ts`).
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 6
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang. Biayanya bila salah: kolom terakhir yang sengaja kosong total ikut hilang (tak berpengaruh pada kartu).
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey` (isi: arti Indonesia, atau Inggris, atau Arab). Task 5 menaruh gambar di sisi itu; Task 6 memilih ikon dari `iconKey`. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet (tanpa data keluar); hanya dicocokkan lewat nama.
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah.
- `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip. Urutan kandidat per kartu: `imageKey`, `iconKey`, teks semua baris. Kartu materi tidak diberi gambar. `downscale` (kanvas) tidak diuji di jsdom; hanya `scaledSize`. Verifikasi `downscale` di browser nyata saat Task 10.
- Task 6: `fitFontSize` bilangan bulat, pencarian biner, ukuran 12 sampai 72 px (CSS 96 dpi). Baris utama memakai ukuran itu, baris sub setengahnya (minimal 11 px). Kartu berukuran mm (bawaan 90 × 65, bisa diatur lewat `widthMm`/`heightMm`; Task 7 harus mengirim ukuran dari `gridFor`). `renderCardSide` mengukur luapan dengan memasang kartu sementara di luar layar; hook `measureOverflow` ada supaya luapan bisa diuji tanpa tata letak nyata (jsdom tak punya). Verifikasi nyata luapan dan tampilan di browser saat Task 8 atau 10.
- Task 6: arah teks dari aksara: tanpa huruf Arab `ltr`, lebih dari separuh huruf Arab `rtl`, campuran `auto`. Saklar harakat membuang U+064B sampai U+065F dan U+0670 (tatwil dipertahankan).
- Task 6: 8 tema (tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam), tiap tema punya ornamen sudut sendiri; `tint` = 85% menuju putih, `ink` = 40% kecerahan warna; `customTheme` menerima #rgb/#rrggbb, selain itu jatuh ke warna tosca. 11 ikon SVG tertanam dengan pencocokan kata kunci persis (Indonesia, Inggris, Arab). Tampilan visual tema belum pernah dilihat siapa pun: minta pemilik menilai saat pratinjau Task 10 ("tema menarik" adalah anti-tujuan di spek).
- Font Arab: `@fontsource/amiri` (400 dan 700) lewat `src/ui/fonts.css`, diimpor dari `main.ts`.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Kirim screenshot daftar run di tab Actions (lihat tabel Status).
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Nanti: uji APK di ponsel Android nyata.

## Langkah berikutnya
Konfirmasi tabel CI di atas. Bila semua sesuai, kerjakan Task 7 sampai 12 berurutan di `main`. Buktikan lebih awal risiko Arab dan cetak bolak-balik di Task 8. Perbarui file ini di akhir setiap sesi.

## Aturan kerja
- Jawab dalam bahasa Indonesia. Akhiri setiap balasan dengan prompt lanjutan di bawah.
- Catat keputusan penting di repo. Repo publik: tanpa kunci atau rahasia.
- Kuota akun cepat habis: kerja ringkas, commit sering, perbarui file ini.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard (bekerja langsung di branch main atas izin pemilik).
Baca dulu HANDOFF.md, docs/superpowers/specs/2026-10-18-flashcard-design.md,
dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: Task 1 sampai 6 sudah didorong ke main dengan urutan tes MERAH lalu kode HIJAU (lihat tabel
di HANDOFF.md). Hasil CI menurut screenshot Actions saya: [ISI: tempel screenshot, atau tulis tiap
commit merah/hijau; jangan dikirim dengan tanda kurung ini kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions, jadi saya yang mengirim screenshot. Bila ada hasil yang tidak sesuai harapan
(terutama uji DOM cardView dan build font Amiri), perbaiki dulu. Bila semua sesuai, lanjutkan dari
Task 7 (layout.ts): tulis tes dulu dan dorong (harus merah), lalu kodenya (harus hijau). Jawab dalam
bahasa Indonesia. Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
