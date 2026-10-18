import type { Table } from './types';

type Delimiter = '|' | '\t' | ',';

const SEPARATOR_ROW = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

function detectDelimiter(firstLine: string): Delimiter {
  if (firstLine.includes('|')) return '|';
  if (firstLine.includes('\t')) return '\t';
  return ',';
}

function parsePipeRows(text: string): string[][] {
  const rows: string[][] = [];
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = raw.trim();
    if (line === '' || SEPARATOR_ROW.test(line)) continue;
    let body = line;
    if (body.startsWith('|')) body = body.slice(1);
    if (body.endsWith('|')) body = body.slice(0, -1);
    rows.push(body.split('|'));
  }
  return rows;
}

// Parser CSV/TSV yang memahami tanda kutip ganda (termasuk "" dan baris baru di dalam kutip).
function parseDelimited(text: string, delimiter: ',' | '\t'): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"' && cell.trim() === '') {
      cell = '';
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

export function parseTable(input: string): Table {
  const text = input.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r\n|\r|\n/).find((l) => l.trim() !== '');
  if (firstLine === undefined) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(firstLine);
  const raw = delimiter === '|' ? parsePipeRows(text) : parseDelimited(text, delimiter);

  const rows = raw
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ''));
  if (rows.length === 0) return { headers: [], rows: [] };

  // Ratakan lebar, lalu buang kolom paling kanan bila kosong di semua baris
  // (pemisah di akhir baris tidak boleh membuat kolom hantu).
  let width = Math.max(...rows.map((r) => r.length));
  for (const r of rows) while (r.length < width) r.push('');
  while (width > 0 && rows.every((r) => r[width - 1] === '')) {
    for (const r of rows) r.pop();
    width--;
  }
  if (width === 0) return { headers: [], rows: [] };

  return { headers: rows[0], rows: rows.slice(1) };
}
