# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 5, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Baca keduanya dulu.

## Status
- Rancangan: disetujui pemilik. Rencana: ditulis. Cara eksekusi: **native** (`superpowers:executing-plans`).
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`, dan pemilik memberi izin penuh untuk bekerja di sana. Branch `build/app` usang; jangan dipakai kecuali pemilik minta.
- **Task 1 sampai 9: SELESAI dan TERVERIFIKASI CI.**
- **Task 8: TERVERIFIKASI CI dan VISUAL.** Perbaikan sesi 5 lulus CI (#43 sampai #45 merah, #46 dan #47 hijau). PDF `verify-pdf` dari kode yang sudah diperbaiki (kiriman pemilik 12:21, `sample_2.pdf`, md5 a2eea099...; BERBEDA dari `sample.pdf`/`sample_1.pdf` lama 942dcfa2...) dinilai: Arab bersambung BAIK; harakat tepat BAIK; kata Latin ("sekolah", "campuran Arab dan Latin") utuh, tidak terpecah BAIK; kartu campuran `الكِتَابُ (the book) رقم 12` urutan benar (dibaca dari kanan: الكِتَابُ, "(the book)", رقم 12) BAIK; materi panjang muat BAIK; sisi belakang tercermin dan sejajar BAIK (depan: كتاب kiri, مدرسة kanan; belakang: sekolah kiri, buku kanan; lembar 2 hanya kartu 5, belakangnya di kanan).
  - Dua catatan kecil yang TIDAK diperbaiki (tidak melanggar spek): (1) frasa Latin dalam tanda kurung bisa terbelah antar baris ("(the" di baris 1, "book)" di baris 2) karena `<bdi>` boleh membungkus di dalam frasa; bila mengganggu, beri `white-space:nowrap` pada `bdi` lalu biarkan `fitFontSize` mengecilkan. (2) Angka "5." di depan teks Arab tampil sebagai "5." dengan titik di sisi kanan angka, di ujung kanan baris (satu unit kiri-ke-kanan). Bisa dianggap benar atau tidak tergantung kebiasaan penomoran Arab pemilik; data uji harness, bukan masukan nyata. Tanyakan pemilik bila perlu.
  - Bukti lama (kode sebelum perbaikan) menunjukkan cacat "sekola"+"h" dan "the) (book"; sudah teratasi.
- **Task 10 (alur antarmuka): DITULIS dan DIDORONG, BELUM dikonfirmasi pemilik.** Urutan commit dan harapan CI (satu commit per berkas):
  1. `test: alur antarmuka tempel sampai cetak (Task 10 MERAH: UI belum ada)` : MERAH
  2. `chore: pembuat elemen dan ikon garis ...` (`src/ui/dom.ts`) : MERAH
  3. `chore: gaya antarmuka tosca ...` (`src/ui/app.css`) : MERAH
  4. `fix: penempatan area grid ...` (`app.css` lagi) : MERAH
  5. `chore: modul aplikasi antarmuka ...` (`src/ui/app.ts`) : MERAH (main.ts belum memakainya)
  6. `feat: alur antarmuka tempel sampai cetak dalam bahasa Indonesia (Task 10 HIJAU)` (`main.ts`) : HIJAU
  7. `docs: handoff setelah Task 10 (sesi 5)` : HIJAU
  - Juga ada commit `ci: verify-pdf juga jalan saat src/ berubah`; karena `verify-pdf` kini terpicu oleh `src/**`, tiap dorongan di atas yang menyentuh `src/` ikut menjalankan job `verify-pdf` (±1 menit). Itu normal; abaikan bila hijau.
  - 17 tes di `tests/ui/flow.test.ts`: `empty_start_shows_zero_cards_and_a_big_paste_box`, `paste_builds_cards_without_extra_clicks`, `mapping_step_shows_only_when_columns_unknown`, `theme_change_updates_preview`, `flip_toggle_swaps_preview_sides`, `unmatched_images_are_listed`, `editing_a_card_updates_the_deck`, `add_card_updates_count_and_rows`, `delete_card_updates_preview`, `reorder_card_updates_preview`, `export_then_import_restores_deck`, `import_of_a_bad_file_shows_an_indonesian_error`, `copy_prompt_button_copies_text`, `pdf_button_exports_with_chosen_options`, `pdf_error_is_shown_in_indonesian`, `save_then_open_saved_deck` (16 `it`; hitung ulang bila tidak cocok). Tes pertama didorong sebelum kode apa pun dan gagal karena `mount` lama mengabaikan `deps` (kegagalan yang benar, bukan galat impor).
  - Bukti lokal: `tsc` strict (`noUnusedLocals`, `noUnusedParameters`) bersih untuk `main.ts`/`app.ts`/`dom.ts` dengan stub tanda tangan modul inti dan paket luar (stub dari kode yang dibaca, bukan modul asli); detektor desain impeccable (`impeccable detect`) pada `app.css`, `app.ts`, `dom.ts`: nol temuan. Tes jsdom BELUM pernah dijalankan (hanya CI). Titik rawan: perilaku `File`/`input.files` di jsdom, urutan `await tick()` pada tes asinkron, `import('../render/pdf')` dinamis di tes (tidak dipanggil karena `exportPdf` dipalsukan), dan CSS `.css` impor di Vitest (sudah dipakai `fonts.css`).
  - **Penampilan antarmuka BELUM pernah dilihat siapa pun** (tidak ada peramban di sandbox yang membuka halaman). Skill `impeccable` mewajibkan verifikasi visual pada lebar ponsel dan desktop; itu belum dilakukan. Minta pemilik membuka halaman (lokal atau Pages setelah diaktifkan) dan mengirim tangkapan layar, atau tambahkan job CI yang memotret halaman (Playwright sudah ada di `verify-pdf`).
  - PRODUCT.md belum ada (skill impeccable menyarankan `/impeccable init`; tidak memblokir). Konteks desain diambil dari spek.
- Task 11 dan 12: belum dikerjakan. APK baru ada setelah Task 11 (tag `v0.1.0` memicu `release.yml`).
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy (keputusan pemilik: pakai GitHub Actions). Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Alat githubku memakai satu commit per berkas (isi berkas dikirim utuh tiap kali); beri label MERAH/HIJAU di pesan commit.
2. Sandbox tidak bisa membaca hasil Actions (github.com memblokir akses otomatis dan `web_fetch` hanya boleh membuka URL dari pesan pemilik). Minta pemilik mengirim satu screenshot daftar run di tab Actions; judul commit memetakan status tiap commit.
3. Kalau ada yang merah di luar harapan, minta screenshot halaman run, lalu job, lalu langkah `npm test`.
4. Cek lokal yang bisa dilakukan: `tsc` global (6.0.3) ada di sandbox. Cara yang dipakai sesi 5: salin berkas baru ke `/tmp/work/src/...`, buat stub `export declare ...` untuk modul yang diimpor, `declare module '*.css'` dan paket luar di `stub/shim.d.ts`, lalu `tsc -p` dengan `strict`, `noUnusedLocals`, `noUnusedParameters`. Tes murni bisa dijalankan dengan `node --experimental-strip-types` memakai skrip tegasan `node:assert` (impor diberi akhiran `.ts`). Uji DOM dan uji yang butuh `jspdf`/`idb-keyval` tidak bisa dijalankan lokal.
5. Bukti visual PDF: `verify-pdf` terpicu otomatis oleh perubahan di `src/**`, `scripts/verify-*`, atau berkas workflow-nya, dan bisa dijalankan manual (Run workflow). Sebelum menilai PNG/PDF kiriman pemilik, bandingkan hash (`md5sum`) dengan kiriman sebelumnya supaya tidak menilai artefak lama.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu minta satu screenshot untuk semuanya.

## Keputusan (ruling) Task 2 sampai 7
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang. Biayanya bila salah: kolom terakhir yang sengaja kosong total ikut hilang (tak berpengaruh pada kartu).
- Sisi kartu yang memuat gambar/ikon (jenis `vocab` dan `picture`) ditandai `Side.iconKey` (isi: arti Indonesia, atau Inggris, atau Arab). Task 5 menaruh gambar di sisi itu; Task 6 memilih ikon dari `iconKey`. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet (tanpa data keluar); hanya dicocokkan lewat nama.
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah.
- `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip. Urutan kandidat per kartu: `imageKey`, `iconKey`, teks semua baris. Kartu materi tidak diberi gambar. `downscale` (kanvas) tidak diuji di jsdom; hanya `scaledSize`. **Verifikasi `downscale` di browser nyata (unggah gambar sungguhan lewat antarmuka Task 10) belum dilakukan.**
- Task 6: `fitFontSize` bilangan bulat, pencarian biner, 12 sampai 72 px (CSS 96 dpi); baris sub setengahnya (minimal 11 px). Kartu berukuran mm (bawaan 90 × 65; `widthMm`/`heightMm` bisa diatur; Task 8 sudah mengirim ukuran dari `gridFor`). `renderCardSide` mengukur luapan dengan memasang kartu sementara di luar layar, lalu melepasnya (kartu yang dikembalikan TIDAK terpasang di dokumen); hook `measureOverflow` ada untuk uji tanpa tata letak nyata.
- Task 6: arah teks dari aksara: tanpa huruf Arab `ltr`, lebih dari separuh huruf Arab `rtl`, campuran `auto`. Saklar harakat membuang U+064B sampai U+065F dan U+0670 (tatwil dipertahankan).
- Task 6: 8 tema (tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam) dengan ornamen sudut berbeda; `customTheme` menerima #rgb/#rrggbb, selain itu jatuh ke tosca. 11 ikon SVG tertanam, pencocokan kata kunci persis (Indonesia, Inggris, Arab). Hanya tema tosca yang pernah terlihat (di PDF `verify-pdf`); 7 tema lain belum dilihat pemilik: minta penilaian ("tema kurang menarik" adalah anti-tujuan di spek).
- Task 7: kartu rapat tanpa celah, margin aman minimal 10 mm; ukuran kartu menyesuaikan kisi (2 per lembar 190 × 138,5; 4: 95 × 138,5; 6: 95 × 92,3; 8: 95 × 69,2; 9: 63,3 × 92,3 mm), jadi bentuknya portrait lebar penuh dan BERBEDA tiap pilihan. Bila pemilik ingin kartu seukuran kartu remi, ubah di `gridFor`. Cetak bolak-balik mengasumsikan balik di sisi panjang (tepi kiri-kanan); baris dibalik kiri-kanan. Tanda potong = ticks pendek 4 mm di margin, di perpanjangan garis kisi. **Terbukti benar di PDF nyata.** Sisa risiko: lembar nyata dari printer belum diuji pemilik.
- Font Arab: `@fontsource/amiri` (400 dan 700) lewat `src/ui/fonts.css`, diimpor dari `main.ts`. **Terbukti tampil di PDF nyata: opsi `fontEmbedCSS` tidak diperlukan.**

## Keputusan (ruling) Task 8
- Ekspor: tiap slot kartu dipasang sementara di luar layar (`position:fixed; left:-10000px`), difoto `html-to-image.toCanvas` dengan `pixelRatio` 300/96 (setara 300 dpi) dan lebar/tinggi persis dari `gridFor`, disimpan sebagai JPEG kualitas 0,9, ditempel ke jsPDF pada koordinat mm dari `gridFor`, lalu kanvas dilepas. Satu kartu pada satu waktu; antarmuka diberi giliran (`nextFrame`) tiap halaman. Biayanya bila salah: PDF 200 kartu dua sisi (±400 gambar) bisa besar (ratusan MB belum diukur); bila berat, turunkan `JPEG_QUALITY` atau pecah menjadi beberapa PDF. PDF contoh 4 halaman ±1,2 MB.
- Urutan halaman `sides:'both'` = depan lembar 1, belakang lembar 1, depan lembar 2, belakang lembar 2 (urutan cetak dua sisi).
- Foto kartu pertama dilakukan dua kali (yang pertama dibuang) karena `html-to-image` sering belum memuat font tertanam pada foto pertama; `document.fonts.ready` ditunggu sekali.
- `PdfOptions` mendapat `deps?: Partial<PdfDeps>` (rasterize dan nextFrame) supaya tes bisa memalsukan rasterisasi. jsPDF `compress:false` supaya tes bisa menghitung operator garis tanda potong.
- Dek kosong melempar galat `Tidak ada kartu untuk diekspor.` (ditampilkan antarmuka Task 10).
- Versi paket: `jspdf ^3.0.1`, `html-to-image ^1.11.13` (terbukti terpasang dan tes lulus di CI).
- Peringatan luapan (`data-overflow`) belum dikirim keluar dari `exportPdf`; antarmuka menampilkannya hanya untuk lembar yang sedang dipratinjau.
- **Sesi 5, Ruling: kata tidak pernah dipecah di tengah** (`overflow-wrap:normal`, bukan `anywhere`); kata terlalu panjang membuat huruf mengecil, dan bila pada 12 px pun meluap kartu diberi `data-overflow`. Biayanya bila salah: kata sangat panjang menjadi kecil atau bertanda luapan, bukan terbungkus.
- **Sesi 5, Ruling: isolasi bidi hanya pada baris yang memuat Arab DAN Latin/angka** (`<bdi dir="ltr">`; `src/core/bidi.ts`), baris murni Arab atau murni Latin tidak berubah. Potongan Latin = satu run huruf/angka Latin (beserta pembuka `([{"'` di depannya) sampai huruf Arab berikutnya, spasi akhir dikeluarkan. Biayanya bila salah: tanda baca penutup persis sebelum teks Arab bisa ikut run Latin; frasa panjang bisa terbelah antar baris (lihat catatan di atas).
- **Sesi 5, Ruling: `verify-pdf` terpicu juga oleh `src/**`.** Alasan: pemicu lama membuat perbaikan di `src/` tidak menghasilkan bukti visual baru. Biayanya bila salah: tiap dorongan ke `src/` memakai ±1 menit kuota Actions, dan job bisa merah karena Playwright tanpa ada kesalahan di kode.

## Keputusan (ruling) Task 9
- Penyimpanan: IndexedDB lewat `idb-keyval`, basis data `flashcard`, penyimpanan `decks`, kunci `deck:<id>`. Penyimpanan dibuat malas (saat pertama dipakai). `saveDeck` menyimpan apa adanya; pemanggil (antarmuka) mengisi `updatedAt` (lewat `getDeck()`).
- `listDecks` hanya mengembalikan `id`, `name`, `updatedAt`, terbaru dulu.
- Format berkas dek: `{ "format": "flashcard-deck", "version": 1, "deck": {...} }`, gambar tertanam sebagai data URL. Impor tidak menerima JSON dek tanpa pembungkus.
- Validasi impor memeriksa bidang dek dan tiap kartu (`id`, `type`, `front.lines`, `back.lines`), tidak memeriksa isi tiap baris teks. Semua galat berawalan `Berkas dek tidak valid:`.
- Impor tidak membatasi ukuran gambar; batas kuota penyimpanan peramban belum diuji dengan dek 200 kartu bergambar.
- Versi paket `idb-keyval ^6.2.1`, `fake-indexeddb ^6.0.0` terbukti terpasang dan 8 tes lulus di CI (#41).

## Keputusan (ruling) Task 10 (sesi 5)
Semua bisa diubah; tidak ada yang dibahas dengan pemilik.
- Struktur: `src/ui/app.ts` (`createApp`), `dom.ts` (pembuat elemen `h` dan ikon garis), `app.css`, `main.ts` (`mount(root, deps?)` mengembalikan `{ getDeck }`; `deps` hanya untuk tes). Semua efek samping (penyimpanan, baca berkas/gambar, simpan berkas, cetak, papan klip, ekspor PDF) lewat `AppDeps` agar bisa diuji di jsdom. Modul `render/pdf` dimuat malas (`import()`) supaya halaman awal ringan.
- Tata letak: satu layar. Desktop (≥ 64rem) dua kolom: kiri tempel, pemetaan, gaya, gambar, daftar kartu, dek; kanan pratinjau dan opsi cetak (menempel saat digulir). Ponsel: satu kolom dengan pratinjau tepat setelah gaya. Tanpa kartu bersarang; bagian dipisah garis tipis.
- Pratinjau hanya menampilkan SATU lembar A4 pada satu waktu (pager "Lembar n dari N", saklar Depan/Belakang yang memakai `backPages`), dengan kartu dirender `renderCardSide` berukuran mm dan skala lewat CSS `--s`. Alasan: 200 kartu × pengukuran luapan terlalu berat bila semua lembar dirender. Biayanya bila salah: peringatan "terlalu panjang" hanya untuk lembar yang sedang tampil, bukan seluruh dek.
- Pemetaan kolom (`[data-step="map"]`) muncul bila saat menempel ADA kolom yang tidak dikenali (termasuk kolom ekstra) dan tetap tampil sampai tempelan berikutnya. Jenis kartu otomatis `material` bila hanya ada kolom judul/penjelasan.
- Mengganti jenis kartu atau pemetaan membangun ulang kartu dari tabel (suntingan tangan hilang); menukar sisi hanya membalik depan/belakang tiap kartu (suntingan aman). Dek yang dibuka dari penyimpanan tidak punya tabel: ganti jenis tidak menghapus kartunya (hanya mengubah jenis untuk kartu baru).
- Sunting: tiap baris punya satu kolom isian depan (`.edit-front`, baris pertama sisi depan) dan satu kolom belakang (`.edit-back`, baris pertama sisi belakang; baris lanjutan ditampilkan baca-saja "+ ..."); sisi tanpa baris teks (depan kartu gambar) dinonaktifkan. Biayanya bila salah: baris ke-2 dan seterusnya (mis. Inggris) tidak bisa disunting dari antarmuka ini, hanya lewat tempel ulang.
- Tema kustom disimpan sebagai `themeId = "custom:#rrggbb"` (tipe `Deck` tidak berubah). Bawaan: 4 per lembar, depan dan belakang, tanda potong aktif, harakat tampil.
- Salin teks perintah AI lewat `navigator.clipboard` dengan cadangan `execCommand`. Cetak = ekspor PDF lalu `iframe` tersembunyi memanggil `print()`; belum teruji di Android WebView (Task 11).
- `Simpan PDF` memakai nama tetap `flashcard.pdf`. Task 11 akan menggantinya dengan `shareOrSavePdf` untuk Android.
- Gaya: dunia tosca (kertas hangat, rel gelap tosca, bingkai bertitik seperti tepi kartu sebagai satu gerakan khas), font sistem untuk UI, Amiri untuk nama dan isian Arab, kontrol standar, ikon garis SVG, fokus terlihat, area sentuh ≥ 44 px, `prefers-reduced-motion` dihormati. Belum ada mode gelap.

## Keputusan yang sudah diambil
Lihat bagian 2 sampai 12 dokumen rancangan. Pilihan teknis rencana: Vite + TypeScript, Vitest, html-to-image + jsPDF (kartu dirender browser agar Arab benar), idb-keyval, @fontsource/amiri, Capacitor untuk APK.

## Tindakan pemilik yang mungkin diperlukan
- **Kirim screenshot daftar run Actions** untuk commit Task 10 (tujuh commit di atas, plus run `verify-pdf` yang ikut terpicu).
- Setelah CI Task 10 hijau: **buka halaman aplikasi** (jalankan `npm run dev` di komputer, atau aktifkan GitHub Pages) dan kirim tangkapan layar tampilan ponsel dan desktop; coba tempel tabel nyata dari buku, unggah beberapa gambar, ganti tema, simpan PDF, dan cetak satu lembar. Catat apa yang ribet atau kurang menarik (anti-tujuan spek).
- Nanti: aktifkan GitHub Pages (Settings → Pages → Source: GitHub Actions) sebelum `pages.yml` ditambahkan ke `main`.
- Nanti: tambahkan rahasia penanda tangan APK (Settings → Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Simpan cadangan kunci. Tanpa rahasia ini APK tetap dibuat tetapi bertanda kunci debug (`...-debug.apk`).
- Nanti: cetak satu lembar uji dari PDF hasil aplikasi nyata dan nilai Arab bersambung, harakat, dan keselarasan bolak-balik; uji APK di ponsel Android nyata (simpan/bagikan PDF tidak bisa dibuktikan dari sandbox).

## Langkah berikutnya
Konfirmasi CI Task 10 dan penilaian tampilan. Bila ada yang merah atau tidak sesuai, perbaiki dulu (Task 10 lebih dulu; jangan menulis kode baru sebelum tes yang gagal dibaca). Bila sesuai, kerjakan Task 11 (mode luring PWA, Capacitor APK, `shareOrSavePdf`, `release.yml`), lalu Task 12 (README dan serah-terima akhir) di `main`. Pertimbangkan menambah job CI yang memotret halaman (Playwright) agar tampilan bisa dinilai tanpa pemilik membuka halaman. Perbarui file ini di akhir setiap sesi.

## Aturan kerja
- Jawab dalam bahasa Indonesia. Akhiri setiap balasan dengan prompt lanjutan di bawah.
- Catat keputusan penting di repo. Repo publik: tanpa kunci atau rahasia.
- Kuota akun cepat habis: kerja ringkas, commit sering, perbarui file ini.
- TDD ketat: tes dulu dan dorong (harus merah), baru kodenya. Kode yang telanjur ditulis sebelum tesnya dihapus dan ditulis ulang.
- Jangan menilai artefak lama: bandingkan hash PDF/PNG kiriman pemilik dengan kiriman sebelumnya.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/flashcard (bekerja langsung di branch main atas izin pemilik).
Baca dulu HANDOFF.md, docs/superpowers/specs/2026-10-18-flashcard-design.md,
dan docs/superpowers/plans/2026-10-18-flashcard-app.md.
Status: Task 1 sampai 9 terverifikasi CI. Task 8 juga terverifikasi visual (PDF dari kode yang sudah
diperbaiki: Arab bersambung, harakat tepat, kata Latin utuh, tanda kurung benar, cermin sejajar).
Task 10 (alur antarmuka tempel sampai cetak, bahasa Indonesia, skill impeccable) sudah didorong ke main
(tes MERAH lalu kode HIJAU), belum dikonfirmasi.
Hasil CI Task 10 menurut screenshot Actions saya: [ISI: tempel screenshot, atau tulis merah/hijau per
commit; jangan dikirim dengan tanda kurung ini kosong].
Hasil penilaian tampilan aplikasi (tangkapan layar ponsel dan desktop, alur tempel sampai simpan PDF):
[ISI: tempel tangkapan layar atau tulis penilaian: mudah dipakai tanpa petunjuk? tema menarik? teks Arab
di pratinjau benar? PDF yang disimpan benar?; jangan dikirim kosong].
Cara eksekusi: native (superpowers:executing-plans). Sandbox tidak bisa npm install dan tidak bisa
membaca hasil Actions maupun mengunduh artefak, jadi saya yang mengirim screenshot dan berkas. Bila hasil
tidak sesuai harapan, perbaiki dulu (Task 10 lebih dulu). Bila sesuai, lanjutkan dari Task 11 (mode luring
PWA dan APK Android): tulis tes dulu dan dorong (harus merah), lalu kodenya (harus hijau). Jawab dalam
bahasa Indonesia.
Perbarui HANDOFF.md dan akhiri setiap balasan dengan prompt lanjutan seperti ini.
```
