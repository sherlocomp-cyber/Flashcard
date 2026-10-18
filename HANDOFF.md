# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 (sesi 3, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja sekarang: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana (memasang patch lewat git dinilai terlalu ribet). Branch `build/app` hanya berisi Task 1 (CI #1 merah, #2 dan #3 hijau) dan sudah usang; jangan dipakai lagi kecuali pemilik minta.
- **Task 1 selesai** (kerangka Vite + TS + Vitest, `mount()`, `types.ts`, `index.html`, `ci.yml`). Seluruh kerangka disalin ke `main`, KECUALI `pages.yml` (sengaja tidak disalin: akan mencoba deploy ke Pages saat push ke `main` sebelum Pages diaktifkan).
- **Task 2 sampai 5 sudah didorong ke `main`** dengan urutan commit yang sengaja memberi bukti merah lalu hijau. Urutan commit dan hasil CI yang DIHARAPKAN (belum dikonfirmasi pemilik; cek tab Actions):

  | Commit | Harapan |
  |---|---|
  | `ci: run tests and build on push (Task 2 MERAH ...)` | merah (parse.ts masih stub) |
  | `feat: parse pasted tables (Task 2 HIJAU ...)` | hijau |
  | `test: column mapping and AI prompt (Task 3 MERAH ...)` | merah |
  | `feat: column mapping (Task 3, 1/2, masih MERAH ...)` | merah |
  | `feat: AI prompt (Task 3, 2/2, HIJAU)` | hijau |
  | `test: build cards from table (Task 4 MERAH ...)` | merah |
  | `feat: build cards from table (Task 4 HIJAU)` | hijau |
  | `test: image matching and downscale (Task 5 MERAH ...)` | merah |
  | `feat: image matching and downscale (Task 5 HIJAU)` | hijau |

  Satu-satunya bukti sampai kini: 25/25 tes lulus lokal di Node 22 dengan pengganti `describe/it/expect` buatan sendiri (Vitest tidak bisa dipasang di sandbox) dan `tsc` strict bersih. Tugas baru dianggap selesai bila tabel di atas terkonfirmasi di Actions.
- Task 6 sampai 12: belum dikerjakan. Mulai dari Task 6 (butuh `jsdom`, `@fontsource/amiri`; tes hanya bisa dibuktikan lewat CI).
- `HANDOFF-main.md` dan patch lama sudah tidak dipakai (isinya sudah digabung ke berkas ini).

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas, jadi satu tugas bisa terdiri dari beberapa commit; beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit di daftar itu memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 5
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang (pemisah di akhir baris tidak membuat kolom hantu). Biayanya bila salah: kolom terakhir yang sengaja kosong total ikut hilang (tidak berpengaruh pada kartu).
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey` (isi: arti Indonesia, atau Inggris, atau Arab). Task 5 menaruh gambar di sisi yang punya `iconKey`; Task 6 memilih ikon dari `iconKey`. Ini mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama (Arab, lalu Indonesia, lalu Inggris; untuk materi, judul). Tautan di kolom `gambar` tidak diambil dari internet (aplikasi tanpa data keluar); hanya dicocokkan lewat nama.
- Hanya satu kolom isi (jenis `vocab` dan `material`): teks pertama dipindah ke sisi depan supaya kartu tidak kosong. Jenis `picture` tidak dipindah (depan memang gambar saja).
- `id` kartu = `c<nomor baris>-<hash isi>`: stabil untuk masukan sama, unik walau barisnya kembar.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar (png, jpg, jpeg, gif, webp, svg, bmp, avif), tanpa spasi, garis bawah, dan strip. Urutan kandidat per kartu: `imageKey`, `iconKey`, lalu teks semua baris kartu (jadi `buku.png` cocok dengan baris Indonesia "buku" walau kolom gambar kosong). Dua berkas dengan kunci sama: yang pertama dipakai, keduanya dianggap cocok. Kartu materi tidak diberi gambar dan berkasnya dilaporkan tak cocok. `downscale` memakai `Image` + kanvas (JPEG 0,85; PNG bila ada piksel transparan) dan tidak diuji di jsdom; hanya `scaledSize` yang diuji. Verifikasi `downscale` di browser nyata saat Task 10.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Kirim screenshot daftar run di tab Actions (lihat tabel Status).
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Nanti: uji APK di ponsel Android nyata.

## Langkah berikutnya
Konfirmasi tabel CI di atas. Bila semua sesuai, kerjakan Task 6 sampai 12 berurutan di `main`. Buktikan lebih awal risiko Arab dan cetak bolak-balik di Task 8. Perbarui file ini di akhir setiap sesi.

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
Status: Task 1 sampai 5 sudah didorong ke main dengan urutan tes MERAH lalu kode HIJAU (lihat tabel
di HANDOFF.md). Hasil CI menurut screenshot Actions saya: [ISI: tempel screenshot, atau tulis tiap
commit merah/hijau; jangan dikirim dengan tanda kurung ini kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions, jadi saya yang mengirim screenshot. Bila ada hasil yang tidak sesuai harapan,
perbaiki dulu. Bila semua sesuai, lanjutkan dari Task 6 (themes.ts, cardView.ts, fit.ts): tulis tes
dulu dan dorong (harus merah), lalu kodenya (harus hijau). Jawab dalam bahasa Indonesia. Perbarui
HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
