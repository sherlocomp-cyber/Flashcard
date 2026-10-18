# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 23:20 WIB (branch `build/app`)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`, satu agen mengerjakan semua tugas, satu pemeriksa independen di akhir).
- **Task 1 selesai** (kerangka Vite + TS + Vitest, `mount()`, `types.ts`, `index.html`, `ci.yml`, `pages.yml`). Bukti: CI pertama merah (tes ada, kode belum), CI kedua hijau (install, test, build semua sukses).
- Task 2 sampai 12: belum dikerjakan. Mulai dari Task 2.
- Pekerjaan ada di branch `build/app`. `main` hanya berisi dokumen. Jangan digabung ke `main` tanpa persetujuan pemilik.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (403 untuk `registry.npmjs.org`, keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alurnya:
1. Tulis tes dulu, commit dan push ke `build/app` (CI harus MERAH; itu bukti RED).
2. Tulis kode, commit dan push (CI harus HIJAU).
3. Baca hasil: `gh run list -R sherlocomp-cyber/Flashcard --branch build/app --limit 1`, lalu `gh run watch <id> -R sherlocomp-cyber/Flashcard --exit-status`, lalu `gh run view <id> -R sherlocomp-cyber/Flashcard --json conclusion,jobs`.
4. Log mentah tidak bisa diunduh (`gh run view --log-failed` ditolak). Untuk melihat pesan kegagalan tes, usulan (belum diuji): ubah langkah tes di `ci.yml` menjadi `npm test -- --reporter=default --reporter=github-actions`, lalu baca anotasi lewat `gh api repos/sherlocomp-cyber/Flashcard/check-runs/<job-id>/annotations`.
Hemat kuota: gabungkan beberapa berkas dan satu tugas dalam satu commit bila tes tugas itu sudah ditulis lengkap.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- Aktifkan GitHub Pages: Settings → Pages → Source: GitHub Actions. `pages.yml` hanya jalan pada push ke `main`.
- Tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci.
- Uji APK di ponsel Android nyata.

## Langkah berikutnya
Task 2 (parser tabel, `src/core/parse.ts`, tes di rencana), lalu Task 3 sampai 12 berurutan. Buktikan lebih awal risiko Arab dan cetak bolak-balik di Task 8. Perbarui file ini di akhir setiap sesi.

## Aturan kerja
- Jawab dalam bahasa Indonesia. Akhiri setiap balasan dengan prompt lanjutan di bawah.
- Catat keputusan penting di repo. Repo publik: tanpa kunci atau rahasia.
- Kuota akun cepat habis: kerja ringkas, commit sering, perbarui file ini.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard, branch build/app.
Baca dulu HANDOFF.md (di branch build/app), docs/superpowers/specs/2026-10-18-flashcard-design.md,
dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: Task 1 selesai (CI hijau). Cara eksekusi: native (superpowers:executing-plans).
Sandbox tidak bisa npm install, jadi tes dijalankan lewat GitHub Actions
(lihat bagian "Cara menjalankan tes" di HANDOFF.md). Lanjutkan dari Task 2,
satu commit per tugas, tulis tes dulu dan pastikan CI merah sebelum kodenya.
Jawab dalam bahasa Indonesia. Perbarui HANDOFF.md dan akhiri setiap balasan
dengan prompt lanjutan seperti ini.
```
