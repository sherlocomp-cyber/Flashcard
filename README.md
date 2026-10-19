# Flashcard Arab

Ubah tabel kosakata atau materi menjadi flashcard A4 siap cetak. Dibuat untuk kelas bahasa Arab: huruf Arab bersambung, harakat tepat, cetak dua sisi sejajar, hemat tinta. Tanpa akun dan tanpa internet setelah dibuka sekali. Semua diolah di perangkat Anda.

## Pakai

- **Web:** https://sherlocomp-cyber.github.io/Flashcard/ (bisa dipasang ke layar utama ponsel lewat menu peramban).
- **Android (APK):** unduh berkas `.apk` terbaru di halaman [Releases](https://github.com/sherlocomp-cyber/Flashcard/releases). Izinkan pemasangan dari sumber ini bila ponsel menanyakan.

## Cara membuat kartu

1. Tempel tabel (dari Excel, Google Sheets, atau hasil AI) ke kotak besar. Kartu langsung terbentuk. Tombol "Salin teks perintah untuk AI" membantu merapikan isi buku menjadi tabel yang benar.
2. Pilih jenis kartu (kosakata, gambar tebak kata, materi) dan tema. Warna sendiri juga bisa.
3. Opsional: pilih banyak gambar sekaligus. Beri nama berkas sama dengan katanya, misalnya `buku.png`.
4. Periksa pratinjau, perbaiki kartu bila perlu, pilih jumlah kartu per lembar (2, 4, 6, 8, 9) dan sisi yang dicetak.
5. **Cetak** atau **Simpan PDF**. Untuk dua sisi, cetak bolak-balik dengan balik di sisi panjang kertas.

Di Android, kedua tombol membuka lembar bagikan: simpan PDF atau kirim ke aplikasi pencetak.

## Untuk pengembang

```
npm install
npm run dev     # jalankan lokal
npm test        # tes (Vitest + jsdom)
npm run build   # hasil di dist/
```

Kode: `src/core` (logika murni), `src/render` (kartu, PDF, simpan/bagikan, cetak), `src/store` (dek), `src/themes`, `src/ui`. Spek dan rencana ada di `docs/superpowers/`. Catatan serah-terima: `HANDOFF.md`.

## Membuat APK

APK dibuat otomatis oleh GitHub Actions (`.github/workflows/release.yml`) setiap kali tag versi dipasang:

```
git tag v0.1.0
git push origin v0.1.0
```

Hasilnya muncul di Releases. Tanpa rahasia kunci di bawah, APK tetap dibuat tetapi bertanda kunci uji (`...-debug.apk`).

### Kunci penanda tangan (sekali saja)

Di repo: Settings → Secrets and variables → Actions → New repository secret, buat empat rahasia:

| Nama | Isi |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | seluruh isi berkas kunci yang sudah di-base64 |
| `ANDROID_KEYSTORE_PASSWORD` | sandi berkas kunci |
| `ANDROID_KEY_ALIAS` | nama kunci (`flashcard`) |
| `ANDROID_KEY_PASSWORD` | sandi kunci |

Membuat kunci sendiri:

```
keytool -genkeypair -keystore flashcard-release.jks -storetype PKCS12 -alias flashcard -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 flashcard-release.jks
```

Jangan pernah mengunggah berkas kunci atau sandinya ke repo ini (repo publik). Simpan cadangannya: bila hilang, APK versi baru tidak bisa dipasang menimpa versi lama.
