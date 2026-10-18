import { describe, it, expect } from 'vitest';
import { parseTable } from '../../src/core/parse';

describe('parseTable', () => {
  it('parses_markdown_table', () => {
    const t = parseTable('| arab | arti |\n|---|---|\n| كتاب | buku |');
    expect(t.headers).toEqual(['arab', 'arti']);
    expect(t.rows).toEqual([['كتاب', 'buku']]);
  });

  it('parses_tab_separated', () => {
    const t = parseTable('arab\tarti\nكتاب\tbuku\nقلم\tpena');
    expect(t.headers).toEqual(['arab', 'arti']);
    expect(t.rows).toEqual([
      ['كتاب', 'buku'],
      ['قلم', 'pena'],
    ]);
  });

  it('parses_csv_with_quoted_commas', () => {
    const t = parseTable('arab,arti\n"أ, ب","a, b"');
    expect(t.headers).toEqual(['arab', 'arti']);
    expect(t.rows).toEqual([['أ, ب', 'a, b']]);
  });

  it('handles_crlf_blank_lines_and_trailing_pipes', () => {
    const md = '| arab | arti |\r\n|---|---|\r\n\r\n| كتاب | buku |\r\n\r\n| قلم | pena |\r\n';
    const t = parseTable(md);
    expect(t.headers).toEqual(['arab', 'arti']);
    expect(t.rows).toEqual([
      ['كتاب', 'buku'],
      ['قلم', 'pena'],
    ]);

    const csv = parseTable('arab,arti,\r\n\r\nكتاب,buku,\r\n');
    expect(csv.headers).toEqual(['arab', 'arti']);
    expect(csv.rows).toEqual([['كتاب', 'buku']]);

    const tsv = parseTable('arab\tarti\t\r\nكتاب\tbuku\t\r\n');
    expect(tsv.headers).toEqual(['arab', 'arti']);
    expect(tsv.rows).toEqual([['كتاب', 'buku']]);
  });

  it('trims_cells_and_keeps_harakat', () => {
    const t = parseTable('|  arab  |  arti  |\n|---|---|\n|  كِتَابٌ  |  buku  |');
    expect(t.headers).toEqual(['arab', 'arti']);
    expect(t.rows).toEqual([['كِتَابٌ', 'buku']]);
  });

  it('returns_empty_table_for_blank_input', () => {
    expect(parseTable('')).toEqual({ headers: [], rows: [] });
    expect(parseTable('  \r\n\t\n  ')).toEqual({ headers: [], rows: [] });
  });
});
