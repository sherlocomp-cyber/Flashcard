# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-20 (sesi alat githubku; status DIPULIHKAN sebagian setelah insiden penimpaan, lihat bawah)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## INSIDEN 2026-10-20 (baca dulu)
Ada lebih dari satu sesi yang menulis ke `main`. Sesi dengan alat githubku (hanya bisa menulis ke `main`, tanpa riwayat git, `put_file` menimpa tanpa memeriksa) menimpa berkas bersama dengan versinya sendiri:
- `package.json` (commit `2954995`): dependensi `idb-keyval`, `fake-indexeddb`, `@capacitor/*` hilang, jadi CI, Pages, dan verify-pdf merah (CI #105 sampai #108, Pages #47 sampai #50, verify-pdf #27). **Sudah dipulihkan dari tebakan berbasis impor kode**: dependensi `@capacitor/android|core|filesystem|share` ^6.0.0, `@capacitor/cli` ^6.0.0, `idb-keyval` ^6.2.1, `fake-indexeddb` ^6.0.0, ditambah yang sudah ada. Versi Capacitor 6 dipilih karena `release.yml` memakai Java 17 (Capacitor 7 butuh Java 21). Versi ASLI belum diketahui: bandingkan dengan `git show 2954995^:package.json` dan koreksi bila beda.
- `tests/render/pdf.test.ts` (`b417fa4`) dan `src/render/pdf.ts` (`2040d97`): versi sesi lain (bila ada) tertimpa. API versi saya cocok dengan pemakai di `src/ui/app.ts` (`exportPdf(cards, opts)`, `PdfOptions`), jadi tipe seharusnya aman, tetapi isi asli hilang dari tangan saya.
- `HANDOFF.md` (`3289074`, dan sebelumnya): catatan status sesi lain tertimpa; berkas INI adalah rekonstruksi.
- Task 7 (`src/core/layout.ts`, `tests/core/layout.test.ts`) mungkin juga menimpa versi lain; belum diperiksa.
**Perbaikan paling bersih bagi sesi dengan git penuh**: `git log --oneline --stat -- package.json src/render/pdf.ts tests/render/pdf.test.ts HANDOFF.md src/core/layout.ts tests/core/layout.test.ts`, lalu `git revert` commit yang menimpa (3289074, 2040d97, b417fa4, 2954995 dan commit pemulihan di atasnya), atau `git checkout <sha-sebelum-saya> -- <berkas>`. Setelah itu pastikan CI, Pages, dan verify-pdf hijau.
**Aturan baru**: satu penulis ke `main`. Sesi githubku wajib `get_file` dulu sebelum `put_file` dan tidak boleh menimpa berkas yang berubah sejak terakhir dibaca.

## Status (yang terbukti dari isi repo, belum dari CI)
- Task 1 sampai 6: terverifikasi CI (screenshot 2026-10-19, run #2 sampai #26).
- Task 7 (`layout.ts`) dan Task 8 (`pdf.ts`, 8 tes unit): ada di repo. Hasil CI sebelum insiden tidak terlihat; setelah insiden merah karena `package.json`. Tunggu run baru.
- Task 9 (`src/store/decks.ts`, `tests/store/decks.test.ts`): ada (sesi lain).
- Task 10 (UI: `src/ui/app.ts`, `main.ts`, `dom.ts`, `scale.ts`, `tests/ui/flow.test.ts`, 16 tes alur): ada (sesi lain).
- Task 11: ada `src/render/share.ts`, `src/render/print.ts`, `capacitor.config.ts`, `.github/workflows/release.yml` (tag `v*` menghasilkan APK), workflow Pages.
- Task 8 langkah 5 (bukti visual PDF): workflow `.github/workflows/verify-pdf.yml` dan `scripts/verify-pdf.mjs` ada; menghasilkan artefak PNG dan PDF. BELUM ada konfirmasi bahwa pemilik atau sesi mana pun sudah memeriksa PNG-nya (Arab bersambung, harakat, sisi belakang sejajar).
- Task 12 (serah-terima dan verifikasi akhir): belum bisa dinilai dari sini.
- Belum dilakukan atau tak terkonfirmasi: putaran desain tema (lihat catatan desain), cetak lembar uji di kertas, uji APK di Android nyata, rahasia penanda tangan APK, GitHub Pages aktif.

## Cara menjalankan tes
`npm install` ditolak proxy sandbox Claude. Tes dijalankan oleh GitHub Actions (`ci.yml`: `npm test` lalu `npm run build`). Dorong tes dulu (merah) lalu kode (hijau). Sandbox tidak bisa membaca hasil Actions; minta pemilik mengirim screenshot daftar run. Cek lokal yang mungkin: `tsc` global dengan stub modul, dan tes murni lewat `node --experimental-strip-types`.

## Keputusan (ruling) yang masih berlaku
- Pemisah tabel: baris pertama menentukan (pipa, tab, koma); kolom paling kanan yang kosong total dibuang.
- Sisi kartu yang memuat gambar/ikon (`vocab`, `picture`) ditandai `Side.iconKey`; gambar ditaruh di sisi itu dan mengikuti tukar sisi. `Card.imageKey` = kolom `gambar`, bila kosong kata utama; tautan di kolom `gambar` tidak diunduh.
- Satu kolom isi: teks pertama dipindah ke depan (`vocab`, `material`). `id` kartu = `c<baris>-<hash isi>`.
- Pencocokan gambar: NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip; kandidat `imageKey`, `iconKey`, lalu teks baris. Kartu materi tidak diberi gambar.
- Kartu: `fitFontSize` 12 sampai 72 px; baris sub setengahnya (min 11); ukuran dalam mm; arah teks dari aksara; saklar harakat membuang U+064B..U+065F dan U+0670.
- Tema: 8 tema dengan ornamen sudut berbeda, `customTheme(warna)`, 11 ikon SVG tertanam, font Amiri.
- Tata letak: kartu rapat, margin >= 10 mm, ukuran menyesuaikan kisi (2/lembar 190×138,5; 4: 95×138,5; 6: 95×92,3; 8: 95×69,2; 9: 63,3×92,3 mm). Bolak-balik: balik di sisi panjang, tiap baris dibalik kiri-kanan. Tanda potong = ticks 4 mm di margin.
- PDF: tiap kartu dirender browser lalu JPEG 300 dpi lewat `html-to-image` ke jsPDF A4; satu kanvas hidup sekaligus; jeda `setTimeout(0)` tiap halaman; mode `both` menyisipkan depan lalu belakang per lembar.

## Catatan desain
- Preferensi pemilik: selalu pakai plugin `superpowers` dan `impeccable` yang sesuai untuk pekerjaan pengembangan dan desain.
- Kriteria tema menarik dari pemilik: tidak sesak (satu ide per kartu, ruang kosong cukup), ilustrasi vektor pop/berkarakter, tipografi sans-serif tegas dan kontras tinggi terbaca dari setengah meter, kode warna per kategori/level/tema seperti kartu permainan, depan sebagai umpan dan belakang sebagai jawaban yang memuaskan. Tema Task 6 masih polos (bingkai, ornamen sudut, ikon garis, satu warna) dan belum memenuhi itu. Putaran desain tema belum dilakukan.

## Tindakan pemilik
- Kirim screenshot daftar run Actions setelah pemulihan `package.json`; bila masih merah, kirim screenshot langkah yang gagal.
- Pilih satu sesi sebagai penulis ke `main`; sesi lain hanya membaca atau menyiapkan patch.
- Unduh artefak `verify-pdf` dari tab Actions dan nilai PNG-nya (atau cetak lembar uji).
- Nanti: aktifkan GitHub Pages (Settings, Pages, Source: GitHub Actions); tambahkan rahasia APK `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` dan simpan cadangan kunci; uji APK di ponsel Android nyata.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard, branch main. Baca dulu HANDOFF.md (bagian INSIDEN),
docs/superpowers/specs/2026-10-18-flashcard-design.md, dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: package.json sudah dipulihkan dari tebakan (Capacitor ^6); hasil CI, Pages, verify-pdf setelah
itu: [ISI: tempel screenshot Actions, atau tulis hijau/merah; jangan dikirim kosong]. Hanya SATU sesi
yang boleh menulis ke main; sesi githubku wajib get_file sebelum put_file. Bila CI masih merah,
perbaiki dulu (periksa versi asli package.json lewat git). Lalu kerjakan yang belum: bukti visual PDF
dari artefak verify-pdf, putaran desain tema dengan impeccable, Task 12. Jawab dalam bahasa Indonesia.
Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
