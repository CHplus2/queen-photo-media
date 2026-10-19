import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../src/i18n/en';
import { tr, setLanguage, getLocale } from '../src/i18n/runtime';
import {
  formatRupiah,
  formatDateTime,
  createWhatsAppOrderLink,
} from '../src/utils/formatters';
import { serviceText, orderItemName } from '../src/i18n/catalogText';
import { businessDate } from '../src/utils/sales';
import type { Order, ServiceItem } from '../src/types';
test('language preference changes application text, not identifiers or user content', async () => {
  await setLanguage('id');
  assert.equal(tr('Simpan'), 'Simpan');
  await setLanguage('en');
  assert.equal(tr('Simpan'), 'Save');
  assert.equal(tr('Kasir'), 'Cashier');
  assert.equal(tr('Nama pelanggan'), 'Customer name');
  assert.equal(
    tr('Tersimpan: Simpan. Periksa pemakaian bahan ukuran baru di Inventaris.'),
    'Saved: Simpan. Review material usage for the new size in Inventory.',
  );
  assert.equal(
    tr('Catatan pribadi pelanggan tentang warna foto'),
    'Catatan pribadi pelanggan tentang warna foto',
  );
  assert.equal(tr('cetak_foto'), 'cetak_foto');
  await setLanguage('id');
});
test('all translation templates preserve their dynamic parameters', () => {
  for (const [source, translated] of Object.entries(en)) {
    const placeholders = (s: string) =>
      [...s.matchAll(/\{\d+\}/g)].map((m) => m[0]).sort();
    assert.deepEqual(placeholders(translated), placeholders(source), source);
  }
});
test('currencies and human dates use the selected language while accounting dates stay in WIB', async () => {
  const instant = '2026-10-18T18:30:00Z';
  await setLanguage('id');
  assert.match(formatRupiah(15000), /15\.000/);
  assert.match(formatDateTime(instant), /19/);
  await setLanguage('en');
  assert.match(formatRupiah(15000), /Rp/);
  assert.match(formatRupiah(15000), /15,000/);
  assert.equal(getLocale(), 'en-GB');
  assert.equal(businessDate(instant), '2026-10-19');
  await setLanguage('id');
});
test('optional English catalog and historical names use explicit translations and do not mutate records', async () => {
  const service: ServiceItem = {
    id: 'photo',
    name: 'Cetak 8R',
    description: 'Cetak foto',
    unit: 'lembar',
    category: 'cetak_foto',
    basePrice: 50000,
    estimatedCost: 10000,
    english: {
      name: '8R photo print',
      description: 'Photo printing',
      unit: 'print',
    },
  };
  const item = {
    id: 'line',
    serviceId: 'photo',
    serviceName: 'Cetak 10R',
    serviceNameEn: '10R photo print',
    category: 'cetak_foto' as const,
    size: '10R',
    quantity: 1,
    unitPrice: 50000,
    unitCost: 10000,
  };
  const order: Order = {
    id: 'QP-original',
    createdAt: '2026-10-19T01:00:00Z',
    customerName: 'Simpan',
    customerPhone: '081234567890',
    channel: 'WALKIN',
    deliveryMethod: 'AMBIL_STUDIO',
    deliveryFee: 0,
    items: [item],
    subtotal: 50000,
    totalAmount: 50000,
    totalCost: 10000,
    totalProfit: 40000,
    paymentMethod: 'TUNAI_KASIR',
    paymentStatus: 'BELUM_BAYAR',
    orderStatus: 'ANTREAN_DESAIN',
  };
  const original = JSON.stringify(order);
  await setLanguage('en');
  assert.equal(serviceText(service, 'name'), '8R photo print');
  assert.equal(orderItemName(item), '10R photo print');
  const text = new URL(createWhatsAppOrderLink(order)).searchParams.get(
    'text',
  )!;
  assert.match(text, /Hello Simpan/);
  assert.match(text, /10R photo print/);
  assert.match(text, /Unpaid/);
  assert.match(text, /QP-original/);
  assert.equal(JSON.stringify(order), original);
  await setLanguage('id');
  assert.equal(orderItemName(item), 'Cetak 10R');
});
