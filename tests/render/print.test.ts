import { describe, it, expect, vi } from 'vitest';
import { printOrSharePdf } from '../../src/render/print';

function fakeDeps(native: boolean) {
  return {
    isNative: vi.fn(async (): Promise<boolean> => native),
    download: vi.fn(async (_blob: Blob, _name: string): Promise<void> => undefined),
    shareNative: vi.fn(async (_blob: Blob, _name: string): Promise<void> => undefined),
    print: vi.fn(async (_blob: Blob): Promise<void> => undefined),
  };
}

describe('printOrSharePdf', () => {
  it('prints_in_the_browser', async () => {
    const deps = fakeDeps(false);
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    await printOrSharePdf(blob, 'flashcard.pdf', deps);
    expect(deps.print).toHaveBeenCalledTimes(1);
    expect(deps.print.mock.calls[0][0]).toBe(blob);
    expect(deps.shareNative).not.toHaveBeenCalled();
    expect(deps.download).not.toHaveBeenCalled();
  });

  it('opens_the_share_sheet_on_android_because_webview_cannot_print_iframes', async () => {
    const deps = fakeDeps(true);
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    await printOrSharePdf(blob, 'flashcard.pdf', deps);
    expect(deps.shareNative).toHaveBeenCalledTimes(1);
    expect(deps.shareNative.mock.calls[0][1]).toBe('flashcard.pdf');
    expect(deps.print).not.toHaveBeenCalled();
  });

  it('print_errors_are_not_swallowed', async () => {
    const deps = fakeDeps(false);
    deps.print.mockRejectedValueOnce(new Error('Printer menolak'));
    await expect(printOrSharePdf(new Blob(['x']), 'a.pdf', deps)).rejects.toThrow('Printer menolak');
  });
});
