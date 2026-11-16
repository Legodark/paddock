import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Prediction } from '../src/types';

const figureName = 'Posición del precio entre referencias de 2023';
const gauge = (page: Page) => page.getByRole('figure', { name: figureName, exact: true });
const status = (page: Page) => page.getByTestId('price-gauge-status');
const needle = (page: Page) => page.getByTestId('price-gauge-needle');

interface Fixture {
  prediction: number;
  minimum: number;
  maximum: number;
  lower: boolean;
  higher: boolean;
}

async function useFixture(page: Page, fixture: Fixture) {
  await page.route('**/api/v1/predict', async route => {
    const response = await route.fetch();
    const original = await response.json() as Prediction;
    // Keep the real response contract and vehicle metadata. Both endpoints are
    // within the API's +/- 5,000 euro comparable window for every fixture.
    const prediction: Prediction = {
      ...original,
      prediccion: fixture.prediction,
      'precio-minimo': fixture.minimum,
      'precio-maximo': fixture.maximum,
      'coches-baratos': fixture.lower ? [{ ...original['coches-baratos'][0], precio: fixture.minimum }] : [],
      'coches-caros': fixture.higher ? [{ ...original['coches-caros'][0], precio: fixture.maximum }] : [],
    };
    await route.fulfill({ response, json: prediction });
  });
}

async function predict(page: Page) {
  await page.goto('/');
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
  await expect(gauge(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  const response = page.waitForResponse(result => result.url().endsWith('/api/v1/predict'));
  await page.getByRole('button', { name: 'Estimar valor histórico', exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(gauge(page)).toBeVisible();
}

async function finiteDrawing(page: Page) {
  const svg = gauge(page).locator('svg');
  await expect(svg).toHaveAttribute('aria-hidden', 'true');
  await expect(svg).toHaveAttribute('focusable', 'false');
  expect(await svg.evaluate(element => element.outerHTML)).not.toMatch(/NaN|Infinity/);
}

for (const zone of [
  { prediction: 16000, formatted: '16.000', label: 'Buen precio' },
  { prediction: 18000, formatted: '18.000', label: 'Promedio' },
  { prediction: 20000, formatted: '20.000', label: 'Caro' },
]) {
  test(`historical price gauge shows ${zone.label} with valid references`, async ({ page }) => {
    await useFixture(page, { prediction: zone.prediction, minimum: 15000, maximum: 21000, lower: true, higher: true });
    await predict(page);
    await expect(page.getByTestId('estimated-price')).toContainText(zone.formatted);
    await expect(status(page)).toHaveText(zone.label);
    await expect(needle(page)).toBeVisible();
    await expect(gauge(page)).toHaveAccessibleName(figureName);
    await expect(gauge(page)).toContainText('2023');
    await finiteDrawing(page);
  });
}

for (const neutral of [
  { name: 'the lower comparable group is missing', minimum: 18000, maximum: 21000, lower: false, higher: true },
  { name: 'the higher comparable group is missing', minimum: 15000, maximum: 18000, lower: true, higher: false },
  { name: 'both comparable groups are missing', minimum: 18000, maximum: 18000, lower: false, higher: false },
  { name: 'all references have the same price', minimum: 18000, maximum: 18000, lower: true, higher: true },
]) {
  test(`historical price gauge stays neutral when ${neutral.name}`, async ({ page }) => {
    await useFixture(page, { prediction: 18000, ...neutral });
    await predict(page);
    await expect(page.getByTestId('estimated-price')).toContainText('18.000');
    await expect(status(page)).toHaveText('Sin referencias suficientes');
    await expect(needle(page)).toHaveCount(0);
    await finiteDrawing(page);
  });
}

test('the gauge stays tied to the submitted estimate and needs no extra requests or price input', async ({ page }, info) => {
  const requests: string[] = [];
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/api/')) requests.push(`${request.method()} ${path}`);
  });
  await predict(page);
  await expect(status(page)).toHaveText('Promedio');
  await expect(needle(page)).toBeVisible();
  await expect(page.getByTestId('estimated-price')).toContainText('20.155');
  const submittedDrawing = await needle(page).evaluate(element => element.outerHTML);
  const submittedCalls = [...requests];
  expect(submittedCalls.filter(request => request === 'POST /api/v1/predict')).toHaveLength(1);
  await expect(gauge(page).locator('input, select, textarea, button')).toHaveCount(0);
  await gauge(page).click();
  await page.getByLabel('Kilómetros', { exact: true }).fill('20000');
  await expect(page.locator('.stale-notice')).toBeVisible();
  await expect(status(page)).toHaveText('Promedio');
  expect(await needle(page).evaluate(element => element.outerHTML)).toBe(submittedDrawing);
  const widths = info.project.name.startsWith('mobile') ? [390, 360, 320] : [1440, 1024, 768];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await gauge(page).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const bounds = await gauge(page).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await expect(status(page)).toBeVisible();
  }
  expect(requests).toEqual(submittedCalls);
  await finiteDrawing(page);
});
