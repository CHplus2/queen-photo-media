import { selectLanguage } from './language-helper.mjs';
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
    const reactURL = source.match(
      /"(\/node_modules\/\.vite\/deps\/react\.js\?[^"\s]+)"/,
    )?.[1];
    assert.ok(reactURL);
    // This context replacement exists only in the test browser. It does not grant real staff access.
    const fixture = `import React from '${reactURL}';const {createContext,useContext,useState}=React;
 const C=createContext(null);const services=[{id:'prints',name:'Cetak 4R',category:'cetak_foto',description:'Foto standar',basePrice:5000,estimatedCost:1000,unit:'lembar',stockMode:'automatic',materialUsage:[{inventoryId:'paper',quantity:.102}]},{id:'passport',name:'Pas foto',category:'pas_foto',description:'Paket pas foto',basePrice:25000,estimatedCost:5000,unit:'paket',stockMode:'none'}];
 export function StudioProvider({children}){const [view,setView]=useState('pos');const [orders,setOrders]=useState([]);const [cart,setCart]=useState([]);const [open,setOpen]=useState(false);const now=()=>new Date().toISOString();const by={uid:'test',name:'Staff Uji'};
 const value={services,orders,cart,setIsCartOpen:setOpen,isCartOpen:open,activeRole:'ADMIN',isAdminAuthenticated:true,isSupervisor:!window.__cashierOnly,currentView:view,setCurrentView:setView,setActiveRole:()=>{},logoutAdmin:async()=>{},monthlyRevenueTarget:30000000,inventoryReady:true,isFirebaseConnected:true,stockLogs:[],inventory:[{id:'paper',name:'Kertas foto',currentStock:10,maxStock:20,lowStockThreshold:2,unit:'meter',type:'ROLL',costPerUnit:1}],rollConfigs:[{id:'roll',name:'Roll Uji',rollWidthCm:15.2,rollLengthMeter:65,rollCostIdr:420000,inkCostPerSqMeter:15000,overheadPerUnit:500}],sheetConfigs:[{id:'sheet',sizeName:'A4',costPerSheetIdr:2000,inkCostIdr:1000,overheadIdr:200}],updateRollConfig:()=>{if(window.__failConfig)throw new Error('storage failed');},updateSheetConfig:()=>{if(window.__failConfig)throw new Error('storage failed');},surveys:[],adminEmail:'test@example.test',
 addOrder:async(data,id)=>{window.__saveCalls=(window.__saveCalls||0)+1;await new Promise(r=>setTimeout(r,120));const order={...data,id:'QP-'+id,createdAt:now(),payments:data.initialPaymentAmount>0?[{id:'initial',amount:data.initialPaymentAmount,method:data.paymentMethod,at:now(),by}]:[],recordedBy:by,workflowVersion:2,inventoryStatus:data.orderStatus==='SELESAI'?'DEDUCTED':'PENDING',...(data.paymentStatus==='LUNAS'?{paidAt:now(),paymentVerifiedBy:by}:{}),history:[]};setOrders(old=>[order,...old]);window.__lastSale=order;return order;},
 updateOrderStatus:async(id,status,cancel)=>{window.__lastStatus={id,status,cancel};setOrders(old=>old.map(o=>o.id===id?{...o,orderStatus:status,cancellationReason:cancel?.reason,cancelledAt:status==='DIBATALKAN'?now():undefined}:o));},
 updateOrderPayment:async(id,paymentStatus,payment)=>{window.__paymentCalls=(window.__paymentCalls||0)+1;window.__lastPayment={id,paymentStatus};setOrders(old=>old.map(o=>o.id===id?{...o,paymentStatus,payments:[...(o.payments||[]),{id:payment.id,amount:payment.amount,method:payment.method,at:now(),by}],paidAt:now(),paymentVerifiedBy:by}:o));},
 reconcileStock:async()=>{},recordInventoryCount:async()=>{},createInventoryItem:async()=>{},updateService:async()=>{},triggerPasswordReset:async()=>{},setMonthlyRevenueTarget:()=>{},setIsSurveyModalOpen:()=>{},setIsOrderModalOpen:()=>{},restockItem:async()=>{},clearCart:()=>setCart([])};
 return React.createElement(C.Provider,{value},children);}export function useStudio(){return useContext(C);}`;
    await page.route('**/src/context/StudioContext.tsx*', (r) =>
      r.fulfill({ contentType: 'application/javascript', body: fixture }),
    );
    await page.goto('http://127.0.0.1:3000/');
    await page
      .getByRole('button', { name: /(?:Cetak 4R|4R print) Rp/ })
      .click();
    await page.getByRole('button', { name: /Pas foto Rp/ }).click();
    await page
      .getByRole('spinbutton', { name: 'Jumlah', exact: true })
      .first()
      .fill('2');
    await page
      .getByRole('spinbutton', {
        name: 'Uang diterima (Rp, untuk hitung kembalian)',
      })
      .fill('50000');
    await page.getByText(/Kembalian Rp/).waitFor();
    assert.match(
      await page.getByText(/Kembalian Rp/).textContent(),
      /15[.]000/,
    );
    // An interrupted shift/browser restart must retain the same sale request ID.
    const draftBefore = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('queen_staff_sale_staff')),
    );
    await page.reload();
    await page
      .getByRole('button', { name: 'Simpan penjualan', exact: true })
      .waitFor();
    const draftAfter = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('queen_staff_sale_staff')),
    );
    assert.equal(draftAfter.requestId, draftBefore.requestId);
    assert.equal(draftAfter.items.length, 2);
    assert.equal(draftAfter.cashTendered, '50000');
    if (process.env.UI_ARTIFACT_DIR)
      await page.screenshot({
        path: process.env.UI_ARTIFACT_DIR + '/cashier-' + width + '.png',
        fullPage: true,
      });
    await page
      .getByRole('button', { name: 'Simpan penjualan', exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await page.getByRole('heading', { name: /Penjualan tersimpan/ }).waitFor();
    assert.equal(await page.evaluate(() => window.__saveCalls), 1);
    const sale = await page.evaluate(() => window.__lastSale);
    assert.equal(sale.items.length, 2);
    assert.equal(sale.totalAmount, 35000);
    assert.equal(sale.customerName, 'Pelanggan umum');
    assert.equal(sale.customerPhone, '');
    assert.equal(sale.orderStatus, 'SELESAI');
    assert.equal(sale.paymentStatus, 'LUNAS');
    await page
      .getByRole('button', { name: /(?:Cetak 4R|4R print) Rp/ })
      .click();
    await page.getByRole('checkbox', { name: /Dikerjakan/ }).check();
    await page
      .getByRole('textbox', { name: 'Nama pelanggan', exact: true })
      .fill('Pelanggan Nanti');
    await page.getByRole('radio', { name: 'QRIS', exact: true }).check();
    assert.equal(
      await page.getByRole('checkbox', { name: /Uang masuk/ }).isChecked(),
      false,
    );
    await page
      .getByRole('button', { name: 'Simpan penjualan', exact: true })
      .click();
    await page.getByRole('heading', { name: /Penjualan tersimpan/ }).waitFor();
    await page.waitForFunction(
      () => window.__lastSale.customerName === 'Pelanggan Nanti',
    );
    const later = await page.evaluate(() => window.__lastSale);
    assert.equal(later.paymentStatus, 'BELUM_BAYAR');
    assert.equal(later.orderStatus, 'ANTREAN_DESAIN');
    const nav = async (label) => {
      if (width < 1280) {
        await page
          .getByRole('button', { name: /^(Buka menu|Open menu)$/, exact: true })
          .click();
        await page
          .getByRole('navigation', { name: /^(Menu seluler|Mobile menu)$/ })
          .getByRole('button', { name: label, exact: true })
          .click();
      } else
        await page
          .getByRole('navigation', {
            name: /^(Navigasi staf|Staff navigation)$/,
          })
          .getByRole('button', { name: label, exact: true })
          .click();
    };
    await nav('Pesanan');
    await page
      .getByRole('article')
      .filter({ hasText: 'Pelanggan Nanti' })
      .getByRole('button', { name: 'Buka pesanan' })
      .click();
    await page
      .getByRole('button', { name: 'Periksa pembayaran', exact: true })
      .click();
    await page
      .getByRole('button', { name: /Uang sudah masuk/ })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    assert.equal(await page.evaluate(() => window.__paymentCalls), 1);
    await page.getByText('Pembayaran diperiksa: Staff Uji').waitFor();
    await page
      .getByRole('button', {
        name: 'Pekerjaan selesai — siap diambil',
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: 'Sudah diserahkan — selesai', exact: true })
      .click();
    assert.equal(
      (await page.evaluate(() => window.__lastStatus)).status,
      'SELESAI',
    );
    await page.keyboard.press('Escape');
    await nav('Kasir');
    await page.getByRole('button', { name: /Pas foto Rp/ }).click();
    await page.getByRole('checkbox', { name: 'Bayar sebagian / DP' }).check();
    await page
      .getByRole('spinbutton', { name: 'Pembayaran sekarang (Rp)' })
      .fill('10000');
    await page.getByText(/Sisa bayar Rp/).waitFor();
    await page
      .getByRole('textbox', { name: /Nama pelanggan/, exact: false })
      .first()
      .fill('Pelanggan DP');
    await page
      .getByRole('button', { name: 'Simpan penjualan', exact: true })
      .click();
    await page.getByRole('heading', { name: /Penjualan tersimpan/ }).waitFor();
    const deposit = await page.evaluate(() => window.__lastSale);
    assert.equal(deposit.paymentStatus, 'SEBAGIAN');
    assert.equal(deposit.initialPaymentAmount, 10000);
    await nav('Pesanan');
    const openCustomer = async (name) =>
      page
        .getByRole('article')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Buka pesanan', exact: true })
        .click();
    await openCustomer('Pelanggan DP');
    await page
      .getByRole('button', { name: 'Batalkan pesanan', exact: true })
      .click();
    await page
      .getByLabel('Alasan pembatalan', { exact: true })
      .fill('Batal untuk pelanggan DP saja');
    await page
      .getByLabel('Bahan sudah terpakai?', { exact: true })
      .selectOption('unused');
    await page
      .getByRole('button', { name: 'Tutup pesanan', exact: true })
      .click();
    await page
      .getByRole('combobox', { name: 'Tampilkan pesanan' })
      .selectOption('all');
    await openCustomer('Pelanggan Nanti');
    await page
      .getByRole('button', { name: 'Batalkan pesanan', exact: true })
      .click();
    assert.equal(
      await page.getByLabel('Alasan pembatalan', { exact: true }).inputValue(),
      '',
    );
    assert.equal(
      await page
        .getByLabel('Bahan sudah terpakai?', { exact: true })
        .inputValue(),
      'used',
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'Konfirmasi pembatalan', exact: true })
        .isDisabled(),
      true,
    );
    await page
      .getByRole('button', { name: 'Tutup pesanan', exact: true })
      .click();
    await nav('Ringkasan toko');
    await page
      .getByRole('heading', { name: 'Ringkasan toko', exact: true })
      .waitFor();
    assert.ok(
      (
        await page
          .getByRole('link', { name: 'Bagikan ke WhatsApp' })
          .getAttribute('href')
      ).startsWith('https://wa.me/?text='),
    );
    await page
      .getByText('Hitung uang & tutup kas hari ini', { exact: true })
      .click();
    await page
      .getByRole('spinbutton', { name: 'Uang awal laci (Rp)', exact: true })
      .fill('100000');
    await page
      .getByRole('spinbutton', {
        name: 'Pengeluaran / refund tunai hari ini (Rp)',
        exact: true,
      })
      .fill('5000');
    await page
      .getByRole('spinbutton', {
        name: 'Uang tunai yang dihitung sekarang (Rp)',
        exact: true,
      })
      .fill('140000');
    await page
      .getByRole('textbox', {
        name: 'Catatan pengeluaran / selisih',
        exact: true,
      })
      .fill('Beli plastik');
    assert.match(
      await page.getByText(/Kas seharusnya Rp/).textContent(),
      /140[.]000/,
    );
    assert.match(await page.getByText(/Selisih Rp/).textContent(), /Rp\s*0/);
    if (process.env.UI_ARTIFACT_DIR)
      await page.screenshot({
        path: process.env.UI_ARTIFACT_DIR + '/owner-' + width + '.png',
        fullPage: true,
      });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
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
    await nav('Pengaturan');
    await page
      .locator('article')
      .filter({
        has: page.getByRole('heading', {
          name: 'Kalkulator biaya',
          exact: true,
        }),
      })
      .getByRole('button', { name: 'Buka', exact: true })
      .click();
    await page
      .getByRole('heading', {
        name: 'Kalkulasi Otomatis Laba Kertas Roll vs Lembaran',
      })
      .waitFor();
    await page
      .getByLabel('Lebar Potongan Cetak (cm):', { exact: true })
      .fill('20');
    await page
      .getByLabel('Panjang Potongan Cetak (cm):', { exact: true })
      .fill('30');
    await page.getByText('~0', { exact: false }).waitFor();
    await page.getByLabel('Panjang Roll (Meter):', { exact: true }).fill('0');
    await page
      .getByRole('button', { name: 'Simpan Konfigurasi Roll Ini', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Isi ukuran lebih dari nol' })
      .waitFor();
    await page.getByLabel('Panjang Roll (Meter):', { exact: true }).fill('65');
    await page.evaluate(() => (window.__failConfig = true));
    await page
      .getByRole('button', { name: 'Simpan Konfigurasi Roll Ini', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Gagal menyimpan konfigurasi' })
      .waitFor();
    await page.evaluate(() => (window.__failConfig = false));
    await page
      .getByRole('button', { name: 'Simpan Konfigurasi Roll Ini', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Konfigurasi tersimpan di perangkat ini saja.' })
      .waitFor();
    await nav('Inventaris');
    await page.getByText('Atur pemakaian per layanan', { exact: true }).click();
    await page.getByLabel('Layanan', { exact: true }).selectOption('prints');
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
    await selectLanguage(page, 'en');
    await page
      .getByRole('heading', {
        name: 'Automatic material settings',
        exact: true,
      })
      .waitFor();
    await nav('Shop summary');
    await page
      .getByText("Count cash & close today's drawer", { exact: true })
      .click();
    await page
      .getByRole('spinbutton', {
        name: 'Opening cash (Rp)',
        exact: true,
      })
      .waitFor();
    await nav('Cashier');
    await page.getByRole('heading', { name: 'Cashier', exact: true }).waitFor();
    await page
      .getByRole('button', { name: /(?:Cetak 4R|4R print) Rp/ })
      .click();
    await page
      .getByRole('spinbutton', { name: 'Quantity', exact: true })
      .fill('2');
    await page
      .getByRole('spinbutton', {
        name: 'Cash received (Rp, to calculate change)',
        exact: true,
      })
      .fill('100000');
    assert.match(await page.getByText(/Change: Rp/).textContent(), /90,000/);
    await selectLanguage(page, 'id');
    assert.equal(
      await page
        .getByRole('spinbutton', { name: 'Jumlah', exact: true })
        .inputValue(),
      '2',
    );
    assert.equal(
      await page
        .getByRole('spinbutton', {
          name: 'Uang diterima (Rp, untuk hitung kembalian)',
          exact: true,
        })
        .inputValue(),
      '100000',
    );
    await page
      .getByRole('button', { name: 'Simpan penjualan', exact: true })
      .click();
    await page.getByRole('heading', { name: /Penjualan tersimpan/ }).waitFor();
    await page.addInitScript(() => {
      window.__cashierOnly = true;
    });
    await page.reload();
    await page.getByRole('heading', { name: 'Kasir', exact: true }).waitFor();
    if (width < 1280)
      await page
        .getByRole('button', { name: /^(Buka menu|Open menu)$/, exact: true })
        .click();
    const cashierNav = page.getByRole('navigation', {
      name: width < 1280 ? 'Menu seluler' : 'Navigasi staf',
    });
    assert.equal(
      await cashierNav
        .getByRole('button', { name: 'Pengaturan', exact: true })
        .count(),
      0,
    );
    assert.equal(
      await cashierNav
        .getByRole('button', { name: 'Inventaris', exact: true })
        .count(),
      0,
    );
    assert.equal(
      await cashierNav
        .getByRole('button', { name: 'Penjualan hari ini', exact: true })
        .count(),
      1,
    );
    console.log(
      'PASS ' +
        width +
        'px: cash change, recovered draft ID, deposit, multi-item sale, duplicate protection, deferred job, payment verification, ready/handover, owner recap, cashier navigation. Test fixture only; no live writes.',
    );
    await context.close();
  }
} finally {
  await browser.close();
}
