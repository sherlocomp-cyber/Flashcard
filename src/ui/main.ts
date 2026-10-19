import './fonts.css';
import './app.css';
import { createApp, type AppDeps, type AppHandle } from './app';
import { shareOrSave } from '../render/share';
import { printOrSharePdf } from '../render/print';

/** Pasang aplikasi ke `root`. `deps` hanya dipakai tes untuk menggantikan efek samping. */
export function mount(root: HTMLElement, deps?: Partial<AppDeps>): AppHandle {
  return createApp(root, deps);
}

const appRoot =
  typeof document !== 'undefined' ? document.querySelector<HTMLElement>('#app') : null;
if (appRoot && !appRoot.hasChildNodes()) {
  mount(appRoot, {
    saveFile: (n, d, m) => shareOrSave(n, d, m),
    printBlob: (blob) => printOrSharePdf(blob, 'flashcard.pdf'),
  });
}
