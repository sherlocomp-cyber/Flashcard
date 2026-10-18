# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 3, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` hanya berisi Task 1 dan usang; jangan dipakai kecuali pemilik minta.
- **Task 1 sampai 6: SELESAI dan TERVERIFIKASI CI.** Screenshot tab Actions pemilik (2026-10-19 05:21, run #2 sampai #26) cocok dengan harapan di setiap commit: semua commit tes berlabel MERAH berstatus merah, semua commit kode berlabel HIJAU berstatus hijau, termasuk uji DOM `cardView` (8 tes jsdom) dan `npm run build` dengan font Amiri. Satu catatan: penyebab merah tiap commit tes tidak dibaca dari log (log tidak bisa dibuka dari sandbox); buktinya tidak langsung, yaitu commit kode berikutnya yang hanya menambah modul itu menjadikannya hijau.
- **Task 7 (layout.ts) didorong ke `main`**: commit `test: A4 layout and duplex mirroring (Task 7 MERAH` (harapan merah) lalu `feat: A4 layout and duplex mirroring (Task 7 HIJAU` (harapan hijau), plus commit `docs: handoff setelah Task 7`. BELUM dikonfirmasi pemilik. Bukti lokal: 8 tes lulus (pengganti `describe/it/expect` di Node 22), `tsc` strict bersih.
- Task 8 sampai 12: belum dikerjakan. Mulai dari Task 8 (ekspor PDF; risiko Arab bersambung, harakat, dan memori; butuh `html-to-image`, `jspdf`; tes hanya bisa dibuktikan lewat CI, dan bukti cetak nyata perlu pemilik).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global ada di sandbox (`tsc -p` dengan stub modul `vitest` dan `*.css`); tes murni dijalankan dengan `node --experimental-strip-types` memakai pengganti `describe/it/expect` (impor diberi akhiran `.ts`). Uji DOM tidak bisa dijalankan lokal.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 7
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang. Biayanya bila salah: kolom terakhir yang sengaja kosong total ikut hilang (tak berpengaruh pada kartu).
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey` (isi: arti Indonesia, atau Inggris, atau Arab). Task 5 menaruh gambar di sisi itu; Task 6 memilih ikon dari `iconKey`. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet (tanpa data keluar); hanya dicocokkan lewat nama.
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah.
- `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip. Urutan kandidat per kartu: `imageKey`, `iconKey`, teks semua baris. Kartu materi tidak diberi gambar. `downscale` (kanvas) tidak diuji di jsdom; hanya `scaledSize`. Verifikasi `downscale` di browser nyata saat Task 10.
- Task 6: `fitFontSize` bilangan bulat, pencarian biner, 12 sampai 72 px (CSS 96 dpi); baris sub setengahnya (minimal 11 px). Kartu berukuran mm (bawaan 90 × 65; `widthMm`/`heightMm` bisa diatur, Task 8 dan 10 harus mengirim ukuran dari `gridFor`). `renderCardSide` mengukur luapan dengan memasang kartu sementara di luar layar; hook `measureOverflow` ada untuk uji tanpa tata letak nyata. Verifikasi luapan dan tampilan di browser nyata saat Task 8 atau 10.
- Task 6: arah teks dari aksara: tanpa huruf Arab `ltr`, lebih dari separuh huruf Arab `rtl`, campuran `auto`. Saklar harakat membuang U+064B sampai U+065F dan U+0670 (tatwil dipertahankan).
- Task 6: 8 tema (tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam) dengan ornamen sudut berbeda; `customTheme` menerima #rgb/#rrggbb, selain itu jatuh ke tosca. 11 ikon SVG tertanam, pencocokan kata kunci persis (Indonesia, Inggris, Arab). Tampilan visual tema belum pernah dilihat pemilik: minta penilaian saat pratinjau Task 10 ("tema kurang menarik" adalah anti-tujuan di spek).
- Task 7: kartu rapat tanpa celah, margin aman minimal 10 mm; ukuran kartu menyesuaikan kisi (2 per lembar 190 × 138,5; 4: 95 × 138,5; 6: 95 × 92,3; 8: 95 × 69,2; 9: 63,3 × 92,3 mm), jadi bentuknya portrait lebar penuh dan BERBEDA tiap pilihan. Bila pemilik ingin kartu seukuran kartu remi, ubah di `gridFor`. Cetak bolak-balik mengasumsikan balik di sisi panjang (tepi kiri-kanan); baris dibalik kiri-kanan. Tanda potong = ticks pendek 4 mm di margin, di perpanjangan garis kisi (bukan garis penuh di atas kartu). Toleransi angka desimal 1e-6 mm di tes.
- Font Arab: `@fontsource/amiri` (400 dan 700) lewat `src/ui/fonts.css`, diimpor dari `main.ts`.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Kirim screenshot daftar run Actions untuk commit Task 7 (dan seterusnya).
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Nanti: cetak satu lembar uji dari PDF hasil Task 8 dan nilai Arab bersambung, harakat, dan keselarasan bolak-balik; uji APK di ponsel Android nyata.

## Langkah berikutnya
Konfirmasi hasil CI Task 7, lalu kerjakan Task 8 sampai 12 berurutan di `main`. Buktikan lebih awal risiko Arab dan cetak bolak-balik di Task 8. Perbarui file ini di akhir setiap sesi.

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
Status: Task 1 sampai 6 terverifikasi CI. Task 7 sudah didorong ke main (tes MERAH lalu kode HIJAU).
Hasil CI Task 7 menurut screenshot Actions saya: [ISI: tempel screenshot, atau tulis merah/hijau per
commit; jangan dikirim dengan tanda kurung ini kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions, jadi saya yang mengirim screenshot. Bila hasil tidak sesuai harapan,
perbaiki dulu. Bila sesuai, lanjutkan dari Task 8 (pdf.ts: risiko Arab bersambung, harakat, memori):
tulis tes dulu dan dorong (harus merah), lalu kodenya (harus hijau). Jawab dalam bahasa Indonesia.
Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
