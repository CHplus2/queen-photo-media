import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  materialPlan,
  stockBalance,
  inventoryAction,
  validateSale,
} from '../src/utils/workflow';
import type {
  InventoryItem,
  Order,
  OrderItem,
  ServiceItem,
} from '../src/types';
const item: OrderItem = {
  id: 'line',
  serviceId: 'prints',
  serviceName: 'Prints',
  category: 'cetak_foto',
  size: '4R',
  quantity: 10,
  unitPrice: 5000,
  unitCost: 1000,
};
const service: ServiceItem = {
  id: 'prints',
  name: 'Prints',
  category: 'cetak_foto',
  description: '',
  basePrice: 5000,
  estimatedCost: 1000,
  unit: 'lembar',
  stockMode: 'automatic',
  materialUsage: [{ inventoryId: 'paper', quantity: 0.102 }],
};
test('materials aggregate per package without rounding each line down', () => {
  const result = materialPlan(
    [item, { ...item, id: 'other', quantity: 5 }],
    [service],
  );
  assert.deepEqual(result, {
    usage: [{ inventoryId: 'paper', quantity: 1.53 }],
    missing: [],
  });
});
test('unknown service, optional frames and nonstandard sizes are flagged rather than guessed', () => {
  assert.equal(materialPlan([item], []).missing.length, 1);
  assert.equal(
    materialPlan([{ ...item, frame: 'Kayu' }], [service]).missing.length,
    1,
  );
  assert.equal(
    materialPlan(
      [{ ...item, size: '5R' }],
      [{ ...service, options: { sizes: ['4R', '5R'] } }],
    ).missing.length,
    1,
  );
});
test('insufficient stock rejects instead of clamping to zero', () => {
  assert.throws(
    () =>
      stockBalance(
        { name: 'Paper', unit: 'meter', currentStock: 1 } as InventoryItem,
        1.02,
        -1,
      ),
    /tidak cukup/,
  );
});
test('cancellation distinguishes unused material from consumed material and duplicate transitions', () => {
  const order = {
    workflowVersion: 2,
    orderStatus: 'SELESAI',
    inventoryStatus: 'DEDUCTED',
  } as Order;
  assert.equal(inventoryAction(order, 'DIBATALKAN', 'unused'), 'restore');
  assert.equal(inventoryAction(order, 'DIBATALKAN', 'used'), 'waste');
  assert.throws(() => inventoryAction(order, 'DIBATALKAN'), /Pilih/);
  assert.equal(
    inventoryAction(
      { ...order, orderStatus: 'DIBATALKAN' },
      'DIBATALKAN',
      'unused',
    ),
    'none',
  );
  assert.throws(
    () => inventoryAction({ ...order, orderStatus: 'DIBATALKAN' }, 'SELESAI'),
    /tidak dibuka ulang/,
  );
});
test('legacy stock is flagged for review without guessing its previous deductions', () => {
  assert.equal(
    inventoryAction(
      { orderStatus: 'ANTREAN_DESAIN' } as Order,
      'SIAP_DIAMBIL_KIRIM',
    ),
    'review',
  );
});
test('sales validation rejects fractional quantities and negative prices', () => {
  assert.throws(() => validateSale([{ ...item, quantity: 1.5 }]));
  assert.throws(() => validateSale([{ ...item, unitPrice: -1 }]));
  assert.deepEqual(validateSale([item]), {
    subtotal: 50000,
    totalCost: 10000,
    totalProfit: 40000,
  });
});
