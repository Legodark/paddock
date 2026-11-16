import { expect, test } from 'vitest';
import { assessPrice } from './price-assessment';
import type { PriceReference } from './price-assessment';

const reference: PriceReference = { value: 300, minimum: 100, maximum: 500, hasLower: true, hasUpper: true };

test.each([
  [100, 'good', 0],
  [199, 'good', .2475],
  [200, 'average', .25],
  [300, 'average', .5],
  // The original upper cutoff is about 75.19%, not 75%.
  [400, 'average', .75],
  [400.7518796992481, 'expensive', .7518796992481203],
  [401, 'expensive', .7525],
  [500, 'expensive', 1],
] as const)('preserves the historical band and needle position for %s', (value, band, position) => {
  const result = assessPrice({ ...reference, value });
  expect(result?.band).toBe(band);
  expect(result?.position).toBeCloseTo(position, 12);
});

test.each([
  { hasLower: false },
  { hasUpper: false },
  { hasLower: false, hasUpper: false },
  { value: 100, minimum: 100, maximum: 100 },
  { minimum: 500, maximum: 100 },
  { value: 99 },
  { value: 501 },
  { value: NaN },
  { maximum: Infinity },
  { minimum: 0 },
])('does not invent a price verdict for incomplete or invalid references: %j', overrides => {
  expect(assessPrice({ ...reference, ...overrides })).toBeNull();
});
