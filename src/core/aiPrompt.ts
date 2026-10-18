import { FIELDS } from './columns';

/** Teks perintah siap salin untuk AI lain, memakai nama kolom persis yang dikenali aplikasi. */
export function buildAiPrompt(): string {
  return [
    'Ubah isi yang saya tempel di bagian bawah menjadi satu tabel Markdown untuk membuat flashcard.',
    '',
    'Aturan:',
    '- Satu baris sama dengan satu kartu. Baris pertama berisi nama kolom.',
    `- Pakai nama kolom persis ini, huruf kecil semua, dan hanya kolom yang diperlukan: ${FIELDS.join(', ')}.`,
    '- arab: kata atau kalimat Arab, lengkap dengan harakat.',
    '- indonesia: arti dalam bahasa Indonesia.',
    '- inggris: arti dalam bahasa Inggris (boleh tidak ada).',
    '- gambar: nama file gambar, misalnya buku.png (boleh tidak ada).',
    '- judul dan penjelasan: untuk kartu materi; penjelasan sekitar 40 kata.',
    '- Jangan menambah kolom lain dan jangan menulis keterangan di luar tabel.',
    '',
    'Isi yang akan diubah:',
    '',
  ].join('\n');
}
