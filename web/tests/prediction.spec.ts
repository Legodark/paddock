import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { accessibilityScanner } from './axe-compat';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
}

async function example(page: Page) {
  await ready(page);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
}

async function estimate(page: Page) {
  const response = page.waitForResponse(r => r.url().endsWith('/api/v1/predict'));
  await page.getByRole('button', { name: /Estimar valor histórico|Actualizar estimación/ }).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByTestId('estimated-price')).toContainText('20.155');
}

test('real prediction, comparables, filters and explicit stale-result state', async ({ page, browserName }, info) => {
  const requests: string[] = [];
  const policyViolations: unknown[] = [];
  await page.exposeFunction('reportPolicyViolation', (violation: unknown) => policyViolations.push(violation));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
    void (window as unknown as { reportPolicyViolation: (violation: unknown) => Promise<void> }).reportPolicyViolation({ directive: event.effectiveDirective, blocked: event.blockedURI });
  }));
  page.on('request', request => requests.push(request.url()));
  await ready(page);
  // Playwright 1.65 toggles an inline <style> when capturing Firefox/WebKit, which itself violates our CSP.
  // Keep the complete CSP/functional checks in every engine and collect these optional captures in Chromium.
  if (browserName === 'chromium') await page.screenshot({ path: info.outputPath('initial.png'), fullPage: true });
  await page.getByLabel('Marca', { exact: true }).selectOption('10');
  await page.getByLabel('Modelo', { exact: true }).selectOption('118');
  for (const [label, value] of [['Año', '2022'], ['Kilómetros', '7119'], ['Potencia', '110'], ['Cilindrada', '1199'], ['Marchas', '6']]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByLabel('Combustible', { exact: true }).selectOption('3');
  await page.getByLabel('Manual', { exact: true }).check();
  await estimate(page);
  await expect(page.getByRole('heading', { name: 'Estimación orientativa' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Por debajo de la estimación' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Por encima de la estimación' })).toBeVisible();
  if (browserName === 'chromium') await page.screenshot({ path: info.outputPath('result.png'), fullPage: true });
  await page.getByRole('button', { name: 'Precio menor', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Por encima de la estimación' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Por encima de la estimación' })).toBeVisible();
  await page.getByLabel('Kilómetros', { exact: true }).fill('20000');
  await expect(page.getByText('Has cambiado los datos.', { exact: false })).toBeVisible();
  const response = page.waitForResponse(r => r.url().endsWith('/api/v1/predict'));
  await page.getByRole('button', { name: 'Actualizar estimación' }).click();
  const update = await response;
  expect(update.request().postDataJSON().km).toBe(20000);
  expect(update.status()).toBe(200);
  await expect(page.getByText('Has cambiado los datos.', { exact: false })).toHaveCount(0);
  expect(requests.some(url => /\.(?:bin|pkl|sqlite3|csv)(?:\?|$)/.test(url))).toBe(false);
  expect(policyViolations).toEqual([]);
});

test('validates fields and resets a model when its brand changes', async ({ page }) => {
  await ready(page);
  await expect(page.getByLabel('Modelo', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByLabel('Marca', { exact: true })).toBeFocused();
  await expect(page.getByText('Selecciona una marca.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('estimated-price')).toHaveCount(0);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await page.getByLabel('Año', { exact: true }).fill('2026');
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByLabel('Año', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Año', { exact: true })).toBeFocused();
  await page.getByLabel('Marca', { exact: true }).selectOption('6');
  await expect(page.getByLabel('Modelo', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Modelo', { exact: true }).locator('option[value="118"]')).toHaveCount(0);
});

test('catalog failure offers a working retry', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/catalog', route => fail ? route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } }) : route.continue());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'No hemos podido cargar el catálogo' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Volver a cargar el catálogo' }).click();
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
});

test('prediction failure preserves inputs and allows retry, never showing a zero value', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/predict', route => fail ? route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } }) : route.continue());
  await example(page);
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByRole('alert')).toContainText('No hemos podido calcular la estimación');
  await expect(page.getByLabel('Kilómetros', { exact: true })).toHaveValue('7119');
  await expect(page.getByTestId('estimated-price')).toHaveCount(0);
  fail = false;
  await estimate(page);
});

test('represents missing comparables without manufacturing a price range', async ({ page }) => {
  await page.route('**/api/v1/predict', async route => {
    const response = await route.fetch();
    const data = await response.json();
    await route.fulfill({ response, json: { ...data, 'coches-baratos': [], 'coches-caros': [], 'precio-minimo': data.prediccion, 'precio-maximo': data.prediccion } });
  });
  await example(page);
  await estimate(page);
  await expect(page.getByText('Sin referencias', { exact: true })).toHaveCount(2);
  await expect(page.getByText('No hay registros en este tramo de precio.', { exact: true })).toHaveCount(2);
});

test('prevents duplicate submits while calculating', async ({ page }) => {
  let submissions = 0;
  await page.route('**/api/v1/predict', async route => {
    submissions++;
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.continue();
  });
  await example(page);
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByRole('button', { name: 'Calculando estimación…' })).toBeDisabled();
  await expect(page.getByLabel('Marca', { exact: true })).toBeDisabled();
  await page.getByRole('form', { name: 'Cuéntanos sobre tu coche' }).evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.getByTestId('estimated-price')).toContainText('20.155');
  expect(submissions).toBe(1);
});

test('keyboard access and automated accessibility checks on initial and result states', async ({ page, browserName }) => {
  await ready(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al estimador' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Saltar al estimador' })).toHaveCSS('clip-path', 'none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#estimador')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Marca', { exact: true })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Saltar al estimador' })).toHaveCSS('clip-path', 'inset(50%)');
  const initial = await accessibilityScanner(page, browserName).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(initial.violations).toEqual([]);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await estimate(page);
  const result = await accessibilityScanner(page, browserName).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
});

test('fits narrow and wide viewports without horizontal overflow', async ({ page }, info) => {
  await example(page);
  await estimate(page);
  const widths = info.project.name.startsWith('mobile') ? [390, 360, 320] : [1440, 1024, 768];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Actualizar estimación' })).toBeVisible();
  }
});
