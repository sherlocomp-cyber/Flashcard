import { shareOrSavePdf, type ShareDeps } from './share';

export interface PrintDeps extends ShareDeps {
  print(blob: Blob): Promise<void>;
}

/** Cetak lewat iframe tersembunyi. Hanya jalan di peramban; WebView Android tidak bisa mencetak iframe. */
function printInFrame(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement('iframe');
    frame.src = url;
    frame.className = 'print-frame';
    frame.setAttribute('aria-hidden', 'true');
    frame.addEventListener('load', () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(url);
      }, 60_000);
      resolve();
    });
    document.body.appendChild(frame);
  });
}

/** Di peramban: dialog cetak. Di aplikasi Android: lembar bagikan, supaya PDF bisa dicetak lewat aplikasi pencetak. */
export async function printOrSharePdf(blob: Blob, name: string, deps?: PrintDeps): Promise<void> {
  if (deps) {
    if (await deps.isNative()) {
      await deps.shareNative(blob, name);
    } else {
      await deps.print(blob);
    }
    return;
  }
  const { Capacitor } = await import('@capacitor/core');
  if (Capacitor.isNativePlatform()) {
    await shareOrSavePdf(blob, name);
  } else {
    await printInFrame(blob);
  }
}
