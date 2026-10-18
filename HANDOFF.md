# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 4, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` hanya berisi Task 1 dan usang; jangan dipakai kecuali pemilik minta.
- **Task 1 sampai 7: SELESAI dan TERVERIFIKASI CI.** Task 7 dikonfirmasi lewat screenshot Actions pemilik (2026-10-19 05:25): #27 `test ... Task 7 MERAH` merah, #28 `feat ... Task 7 HIJAU` hijau, #29 `docs: handoff` hijau; cocok dengan harapan. Catatan lama tetap berlaku: penyebab merah tiap commit tes tidak dibaca dari log (log tidak bisa dibuka dari sandbox); buktinya tidak langsung, yaitu commit kode berikutnya menjadikannya hijau.
- **Task 8 (pdf.ts) didorong ke `main`, BELUM dikonfirmasi pemilik.** Urutan commit dan harapan CI utama (workflow `CI`):
  1. `test: ekspor PDF A4 (Task 8 MERAH: pdf.ts belum ada)` : harapan MERAH
  2. `test: ekspor PDF A4, regex tanda potong diperbaiki (Task 8 MERAH ...)` : harapan MERAH
  3. `chore: tambah html-to-image dan jspdf (Task 8, tes masih MERAH)` : harapan MERAH (pdf.ts belum ada)
  4. `feat: ekspor PDF A4 per slot dengan pelepasan kanvas (Task 8 HIJAU)` : harapan HIJAU
  5. tiga commit `chore: ... verify-pdf` (halaman uji, kartu contoh, skrip): harapan HIJAU (di luar `src` dan `tests`)
  6. `ci: job verify-pdf ...` : harapan HIJAU pada `CI`, dan satu run baru workflow **`verify-pdf`** (lihat di bawah)
  7. `docs: handoff setelah Task 8` : harapan HIJAU
- Bukti lokal Task 8: `tsc` strict bersih untuk `pdf.ts` dengan stub tipe untuk `jspdf` dan `html-to-image` (paket aslinya tidak bisa dipasang di sandbox, jadi tipe aslinya BELUM diperiksa). Tes `pdf.test.ts` (8 tes) BELUM pernah dijalankan; hanya CI yang bisa membuktikan. Titik rawan terbesar: jsPDF di lingkungan jsdom/Node (cara tes membaca jumlah halaman dari teks PDF, `MediaBox`, dan operator garis).
- **Bukti visual Arab (risiko 1) dan cetak bolak-balik (risiko 3) BELUM ada.** Workflow `verify-pdf` (manual lewat "Run workflow", atau otomatis saat `scripts/verify-*` berubah) membuka `scripts/verify-harness.html` di Chromium tanpa kepala, mengekspor 5 kartu contoh (harakat, campuran Arab dan Latin, materi panjang; 4 per lembar; depan dan belakang; tanda potong) lalu mengunggah artefak `verify-pdf` berisi `sample.pdf` dan `halaman-*.png`. Sandbox tidak bisa mengunduh artefak: pemilik yang membukanya.
- Task 9 sampai 12: belum dikerjakan. Berikutnya Task 9 (penyimpanan dek, `idb-keyval`, `fake-indexeddb`).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global ada di sandbox (`tsc -p` dengan stub modul `vitest`, `*.css`, dan paket luar); tes murni dijalankan dengan `node --experimental-strip-types` memakai pengganti `describe/it/expect` (impor diberi akhiran `.ts`). Uji DOM dan uji yang butuh `jspdf` tidak bisa dijalankan lokal.
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
- Task 7: kartu rapat tanpa celah, margin aman minimal 10 mm; ukuran kartu menyesuaikan kisi (2 per lembar 190 × 138,5; 4: 95 × 138,5; 6: 95 × 92,3; 8: 95 × 69,2; 9: 63,3 × 92,3 mm), jadi bentuknya portrait lebar penuh dan BERBEDA tiap pilihan. Bila pemilik ingin kartu seukuran kartu remi, ubah di `gridFor`. Cetak bolak-balik mengasumsikan balik di sisi panjang (tepi kiri-kanan); baris dibalik kiri-kanan. Tanda potong = ticks pendek 4 mm di margin, di perpanjangan garis kisi (bukan garis penuh di atas kartu). Toleransi angka desimal 1e-6 mm di tes.
- Font Arab: `@fontsource/amiri` (400 dan 700) lewat `src/ui/fonts.css`, diimpor dari `main.ts`.

## Keputusan (ruling) Task 8
- Ekspor: tiap slot kartu dipasang sementara di luar layar (`position:fixed; left:-10000px`), difoto `html-to-image.toCanvas` dengan `pixelRatio` 300/96 (setara 300 dpi) dan lebar/tinggi persis dari `gridFor`, disimpan sebagai JPEG kualitas 0,9, ditempel ke jsPDF pada koordinat mm dari `gridFor`, lalu kanvas dilepas (`width=height=0`). Satu kartu pada satu waktu; antarmuka diberi giliran (`nextFrame`) tiap halaman. Alasan: memori dan keandalan (Review Focus 5). Biayanya bila salah: PDF 200 kartu dua sisi (±400 gambar) bisa besar (ratusan MB belum diukur); bila berat, turunkan `JPEG_QUALITY` atau pecah menjadi beberapa PDF.
- Urutan halaman `sides:'both'` = depan lembar 1, belakang lembar 1, depan lembar 2, belakang lembar 2 (urutan cetak dua sisi). Pilihan `front` atau `back` membuat hanya sisi itu.
- Foto kartu pertama dilakukan dua kali (yang pertama dibuang) karena `html-to-image` sering belum memuat font tertanam pada foto pertama; `document.fonts.ready` ditunggu sekali. Bila Amiri tetap tidak muncul di PNG `verify-pdf`, ini tempat pertama untuk diperiksa (opsi `fontEmbedCSS`).
- Penyimpangan kecil dari rencana: `PdfOptions` mendapat `deps?: Partial<PdfDeps>` (rasterize dan nextFrame) supaya tes bisa memalsukan rasterisasi tanpa kanvas (rencana menyebut "fungsi render yang dipalsukan"). Tanpa dampak bagi pemakai.
- jsPDF dibuat dengan `compress:false` supaya tes bisa menghitung operator garis tanda potong; dampaknya hanya aliran konten halaman sedikit lebih besar (gambar JPEG yang dominan tidak terpengaruh).
- Dek kosong melempar galat `Tidak ada kartu untuk diekspor.` (pesan Indonesia untuk antarmuka Task 10).
- Versi paket dipilih tanpa bisa memasangnya di sandbox: `jspdf ^3.0.1` (versi 2.x punya temuan keamanan), `html-to-image ^1.11.13`. Bila CI menolak (API berubah), cek nama ekspor dan tipe di CI dulu.
- Peringatan luapan (`data-overflow`) belum dikirim keluar dari `exportPdf`; Task 10 menampilkannya di pratinjau. Bila pemilik ingin peringatan juga saat ekspor, tambahkan callback.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Kirim screenshot daftar run Actions untuk commit Task 8 (dan seterusnya).
- **Buka run `verify-pdf` terbaru (tab Actions → verify-pdf → bagian Artifacts → `verify-pdf`)**, unduh, dan kirim/nilai `halaman-1.png` sampai `halaman-4.png`: (a) huruf Arab bersambung dan harakat tepat di atas/bawah hurufnya? (b) kartu campuran Arab dan Latin tampil benar? (c) teks materi panjang muat? (d) di lembar belakang, kartu 2 ada di kiri kartu 1 (cermin) dan lembar kedua hanya memuat kartu 5? Bila workflow ini merah, kirim screenshot langkah yang merah.
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Nanti: cetak satu lembar uji dari PDF hasil Task 8 (dari aplikasi nyata di Task 10) dan nilai Arab bersambung, harakat, dan keselarasan bolak-balik; uji APK di ponsel Android nyata.

## Langkah berikutnya
Konfirmasi hasil CI Task 8 dan hasil `verify-pdf`. Bila ada yang tidak sesuai, perbaiki Task 8 dulu (risiko Arab adalah risiko utama spek). Bila sesuai, kerjakan Task 9 sampai 12 berurutan di `main`. Perbarui file ini di akhir setiap sesi.

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
Status: Task 1 sampai 7 terverifikasi CI. Task 8 (pdf.ts) sudah didorong ke main (tes MERAH lalu kode HIJAU,
plus workflow verify-pdf).
Hasil CI Task 8 menurut screenshot Actions saya: [ISI: tempel screenshot, atau tulis merah/hijau per
commit; jangan dikirim dengan tanda kurung ini kosong].
Hasil verify-pdf (PNG artefak): [ISI: tempel PNG atau tulis penilaian: Arab bersambung? harakat tepat?
campuran Arab-Latin benar? sisi belakang tercermin dan sejajar?; jangan dikirim kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions maupun mengunduh artefak, jadi saya yang mengirim screenshot dan PNG. Bila hasil
tidak sesuai harapan, perbaiki dulu (Task 8 lebih dulu). Bila sesuai, lanjutkan dari Task 9 (store/decks.ts:
penyimpanan dek dengan idb-keyval dan fake-indexeddb): tulis tes dulu dan dorong (harus merah), lalu
kodenya (harus hijau). Jawab dalam bahasa Indonesia.
Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
