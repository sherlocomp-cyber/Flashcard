import { describe, it, expect } from 'vitest';
import { blobToBase64 } from '../src/render/share';

describe('blobToBase64', () => {
  it('has_no_data_url_prefix', async () => {
    expect(await blobToBase64(new Blob(['hi']))).toBe('aGk=');
  });
});
