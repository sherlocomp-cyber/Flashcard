// Membuka halaman uji di Chromium tanpa kepala, mengekspor PDF contoh, menyimpannya ke verify-out/sample.pdf.
// Dijalankan oleh .github/workflows/verify-pdf.yml (butuh server Vite di port 5173).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.VERIFY_URL ?? 'http://localhost:5173/scripts/verify-harness.html';
mkdirSync('verify-out', { recursive: true });

const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[peramban]', m.text()));
  page.on('pageerror', (e) => {
    failed = true;
    console.error('[galat halaman]', e.message);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.runVerify === 'function', null, { timeout: 60000 });
  const t0 = Date.now();
  const b64 = await page.evaluate(() => window.runVerify());
  console.log(`PDF contoh selesai dalam ${Date.now() - t0} ms`);
  writeFileSync('verify-out/sample.pdf', Buffer.from(b64, 'base64'));
} catch (e) {
  failed = true;
  console.error('Gagal membuat PDF contoh:', e);
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
