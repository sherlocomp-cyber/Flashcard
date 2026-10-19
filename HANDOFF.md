# HANDOFF: aplikasi flashcard siap print (bahasa Arab)

Terakhir diperbarui: 2026-10-19 (sesi 7, bekerja langsung di `main` atas izin pemilik)

## Proyek
Aplikasi web (GitHub Pages) dan APK Android untuk membuat flashcard siap cetak A4 dari tabel yang ditempel. Pemilik adalah guru bahasa Arab. Keputusan: `docs/superpowers/specs/2026-10-18-flashcard-design.md`. Rencana 12 tugas: `docs/superpowers/plans/2026-10-18-flashcard-app.md`. Konteks produk: `PRODUCT.md`. `DESIGN.md` belum ada.

## Status
- **Tempat kerja: `main`.** Alat githubku hanya menulis ke `main`. Branch `build/app` usang.
- **Task 1 sampai 9: SELESAI, terverifikasi CI.** Task 8 juga terverifikasi visual (PDF nyata).
- **Task 10 (alur antarmuka): CI hijau. Tampilan BELUM pernah dinilai pemilik/manusia.** Minta tangkapan layar ponsel dan desktop.
  - **Sesi 7:** skala pratinjau dipindah ke `src/ui/scale.ts` (`sheetScale(lebar, tinggi)`: tidak memperbesar, batas bawah 0,35, null bila lebar belum terukur) dan dipasang di `fitSheet` pada `src/ui/app.ts`. Layar ≥ 64rem: tinggi layar dikurangi 300 px (`STAGE_CHROME_PX`, tebakan) ikut membatasi supaya satu lembar utuh terlihat; ponsel: hanya lebar. Bantalan `.sheet-wrap` (24 px) kini dikurangkan dari lebar; ada listener `resize`. Tes baru: `tests/scale.test.ts`. **CI belum diperiksa setelah dua commit ini** (sesi 7 tidak bisa membaca status CI); periksa dulu.
- **Task 11 (PWA luring, simpan/bagikan, Cetak Android, APK): KODE SELESAI, CI #86 dan Pages #28 hijau (sebelum sesi 7).** Belum terbukti: `release.yml` belum pernah berjalan (butuh tag), APK belum diuji di ponsel, service worker/luring belum diuji di peramban nyata.
  - `pwa.config.ts` + `vite-plugin-pwa` (precache js/css/html/woff2/svg/webmanifest, manifest relatif, ikon `public/icon.svg`); plugin dimatikan saat `VITEST`.
  - `src/render/share.ts`: `shareOrSave`, `shareOrSavePdf`, `blobToBase64`. Web: unduh `<a download>`. Android: tulis ke cache (Capacitor Filesystem) lalu `Share.share`; batal bagikan tidak dianggap galat (ditangani di `shareNative` bawaan, bukan di `shareOrSavePdf`).
  - `src/render/print.ts`: `printOrSharePdf`. Web: iframe + `print()`. Android: lembar bagikan (WebView tidak bisa mencetak iframe). Dipasang lewat `main.ts` (`saveFile`, `printBlob`).
  - `capacitor.config.ts`: `appId` **`id.sherlocomp.flashcardarab`** (tebakan, belum dikonfirmasi pemilik), `webDir: dist`.
  - `.github/workflows/release.yml`: tag `v*` → tes, build, `cap add android` bila folder `android/` tidak ada, `cap sync`, `minSdkVersion = 26` (sed di `android/variables.gradle`), `assembleRelease` bertanda tangan bila 4 rahasia ada; bila tidak, `assembleDebug` dan nama berkas `...-debug.apk`. Rilis lewat `softprops/action-gh-release@v2`.
  - Sisa duplikat tak terpakai: `src/ui/share.ts` (isi `export {}`, boleh dihapus) dan `tests/share.test.ts` (satu tes base64 untuk `blobToBase64`).
- **Task 12: README.md dan HANDOFF.md ditulis.** Verifikasi akhir (alur nyata di Pages dengan tabel 20 kata) BELUM dilakukan.
- `HANDOFF-main.md` usang; boleh dihapus lewat web GitHub.

## Kunci penanda tangan APK (sesi 6)
Kunci rilis dibuat di sandbox (PKCS12, RSA 2048, alias `flashcard`, berlaku 10000 hari, sandi acak) dan dikirim ke pemilik sebagai tiga berkas: `flashcard-release.jks`, `keystore.b64`, `rahasia-github.txt`. **Tidak ada di repo dan tidak boleh ada** (repo publik). Rahasia GitHub belum terpasang: token `gh` di sandbox tidak valid, jadi pemilik harus mengisi empat rahasia sendiri (lihat README). Salinan kunci di sandbox bersifat sementara; pemilik wajib menyimpan cadangannya, karena kunci hilang berarti APK baru tidak bisa menimpa yang lama.

## Cara menjalankan tes (PENTING)
Di sandbox Claude, `npm install` ditolak proxy. Jangan mencari jalan memutar. Alur di `main`:
1. Dorong tes dulu (CI harus MERAH), lalu kodenya (CI harus HIJAU). Satu commit per berkas; beri label MERAH/HIJAU di pesan commit.
2. Status CI bisa dibaca lewat `WebFetch` ke `https://github.com/sherlocomp-cyber/Flashcard/actions/workflows/ci.yml?query=branch%3Amain` (dan `pages.yml`); URL berbeda untuk melewati cache 15 menit. Log langkah butuh login, jadi untuk galat rinci minta pemilik mengirim screenshot halaman run. Halaman `github.com/.../tree/...` diblokir robots. (Sesi 7 di chat claude.ai: `web_fetch` menolak URL ini karena tidak pernah muncul di hasil pencarian; hanya alat githubku `get_file`/`put_file` yang tersedia.)
3. Daftar folder: `https://api.github.com/repos/sherlocomp-cyber/Flashcard/contents/<path>` lewat `WebFetch` (alat `get_file` tidak bisa membaca folder).
4. Cek lokal: `tsc` global ada di sandbox; tes murni bisa dijalankan dengan `node --experimental-strip-types`. Tes DOM dan yang butuh `jspdf`/`idb-keyval` tidak bisa lokal.
5. Bukti visual PDF: job `verify-pdf` (terpicu oleh `src/**`). Sebelum menilai PNG/PDF kiriman pemilik, bandingkan hash `md5sum` dengan kiriman sebelumnya.
Hemat kuota: dorong beberapa tugas berturut-turut, lalu periksa sekali.

## Keputusan (ruling) Task 2 sampai 7
- Pemisah tabel dideteksi dari baris pertama dengan prioritas pipa, tab, koma. Kolom paling kanan yang kosong di semua baris dibuang.
- `Side.iconKey` menandai sisi yang memuat gambar/ikon (jenis `vocab` dan `picture`): isi arti Indonesia, atau Inggris, atau Arab. Mengikuti saklar tukar sisi tanpa mengubah tipe `Card`.
- `Card.imageKey` = isi kolom `gambar`, bila kosong kata utama. Tautan di kolom `gambar` tidak diambil dari internet; hanya dicocokkan lewat nama.
- Hanya satu kolom isi (`vocab`, `material`): teks pertama dipindah ke depan. `picture` tidak dipindah. `id` kartu = `c<nomor baris>-<hash isi>`.
- Task 5: kunci pencocokan = NFC, tanpa harakat dan tatwil, huruf kecil, tanpa ekstensi gambar, tanpa spasi/garis bawah/strip. `downscale` (kanvas) tidak diuji di jsdom; belum diverifikasi di peramban nyata dengan gambar sungguhan.
- Task 6: `fitFontSize` bilangan bulat, pencarian biner, 12 sampai 72 px; baris sub setengahnya (min 11 px). Kartu berukuran mm. Arah teks dari aksara: tanpa huruf Arab `ltr`, lebih dari separuh Arab `rtl`, campuran `auto`. Saklar harakat membuang U+064B..U+065F dan U+0670 (tatwil dipertahankan). 8 tema (tosca, koral, ungu, biru laut, hijau daun, emas klasik, merah muda, langit malam); `customTheme` menerima #rgb/#rrggbb. 11 ikon SVG tertanam. Hanya tema tosca pernah terlihat; 7 tema lain belum dinilai pemilik (anti-tujuan: "tema kurang menarik").
- Task 7: kartu rapat tanpa celah, margin aman minimal 10 mm; ukuran kartu menyesuaikan kisi (2: 190 × 138,5; 4: 95 × 138,5; 6: 95 × 92,3; 8: 95 × 69,2; 9: 63,3 × 92,3 mm). Cetak bolak-balik mengasumsikan balik di sisi panjang; baris dibalik kiri-kanan. Tanda potong = ticks 4 mm di margin. Terbukti benar di PDF nyata; lembar dari printer nyata belum diuji.
- Font Arab: `@fontsource/amiri` (400, 700) lewat `src/ui/fonts.css`. Terbukti tampil di PDF nyata.

## Keputusan (ruling) Task 8
- Tiap slot kartu dipasang sementara di luar layar, difoto `html-to-image.toCanvas` (`pixelRatio` 300/96), JPEG 0,9, ditempel ke jsPDF dalam mm dari `gridFor`, kanvas dilepas. Satu kartu sekaligus; antarmuka diberi giliran tiap halaman. Risiko: PDF 200 kartu dua sisi bisa besar (belum diukur); bila berat turunkan `JPEG_QUALITY` atau pecah PDF.
- Urutan halaman `sides:'both'` = depan lembar 1, belakang lembar 1, depan lembar 2, ... Foto kartu pertama dilakukan dua kali (yang pertama dibuang) karena font tertanam sering belum siap. `PdfOptions.deps` memungkinkan tes memalsukan rasterisasi. Dek kosong melempar `Tidak ada kartu untuk diekspor.`
- Kata tidak pernah dipecah di tengah (`overflow-wrap:normal`); kata terlalu panjang mengecilkan huruf, di 12 px meluap → `data-overflow`.
- Isolasi bidi hanya pada baris yang memuat Arab DAN Latin/angka (`<bdi dir="ltr">`, `src/core/bidi.ts`). Catatan kecil yang tidak diperbaiki: frasa Latin dalam kurung bisa terbelah antar baris (bila mengganggu, `white-space:nowrap` pada `bdi`); angka "5." di depan Arab tampil dengan titik di sisi kanan angka.
- `verify-pdf` terpicu juga oleh `src/**` (±1 menit kuota Actions per dorongan).

## Keputusan (ruling) Task 9
- IndexedDB lewat `idb-keyval`, basis data `flashcard`, penyimpanan `decks`, kunci `deck:<id>`. `saveDeck` menyimpan apa adanya; antarmuka mengisi `updatedAt`. `listDecks` terbaru dulu.
- Format berkas dek: `{ "format": "flashcard-deck", "version": 1, "deck": {...} }`, gambar sebagai data URL. Galat impor berawalan `Berkas dek tidak valid:`. Batas kuota penyimpanan dengan 200 kartu bergambar belum diuji.

## Keputusan (ruling) Task 10
- `src/ui/app.ts` (`createApp`), `dom.ts`, `app.css`, `main.ts`, `scale.ts`. Semua efek samping lewat `AppDeps` agar teruji di jsdom; `render/pdf` dimuat malas.
- Satu layar: desktop (≥ 64rem) dua kolom, pratinjau menempel di kanan; ponsel satu kolom. Pratinjau menampilkan SATU lembar pada satu waktu (pager, saklar Depan/Belakang); peringatan "terlalu panjang" hanya untuk lembar yang tampil.
- Pemetaan kolom muncul hanya bila ada kolom tak dikenali. Ganti jenis kartu/pemetaan membangun ulang kartu dari tabel (suntingan tangan hilang); tukar sisi aman. Dek yang dibuka dari penyimpanan tidak punya tabel.
- Sunting hanya baris pertama tiap sisi (baris lanjutan baca-saja). Tema kustom = `themeId "custom:#rrggbb"`. Bawaan: 4 per lembar, depan dan belakang, tanda potong aktif, harakat tampil.
- Gaya: dunia tosca (kertas hangat, rel gelap tosca, bingkai bertitik), font sistem untuk UI, Amiri untuk Arab, area sentuh ≥ 44 px, `prefers-reduced-motion` dihormati. Belum ada mode gelap.

## Tindakan pemilik
1. **Pasang empat rahasia GitHub** (Settings → Secrets and variables → Actions) dari berkas `rahasia-github.txt` dan `keystore.b64` yang dikirim sesi 6. **Simpan cadangan `flashcard-release.jks` dan sandinya.**
2. **Pasang tag** `v0.1.0` (`git tag v0.1.0 && git push origin v0.1.0`, atau buat Release baru di GitHub dengan tag itu). Setelah itu cek tab Actions → "Release APK" dan unduh APK dari Releases. Bila merah, kirim screenshot halaman run.
3. Konfirmasi atau ganti `appId` di `capacitor.config.ts` **sebelum APK dibagikan ke guru lain**: mengganti `appId` setelah APK beredar membuat aplikasi dianggap aplikasi berbeda.
4. Uji APK di ponsel: tempel tabel, simpan PDF (lembar bagikan muncul?), tombol Cetak, mode pesawat (jalan tanpa internet?).
5. Buka halaman Pages dan kirim tangkapan layar ponsel dan desktop; nilai kemudahan, tema, dan Arab di pratinjau (termasuk apakah satu lembar utuh terlihat di desktop dan terbaca di ponsel).
6. Cetak satu lembar uji dari printer nyata; nilai Arab bersambung, harakat, dan keselarasan bolak-balik.

## Langkah berikutnya
Periksa CI `main` untuk dua commit sesi 7 (`tests/scale.test.ts`, `src/ui/app.ts`); bila merah, perbaiki dulu. Bila rilis APK gagal, perbaiki `release.yml` (kemungkinan: versi Gradle/Java, `cap add android` di CI, jalur `app-release.apk`). Lalu tinjau tampilan Task 10 dari tangkapan layar pemilik dan perbaiki yang ribet atau kurang menarik; pertimbangkan job CI Playwright yang memotret halaman. Terakhir lakukan verifikasi akhir Task 12 (alur 20 kata di Pages). Perbarui file ini di akhir setiap sesi.

## Aturan kerja
- Jawab dalam bahasa Indonesia. Akhiri setiap balasan dengan prompt lanjutan di bawah bila diminta.
- Repo publik: tanpa kunci atau rahasia di dalamnya.
- Kuota akun cepat habis: kerja ringkas, commit sering, perbarui file ini.
- TDD ketat: tes dulu dan dorong (harus merah), baru kodenya. Pakai skill superpowers dan impeccable (pemilik meminta selalu).
- Jangan menilai artefak lama: bandingkan hash PDF/PNG dengan kiriman sebelumnya.

## Prompt lanjutan
```
Lanjutkan proyek aplikasi flashcard siap print untuk kelas bahasa Arab di repo
https://github.com/sherlocomp-cyber/Flashcard (langsung di branch main atas izin pemilik).
Baca dulu HANDOFF.md, lalu spek dan rencana di docs/superpowers/. Gunakan selalu skill superpowers dan impeccable.
Status: Task 1 sampai 11 selesai dan hijau di CI (Task 11 belum terbukti sebagai APK karena tag belum dipasang).
Sesi 7 menambah skala pratinjau (scale.ts); CI untuk dua commit itu belum diperiksa.
README.md dan HANDOFF.md sudah ditulis. Sisa: rilis APK pertama, penilaian tampilan, verifikasi akhir.
Hasil CI main terbaru: [ISI: hijau/merah + screenshot bila merah; jangan dikirim kosong].
Hasil rilis APK (tag v0.1.0): [ISI: hijau/merah + screenshot bila merah; jangan dikirim kosong].
Hasil uji di ponsel dan tampilan aplikasi: [ISI: tangkapan layar atau penilaian; jangan dikirim kosong].
Bila ada yang merah atau tidak sesuai, perbaiki dulu. Jawab dalam bahasa Indonesia.
```
