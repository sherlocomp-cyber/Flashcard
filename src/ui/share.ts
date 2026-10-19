import { Capacitor } from '@capacitor/core';

/** Efek samping dipisah supaya alurnya bisa diuji tanpa peramban atau ponsel sungguhan. */
export interface ShareEnv {
  isNative(): boolean;
  toBase64(blob: Blob): Promise<string>;
  /** Tulis ke cache aplikasi dan kembalikan URI berkasnya. */
  writeCache(name: string, base64: string): Promise<string>;
  share(name: string, uri: string): Promise<void>;
  download(name: string, blob: Blob): void;
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

function defaultEnv(): ShareEnv {
  return {
    isNative: () => Capacitor.isNativePlatform(),
    toBase64: blobToBase64,
    writeCache: async (name, base64) => {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const res = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
      return res.uri;
    },
    share: async (name, uri) => {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: name, dialogTitle: 'Simpan atau bagikan', url: uri });
    },
    download: (name, blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
  };
}

const isCancel = (e: unknown): boolean => /cancel/i.test(e instanceof Error ? e.message : String(e));

/**
 * Di peramban: unduh berkas seperti biasa.
 * Di aplikasi Android: tulis ke cache lalu buka lembar bagikan, karena unduhan lewat `<a download>` tidak jalan di WebView.
 */
export async function saveFile(
  name: string,
  data: string | Blob,
  mime: string,
  env: ShareEnv = defaultEnv(),
): Promise<void> {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  if (!env.isNative()) {
    env.download(name, blob);
    return;
  }
  const uri = await env.writeCache(name, await env.toBase64(blob));
  try {
    await env.share(name, uri);
  } catch (e) {
    // Menutup lembar bagikan bukan kesalahan.
    if (!isCancel(e)) throw e;
  }
}
