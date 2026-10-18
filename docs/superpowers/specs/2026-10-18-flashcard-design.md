# Flashcard siap print untuk kelas bahasa Arab: dokumen rancangan

Tanggal: 2026-10-18
Pemilik: sherlocomp-cyber (guru bahasa Arab)
Status: menunggu persetujuan pemilik. Belum ada kode.

Tanda: **[Keputusan pemilik]** berarti pemilik yang menyatakannya. **[Pilihan saya]** berarti keputusan perancang yang belum disetujui pemilik dan boleh diubah. **[Pembangun]** berarti diserahkan kepada pembangun.

## 1. Maksud dan alasan

Pemilik mengajar bahasa Arab di kelas dan memakai flashcard cetak. Dua cara pakainya:

1. Guru menunjukkan kartu berisi kata Arab, siswa menebak artinya.
2. Guru menunjukkan kartu bergambar, siswa menebak kata Arabnya.

Masalah sekarang: setiap kartu didesain satu per satu. Aplikasi ini ada untuk menghapus pekerjaan itu. Kata dan materi diambil dari buku, dirapikan menjadi tabel oleh AI lain, lalu **ditempel sekali** ke aplikasi, dan kartu terbentuk massal, siap cetak A4.

## 2. Tujuan

- Membuat satu dek kartu hanya dengan menempel tabel. Tidak ada pengetikan per kartu. **[Keputusan pemilik]**
- Tiga jenis isi kartu: gambar dan artinya, kosakata dan artinya, materi dan penjelasannya. **[Keputusan pemilik]**
- Tiga bahasa: Indonesia, Arab, Inggris, dengan tata letak kanan-ke-kiri yang benar untuk Arab. **[Keputusan pemilik]**
- Hasil cetak berukuran A4. **[Keputusan pemilik]**
- Desain UI dan UX profesional dan menarik, dengan banyak tema yang bagus. **[Keputusan pemilik]**
- Kartu hemat tinta tetapi menarik: bagian tengah putih, hiasan estetik di tepi. **[Keputusan pemilik]**
- Gambar bersifat opsional; kartu tanpa gambar harus tetap sempurna. **[Keputusan pemilik]**
- Dua hasil rilis: halaman web (GitHub Pages) dan APK Android. **[Keputusan pemilik]**
- Catatan serah-terima di repo dan prompt lanjutan di akhir setiap percakapan, supaya pekerjaan bisa dilanjutkan dari akun lain bila kuota habis. **[Keputusan pemilik]**

## 3. Bukan tujuan

- Tidak ada akun, login, server, atau database online. **[Pilihan saya]**
- Tidak mengambil gambar otomatis dari Canva atau Google. Alasan: Canva butuh persetujuan pengembang, pencarian gambar Google berbayar, berbatas kuota, dan tidak semua gambarnya bebas dipakai. Pemilik mengunduh gambar sendiri. **[Pilihan saya, pemilik menyetujui cara unggahnya]**
- Tidak ada fitur permainan atau kuis di layar. Tujuannya kartu cetak. **[Pilihan saya]**
- Tidak ada iOS. **[Pilihan saya]**

## 4. Anti-tujuan (dianggap gagal walau semua fitur jalan)

Dinyatakan pemilik. **[Keputusan pemilik]**

1. Fitur kurang lengkap.
2. Tema kurang menarik.
3. Ribet saat membuat kartu.

Turunannya untuk pembangun: setiap langkah dari tempel sampai cetak harus bisa selesai tanpa membaca petunjuk; jumlah tema harus banyak dan masing-masing benar-benar berbeda, bukan sekadar ganti warna.

## 5. Alur pengguna

1. Buka aplikasi (web atau APK). Satu layar utama dengan kotak tempel besar.
2. Tempel tabel. Aplikasi mengenali format (tabel Markdown, hasil salin dari Excel atau Google Sheets, CSV) dan menebak kolom Arab, Indonesia, Inggris, gambar, judul, penjelasan. **[Pilihan saya]**
3. Pilih jenis kartu (gambar, kosakata, materi) dan tema. Pratinjau langsung berubah.
4. Opsional: unggah banyak gambar sekaligus. Aplikasi mencocokkan gambar ke kartu lewat nama file (misalnya `buku.png` untuk baris "buku"), atau lewat tautan gambar di kolom tabel. Kartu tanpa gambar memakai ikon bawaan berwarna sesuai tema.
5. Perbaiki kartu tertentu di pratinjau (teks, gambar, hapus, tambah) tanpa mengulang dari awal.
6. Pilih tata letak halaman A4 dan cetak atau ekspor PDF.

Aplikasi menyediakan **teks perintah siap salin** untuk AI lain, supaya tabel dari buku selalu berformat yang dikenali. **[Pilihan saya]**

## 6. Fitur (lengkap)

Daftar ini menerjemahkan anti-tujuan "fitur kurang lengkap". Pembangun boleh menambah, tidak boleh mengurangi tanpa persetujuan pemilik.

**Pembuatan kartu**
- Kotak tempel dengan deteksi pemisah otomatis dan pemetaan kolom yang bisa dikoreksi.
- Tiga jenis kartu: gambar+arti, kosakata+arti, materi+penjelasan.
- Bahasa per kolom: Indonesia, Arab, Inggris, dalam kombinasi apa pun (misalnya Arab di depan, Indonesia dan Inggris di belakang).
- Teks panjang (materi dan penjelasan) mengecil otomatis supaya muat di kartu.
- Unggah gambar massal, pencocokan lewat nama file, tukar gambar per kartu.
- Ikon bawaan sebagai pengganti gambar. **[Pilihan saya]**
- Edit, tambah, hapus, dan urut ulang kartu di pratinjau.
- Simpan dan buka dek di perangkat (tanpa akun); ekspor dan impor dek sebagai berkas. **[Pilihan saya]**

**Bahasa Arab**
- Tata letak kanan-ke-kiri yang benar.
- Harakat (tanda baca vokal) tampil jelas dan tidak terpotong; ada saklar untuk menampilkan atau menyembunyikan harakat. **[Pilihan saya]**
- Font Arab yang jelas dan enak dibaca dari jauh di kelas, ditanam bersama aplikasi supaya jalan tanpa internet.

**Tema**
- Minimal delapan tema, masing-masing dengan warna, motif bingkai, dan ornamen sudut yang berbeda. Usulan awal: tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam. **[Pilihan saya]**
- Semua tema mempertahankan prinsip hemat tinta: tengah putih, warna dan hiasan di tepi.
- Pemilih warna sendiri untuk tema kustom. **[Pilihan saya]**
- Acuan visual awal (dari percakapan perancangan; ada tiga contoh tema: tosca dengan ornamen berlian, koral dengan bintang, ungu dengan bulan sabit): bingkai bertitik, garis dalam tipis, ornamen di empat sudut, lingkaran bergambar atau berikon di atas kata Arab besar.

**Cetak (A4)**
- Beberapa pilihan jumlah kartu per lembar (usulan: 2, 4, 6, 8, 9). **[Pembangun]**
- Garis potong atau tanda potong.
- Cetak bolak-balik yang benar: urutan sisi belakang dicerminkan supaya sejajar dengan sisi depan saat dicetak dua sisi. Ini wajib; kesalahan di sini merusak seluruh kartu.
- Opsi cetak hanya sisi depan, hanya sisi belakang, atau keduanya.
- Pratinjau halaman persis seperti hasil cetak.
- Ekspor PDF ukuran A4 dan cetak langsung.

## 7. Batasan dan cara pembuatan

Pemilik tidak menyebut pilihan teknis. Semuanya **[Pilihan saya]** kecuali disebut lain.

- Satu aplikasi web (PWA) dengan satu kode untuk dua hasil: halaman web di GitHub Pages dan APK Android yang dibungkus dari kode yang sama.
- Setelah dibuka sekali, jalan tanpa internet (font, ikon, dan tema ditanam di aplikasi).
- APK dibuat otomatis oleh GitHub Actions dan dipasang di halaman Releases repo. Karena APK harus bertanda tangan agar bisa dipasang, pembangun memilih cara penandatanganan yang membuat unduhan langsung bisa dipasang di Android (lihat bagian 9).
- Semua pengolahan di perangkat pengguna. Data tidak dikirim ke mana pun.
- Bahasa antarmuka: Indonesia. **[Pembangun]** boleh menyiapkan struktur teks agar bahasa lain mudah ditambah.

## 8. Risiko teknis utama (untuk pembangun)

1. **Arab dan harakat dalam PDF.** Pustaka PDF sering gagal membentuk huruf Arab bersambung dan menaruh harakat. Pembangun harus membuktikan keluaran PDF dan cetak benar (huruf bersambung, harakat tepat, kanan-ke-kiri) sebelum fitur lain dianggap selesai. Pendekatan yang aman, misalnya merender kartu menjadi gambar lalu menaruhnya di halaman, boleh dipilih.
2. **Cetak dari APK.** Mencetak atau membagikan PDF dari dalam pembungkus Android berbeda dari browser. Pastikan alurnya berfungsi di Android nyata.
3. **Cetak bolak-balik.** Cerminan urutan halaman belakang harus diuji dengan lembar nyata.

## 9. Diserahkan kepada pembangun

- Pilihan kerangka kerja dan pustaka.
- Cara membungkus APK dan cara menandatanganinya, selama APK di Releases bisa langsung dipasang, dan cara penyimpanan kunci tidak membocorkan rahasia ke repo publik (repo ini publik).
- Jumlah dan susunan tata letak per lembar, selama ada beberapa pilihan.
- Pemilihan ikon bawaan dan motif ornamen tiap tema.
- Struktur folder repo, pengujian, dan alur rilis (misalnya rilis dipicu tag versi).

## 10. Serah-terima dan kelanjutan antarakun

Permintaan pemilik. **[Keputusan pemilik]**

- Repo berisi `HANDOFF.md` di akar: status terkini, keputusan yang sudah diambil, cara menjalankan dan membangun, yang sudah selesai, yang belum, dan langkah berikutnya. Diperbarui di akhir setiap sesi kerja.
- Di akhir **setiap** balasan pembangun, ada blok **prompt lanjutan** yang bisa ditempel apa adanya di akun lain bila kuota habis. Blok itu menunjuk ke repo dan `HANDOFF.md`, dan menyebut tugas berikutnya.
- Keputusan penting dicatat di repo, bukan hanya di percakapan.

## 11. Ukuran keberhasilan

- Pemilik menempel satu tabel kosakata dari buku dan dalam beberapa menit memegang lembar A4 yang benar, tanpa mengetik per kartu.
- Delapan tema atau lebih tampak jelas berbeda dan menarik saat dicetak.
- Kartu tanpa gambar tampak sama rapinya dengan kartu bergambar.
- Cetak dua sisi sejajar.
- APK unduhan dari Releases terpasang dan berfungsi di Android; halaman web terbuka di GitHub Pages.
- Orang yang membuka akun lain bisa melanjutkan hanya dari repo dan prompt lanjutan.

## 12. Keputusan tambahan (hasil pemeriksaan pembaca independen)

Semuanya **[Pilihan saya]**; pemilik boleh mengubahnya.

**Format tabel masukan.** Satu tabel; satu baris sama dengan satu kartu; baris pertama berisi judul kolom. Kolom dikenali dari nama (alias yang diterima: `arab`/`ar`; `indonesia`/`arti`/`indo`; `inggris`/`english`/`en`; `gambar`/`image`/`foto`; `judul`/`title`/`topik`; `penjelasan`/`isi`/`keterangan`) dan, bila nama tidak jelas, dari aksara (teks berhuruf Arab dianggap kolom Arab). Kolom boleh kurang; cukup satu kolom isi. Kolom yang tidak dikenali muncul di langkah pemetaan untuk dipilih manual. Teks perintah untuk AI lain memakai nama kolom persis ini.

**Sisi kartu.** Setiap kartu punya dua sisi:
- Kosakata: depan kata Arab (dengan gambar bila ada); belakang Indonesia dan Inggris.
- Gambar: depan gambar besar saja (atau ikon bawaan); belakang kata Arab dan artinya.
- Materi: depan judul; belakang penjelasan.
- Satu saklar menukar depan dan belakang untuk ketiga jenis (siswa menebak artinya, atau menebak kata Arabnya).

**Ukuran dan teks.** Bawaan 4 kartu per lembar A4, cukup besar untuk ditunjukkan ke kelas; pilihan lain 2, 6, 8, 9. Untuk kartu materi, panduannya sekitar 40 kata per kartu; teks mengecil otomatis sampai batas keterbacaan, lalu kartu yang masih meluap diberi peringatan.

**Teks campuran.** Tiap bidang teks mendeteksi arahnya sendiri, sehingga campuran Arab dan Latin dalam satu bidang tampil benar.

**PDF.** Kartu boleh dirender sebagai gambar beresolusi tinggi (setara 300 dpi); teks tidak wajib bisa dipilih.

**Skala.** Dirancang nyaman sampai sekitar 200 kartu per dek; gambar diperkecil saat diunggah.

**Penandatanganan APK.** Kunci dibuat sekali dan disimpan sebagai rahasia GitHub Actions. Pemilik mungkin perlu menambahkannya di pengaturan repo dan sebaiknya menyimpan cadangan kunci; langkahnya dicatat di `HANDOFF.md`. Bila rahasia belum ada, build tetap menghasilkan APK bertanda kunci debug dan ditandai jelas sebagai sementara.

**Android minimum.** Android 8 (API 26). Jalur utama dari APK adalah menyimpan atau membagikan PDF; cetak langsung opsional bila berfungsi di perangkat uji.
