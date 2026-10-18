# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-18 22:58 WIB

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Semua keputusan ada di `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Baca dokumen itu dulu.

## Status
- Dokumen rancangan: selesai, sudah diperiksa pembaca independen, sudah di-commit di `main`.
- Persetujuan pemilik atas dokumen: **belum ada**. Jangan menulis kode produk sebelum pemilik menyetujui.
- Kode: belum ada.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 di dokumen rancangan. Ringkasnya: satu aplikasi web (PWA) tanpa server, dibungkus jadi APK lewat GitHub Actions, kartu hemat tinta dengan hiasan di tepi, minimal delapan tema, masukan lewat tempel tabel, gambar opsional lewat unggah massal bernama sesuai kata.

## Langkah berikutnya
1. Minta persetujuan pemilik atas dokumen rancangan (atau perubahan darinya).
2. Setelah setuju: tulis rencana implementasi (`superpowers:writing-plans`), lalu bangun.
3. Buktikan dulu dua risiko terbesar: huruf Arab bersambung dan harakat di PDF, serta cetak bolak-balik yang sejajar.
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
Baca dulu HANDOFF.md dan docs/superpowers/specs/2026-10-18-flashcard-design.md.
Status: dokumen rancangan selesai dan diperiksa, menunggu persetujuan pemilik.
Belum ada kode. Jawab dalam bahasa Indonesia.
Langkah berikutnya: bila pemilik sudah setuju, tulis rencana implementasi
(superpowers:writing-plans), lalu bangun. Perbarui HANDOFF.md dan akhiri
setiap balasan dengan prompt lanjutan seperti ini.
```
