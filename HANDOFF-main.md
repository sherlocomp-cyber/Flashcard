# Catatan sementara: pekerjaan yang masuk ke `main`

Berkas ini sengaja terpisah dari `HANDOFF.md` supaya tidak menimpa `HANDOFF.md` di branch `build/app` (yang berisi status Task 1 dan bagian "Cara menjalankan tes"). Setelah digabung ke `build/app`, ringkas isinya ke `HANDOFF.md` lalu hapus berkas ini.

## Mengapa ada commit di `main`
Sesi kerja tidak bisa mengakses branch `build/app` (alat githubku hanya menulis ke `main`). Pemilik mengizinkan commit ke `main` sebagai jalur sementara.

## Status
- Task 1: selesai di `build/app` (CI hijau), kodenya TIDAK ada di `main`.
- Task 2 (parser tabel tempelan): ditulis di `main`, belum diverifikasi CI.
  - `tests/core/parse.test.ts` (6 tes sesuai rencana)
  - `src/core/parse.ts` (`parseTable`, mengimpor tipe `Table` dari `src/core/types.ts` buatan Task 1)
  - Urutan commit: tes dulu, lalu kode.
- Task 3 sampai 12: belum dimulai.

## Bukti yang ada dan yang belum
- Ada: 6 tes lulus di Node 22 memakai pengganti `describe/it/expect` buatan sendiri (Vitest tidak bisa dipasang di ruang kerja).
- Belum: CI merah sebelum kode, lalu hijau. `main` tidak punya `package.json` atau workflow tes, jadi CI tidak jalan di sini.

## Yang perlu dilakukan pemilik
1. Di `build/app`: `git fetch origin && git cherry-pick <commit tes> <commit kode>` (dua commit Task 2 di `main`), atau `git merge origin/main` bila tidak ada konflik selain berkas ini.
2. Dorong ke `build/app`, tunggu CI. Bila ada tes merah, kirim log-nya ke sesi berikutnya.
3. Kabari hasilnya; kerjakan Task 3 berikutnya.
