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
    await page.route('https://**/*', (r) => r.abort());
    const source = await (
      await page.request.get('http://127.0.0.1:3000/src/App.tsx')
    ).text();
    const react = source.match(
      /"(\/node_modules\/\.vite\/deps\/react\.js\?[^"\s]+)"/,
    )?.[1];
    assert.ok(react);
    await page.route('**/src/context/StudioContext.tsx*', (r) =>
      r.fulfill({
        contentType: 'application/javascript',
        body: `import React from '${react}';const C=React.createContext(null);export function StudioProvider({children}){const [view,setView]=React.useState('menu');const [services,setServices]=React.useState([{id:'photo',name:'Cetak 10R',category:'cetak_foto',description:'Foto',basePrice:50000,estimatedCost:10000,unit:'lembar',stockMode:'automatic',materialUsage:[{inventoryId:'paper',quantity:1}],options:{sizes:['10R'],finishes:['Glossy'],frames:['Tanpa Bingkai','Minimalis Hitam']}}]);return React.createElement(C.Provider,{value:{currentView:view,setCurrentView:setView,isSupervisor:true,isAdminAuthenticated:true,activeRole:'ADMIN',setActiveRole:()=>{},cart:[],orders:[],setIsCartOpen:()=>{},logoutAdmin:async()=>{},services,updateService:async(id,patch)=>{window.__calls=(window.__calls||0)+1;await new Promise(r=>setTimeout(r,60));if(window.__failSave)throw new Error('Uji koneksi gagal');window.__recipeReview=Object.hasOwn(patch,'stockMode')&&patch.stockMode===undefined;window.__lastPatch=patch;setServices(old=>old.map(s=>s.id===id?{...s,...patch}:s));},addService:async()=>{throw new Error('No writes')},openOrderWithService:()=>{}}},children)}export const useStudio=()=>React.useContext(C);`,
      }),
    );
    await page.goto('http://127.0.0.1:3000/');
    await page
      .getByRole('heading', { name: 'Produk & harga', exact: true })
      .waitFor();
    let form = page.getByRole('form', { name: 'Ubah Cetak 10R', exact: true });
    assert.equal(
      await form
        .getByRole('textbox', { name: 'Ukuran foto', exact: true })
        .inputValue(),
      '10R',
    );
    await form
      .getByRole('textbox', { name: 'Nama produk', exact: true })
      .fill('Cetak 8R');
    await form
      .getByRole('textbox', { name: 'Nama produk', exact: true })
      .press('Enter');
    await page
      .getByRole('heading', { name: 'Cetak 8R', exact: true })
      .waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    if (process.env.UI_ARTIFACT_DIR)
      await page.screenshot({
        path: process.env.UI_ARTIFACT_DIR + '/catalog-' + width + '.png',
        fullPage: true,
      });
    await page
      .getByRole('button', { name: 'Ukuran foto', exact: true })
      .click();
    form = page.getByRole('form', { name: 'Ubah Cetak 8R', exact: true });
    await form
      .getByRole('textbox', { name: 'Ukuran 1', exact: true })
      .fill('8R');
    await page.evaluate(() => (window.__failSave = true));
    await form.getByRole('button', { name: 'Simpan', exact: true }).click();
    await form
      .getByRole('alert')
      .filter({ hasText: 'Uji koneksi gagal' })
      .waitFor();
    assert.equal(
      await form
        .getByRole('textbox', { name: 'Ukuran 1', exact: true })
        .inputValue(),
      '8R',
    );
    await page.evaluate(() => (window.__failSave = false));
    await form.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Periksa pemakaian bahan' })
      .waitFor();
    assert.equal(await page.evaluate(() => window.__recipeReview), true);
    await page.getByRole('button', { name: 'Bingkai', exact: true }).click();
    await form
      .getByRole('textbox', { name: 'Nama bingkai 2', exact: true })
      .fill('Hitam modern');
    await form.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Tersimpan: Cetak 8R.' })
      .waitFor();
    assert.deepEqual(
      await page.evaluate(
        () => window.__lastPatch.options.framePrices['Hitam modern'],
      ),
      { price: 25000, cost: 12000 },
    );
    assert.deepEqual(
      await page.evaluate(() => window.__lastPatch.options.finishes),
      ['Glossy'],
    );
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
    await page
      .getByRole('combobox', { name: 'Bahasa / Language' })
      .selectOption('en');
    await page
      .getByRole('button', { name: 'Names & prices', exact: true })
      .click();
    await page
      .getByText('English product text (optional)', { exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'English product name', exact: true })
      .fill('8R photo print');
    await page
      .getByRole('textbox', { name: 'English description', exact: true })
      .fill('A photo print for your album');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Saved: Cetak 8R.' })
      .waitFor();
    assert.equal(
      await page.evaluate(() => window.__lastPatch.name),
      'Cetak 8R',
    );
    assert.equal(
      await page.evaluate(() => window.__lastPatch.english.name),
      '8R photo print',
    );
    assert.equal(
      await page.evaluate(() => window.__lastPatch.english.description),
      'A photo print for your album',
    );
    assert.deepEqual(errors, []);
    console.log(
      'PASS ' +
        width +
        'px: direct name edit/Enter save, size rename, failed-save recovery, stock review, frame rename preserves price/cost, no dialog/overflow; fixture only, no live writes.',
    );
    await context.close();
  }
} finally {
  await browser.close();
}
