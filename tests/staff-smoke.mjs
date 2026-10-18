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
 const value={services,orders,cart,setIsCartOpen:setOpen,isCartOpen:open,activeRole:'ADMIN',isAdminAuthenticated:true,currentView:view,setCurrentView:setView,setActiveRole:()=>{},logoutAdmin:async()=>{},monthlyRevenueTarget:30000000,inventoryReady:true,isFirebaseConnected:true,stockLogs:[],inventory:[{id:'paper',name:'Kertas foto',currentStock:10,maxStock:20,lowStockThreshold:2,unit:'meter',type:'ROLL',costPerUnit:1}],rollConfigs:[],sheetConfigs:[],surveys:[],adminEmail:'test@example.test',
 addOrder:async(data,id)=>{window.__saveCalls=(window.__saveCalls||0)+1;await new Promise(r=>setTimeout(r,120));const order={...data,id:'QP-'+id,createdAt:now(),recordedBy:by,workflowVersion:2,inventoryStatus:data.orderStatus==='SELESAI'?'DEDUCTED':'PENDING',...(data.paymentStatus==='LUNAS'?{paidAt:now(),paymentVerifiedBy:by}:{}),history:[]};setOrders(old=>[order,...old]);window.__lastSale=order;return order;},
 updateOrderStatus:async(id,status,cancel)=>{window.__lastStatus={id,status,cancel};setOrders(old=>old.map(o=>o.id===id?{...o,orderStatus:status,cancellationReason:cancel?.reason,cancelledAt:status==='DIBATALKAN'?now():undefined}:o));},
 updateOrderPayment:async(id,paymentStatus)=>{window.__lastPayment={id,paymentStatus};setOrders(old=>old.map(o=>o.id===id?{...o,paymentStatus,paidAt:now(),paymentVerifiedBy:by}:o));},
 reconcileStock:async()=>{},recordInventoryCount:async()=>{},createInventoryItem:async()=>{},updateService:async()=>{},triggerPasswordReset:async()=>{},setMonthlyRevenueTarget:()=>{},setIsSurveyModalOpen:()=>{},setIsOrderModalOpen:()=>{},restockItem:async()=>{},clearCart:()=>setCart([])};
 return React.createElement(C.Provider,{value},children);}export function useStudio(){return useContext(C);}`;
    await page.route('**/src/context/StudioContext.tsx*', (r) =>
      r.fulfill({ contentType: 'application/javascript', body: fixture }),
    );
    await page.goto('http://127.0.0.1:3000/');
    await page.getByRole('button', { name: /Cetak 4R Rp/ }).click();
    await page.getByRole('button', { name: /Pas foto Rp/ }).click();
    await page
      .getByRole('spinbutton', { name: 'Jumlah', exact: true })
      .first()
      .fill('2');
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
    await page.getByRole('button', { name: /Cetak 4R Rp/ }).click();
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
          .getByRole('button', { name: 'Buka menu', exact: true })
          .click();
        await page
          .getByRole('navigation', { name: 'Menu seluler' })
          .getByRole('button', { name: label, exact: true })
          .click();
      } else
        await page
          .getByRole('navigation', { name: 'Navigasi staf' })
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
    await page.getByRole('button', { name: /Uang sudah masuk/ }).click();
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
    console.log(
      'PASS ' +
        width +
        'px: multi-item sale, optional customer, duplicate-click protection, unpaid deferred job, payment verification, ready/handover, owner recap. Test fixture only; no live writes.',
    );
    await context.close();
  }
} finally {
  await browser.close();
}
