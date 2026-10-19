import assert from 'node:assert/strict';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('https://**/*', (route) => route.abort());
    await page.goto('http://127.0.0.1:3000/');
    await page.getByRole('heading', { name: /Cetak foto, pas foto/ }).waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'id');
    await page
      .getByRole('combobox', { name: 'Bahasa / Language' })
      .selectOption('en');
    await page
      .getByRole('heading', { name: /Photo prints, ID photos/ })
      .waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    const catalog = page.locator('#services');
    await catalog
      .getByRole('group', { name: 'Service categories' })
      .getByRole('button', { name: 'Photo prints', exact: true })
      .click();
    const jumbo = catalog
      .locator('article')
      .filter({
        has: page.getByRole('heading', {
          name: 'Jumbo 10R Photo Print (20x25 cm)',
          exact: true,
        }),
      });
    await jumbo.getByText('Photo prints', { exact: true }).waitFor();
    await jumbo
      .getByText(/An ideal size for display in your living room/)
      .waitFor();
    await catalog.getByRole('searchbox').fill('Jumbo 10R Photo Print');
    assert.equal(await catalog.locator('article').count(), 1);
    await catalog.getByRole('searchbox').fill('');
    await catalog
      .getByRole('button', { name: 'Choose a service', exact: true })
      .first()
      .click();
    await page.getByRole('dialog').waitFor();
    await page
      .getByRole('spinbutton', { name: 'Quantity', exact: true })
      .fill('2');
    await page
      .getByRole('button', {
        name: 'Additional options & notes (optional)',
        exact: true,
      })
      .click();
    await page
      .getByRole('combobox', { name: 'Frames', exact: true })
      .selectOption({ label: 'Minimalist black' });
    assert.equal(
      await page
        .getByRole('combobox', { name: 'Frames', exact: true })
        .inputValue(),
      'Minimalis Hitam',
      'Localized options must retain their original stored values.',
    );
    await page
      .getByRole('textbox', { name: 'Notes for the studio', exact: true })
      .fill('Warna natural, nama Simpan');
    await page
      .getByRole('button', { name: 'Add to cart', exact: true })
      .click();
    await page.getByRole('dialog', { name: 'Your cart' }).waitFor();
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('queen_photo_cart')),
    );
    assert.equal(cart[0].frame, 'Minimalis Hitam');
    assert.equal(cart[0].unitPrice, 30000);
    assert.equal(cart[0].quantity, 2);
    assert.equal(cart[0].notes, 'Warna natural, nama Simpan');
    await page
      .getByRole('button', { name: 'Continue to checkout', exact: true })
      .click();
    await page.getByRole('textbox', { name: /Full name/ }).fill('Nama asli');
    // Close first because dialogs correctly trap focus and keep their form state.
    await page.getByRole('button', { name: 'Close cart', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Bahasa / Language' })
      .selectOption('id');
    await page
      .getByRole('button', { name: /Buka keranjang/ })
      .first()
      .click();
    await page
      .getByRole('button', { name: 'Lanjut ke checkout', exact: true })
      .click();
    assert.equal(
      await page.getByRole('textbox', { name: /Nama lengkap/ }).inputValue(),
      'Nama asli',
      'Changing language must not remount or discard form inputs.',
    );
    await page
      .getByRole('button', { name: 'Tutup keranjang', exact: true })
      .click();
    await page
      .getByRole('combobox', { name: 'Bahasa / Language' })
      .selectOption('en');
    await page.reload();
    await page
      .getByRole('heading', { name: /Photo prints, ID photos/ })
      .waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page
      .locator('footer')
      .getByRole('button', { name: 'Services & prices', exact: true })
      .click();
    await page.waitForFunction(
      () => document.title === 'Services & prices — Queen Photo',
    );
    assert.equal(
      await page
        .getByRole('heading', { name: /Photo prints, ID photos/ })
        .count(),
      0,
    );
    await page
      .locator('footer')
      .getByRole('button', { name: 'About Queen Photo', exact: true })
      .click();
    await page.getByRole('heading', { name: /Keeping memories/ }).waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    if (process.env.AXE_MODULE) {
      const { default: AxeBuilder } = await import(process.env.AXE_MODULE);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        result.violations.map((v) => v.id),
        [],
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      'PASS ' +
        width +
        'px: ID/EN navigation, stable frame values/pricing, original notes, checkout input retention, reload preference, language metadata and layout. No live writes.',
    );
    await context.close();
  }
} finally {
  await browser.close();
}
