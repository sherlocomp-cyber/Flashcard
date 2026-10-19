import './fonts.css';
import './app.css';
import { createApp, type AppDeps, type AppHandle } from './app';
import { saveFile } from './share';

/** Pasang aplikasi ke `root`. `deps` hanya dipakai tes untuk menggantikan efek samping. */
export function mount(root: HTMLElement, deps?: Partial<AppDeps>): AppHandle {
  return createApp(root, deps);
}

const appRoot =
  typeof document !== 'undefined' ? document.querySelector<HTMLElement>('#app') : null;
if (appRoot && !appRoot.hasChildNodes()) mount(appRoot, { saveFile: (n, d, m) => saveFile(n, d, m) });
