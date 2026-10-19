import { Capacitor } from '@capacitor/core';

/** Efek samping dipisah supaya alurnya bisa diuji tanpa peramban atau ponsel sungguhan. */
export interface ShareDeps {
  isNative(): Promise<boolean>;
  download(blob: Blob, name: string): Promise<void>;
  shareNative(blob: Blob, name: string): Promise<void>;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca berkas.'));
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

const isCancel = (e: unknown): boolean => /cancel/i.test(e instanceof Error ? e.message : String(e));

function defaultDeps(): ShareDeps {
  return {
    isNative: async () => Capacitor.isNativePlatform(),
    download: async (blob, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    // Unduhan lewat <a download> tidak jalan di WebView Android: tulis ke cache lalu buka lembar bagikan.
    shareNative: async (blob, name) => {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const written = await Filesystem.writeFile({
        path: name,
        data: await blobToBase64(blob),
        directory: Directory.Cache,
      });
      try {
        await Share.share({ title: name, dialogTitle: 'Simpan atau bagikan', url: written.uri });
      } catch (e) {
        // Menutup lembar bagikan bukan kesalahan.
        if (!isCancel(e)) throw e;
      }
    },
  };
}

/** Di peramban: unduh. Di aplikasi Android: lembar bagikan. Kesalahan diteruskan ke pemanggil. */
export async function shareOrSavePdf(blob: Blob, name: string, deps: ShareDeps = defaultDeps()): Promise<void> {
  if (await deps.isNative()) {
    await deps.shareNative(blob, name);
  } else {
    await deps.download(blob, name);
  }
}

/** Sama seperti `shareOrSavePdf`, untuk data teks atau Blob apa pun. */
export async function shareOrSave(
  name: string,
  data: string | Blob,
  mime: string,
  deps: ShareDeps = defaultDeps(),
): Promise<void> {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  await shareOrSavePdf(blob, name, deps);
}
