import assert from 'node:assert/strict';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  // Never send test data to the production database.
  await page.route('https://**/*', (route) =>
    route.request().url().includes('identitytoolkit.googleapis.com')
      ? route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 400,
              message: 'OPERATION_NOT_ALLOWED',
              errors: [{ message: 'OPERATION_NOT_ALLOWED' }],
            },
          }),
        })
      : route.abort(),
  );
  await page.goto('http://127.0.0.1:3000/');
  await page
    .getByRole('button', { name: 'Buat photostrip', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent?.trim()),
    'Tambah ke keranjang',
  );
  await page.keyboard.press('Tab');
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-label'),
    ),
    'Tutup pilihan layanan',
  );
  await page.getByLabel('Jumlah', { exact: true }).fill('0');
  assert.equal(
    await page
      .getByRole('button', { name: 'Tambah ke keranjang', exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel('Jumlah', { exact: true }).fill('2');
  await page
    .getByRole('button', { name: 'Opsi tambahan & catatan (opsional)' })
    .click();
  await page.getByLabel('Catatan untuk studio').fill('Warna natural');
  await page
    .getByRole('button', { name: 'Tambah ke keranjang', exact: true })
    .click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('queen_photo_cart')),
  );
  assert.equal(saved.length, 1);
  assert.equal(saved[0].quantity, 2);
  assert.equal(saved[0].notes, 'Warna natural');
  await page.getByRole('button', { name: 'Lanjut ke checkout' }).click();
  assert.equal(
    await page.getByRole('radio', { name: /Ambil di studio/ }).isChecked(),
    true,
  );
  await page.getByLabel('Nama lengkap').fill('Browser test');
  await page.getByLabel('Nomor WhatsApp').fill('081234567890');
  await page.getByRole('radio', { name: /Kirim ke alamat/ }).check();
  await page.getByLabel('Alamat lengkap & patokan').fill('Test address');
  await page
    .getByRole('button', { name: 'Kirim pesanan', exact: true })
    .click();
  await page
    .getByRole('alert')
    .filter({ hasText: 'Pesanan belum tersimpan' })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('queen_photo_cart')).length,
    ),
    1,
  );
  assert.equal(
    await page
      .getByRole('button', { name: 'Kirim pesanan', exact: true })
      .isEnabled(),
    true,
  );
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.reload();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('queen_photo_cart'))[0].quantity,
    ),
    2,
  );
  console.log(
    'PASS mobile customize → cart → checkout; keyboard trap; quantity validation; failed checkout retains cart; reload persistence. No live writes.',
  );
} finally {
  await browser.close();
}
