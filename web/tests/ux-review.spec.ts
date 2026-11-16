import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Abrir asistente', exact: true }).click();
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeEnabled();
}
async function prediction(page: Page) {
  const response = page.waitForResponse(r => r.url().endsWith('/api/v1/predict'));
  await page.getByRole('button', { name: /Estimar valor histórico|Actualizar estimación/ }).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByTestId('estimated-price')).toContainText('20.155');
}
const message = 'Busco coches Citroën de menos de 20.000 euros en Málaga';

test.beforeEach(async ({ browser, browserName }, info) => {
  info.annotations.push({ type: 'browser-version', description: `${browserName} ${browser.version()}` });
});

test('prediction rate limiting preserves the vehicle and supports a deliberate retry', async ({ page }) => {
  let limited = true;
  await page.route('**/api/v1/predict', route => limited
    ? route.fulfill({ status: 429, contentType: 'text/html', body: '<h1>Too many requests</h1>' }) : route.continue());
  await ready(page);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByRole('alert')).toContainText('Hay muchas solicitudes');
  await expect(page.getByLabel('Kilómetros', { exact: true })).toHaveValue('7119');
  await expect(page.getByTestId('estimated-price')).toHaveCount(0);
  limited = false;
  await prediction(page);
});

test('chat rate limiting preserves the query and never becomes an empty result', async ({ page }) => {
  let limited = true;
  await page.route('**/api/v1/message', route => limited
    ? route.fulfill({ status: 429, contentType: 'text/html', body: '<h1>Too many requests</h1>' }) : route.continue());
  await ready(page);
  await page.getByLabel('Tu consulta sobre coches').fill(message);
  await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
  await expect(page.locator('#chat-error')).toContainText('Hay muchas solicitudes');
  await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue(message);
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo', exact: true })).toHaveCount(0);
  await expect(page.locator('.chat-empty')).toHaveCount(0);
  limited = false;
  await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo', exact: true })).toBeVisible();
});

test('portrait and landscape changes preserve the estimate, query and historical context', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await prediction(page);
  await page.getByLabel('Tu consulta sobre coches').fill(message);
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.getByTestId('estimated-price')).toContainText('20.155');
    await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue(message);
    await expect(page.getByLabel('Kilómetros', { exact: true })).toHaveValue('7119');
  }
  await expect(page.locator('#proyecto')).toContainText('Juan Cerezo Serrano');
  await expect(page.locator('#proyecto')).toContainText('Oscar Pörtner Ostos');
  await expect(page.locator('#proyecto')).toContainText('no un servicio de tasación actual');
});

test('controls remain readable and usable with doubled text', async ({ page }, info) => {
  await page.setViewportSize({ width: info.project.name.startsWith('mobile') ? 390 : 1440, height: 1000 });
  await ready(page);
  // Instrumented text-only enlargement; this does not claim a physical browser zoom or screen-reader test.
  await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll<HTMLElement>('body, body *')).map(element =>
      [element, parseFloat(getComputedStyle(element).fontSize)] as const);
    for (const [element, size] of sizes) if (Number.isFinite(size)) element.style.fontSize = `${size * 2}px`;
  });
  const geometry = await page.evaluate(() => ({
    viewport: innerWidth, width: document.documentElement.scrollWidth,
    overflowing: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter(el => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'absolute')
      .slice(0, 12).map(el => ({ tag: el.tagName, className: String(el.className), text: el.innerText?.slice(0, 70), right: el.getBoundingClientRect().right })),
  }));
  expect(geometry.width, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewport + 1);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await prediction(page);
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
  await expect(page.getByTestId('estimated-price')).toBeVisible();
});

test('visible touch controls meet the 24 CSS pixel target minimum', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const targets = page.locator('button:visible, .gearbox-option');
  for (const target of await targets.all()) {
    const box = await target.boundingBox();
    expect(box, await target.innerText()).not.toBeNull();
    expect(box!.width, await target.innerText()).toBeGreaterThanOrEqual(24);
    expect(box!.height, await target.innerText()).toBeGreaterThanOrEqual(24);
  }
});

test('section navigation follows anchor history and preserves the vehicle', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('link', { name: 'Consultar', exact: true }).click();
  await expect(page).toHaveURL(/#consultar$/);
  await expect(nav.getByRole('link', { name: 'Consultar', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect(nav.getByRole('link', { name: 'Estimar', exact: true })).not.toHaveAttribute('aria-current', 'location');
  await nav.getByRole('link', { name: 'Proyecto', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#proyecto$/);
  await expect(nav.getByRole('link', { name: 'Proyecto', exact: true })).toHaveAttribute('aria-current', 'location');
  await page.goBack();
  await expect(nav.getByRole('link', { name: 'Consultar', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect(page.getByLabel('Kilómetros', { exact: true })).toHaveValue('7119');
});
