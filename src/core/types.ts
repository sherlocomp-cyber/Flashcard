export type CardType = 'vocab' | 'picture' | 'material';
export type Field = 'arab' | 'indonesia' | 'inggris' | 'gambar' | 'judul' | 'penjelasan';
export type ColumnMap = Partial<Record<Field, number>>;
export interface Table {
  headers: string[];
  rows: string[][];
}
export interface Line {
  text: string;
  lang: 'ar' | 'id' | 'en';
  role: 'main' | 'sub';
}
export interface Side {
  lines: Line[];
  image?: string;
  iconKey?: string;
}
export interface Card {
  id: string;
  type: CardType;
  front: Side;
  back: Side;
  imageKey?: string;
}
export type PerPage = 2 | 4 | 6 | 8 | 9;
export interface Page {
  slots: (Card | null)[];
  side: 'front' | 'back';
}
