import { describe, it, expect, vi } from 'vitest';
import { shareOrSave, shareOrSavePdf } from '../../src/render/share';

function fakeDeps(native: boolean) {
  return {
    isNative: vi.fn(async (): Promise<boolean> => native),
    download: vi.fn(async (_blob: Blob, _name: string): Promise<void> => undefined),
    shareNative: vi.fn(async (_blob: Blob, _name: string): Promise<void> => undefined),
  };
}

describe('shareOrSavePdf', () => {
  it('share_uses_download_on_web', async () => {
    const deps = fakeDeps(false);
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    await shareOrSavePdf(blob, 'flashcard.pdf', deps);
    expect(deps.download).toHaveBeenCalledTimes(1);
    expect(deps.download.mock.calls[0][0]).toBe(blob);
    expect(deps.download.mock.calls[0][1]).toBe('flashcard.pdf');
    expect(deps.shareNative).not.toHaveBeenCalled();
  });

  it('share_uses_native_share_on_android', async () => {
    const deps = fakeDeps(true);
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    await shareOrSavePdf(blob, 'flashcard.pdf', deps);
    expect(deps.shareNative).toHaveBeenCalledTimes(1);
    expect(deps.shareNative.mock.calls[0][0]).toBe(blob);
    expect(deps.shareNative.mock.calls[0][1]).toBe('flashcard.pdf');
    expect(deps.download).not.toHaveBeenCalled();
  });

  it('native_share_error_is_not_swallowed', async () => {
    const deps = fakeDeps(true);
    deps.shareNative.mockRejectedValueOnce(new Error('Berbagi dibatalkan'));
    await expect(shareOrSavePdf(new Blob(['x']), 'a.pdf', deps)).rejects.toThrow('Berbagi dibatalkan');
  });
});

describe('shareOrSave', () => {
  it('text_data_is_wrapped_into_a_blob_with_the_given_mime', async () => {
    const deps = fakeDeps(false);
    await shareOrSave('dek.json', '{"a":1}', 'application/json', deps);
    expect(deps.download).toHaveBeenCalledTimes(1);
    const blob = deps.download.mock.calls[0][0];
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBe(7);
    expect(deps.download.mock.calls[0][1]).toBe('dek.json');
  });
});
