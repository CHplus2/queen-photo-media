import assert from 'node:assert/strict';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('https://**/*', (route) => route.abort());
    await page.goto('http://127.0.0.1:3000/');
    const navigate = async (name) => {
      if (width < 1280) {
        await page
          .getByRole('button', { name: 'Buka menu', exact: true })
          .click();
        await page
          .getByRole('navigation', { name: 'Menu seluler' })
          .getByRole('button', { name, exact: true })
          .click();
      } else
        await page
          .getByRole('navigation', { name: 'Navigasi utama' })
          .getByRole('button', { name, exact: true })
          .click();
    };
    const noOverflow = async (label) =>
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        false,
        `${width}px overflow: ${label}`,
      );
    await noOverflow('home');
    for (const name of [
      'Layanan & harga',
      'Photostrip',
      'Lacak pesanan',
      'Tentang kami',
    ]) {
      await navigate(name);
      await noOverflow(name);
      assert.equal(
        (await page.getByRole('main').locator('h1,h2').count()) > 0,
        true,
      );
    }
    await navigate('Layanan & harga');
    const all = await page.getByRole('article').count();
    await page
      .getByRole('group', { name: 'Kategori layanan' })
      .getByRole('button', { name: 'Pas foto', exact: true })
      .click();
    assert.ok(
      (await page.getByRole('article').count()) > 0 &&
        (await page.getByRole('article').count()) < all,
    );
    await page
      .getByRole('searchbox', { name: 'Cari layanan' })
      .fill('not-a-service-xyz');
    await page
      .getByRole('heading', { name: 'Layanan belum ditemukan' })
      .waitFor();
    await page.getByRole('button', { name: 'Tampilkan semua layanan' }).click();
    assert.equal(await page.getByRole('article').count(), all);
    await page
      .getByRole('button', { name: 'Pilih layanan', exact: true })
      .first()
      .click();
    await page.getByRole('dialog').waitFor();
    await noOverflow('configure');
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Tambah pilihan standar', exact: true })
      .first()
      .click();
    await page.getByRole('dialog').waitFor();
    await noOverflow('cart');
    await page.getByRole('button', { name: 'Lanjut ke checkout' }).click();
    await noOverflow('checkout');
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, [], `Browser errors at ${width}px`);
    console.log(
      `PASS ${width}px: navigation, catalog search/filter/empty state, dialogs and checkout; no page overflow or runtime errors.`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
