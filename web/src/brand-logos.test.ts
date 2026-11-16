import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { BRAND_LOGOS } from './brand-logos';

const contract = JSON.parse(readFileSync(new URL('../../experiments/model-contract/feature-contract.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(readFileSync(new URL('../../docs/evidence/ux/brand-assets.json', import.meta.url), 'utf8')) as {
  output_bytes: number;
  assets: { id: string; brand: string; source: string; source_sha256: string; output: string; sha256: string; width: number; height: number; bytes: number }[];
};
const root = new URL('../../', import.meta.url);
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

test('manufacturer artwork covers canonical IDs without using the legacy selector numbering', () => {
  expect(Object.keys(BRAND_LOGOS)).toEqual(Object.keys(contract.categories.brands));
  expect(evidence.assets.map(asset => [asset.id, asset.brand])).toEqual(Object.entries(contract.categories.brands));
  for (const asset of evidence.assets) {
    expect(BRAND_LOGOS[asset.id].brand).toBe(contract.categories.brands[asset.id]);
    expect(BRAND_LOGOS[asset.id].src).toBe('/' + asset.output.replace('web/public/', ''));
  }
  expect(BRAND_LOGOS['34'].src).toContain('/land_rover.');
  expect(BRAND_LOGOS['38'].src).toContain('/lynkco.');
  expect(BRAND_LOGOS['44'].src).toContain('/mercedes_benz.');
});

test('the committed image inventory preserves archived sources and bounds public resources', () => {
  let bytes = 0;
  const outputs = [];
  for (const asset of evidence.assets) {
    expect(asset.source).toMatch(/^padook\/Frontend\/assets\/images\/marcas\/[a-z_]+\.png$/);
    expect(asset.output).toMatch(/^web\/public\/brand-logos\/[a-z_]+\.[a-f0-9]{12}\.webp$/);
    expect(digest(readFileSync(new URL(asset.source, root)))).toBe(asset.source_sha256);
    const output = readFileSync(new URL(asset.output, root));
    expect(digest(output)).toBe(asset.sha256);
    expect(output.subarray(8, 12).toString()).toBe('WEBP');
    expect(output.length).toBe(asset.bytes);
    expect(Math.max(asset.width, asset.height)).toBeLessThanOrEqual(96);
    expect(Math.min(asset.width, asset.height)).toBeGreaterThan(0);
    bytes += output.length;
    outputs.push(asset.output.split('/').at(-1));
  }
  expect(bytes).toBe(evidence.output_bytes);
  expect(bytes).toBeLessThan(175000);
  expect(readdirSync(new URL('../public/brand-logos/', import.meta.url)).sort()).toEqual(outputs.sort());
});
