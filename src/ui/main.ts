export function mount(root: HTMLElement): void {
  root.innerHTML =
    '<main class="shell"><h1>Flashcard Arab</h1>' +
    '<p>Tempel tabel kosakata untuk membuat kartu siap cetak.</p></main>';
}

const appRoot =
  typeof document !== 'undefined' ? document.querySelector<HTMLElement>('#app') : null;
if (appRoot && !appRoot.hasChildNodes()) mount(appRoot);
