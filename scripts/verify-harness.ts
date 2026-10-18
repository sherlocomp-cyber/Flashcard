import '../src/ui/fonts.css';
import { exportPdf } from '../src/render/pdf';
import { THEMES } from '../src/themes/themes';
import type { Card } from '../src/core/types';

declare global {
  interface Window {
    runVerify: () => Promise<string>;
  }
}

function vocab(n: number, ar: string, id: string, en: string): Card {
  return {
    id: `v${n}`,
    type: 'vocab',
    front: { lines: [{ text: ar, lang: 'ar', role: 'main' }], iconKey: id },
    back: {
      lines: [
        { text: `${n}. ${id}`, lang: 'id', role: 'main' },
        { text: en, lang: 'en', role: 'sub' },
      ],
    },
  };
}

const LONG_ID =
  'Jumlah ismiyyah adalah kalimat yang diawali dengan isim. Bagian pertama disebut mubtada dan bagian kedua disebut khabar. ' +
  'Keduanya berharakat rafa. Contoh: kalimat sederhana yang menyebut sifat suatu benda, misalnya tentang sebuah buku yang baru ' +
  'dan sebuah sekolah yang besar, lalu siswa menebak peran tiap kata.';

const CARDS: Card[] = [
  vocab(1, 'كِتَابٌ', 'buku', 'book'),
  vocab(2, 'مَدْرَسَةٌ', 'sekolah', 'school'),
  vocab(3, 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ', 'salam', 'peace be upon you'),
  vocab(4, 'الكِتَابُ (the book) رقم 12', 'campuran Arab dan Latin', 'mixed script'),
  {
    id: 'm5',
    type: 'material',
    front: { lines: [{ text: '5. الجُمْلَةُ الِاسْمِيَّةُ', lang: 'ar', role: 'main' }] },
    back: { lines: [{ text: LONG_ID, lang: 'id', role: 'main' }] },
  },
];

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// 5 kartu, 4 per lembar: lembar kedua berisi satu kartu + 3 slot kosong, jadi pencerminan terlihat jelas.
window.runVerify = async () => {
  const blob = await exportPdf(CARDS, {
    perPage: 4,
    theme: THEMES[0],
    harakat: true,
    sides: 'both',
    cutMarks: true,
    onProgress: (done, total) => console.log(`halaman ${done}/${total}`),
  });
  return toBase64(blob);
};
