import { test } from 'node:test';
import assert from 'node:assert/strict';
import { supervision } from '../src/utils/supervision';
import type { Order } from '../src/types';
const base: Order = {
  customerName: 'Test',
  customerPhone: '',
  channel: 'ONLINE',
  deliveryMethod: 'AMBIL_STUDIO',
  subtotal: 50000,
  totalProfit: 40000,
  paymentMethod: 'QRIS',
  id: 'one',
  createdAt: '2026-10-18T01:00:00Z',
  paidAt: '2026-10-19T01:00:00Z',
  paymentStatus: 'LUNAS',
  orderStatus: 'SELESAI',
  totalAmount: 60000,
  deliveryFee: 10000,
  totalCost: 10000,
  items: [],
};
test('owner separates order-day revenue from later payment-day receipts', () => {
  const report = supervision([base], '2026-10-19');
  assert.equal(report.sales.revenue, 0);
  assert.equal(report.payments.length, 1);
});
test('paid cancellation stays visible for refund review and gross receipts', () => {
  const report = supervision(
    [
      {
        ...base,
        orderStatus: 'DIBATALKAN',
        cancelledAt: '2026-10-19T02:00:00Z',
      },
    ],
    '2026-10-19',
  );
  assert.equal(report.refundsToCheck.length, 1);
  assert.equal(report.payments.length, 1);
  assert.equal(report.sales.revenue, 0);
});
test('legacy payment dates are explicitly counted and malformed dates do not crash', () => {
  const report = supervision(
    [
      { ...base, paidAt: undefined },
      { ...base, id: 'bad', createdAt: 'invalid', paidAt: undefined },
    ],
    '2026-10-18',
  );
  assert.equal(report.legacyPayments, 1);
  assert.equal(report.today.length, 1);
});
