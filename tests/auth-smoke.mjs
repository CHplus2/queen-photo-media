// Exercise the real StudioProvider with test-only Firebase transport replacements.
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
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem(
      'queen_photo_surveys',
      '[{"customerName":"Private old survey"}]',
    );
    localStorage.setItem('queen_2fa_secret', 'old-secret');
    localStorage.setItem('queen_2fa_enabled', 'true');
  });
  await page.route('https://**/*', (r) => r.abort());
  await page.route('**/src/lib/firebase.ts*', (r) =>
    r.fulfill({
      contentType: 'application/javascript',
      body: 'export const auth={currentUser:null}; export const db={};',
    }),
  );
  await page.route('**/firebase_auth.js*', (r) =>
    r.fulfill({
      contentType: 'application/javascript',
      body: `
 import {auth} from '/src/lib/firebase.ts'; const listeners=new Set();
 async function emit(user){auth.currentUser=user;await Promise.all([...listeners].map(cb=>cb(user)));}
 window.__emitStaff=()=>emit({uid:'staff',email:'staff@example.test',getIdTokenResult:async()=>({claims:{staff:true,owner:true}})});
 window.__beginDelayed=()=>{let resolve;const promise=new Promise(r=>resolve=r);window.__finishDelayed=()=>resolve({claims:{staff:true,owner:true}});emit({uid:'slow',getIdTokenResult:()=>promise});};
 window.__emitLogout=()=>emit(null);
 export const onIdTokenChanged=(_,cb)=>{listeners.add(cb);queueMicrotask(()=>cb(auth.currentUser));return()=>listeners.delete(cb);};
 export const signOut=async()=>{if(window.__failLogout)throw new Error('Test failure');await emit(null);};
 export const signInAnonymously=async()=>{throw new Error('No writes in tests');};
 export const signInWithEmailAndPassword=async()=>{throw new Error('No writes in tests');};
 export const sendPasswordResetEmail=async(_,email)=>{if(email.startsWith('missing'))throw {code:'auth/user-not-found'};};
 export const updatePassword=async()=>{};
 `,
    }),
  );
  await page.route('**/firebase_firestore.js*', (r) =>
    r.fulfill({
      contentType: 'application/javascript',
      body: `
 import {auth} from '/src/lib/firebase.ts';
 window.__subscriptions=[];
 export const collection=(_,path)=>({path}); export const doc=(_,path,id)=>({path:path+'/'+id});
 export const query=(ref,...parts)=>({...ref,parts});export const where=(...values)=>({where:values});export const orderBy=(...values)=>({orderBy:values});export const limit=(n)=>({limit:n});
 const sale={id:'private-sale',ownerUid:'staff',createdAt:'2026-10-19T03:00:00Z',customerName:'Private Customer',customerPhone:'',channel:'WALKIN',deliveryMethod:'AMBIL_STUDIO',deliveryFee:0,subtotal:10000,totalAmount:10000,totalCost:1000,totalProfit:9000,paymentMethod:'TUNAI_KASIR',paymentStatus:'LUNAS',orderStatus:'SELESAI',items:[{id:'line',serviceId:'prints',serviceName:'Cetak foto',category:'cetak_foto',size:'4R',quantity:2,unitPrice:5000,unitCost:500}]};
 export const onSnapshot=(ref,...args)=>{window.__subscriptions.push(ref);const cb=args.find(a=>typeof a==='function');let active=true;queueMicrotask(()=>{if(!active)return;const values=ref.path==='orders' && !ref.parts && auth.currentUser?.uid==='staff'?[sale]:[];const docs=values.map(value=>({id:value.id,data:()=>value}));cb({empty:!docs.length,docs,forEach:fn=>docs.forEach(fn),metadata:{fromCache:false,hasPendingWrites:false},exists:()=>false});});return()=>{active=false;};};
 export const setDoc=async()=>{throw new Error('No writes');};export const deleteDoc=setDoc;export const updateDoc=setDoc;export const runTransaction=setDoc;
 `,
    }),
  );
  await page.goto('http://127.0.0.1:3000/');
  await page.getByRole('heading', { name: /Cetak foto, pas foto/ }).waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem('queen_photo_surveys')),
    null,
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem('queen_2fa_secret')),
    null,
  );
  await page.evaluate(() => window.__emitStaff());
  await page
    .getByRole('button', { name: 'Keluar dari akun staf', exact: true })
    .waitFor();
  await page
    .getByRole('navigation', { name: 'Navigasi staf' })
    .getByRole('button', { name: 'Pesanan', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Tampilkan pesanan' })
    .selectOption('all');
  await page.getByText('Private Customer', { exact: true }).waitFor();
  await page.evaluate(() => (window.__failLogout = true));
  await page
    .getByRole('button', { name: 'Keluar dari akun staf', exact: true })
    .click();
  await page
    .getByRole('alert')
    .filter({ hasText: 'Belum berhasil keluar' })
    .waitFor();
  assert.equal(
    await page.getByRole('navigation', { name: 'Navigasi staf' }).count(),
    1,
  );
  await page.evaluate(() => (window.__failLogout = false));
  await page
    .getByRole('button', { name: 'Keluar dari akun staf', exact: true })
    .click();
  await page.getByRole('navigation', { name: 'Navigasi utama' }).waitFor();
  assert.equal(
    await page.getByText('Private Customer', { exact: true }).count(),
    0,
  );
  await page
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('button', { name: 'Lacak pesanan', exact: true })
    .click();
  await page.getByLabel('Nomor pesanan', { exact: true }).fill('private-sale');
  await page.locator('main form').evaluate((form) => form.requestSubmit());
  assert.equal(
    await page.getByText('Private Customer', { exact: true }).count(),
    0,
  );
  await page.evaluate(() => window.__beginDelayed());
  await page.evaluate(() => window.__emitLogout());
  await page.evaluate(() => window.__finishDelayed());
  assert.equal(
    await page.getByRole('navigation', { name: 'Navigasi staf' }).count(),
    0,
    'A stale token promise must not restore staff access.',
  );
  assert.equal(
    await page.evaluate(() =>
      window.__subscriptions.some((s) => s.path === 'admins/heroch94'),
    ),
    false,
  );
  await page.getByRole('button', { name: 'Staf', exact: true }).click();
  await page.getByLabel('Email staf').fill('missing@example.test');
  await page
    .getByRole('button', { name: 'Lupa kata sandi?', exact: true })
    .click();
  const missing = await page
    .getByRole('status')
    .filter({ hasText: 'Jika alamat ini terdaftar' })
    .textContent();
  await page.getByLabel('Email staf').fill('exists@example.test');
  await page
    .getByRole('button', { name: 'Lupa kata sandi?', exact: true })
    .click();
  assert.equal(
    await page
      .getByRole('status')
      .filter({ hasText: 'Jika alamat ini terdaftar' })
      .textContent(),
    missing,
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS real provider: private cache cleanup, failed/successful logout, customer isolation, stale token race, no legacy secret subscription, neutral password reset responses. Firebase transport mocked; no live writes.',
  );
  await context.close();
} finally {
  await browser.close();
}
