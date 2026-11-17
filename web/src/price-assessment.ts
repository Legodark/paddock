export const GOOD_PRICE_LIMIT = 1 / 4;
export const HIGH_PRICE_DIVISOR = 1.33;
export const HIGH_PRICE_LIMIT = 1 / HIGH_PRICE_DIVISOR;

export interface PriceReference {
  value: number;
  minimum: number;
  maximum: number;
  hasLower: boolean;
  hasUpper: boolean;
}

export type PriceBand = 'good' | 'average' | 'expensive';

// Preserve the 2023 visual rule. These are catalogue positions, not a learned
// deal score or a confidence interval. One-sided bounds use the prediction in
// the API and cannot support this comparison.
export function assessPrice({ value, minimum, maximum, hasLower, hasUpper }: PriceReference): { band: PriceBand; position: number } | null {
  if (!hasLower || !hasUpper || ![value, minimum, maximum].every(Number.isFinite) ||
      minimum <= 0 || maximum <= minimum || value < minimum || value > maximum) return null;
  const width = maximum - minimum;
  const lowerCut = minimum + width * GOOD_PRICE_LIMIT;
  const upperCut = minimum + width / HIGH_PRICE_DIVISOR;
  return {
    band: value >= upperCut ? 'expensive' : value >= lowerCut ? 'average' : 'good',
    position: (value - minimum) / width,
  };
}
