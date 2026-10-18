# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 23:05 WIB

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Semua keputusan ada di `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana kerja ada di `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Dokumen rancangan: selesai, diperiksa, **disetujui pemilik** (2026-10-18).
- Rencana implementasi (12 tugas): selesai ditulis. Pemilik memilih cara eksekusi **native** (satu agen mengerjakan semua tugas, satu pemeriksa independen di akhir).
- Kode: Task 1 baru separuh, di branch `build/app` (bukan `main`). Sudah ada `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, dan tes `tests/smoke.test.ts` (belum dijalankan hijau). Belum ada `src/ui/main.ts`, `src/core/types.ts`, `index.html`, `pages.yml`.
- **HAMBATAN (2026-10-18 23:10 WIB):** di sesi ini `npm install` gagal. Proxy keluar menjawab 403 (penolakan kebijakan) untuk `registry.npmjs.org`, dan DNS langsung tidak ada. Tidak ada paket npm yang bisa dipasang, jadi Vite, TypeScript, dan Vitest belum terpasang dan tes belum pernah dijalankan. Jangan mencari jalan memutar; lapor ke pemilik. Cek ulang di sesi atau akun lain dengan `npm install`.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 di dokumen rancangan. Ringkasnya: satu aplikasi web (PWA) tanpa server, dibungkus jadi APK lewat GitHub Actions, kartu hemat tinta dengan hiasan di tepi, minimal delapan tema, masukan lewat tempel tabel, gambar opsional lewat unggah massal bernama sesuai kata.
Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Aktifkan GitHub Pages: Settings → Pages → Source: GitHub Actions (jika pengaktifan otomatis gagal).
- Tambahkan rahasia penanda tangan APK di Settings → Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Uji APK di ponsel Android nyata.

## Langkah berikutnya
1. Pemilik memeriksa rencana dan memilih cara eksekusi.
2. Kerjakan Task 1 sampai 12 berurutan, satu commit per tugas.
3. Buktikan lebih awal risiko terbesar: huruf Arab bersambung dan harakat di PDF, serta cetak bolak-balik yang sejajar (Task 8).
4. Perbarui file ini di akhir setiap sesi kerja.

## Aturan kerja
- Jawab dalam bahasa Indonesia.
- Akhiri setiap balasan dengan blok prompt lanjutan (di bawah) supaya pekerjaan bisa dilanjutkan dari akun lain.
- Catat keputusan penting di repo, bukan hanya di percakapan.
- Repo ini publik: jangan menaruh kunci atau rahasia di dalamnya.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard (branch main).
Baca dulu HANDOFF.md, docs/superpowers/specs/2026-10-18-flashcard-design.md,
dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: rancangan disetujui, rencana 12 tugas ditulis, cara eksekusi: native.
Task 1 separuh jalan di branch build/app (baca HANDOFF.md di branch itu).
Hambatan sebelumnya: npm install ditolak proxy (403) di sesi lama. Jalankan
npm install dulu; bila lolos, lanjutkan Task 1 dari tes smoke (RED), lalu
Task 2 dst. Bila masih ditolak, lapor ke pemilik dan jangan cari jalan memutar.
Jawab dalam bahasa Indonesia. Perbarui HANDOFF.md dan akhiri setiap balasan
dengan prompt lanjutan seperti ini.
```
