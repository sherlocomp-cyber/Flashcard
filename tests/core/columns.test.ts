import { describe, it, expect } from 'vitest';
import { guessColumns } from '../../src/core/columns';
import { buildAiPrompt } from '../../src/core/aiPrompt';

describe('guessColumns', () => {
  it('maps_by_header_aliases', () => {
    const cases: [string, string][] = [
      ['arab', 'arab'], ['ar', 'arab'],
      ['indonesia', 'indonesia'], ['arti', 'indonesia'], ['indo', 'indonesia'],
      ['inggris', 'inggris'], ['english', 'inggris'], ['en', 'inggris'],
      ['gambar', 'gambar'], ['image', 'gambar'], ['foto', 'gambar'],
      ['judul', 'judul'], ['title', 'judul'], ['topik', 'judul'],
      ['penjelasan', 'penjelasan'], ['isi', 'penjelasan'], ['keterangan', 'penjelasan'],
    ];
    for (const [header, field] of cases) {
      expect(guessColumns({ headers: [header], rows: [['x']] })).toEqual({ [field]: 0 });
    }
    // tak peka huruf besar dan spasi
    expect(guessColumns({ headers: [' Arab ', 'ARTI', 'English'], rows: [] })).toEqual({
      arab: 0,
      indonesia: 1,
      inggris: 2,
    });
  });

  it('maps_by_script_when_headers_unknown', () => {
    const table = {
      headers: ['kolom1', 'kolom2'],
      rows: [
        ['كِتَابٌ', 'buku'],
        ['قلم', 'pena'],
      ],
    };
    expect(guessColumns(table)).toEqual({ arab: 0 });
  });

  it('leaves_unrecognised_columns_unmapped', () => {
    expect(
      guessColumns({ headers: ['arab', 'catatan'], rows: [['كتاب', 'buku']] }),
    ).toEqual({ arab: 0 });
    expect(guessColumns({ headers: ['a', 'b'], rows: [['x', 'y']] })).toEqual({});
  });
});

describe('buildAiPrompt', () => {
  it('ai_prompt_lists_exact_column_names', () => {
    const prompt = buildAiPrompt();
    for (const name of ['arab', 'indonesia', 'inggris', 'gambar', 'judul', 'penjelasan']) {
      expect(prompt).toContain(name);
    }
    expect(prompt).toContain('tabel');
  });
});
