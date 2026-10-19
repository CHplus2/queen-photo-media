import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Order } from '../src/types';
import { readOrderRecord } from '../src/utils/orderRecords';
import { paidAmount } from '../src/utils/payments';
import { supervision } from '../src/utils/supervision';
const order: Order = {
  id: 'one',
  createdAt: '2026-10-19T02:00:00Z',
  customerName: 'Test',
  customerPhone: '',
  channel: 'ONLINE',
  deliveryMethod: 'AMBIL_STUDIO',
  deliveryFee: 0,
  subtotal: 10000,
  totalAmount: 10000,
  totalCost: 1000,
  totalProfit: 9000,
  paymentMethod: 'QRIS',
  paymentStatus: 'BELUM_BAYAR',
  orderStatus: 'MENUNGGU_BAYAR',
  items: [
    {
      id: 'line',
      serviceId: 'prints',
      serviceName: 'Cetak foto',
      category: 'cetak_foto',
      size: '4R',
      quantity: 2,
      unitPrice: 5000,
      unitCost: 500,
    },
  ],
};
test('unverified customer request cannot fabricate receipts or inventory metadata in reports', () => {
  const forged: Order = {
    ...order,
    paidAt: order.createdAt,
    inventoryStatus: 'DEDUCTED',
    history: [
      {
        type: 'payment',
        at: order.createdAt,
        by: { uid: 'fake', name: 'Fake' },
        detail: 'Verified',
      },
    ],
    payments: [
      {
        id: 'fake',
        amount: 1000000,
        method: 'QRIS',
        at: order.createdAt,
        by: { uid: 'fake', name: 'Fake' },
      },
    ],
  };
  assert.equal(paidAmount(forged), 0);
  assert.equal(supervision([forged], '2026-10-19').payments.length, 0);
  const safe = readOrderRecord('actual-id', forged)!;
  assert.equal(safe.id, 'actual-id');
  assert.equal(safe.payments, undefined);
  assert.equal(safe.paidAt, undefined);
  assert.equal(safe.inventoryStatus, 'PENDING');
  assert.deepEqual(safe.history, []);
});
test('malformed records are rejected without crashing a list of other orders', () => {
  for (const bad of [
    null,
    42,
    { ...order, items: [null] },
    { ...order, items: [{ ...order.items[0], quantity: Infinity }] },
    { ...order, createdAt: {} },
    { ...order, customerName: {} },
    { ...order, totalAmount: NaN },
  ])
    assert.equal(readOrderRecord('bad', bad), null);
  assert.equal(readOrderRecord('good', order)?.totalAmount, 10000);
});
test('verified partial payments remain intact and malformed financial metadata is not silently counted', () => {
  const partial: Order = {
    ...order,
    channel: 'WALKIN',
    paymentStatus: 'SEBAGIAN',
    orderStatus: 'ANTREAN_DESAIN',
    payments: [
      {
        id: 'deposit',
        amount: 4000,
        method: 'TUNAI_KASIR',
        at: order.createdAt,
        by: { uid: 's', name: 'Staff' },
      },
    ],
  };
  const safe = readOrderRecord('partial', partial)!;
  assert.equal(paidAmount(safe), 4000);
  assert.equal(supervision([safe], '2026-10-19').payments[0].totalAmount, 4000);
  assert.equal(
    readOrderRecord('bad', { ...partial, payments: [{ amount: 1000 }] }),
    null,
  );
});
