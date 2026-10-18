import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import * as store from './fakes/firestore';
import type { Order, InventoryItem } from '../src/types';
const hook = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.includes('/src/lib/staffOperations.ts')) {
      if (specifier === 'firebase/firestore')
        return {
          url: new URL('./fakes/firestore.ts', import.meta.url).href,
          shortCircuit: true,
        };
      if (specifier === './firebase')
        return {
          url: new URL('./fakes/firebase.ts', import.meta.url).href,
          shortCircuit: true,
        };
    }
    return next(specifier, context);
  },
});
const { saveWalkin, changeOrderStatus, verifyOrderPayment } = await import(
  '../src/lib/staffOperations'
);
const data = (): Omit<Order, 'id' | 'createdAt'> => ({
  customerName: 'Pelanggan umum',
  customerPhone: '',
  channel: 'WALKIN',
  deliveryMethod: 'AMBIL_STUDIO',
  deliveryFee: 0,
  subtotal: 50000,
  totalAmount: 50000,
  totalCost: 10000,
  totalProfit: 40000,
  paymentMethod: 'TUNAI_KASIR',
  paymentStatus: 'LUNAS',
  orderStatus: 'SELESAI',
  items: [
    {
      id: 'line',
      serviceId: 'prints',
      serviceName: '4R',
      category: 'cetak_foto',
      size: '4R',
      quantity: 10,
      unitPrice: 5000,
      unitCost: 1000,
    },
  ],
});
function setup(stock = 10) {
  store.reset();
  store.seed('inventory/paper', {
    id: 'paper',
    name: 'Paper',
    unit: 'meter',
    currentStock: stock,
    maxStock: 10,
  } as InventoryItem);
  store.seed('services/prints', {
    id: 'prints',
    stockMode: 'automatic',
    unit: '4R',
    materialUsage: [{ inventoryId: 'paper', quantity: 0.102 }],
  });
}
test('saving a multi-material sale and retrying its request ID deducts only once', async () => {
  setup();
  const first = await saveWalkin(data(), 'same');
  const second = await saveWalkin(data(), 'same');
  assert.equal(first.id, second.id);
  assert.equal(store.read('inventory/paper').currentStock, 8.98);
  assert.equal(
    store
      .entries('stock_logs/')
      .filter(([, data]) => data.type !== 'ORDER_STATE').length,
    1,
  );
  assert.equal(first.recordedBy?.uid, 'staff-1');
  assert.ok(first.paidAt);
  await assert.rejects(
    saveWalkin({ ...data(), customerName: 'Different' }, 'same'),
    /sudah tersimpan/,
  );
});
test('insufficient stock rolls back both order and ledger', async () => {
  setup(0.5);
  await assert.rejects(saveWalkin(data(), 'short'), /tidak cukup/);
  assert.equal(store.read('inventory/paper').currentStock, 0.5);
  assert.equal(store.entries('orders/').length, 0);
  assert.equal(
    store
      .entries('stock_logs/')
      .filter(([, data]) => data.type !== 'ORDER_STATE').length,
    0,
  );
});
test('two competing sales cannot overwrite the same stock balance', async () => {
  setup(1.5);
  const result = await Promise.allSettled([
    saveWalkin(data(), 'a'),
    saveWalkin(data(), 'b'),
  ]);
  assert.equal(result.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(store.read('inventory/paper').currentStock, 0.48);
});
test('deferred job consumes on ready and unused cancellation restores exactly once', async () => {
  setup();
  const order = await saveWalkin(
    { ...data(), orderStatus: 'ANTREAN_DESAIN' },
    'later',
  );
  assert.equal(store.read('inventory/paper').currentStock, 10);
  await changeOrderStatus(order.id, 'SIAP_DIAMBIL_KIRIM');
  await changeOrderStatus(order.id, 'SIAP_DIAMBIL_KIRIM');
  assert.equal(store.read('inventory/paper').currentStock, 8.98);
  await changeOrderStatus(order.id, 'DIBATALKAN', {
    reason: 'Customer changed plans',
    materials: 'unused',
  });
  await changeOrderStatus(order.id, 'DIBATALKAN', {
    reason: 'Retry',
    materials: 'unused',
  });
  assert.equal(store.read('inventory/paper').currentStock, 10);
  assert.equal(
    store
      .entries('stock_logs/')
      .filter(([, data]) => data.type !== 'ORDER_STATE').length,
    2,
  );
});
test('cancelling printed materials records waste without inventing stock', async () => {
  setup();
  const o = await saveWalkin(data(), 'waste');
  await changeOrderStatus(o.id, 'DIBATALKAN', {
    reason: 'Printed already',
    materials: 'used',
  });
  assert.equal(store.read('inventory/paper').currentStock, 8.98);
  assert.equal(store.read(`orders/${o.id}`).inventoryStatus, 'WASTED');
});
test('unconfigured material usage is flagged without partial deductions', async () => {
  setup();
  store.seed('services/unknown', { id: 'unknown' });
  const d = data();
  d.items.push({ ...d.items[0], id: 'other', serviceId: 'unknown' });
  const order = await saveWalkin(d, 'review');
  assert.equal(order.inventoryStatus, 'NEEDS_REVIEW');
  assert.equal(store.read('inventory/paper').currentStock, 10);
});
test('payment verification keeps an audit stamp and is idempotent', async () => {
  setup();
  const o = await saveWalkin(
    {
      ...data(),
      paymentStatus: 'BELUM_BAYAR',
      paymentMethod: 'QRIS',
      orderStatus: 'ANTREAN_DESAIN',
    },
    'unpaid',
  );
  assert.equal(o.paidAt, undefined);
  const paid = await verifyOrderPayment(o.id, 'LUNAS');
  const again = await verifyOrderPayment(o.id, 'LUNAS');
  assert.equal(paid.paidAt, again.paidAt);
  assert.equal(paid.paymentVerifiedBy?.uid, 'staff-1');
  assert.equal(paid.history?.filter((e) => e.type === 'payment').length, 1);
});
test('a flagged new sale can be reconciled once after its recipe is configured', async () => {
  setup();
  store.seed('services/prints', { id: 'prints' });
  const order = await saveWalkin(data(), 'fix-later');
  assert.equal(order.inventoryStatus, 'NEEDS_REVIEW');
  store.seed('services/prints', {
    id: 'prints',
    stockMode: 'automatic',
    unit: '4R',
    materialUsage: [{ inventoryId: 'paper', quantity: 0.102 }],
  });
  const { reconcileMaterialUsage } = await import('../src/lib/staffOperations');
  await reconcileMaterialUsage(order.id);
  await reconcileMaterialUsage(order.id);
  assert.equal(store.read('inventory/paper').currentStock, 8.98);
  assert.equal(
    store
      .entries('stock_logs/')
      .filter(([, data]) => data.type !== 'ORDER_STATE').length,
    1,
  );
});
test('a customer-supplied inventory flag cannot fabricate a stock restoration', async () => {
  setup();
  const forged = {
    ...data(),
    channel: 'ONLINE',
    paymentStatus: 'BELUM_BAYAR',
    orderStatus: 'MENUNGGU_BAYAR',
    workflowVersion: 2,
    inventoryStatus: 'DEDUCTED',
    materialUsage: [{ inventoryId: 'paper', quantity: 1000 }],
    id: 'QP-forged',
    createdAt: new Date().toISOString(),
  };
  store.seed('orders/QP-forged', forged);
  await changeOrderStatus('QP-forged', 'DIBATALKAN', {
    reason: 'Rejected request',
    materials: 'unused',
  });
  assert.equal(store.read('inventory/paper').currentStock, 10);
  assert.equal(
    store
      .entries('stock_logs/')
      .filter(([, data]) => data.type !== 'ORDER_STATE').length,
    0,
  );
});
