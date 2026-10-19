import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  frameAdjustment,
  frameOptions,
  validateLabels,
} from '../src/utils/catalogEditing';
import type { ServiceItem } from '../src/types';
const service: ServiceItem = {
  id: 'photo',
  name: 'Cetak 10R',
  category: 'cetak_foto',
  description: 'Photo',
  basePrice: 50000,
  estimatedCost: 10000,
  unit: 'lembar',
  options: {
    sizes: ['10R'],
    finishes: ['Glossy'],
    frames: ['Tanpa Bingkai', 'Minimalis Hitam'],
  },
};
test('renaming a frame preserves its surcharge and cost independently of its label', () => {
  const original = frameAdjustment(service, 'Minimalis Hitam');
  const options = frameOptions(service, [
    { name: 'Tanpa Bingkai', price: 0, cost: 0 },
    { name: 'Hitam modern', ...original },
  ]);
  assert.deepEqual(frameAdjustment({ ...service, options }, 'Hitam modern'), {
    price: 25000,
    cost: 12000,
  });
  assert.deepEqual(options.finishes, ['Glossy']);
  assert.deepEqual(options.sizes, ['10R']);
  assert.equal(options.framePrices?.['Minimalis Hitam'], undefined);
  assert.equal(service.options?.frames?.[1], 'Minimalis Hitam');
});
test('frame edits reject duplicate names, negative amounts, and charging the no-frame option', () => {
  assert.throws(() => validateLabels(['8R', ' 8r ']), /tidak boleh sama/);
  assert.throws(() => validateLabels(['']), /hapus baris/);
  assert.throws(
    () => frameOptions(service, [{ name: 'Kayu', price: -1, cost: 0 }]),
    /rupiah/,
  );
  assert.throws(
    () => frameOptions(service, [{ name: 'Tanpa Bingkai', price: 1, cost: 0 }]),
    /Rp0/,
  );
  assert.deepEqual(frameAdjustment(service, 'Tanpa Bingkai'), {
    price: 0,
    cost: 0,
  });
});
test('arbitrary frame labels cannot use inherited object properties as prices', () => {
  assert.deepEqual(
    frameAdjustment(
      { ...service, options: { frames: ['constructor'], framePrices: {} } },
      'constructor',
    ),
    { price: 0, cost: 0 },
  );
  const options = frameOptions(service, [
    { name: 'constructor', price: 1000, cost: 100 },
  ]);
  assert.deepEqual(frameAdjustment({ ...service, options }, 'constructor'), {
    price: 1000,
    cost: 100,
  });
});

test('an old pending size is not silently deducted using a renamed single-size recipe', async () => {
  const { materialPlan } = await import('../src/utils/workflow');
  const changed: ServiceItem = {
    ...service,
    stockMode: 'automatic',
    materialUsage: [{ inventoryId: 'paper', quantity: 0.5 }],
    options: { sizes: ['8R'] },
  };
  const plan = materialPlan(
    [
      {
        id: 'old',
        serviceId: 'photo',
        serviceName: 'Cetak 10R',
        category: 'cetak_foto',
        size: '10R',
        quantity: 1,
        unitPrice: 50000,
        unitCost: 10000,
      },
    ],
    [changed],
  );
  assert.deepEqual(plan.usage, []);
  assert.equal(plan.missing.length, 1);
});
