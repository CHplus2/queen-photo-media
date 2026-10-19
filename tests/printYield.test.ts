import assert from 'node:assert/strict';
import test from 'node:test';
import { estimateRollYield } from '../src/utils/printYield';
test('roll yield considers width, rotation and dimensions that cannot fit', () => {
  assert.equal(estimateRollYield(30, 1, 10, 20), 15);
  assert.equal(estimateRollYield(15.2, 65, 15.2, 10.2), 637);
  assert.equal(estimateRollYield(15.2, 65, 20, 30), 0);
  for (const invalid of [0, -1, NaN, Infinity])
    assert.equal(estimateRollYield(invalid, 65, 10, 15), 0);
});
