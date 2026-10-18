import { test } from 'node:test';
import assert from 'node:assert/strict';
import { businessDate, reportableOrders, salesSummary } from '../src/utils/sales';
import { generateWhatsAppRecapText } from '../src/utils/formatters';
import type { Order } from '../src/types';
const order = (changes: Partial<Order> = {}): Order => ({ id: 'one', createdAt: '2026-10-18T03:00:00Z', customerName: 'Test', customerPhone: '', channel: 'ONLINE', deliveryMethod: 'AMBIL_STUDIO', deliveryFee: 10000, items: [], subtotal: 100000, totalAmount: 100000, totalCost: 40000, totalProfit: 999999, paymentMethod: 'QRIS', paymentStatus: 'LUNAS', orderStatus: 'SELESAI', ...changes });
test('WIB month boundaries include late UTC evening in the next month', () => {
  assert.equal(businessDate('2026-09-30T18:00:00Z'), '2026-10-01');
  assert.equal(reportableOrders([order({createdAt:'2026-09-30T18:00:00Z'})], '2026-10').length, 1);
});
test('reports exclude unpaid, cancelled, invalid and other-month orders', () => {
  const data = [order(), order({paymentStatus:'BELUM_BAYAR'}), order({orderStatus:'DIBATALKAN'}), order({createdAt:'bad'}), order({createdAt:'2026-09-18T03:00:00Z'})];
  assert.equal(reportableOrders(data,'2026-10').length, 1);
});
test('gross profit uses discounted merchandise revenue, excludes delivery and ignores stale stored profit', () => {
  assert.deepEqual(salesSummary([order()]), { revenue: 90000, cost:40000, profit:50000 });
});
test('daily export does not include unpaid or cancelled transactions', () => {
  const now = new Date().toISOString();
  const text = generateWhatsAppRecapText([order({createdAt:now,customerName:'Paid'}),order({createdAt:now,customerName:'Unpaid',paymentStatus:'BELUM_BAYAR'}),order({createdAt:now,customerName:'Cancelled',orderStatus:'DIBATALKAN'})]);
  assert.match(text,/Paid/); assert.doesNotMatch(text,/Unpaid|Cancelled|Laba Bersih/);
});
