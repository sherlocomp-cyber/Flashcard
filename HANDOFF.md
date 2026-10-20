# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 3, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` hanya berisi Task 1 dan usang.
- **Task 1 sampai 6: SELESAI dan TERVERIFIKASI CI** (screenshot Actions pemilik 2026-10-19 05:21, run #2 sampai #26 cocok dengan harapan merah/hijau tiap commit, termasuk 8 uji DOM `cardView` dan build font Amiri). Catatan: penyebab merah tiap commit tes tidak dibaca dari log; buktinya tidak langsung (commit kode berikutnya yang menambah modul itu menjadikannya hijau).
- **Task 7 (layout.ts)** didorong ke `main` (`test: A4 layout ... (Task 7 MERAH`, lalu `feat: A4 layout ... (Task 7 HIJAU`). BELUM dikonfirmasi pemilik. Bukti lokal: 8 tes lulus, `tsc` strict bersih.
- **Task 8 (pdf.ts, kode dan tes unit)** didorong ke `main`: `chore: tambah dependensi jspdf dan html-to-image` (harapan hijau), `test: A4 pdf export (Task 8 MERAH` (harapan merah), `feat: A4 pdf export (Task 8 HIJAU` (harapan hijau, RISIKO TINGGI: jsPDF belum pernah dijalankan di sandbox; `tsc` hanya diperiksa dengan stub tipe `jspdf` dan `html-to-image`). BELUM dikonfirmasi. 8 tes di `tests/render/pdf.test.ts` memakai rasterizer palsu (jsPDF sungguhan, gambar JPEG 8×8 valid): jumlah halaman dan ukuran A4, pilihan sisi, kemajuan per halaman, 200 kartu dengan kanvas hanya satu hidup sekaligus dan semuanya dilepas, urutan sisi belakang tercermin end-to-end, tanda potong menambah gambar, dek kosong ditolak dengan pesan Indonesia, `host` luar layar dibersihkan saat gagal.
- **Task 8 langkah 5 (bukti visual) BELUM dikerjakan, dan itu syarat spek**: spek bagian risiko 1 mewajibkan bukti bahwa huruf Arab bersambung, harakat tepat, dan sisi belakang sejajar sebelum fitur lain dianggap selesai. `scripts/verify-pdf.mjs` dan job CI `verify-pdf` (peramban tanpa kepala, ekspor PDF dari kartu contoh, `pdftoppm` ke PNG, unggah sebagai artefak) belum ada. Cara membuktikan: pemilik mengunduh artefak PNG dari tab Actions lalu mengunggahnya ke chat, atau (lebih sederhana) mencetak satu lembar uji dari aplikasi setelah Task 10 dan menilainya di kertas. Sampai itu terjadi, Task 8 hanya "kode dan uji unit selesai".
- Task 9 sampai 12: belum dikerjakan. Mulai dari Task 9 (`src/store/decks.ts`, `idb-keyval`, `fake-indexeddb`).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global ada di sandbox (`tsc -p` dengan stub modul `vitest`, `*.css`, `jspdf`, `html-to-image`); tes murni dijalankan dengan `node --experimental-strip-types` memakai pengganti `describe/it/expect` (impor diberi akhiran `.ts`). Uji DOM dan uji jsPDF tidak bisa dijalankan lokal.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 8
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang.
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey`; Task 5 menaruh gambar di sisi itu, Task 6 memilih ikon darinya. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet (tanpa data keluar).
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah.
- `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan gambar = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip; kandidat: `imageKey`, `iconKey`, teks semua baris. Kartu materi tidak diberi gambar. `downscale` (kanvas) tidak diuji di jsdom; hanya `scaledSize`. Verifikasi `downscale` di browser nyata saat Task 10.
- Task 6: `fitFontSize` bilangan bulat 12 sampai 72 px (CSS 96 dpi), baris sub setengahnya (min 11). Kartu berukuran mm (`widthMm`/`heightMm`). Luapan diukur dengan memasang kartu sementara di luar layar; hook `measureOverflow` untuk uji. Arah teks dari aksara (`ltr`, `rtl`, `auto`). Saklar harakat membuang U+064B..U+065F dan U+0670.
- Task 6: 8 tema dengan ornamen sudut berbeda; `customTheme` menerima #rgb/#rrggbb, selain itu tosca. 11 ikon SVG tertanam, pencocokan kata kunci persis (Indonesia, Inggris, Arab). Font Arab Amiri (`@fontsource/amiri` 400 dan 700) lewat `src/ui/fonts.css`.
- Task 7: kartu rapat tanpa celah, margin minimal 10 mm; ukuran kartu menyesuaikan kisi (2/lembar 190×138,5; 4: 95×138,5; 6: 95×92,3; 8: 95×69,2; 9: 63,3×92,3 mm), bentuknya BERBEDA tiap pilihan. Cetak bolak-balik mengasumsikan balik di sisi panjang; tiap baris dibalik kiri-kanan. Tanda potong = ticks 4 mm di margin, di perpanjangan garis kisi.
- Task 8: tiap kartu dirender browser (`renderCardSide`), diubah jadi gambar JPEG 300 dpi (`pixelRatio` 300/96, kualitas 0,92) dengan `html-to-image` lalu ditempel ke jsPDF A4; satu kanvas hidup sekaligus dan dilepas (`width = height = 0`) segera sesudah ditempel; antarmuka diberi jeda `setTimeout(0)` tiap halaman (bukan `requestAnimationFrame`, supaya tidak macet di tab latar). Mode `both` menyisipkan depan lalu belakang per lembar fisik (urutan cetak dua sisi). `exportPdf(cards, opts, deps?)` menerima `deps.rasterize` opsional untuk uji. Blob PDF dibuat dari `output('arraybuffer')` supaya kelas `Blob` sama dengan yang dipakai pemanggil. Dek kosong ditolak: "Belum ada kartu untuk dijadikan PDF."

## Catatan desain (WAJIB dibaca sebelum Task 10)
- Pemilik menyimpan preferensi: SELALU pakai plugin `superpowers` dan `impeccable` yang sesuai untuk pekerjaan pengembangan dan desain. Task 10 (UI) dan penyempurnaan tema harus lewat `impeccable:impeccable` (dan `superpowers:brainstorming` untuk keputusan desain baru).
- Pemilik menyebut kriteria tema yang menarik: tidak sesak (satu ide per kartu, ruang kosong cukup), ilustrasi vektor pop/berkarakter, tipografi sans-serif tegas dan kontras tinggi yang terbaca dari setengah meter, kode warna per kategori/level/tema seperti kartu permainan, sisi depan sebagai umpan dan sisi belakang sebagai jawaban yang memuaskan. Tema Task 6 sekarang MASIH POLOS (bingkai, ornamen sudut, ikon garis, satu warna) dan font Arab memakai Amiri (serif Naskh). Ini belum memenuhi kriteria itu: ikon garis 11 buah bukan "ilustrasi karakter", dan belum ada kode warna per kategori. Jadwalkan putaran desain tema sebelum Task 10 dianggap selesai, dan minta pemilik menilai tampilan nyata.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF, idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Kirim screenshot daftar run Actions untuk commit Task 7 dan Task 8 (dan seterusnya).
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Nanti: cetak satu lembar uji dari PDF hasil aplikasi dan nilai Arab bersambung, harakat, dan keselarasan bolak-balik; uji APK di ponsel Android nyata.

## Langkah berikutnya
Konfirmasi hasil CI Task 7 dan 8. Bila merah di luar harapan, perbaiki dulu (kemungkinan terbesar: uji jsPDF di jsdom). Lalu Task 9, bukti visual PDF, putaran desain tema, Task 10 sampai 12. Perbarui file ini di akhir setiap sesi.

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
Status: Task 1 sampai 6 terverifikasi CI. Task 7 dan Task 8 (kode dan uji unit) sudah didorong ke main
(tes MERAH lalu kode HIJAU). Hasil CI Task 7 dan 8 menurut screenshot Actions saya: [ISI: tempel
screenshot, atau tulis merah/hijau per commit; jangan dikirim dengan tanda kurung ini kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions, jadi saya yang mengirim screenshot. Bila hasil tidak sesuai harapan,
perbaiki dulu. Bila sesuai, lanjutkan Task 9 (src/store/decks.ts): tulis tes dulu dan dorong
(harus merah), lalu kodenya (harus hijau). Ingat: bukti visual PDF (Task 8 langkah 5) dan putaran
desain tema (impeccable) masih berutang. Jawab dalam bahasa Indonesia. Perbarui HANDOFF.md dan
akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
