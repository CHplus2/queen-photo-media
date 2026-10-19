// Serve the actual build with the Vercel headers, so Chromium enforces CSP locally.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const config = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
);
const root = resolve('dist');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    const file = resolve(root, path === '/' ? 'index.html' : '.' + path);
    if (!file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const body = await readFile(file);
    for (const header of config.headers[0].headers)
      res.setHeader(header.key, header.value);
    res.setHeader(
      'Content-Type',
      types[extname(file)] || 'application/octet-stream',
    );
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  const scripts = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(e.violatedDirective + ':' + e.blockedURI),
    );
  });
  await page.route('https://**/*', (route) => route.abort());
  const response = await page.goto(base);
  assert.equal(response.headers()['x-frame-options'], 'DENY');
  await page.getByRole('heading', { name: /Cetak foto, pas foto/ }).waitFor();
  await page
    .locator('img[fetchpriority="high"]')
    .evaluate((img) => img.decode());
  assert.equal(
    scripts.some((url) =>
      /AdminPosView-|InventoryView-|OwnerDashboard-/.test(url),
    ),
    false,
    'Customer homepage should not download staff pages.',
  );
  await page
    .getByRole('button', { name: 'Buat photostrip', exact: true })
    .click();
  await page.getByRole('dialog').waitFor();
  await page
    .getByRole('button', { name: 'Tambah ke keranjang', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Lanjut ke checkout', exact: true })
    .waitFor();
  const lazy = scripts.filter((url) =>
    /OrderConfiguratorModal-|CartDrawer-/.test(url),
  );
  assert.equal(lazy.length, 2, 'Ordering bundles should load only on use.');
  assert.deepEqual(
    await page.evaluate(() => window.__csp),
    [],
    'Production CSP must allow the actual application.',
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS production build: enforced CSP, WebP hero, on-demand bundles, custom service → cart; no runtime/CSP errors. External Firebase requests blocked; no live writes.',
  );
  await context.close();
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
