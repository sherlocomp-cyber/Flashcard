import { describe, it, expect, vi } from 'vitest';
import { blobToBase64, saveFile, type ShareEnv } from '../src/ui/share';

function fakeEnv(native: boolean, over: Partial<ShareEnv> = {}): ShareEnv {
  return {
    isNative: () => native,
    toBase64: async () => 'QUJD',
    writeCache: vi.fn(async () => 'file:///cache/x'),
    share: vi.fn(async () => {}),
    download: vi.fn(),
    ...over,
  };
}

describe('share', () => {
  it('web_downloads_and_never_touches_native_apis', async () => {
    const env = fakeEnv(false);
    await saveFile('a.json', '{}', 'application/json', env);
    expect(env.download).toHaveBeenCalledTimes(1);
    const [name, blob] = (env.download as ReturnType<typeof vi.fn>).mock.calls[0] as [string, Blob];
    expect(name).toBe('a.json');
    expect(blob.type).toBe('application/json');
    expect(env.writeCache).not.toHaveBeenCalled();
    expect(env.share).not.toHaveBeenCalled();
  });

  it('native_writes_cache_then_opens_share_sheet', async () => {
    const env = fakeEnv(true);
    await saveFile('flashcard.pdf', new Blob(['x']), 'application/pdf', env);
    expect(env.writeCache).toHaveBeenCalledWith('flashcard.pdf', 'QUJD');
    expect(env.share).toHaveBeenCalledWith('flashcard.pdf', 'file:///cache/x');
    expect(env.download).not.toHaveBeenCalled();
  });

  it('native_ignores_a_cancelled_share_sheet', async () => {
    const env = fakeEnv(true, { share: async () => { throw new Error('Share canceled'); } });
    await expect(saveFile('a.pdf', new Blob(['x']), 'application/pdf', env)).resolves.toBeUndefined();
  });

  it('native_surfaces_real_errors', async () => {
    const env = fakeEnv(true, { writeCache: async () => { throw new Error('Penyimpanan penuh'); } });
    await expect(saveFile('a.pdf', new Blob(['x']), 'application/pdf', env)).rejects.toThrow('Penyimpanan penuh');
  });

  it('blob_to_base64_has_no_data_url_prefix', async () => {
    expect(await blobToBase64(new Blob(['hi']))).toBe('aGk=');
  });
});
