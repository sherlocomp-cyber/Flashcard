# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 23:05 WIB

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Semua keputusan ada di `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana kerja ada di `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Dokumen rancangan: selesai, diperiksa, **disetujui pemilik** (2026-10-18).
- Rencana implementasi (12 tugas): selesai ditulis, menunggu pemilik memeriksa dan memilih cara eksekusi (subagent-driven atau native).
- Kode: belum ada. Mulai dari Task 1 setelah pemilik memilih cara eksekusi.

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
Status: rancangan disetujui pemilik, rencana implementasi 12 tugas sudah ditulis,
belum ada kode. Jawab dalam bahasa Indonesia.
Langkah berikutnya: bila pemilik sudah memilih cara eksekusi (subagent-driven
atau native), kerjakan dari Task 1. Bila belum, tanyakan. Perbarui HANDOFF.md
dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
