# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite + TypeScript, Vitest + jsdom, tanpa kerangka UI; web statis (GitHub Pages) dan pembungkus Capacitor untuk APK Android. Sudah diputuskan di rencana implementasi.

## Users
Guru bahasa Arab (pemilik proyek) yang mengajar di kelas dan memakai flashcard cetak, serta guru lain yang belum tentu paham teknis. Dipakai sama sering di ponsel Android dan di laptop/PC. Konfirmasi pemilik, 2026-10-19.

## Product Purpose
Mengubah tabel kosakata atau materi (dirapikan AI lain dari buku, lalu ditempel sekali) menjadi flashcard siap cetak A4 secara massal, tanpa mendesain kartu satu per satu. Berhasil bila guru menempel tabel dan dalam beberapa menit memegang lembar A4 yang benar.

## Positioning
Pembuat flashcard khusus pelajaran bahasa Arab: huruf Arab bersambung dan harakat benar, kanan-ke-kiri, cetak dua sisi sejajar, hemat tinta (tengah putih, hiasan di tepi), jalan tanpa akun dan tanpa internet setelah dibuka sekali.

## Operating Context
Alur: tempel tabel, pilih jenis kartu dan tema, opsional unggah gambar massal (dicocokkan lewat nama file), perbaiki kartu di pratinjau, pilih tata letak A4, cetak atau simpan PDF. Hasil dicetak di printer biasa lalu dipotong. Antarmuka berbahasa Indonesia.

## Capabilities and Constraints
Tiga jenis kartu (gambar, kosakata, materi); bahasa Indonesia, Arab, Inggris; delapan tema atau lebih ditambah tema kustom; 2, 4, 6, 8, atau 9 kartu per lembar; sisi depan, belakang, atau keduanya; tanda potong; saklar harakat; saklar tukar depan-belakang; simpan dan buka dek di perangkat, ekspor dan impor berkas dek JSON; nyaman sampai sekitar 200 kartu. Semua pengolahan di perangkat; tanpa akun, server, atau data keluar. Repo publik: tanpa rahasia.

## Brand Commitments
Anti-tujuan menurut pemilik (dianggap gagal walau semua fitur jalan): fitur kurang lengkap, tema kurang menarik, ribet saat membuat kartu. Setiap langkah dari tempel sampai cetak harus bisa selesai tanpa membaca petunjuk. Desain UI dan UX harus profesional dan menarik.

## Evidence on Hand
Spek dan rencana di `docs/superpowers/`. Delapan tema dan penampil kartu sudah ada (`src/themes`, `src/render/cardView.ts`), terbukti di PDF nyata. Tidak ada testimoni, pengguna, atau data ukur; jangan dikarang.

## Product Principles
1. Satu layar, satu tindakan jelas berikutnya: dari tempel sampai cetak tanpa petunjuk.
2. Pratinjau selalu persis seperti hasil cetak.
3. Kesalahan dijelaskan dengan bahasa guru, bukan bahasa teknis, dan ada jalan keluarnya.
4. Hemat tinta dan hemat kertas adalah fitur, bukan pelengkap.

## Accessibility & Inclusion
Huruf Arab harus terbaca jelas dari jauh di kelas; kontras cukup; target sentuh nyaman di ponsel; seluruh teks antarmuka berbahasa Indonesia.
