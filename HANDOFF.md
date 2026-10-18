# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 5, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` usang; jangan dipakai kecuali pemilik minta.
- **Task 1 sampai 9: SELESAI dan TERVERIFIKASI CI.** Task 9 dikonfirmasi screenshot pemilik 05:40: #39 dan #40 merah, #41 dan #42 hijau. Catatan lama tetap berlaku: penyebab merah tiap commit tes tidak dibaca dari log; buktinya tidak langsung.
- **Task 8: perbaikan sesi 5 TERVERIFIKASI CI, BELUM terverifikasi visual.**
  - CI (screenshot pemilik 05:47): #43 `test: isolasi Latin ...` merah, #44 `test: kartu campuran ...` merah, #45 `feat: pemisah segmen Latin ...` merah, #46 `fix: kartu campuran Arab-Latin terisolasi ...` HIJAU (28 s), #47 `docs: handoff setelah perbaikan Task 8` hijau. Persis urutan yang diharapkan.
  - Penilaian PNG/PDF `verify-pdf` lama (commit 72a0bfa, dinilai di sesi 5): Arab bersambung BAIK; harakat tepat BAIK; sisi belakang tercermin dan sejajar BAIK (kedua lembar); materi panjang muat BAIK. Cacat: (1) kata Latin dipecah di tengah kata ("sekola"+"h", "campur"+"an"); (2) kartu `الكِتَابُ (the book) رقم 12` urutan tanda kurung salah ("the) (book"). Pengamatan belum dipastikan: angka "5." pada kartu "5. الجملة الاسمية" tampak di sisi kiri teks Arab (pada paragraf kanan-ke-kiri seharusnya di kanan); sebabnya belum jelas (mungkin dari data contoh di `scripts/verify-harness.html`); periksa di PNG baru.
  - **Kiriman PDF kedua pemilik (`sample_1.pdf`, 05:49) IDENTIK byte demi byte (md5 942dcfa2...) dengan yang lama.** Sebabnya: `verify-pdf` hanya terpicu oleh `scripts/verify-*` dan berkas workflow-nya, jadi perbaikan di `src/` tidak menjalankannya; run yang terlihat di tab Actions hanya #1 (commit 72a0bfa). Jadi sampai saat ini BELUM ada bukti visual untuk kode yang sudah diperbaiki.
  - Perbaikan kode: `src/core/bidi.ts` (`splitBidi`), `cardView.ts` membungkus potongan Latin/angka `<bdi dir="ltr">` hanya pada baris campuran, `LINE_WRAP_CSS` (`overflow-wrap:normal; word-break:normal`), pengukur luapan bawaan memeriksa lebar tiap baris.
  - Commit `ci: verify-pdf juga jalan saat src/ berubah` menambah `src/**` ke pemicu `verify-pdf` dan, karena mengubah berkas workflow-nya sendiri, memicu run baru (#2) pada kode yang sudah diperbaiki. PNG dari run #2 itulah yang harus dinilai.
  - Titik rawan yang masih terbuka: `bdi` di dalam `html-to-image` (SVG foreignObject); keandalan deteksi lebar per baris di Chromium; tes jsdom tidak mengukur tata letak (`line_wrap_never_breaks_inside_a_word` hanya memeriksa konstanta CSS).
- Task 10 sampai 12: belum dikerjakan. **Task 10 menunggu penilaian PNG run #2.** APK baru ada setelah Task 11 (tag `v0.1.0` memicu `release.yml`).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global ada di sandbox (`tsc -p` dengan stub modul `vitest`, `*.css`, dan paket luar); tes murni dijalankan dengan `node --experimental-strip-types` memakai skrip tegasan `node:assert` (impor diberi akhiran `.ts`). Uji DOM dan uji yang butuh `jspdf`/`idb-keyval` tidak bisa dijalankan lokal.
5. Bukti visual PDF: sejak sesi 5 `verify-pdf` terpicu otomatis oleh perubahan di `src/`, `scripts/verify-*`, atau berkas workflow-nya, dan bisa dijalankan manual (Run workflow). Sebelum menilai PNG, pastikan PDF-nya baru (bandingkan dengan kiriman sebelumnya, mis. ukuran/hash), jangan menilai artefak dari run lama.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 7
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang. Biayanya bila salah: kolom terakhir yang sengaja kosong total ikut hilang (tak berpengaruh pada kartu).
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey` (isi: arti Indonesia, atau Inggris, atau Arab). Task 5 menaruh gambar di sisi itu; Task 6 memilih ikon dari `iconKey`. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet (tanpa data keluar); hanya dicocokkan lewat nama.
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah.
- `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip. Urutan kandidat per kartu: `imageKey`, `iconKey`, teks semua baris. Kartu materi tidak diberi gambar. `downscale` (kanvas) tidak diuji di jsdom; hanya `scaledSize`. Verifikasi `downscale` di browser nyata saat Task 10.
- Task 6: `fitFontSize` bilangan bulat, pencarian biner, 12 sampai 72 px (CSS 96 dpi); baris sub setengahnya (minimal 11 px). Kartu berukuran mm (bawaan 90 × 65; `widthMm`/`heightMm` bisa diatur; Task 8 sudah mengirim ukuran dari `gridFor`). `renderCardSide` mengukur luapan dengan memasang kartu sementara di luar layar, lalu melepasnya (kartu yang dikembalikan TIDAK terpasang di dokumen); hook `measureOverflow` ada untuk uji tanpa tata letak nyata. Verifikasi luapan dan tampilan di browser nyata lewat `verify-pdf` (Task 8) atau pratinjau Task 10.
- Task 6: arah teks dari aksara: tanpa huruf Arab `ltr`, lebih dari separuh huruf Arab `rtl`, campuran `auto`. Saklar harakat membuang U+064B sampai U+065F dan U+0670 (tatwil dipertahankan).
- Task 6: 8 tema (tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam) dengan ornamen sudut berbeda; `customTheme` menerima #rgb/#rrggbb, selain itu jatuh ke tosca. 11 ikon SVG tertanam, pencocokan kata kunci persis (Indonesia, Inggris, Arab). Tampilan visual tema belum pernah dilihat pemilik: minta penilaian saat pratinjau Task 10 ("tema kurang menarik" adalah anti-tujuan di spek). `verify-pdf` juga menampilkan tema tosca sekilas.
- Task 7: kartu rapat tanpa celah, margin aman minimal 10 mm; ukuran kartu menyesuaikan kisi (2 per lembar 190 × 138,5; 4: 95 × 138,5; 6: 95 × 92,3; 8: 95 × 69,2; 9: 63,3 × 92,3 mm), jadi bentuknya portrait lebar penuh dan BERBEDA tiap pilihan. Bila pemilik ingin kartu seukuran kartu remi, ubah di `gridFor`. Cetak bolak-balik mengasumsikan balik di sisi panjang (tepi kiri-kanan); baris dibalik kiri-kanan. Tanda potong = ticks pendek 4 mm di margin, di perpanjangan garis kisi (bukan garis penuh di atas kartu). Toleransi angka desimal 1e-6 mm di tes. **Terbukti benar di PDF nyata (sesi 5).**
- Font Arab: `@fontsource/amiri` (400 dan 700) lewat `src/ui/fonts.css`, diimpor dari `main.ts`. **Terbukti tampil di PDF nyata (sesi 5): opsi `fontEmbedCSS` tidak diperlukan.**

## Keputusan (ruling) Task 8
- Ekspor: tiap slot kartu dipasang sementara di luar layar (`position:fixed; left:-10000px`), difoto `html-to-image.toCanvas` dengan `pixelRatio` 300/96 (setara 300 dpi) dan lebar/tinggi persis dari `gridFor`, disimpan sebagai JPEG kualitas 0,9, ditempel ke jsPDF pada koordinat mm dari `gridFor`, lalu kanvas dilepas (`width=height=0`). Satu kartu pada satu waktu; antarmuka diberi giliran (`nextFrame`) tiap halaman. Alasan: memori dan keandalan (Review Focus 5). Biayanya bila salah: PDF 200 kartu dua sisi (±400 gambar) bisa besar (ratusan MB belum diukur); bila berat, turunkan `JPEG_QUALITY` atau pecah menjadi beberapa PDF. Catatan sesi 5: PDF contoh 4 halaman sekitar 1,3 MB.
- Urutan halaman `sides:'both'` = depan lembar 1, belakang lembar 1, depan lembar 2, belakang lembar 2 (urutan cetak dua sisi). Pilihan `front` atau `back` membuat hanya sisi itu.
- Foto kartu pertama dilakukan dua kali (yang pertama dibuang) karena `html-to-image` sering belum memuat font tertanam pada foto pertama; `document.fonts.ready` ditunggu sekali.
- Penyimpangan kecil dari rencana: `PdfOptions` mendapat `deps?: Partial<PdfDeps>` (rasterize dan nextFrame) supaya tes bisa memalsukan rasterisasi tanpa kanvas. Tanpa dampak bagi pemakai.
- jsPDF dibuat dengan `compress:false` supaya tes bisa menghitung operator garis tanda potong; dampaknya hanya aliran konten halaman sedikit lebih besar.
- Dek kosong melempar galat `Tidak ada kartu untuk diekspor.` (pesan Indonesia untuk antarmuka Task 10).
- Versi paket: `jspdf ^3.0.1`, `html-to-image ^1.11.13` (terbukti terpasang dan tes lulus di CI).
- Peringatan luapan (`data-overflow`) belum dikirim keluar dari `exportPdf`; Task 10 menampilkannya di pratinjau. Bila pemilik ingin peringatan juga saat ekspor, tambahkan callback.
- **Sesi 5, Ruling: kata tidak pernah dipecah di tengah** (`overflow-wrap:normal`, bukan `anywhere`); kata terlalu panjang membuat huruf mengecil, dan bila pada 12 px pun meluap kartu diberi `data-overflow`. Biayanya bila salah: kata sangat panjang (mis. satu kata Latin lebih dari ±12 huruf di kartu 9 per lembar) menjadi kecil atau bertanda luapan, bukan terbungkus.
- **Sesi 5, Ruling: isolasi bidi hanya pada baris yang memuat Arab DAN Latin/angka** (`<bdi dir="ltr">`), baris murni Arab atau murni Latin tidak berubah. Potongan Latin = satu run dari huruf/angka Latin (beserta pembuka `([{"'` di depannya) sampai huruf Arab berikutnya, spasi akhir dikeluarkan. Biayanya bila salah: tanda baca penutup yang jatuh persis sebelum teks Arab bisa ikut run Latin; run Latin yang sangat panjang tidak membungkus di tengah run.
- **Sesi 5, Ruling: `verify-pdf` terpicu juga oleh `src/**`.** Alasan: pemicu lama membuat perbaikan di `src/` tidak menghasilkan bukti visual baru, dan sempat hampir dinilai dari artefak lama. Biayanya bila salah: tiap dorongan ke `src/` menjalankan job ±1 menit (kuota Actions), dan job bisa merah karena Playwright/Chromium tanpa ada kesalahan di kode aplikasi.

## Keputusan (ruling) Task 9
- Penyimpanan: IndexedDB lewat `idb-keyval`, basis data `flashcard`, penyimpanan `decks`, kunci `deck:<id>`. Penyimpanan dibuat malas (saat pertama dipakai), bukan saat modul dimuat, agar aman tanpa IndexedDB. `saveDeck` menyimpan apa adanya; pemanggil (Task 10) yang mengisi `updatedAt`.
- `listDecks` hanya mengembalikan `id`, `name`, `updatedAt` (tanpa kartu dan gambar), terbaru dulu.
- Format berkas dek: `{ "format": "flashcard-deck", "version": 1, "deck": {...} }`, gambar tertanam sebagai data URL. Rencana tidak menyebut pembungkus; ditambahkan agar berkas asing ditolak dengan jelas dan format bisa berkembang. Impor tidak menerima JSON dek tanpa pembungkus.
- Validasi impor memeriksa bidang dek dan tiap kartu (`id`, `type`, `front.lines`, `back.lines`), tidak memeriksa isi tiap baris teks. Biayanya bila salah: berkas buatan tangan dengan baris teks rusak lolos impor dan baru gagal saat dirender. Semua galat berawalan `Berkas dek tidak valid:`.
- Impor tidak membatasi ukuran gambar; batas kuota penyimpanan peramban belum diuji dengan dek 200 kartu bergambar (Task 10).
- Versi paket `idb-keyval ^6.2.1`, `fake-indexeddb ^6.0.0` terbukti terpasang dan 8 tes lulus di CI (#41).

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- **Buka tab Actions → workflow `verify-pdf`.** Harus ada run #2 (judul `ci: verify-pdf juga jalan saat src/ berubah ...`). Tunggu hijau (±1 menit), buka run itu, unduh artefak `verify-pdf`, dan kirim PNG `halaman-1.png` sampai `halaman-4.png` (atau `sample.pdf`). Bila run #2 tidak ada, tekan "Run workflow" di halaman `verify-pdf`. Nilai: (a) kata Latin ("sekolah", "campuran Arab dan Latin") tidak lagi terpecah di tengah kata? (b) kartu campuran `الكِتَابُ (the book) رقم 12` memuat "(the book)" utuh dengan tanda kurung benar? (c) posisi "5." pada kartu "الجملة الاسمية"? (d) Arab masih bersambung, harakat tepat, cermin sejajar? Bila run #2 merah, kirim screenshot halaman run dan langkah yang gagal.
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci. Tanpa rahasia ini APK tetap dibuat tetapi bertanda kunci debug (`...-debug.apk`).
- Nanti: cetak satu lembar uji dari PDF hasil aplikasi nyata (Task 10) dan nilai Arab bersambung, harakat, dan keselarasan bolak-balik; uji APK di ponsel Android nyata (simpan/bagikan PDF tidak bisa dibuktikan dari sandbox).

## Langkah berikutnya
Nilai PNG `verify-pdf` run #2. Bila ada yang tidak sesuai, perbaiki dulu (Task 8 lebih dulu). Bila sesuai, kerjakan Task 10 (alur antarmuka; terapkan skill `impeccable:impeccable` pada tampilan akhir), lalu Task 11 (APK) dan 12 berurutan di `main`. Perbarui file ini di akhir setiap sesi.

## Aturan kerja
- Jawab dalam bahasa Indonesia. Akhiri setiap balasan dengan prompt lanjutan di bawah.
- Catat keputusan penting di repo. Repo publik: tanpa kunci atau rahasia.
- Kuota akun cepat habis: kerja ringkas, commit sering, perbarui file ini.
- TDD ketat: tes dulu dan dorong (harus merah), baru kodenya. Kode yang telanjur ditulis sebelum tesnya dihapus dan ditulis ulang.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard (bekerja langsung di branch main atas izin pemilik).
Baca dulu HANDOFF.md, docs/superpowers/specs/2026-10-18-flashcard-design.md,
dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: Task 1 sampai 9 terverifikasi CI. Perbaikan Task 8 (kata Latin dipecah di tengah kata, tanda
kurung terbalik pada kartu campuran Arab-Latin) sudah lulus CI (#43 sampai #45 merah, #46 dan #47 hijau),
tetapi bukti visualnya belum ada: verify-pdf run #2 dipicu ulang oleh commit "ci: verify-pdf juga jalan
saat src/ berubah".
Hasil verify-pdf run #2 (PNG artefak): [ISI: tempel PNG atau tulis penilaian: kata Latin tidak terpecah?
kartu "الكِتَابُ (the book) رقم 12" benar? posisi "5." pada kartu الجملة الاسمية? Arab masih bersambung,
harakat tepat, cermin sejajar?; atau bila run merah, tempel screenshot halaman run; jangan dikirim kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions maupun mengunduh artefak, jadi saya yang mengirim screenshot dan PNG. Bila hasil
tidak sesuai harapan, perbaiki dulu (Task 8 lebih dulu). Bila sesuai, lanjutkan dari Task 10 (alur antarmuka
tempel sampai cetak, bahasa Indonesia, terapkan skill impeccable:impeccable): tulis tes dulu dan dorong
(harus merah), lalu kodenya (harus hijau). Jawab dalam bahasa Indonesia.
Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
