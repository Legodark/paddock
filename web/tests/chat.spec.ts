import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { accessibilityScanner } from './axe-compat';

const example = 'Busco coches Citroën de menos de 20.000 euros en Málaga';
async function ready(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir asistente', exact: true }).click();
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeEnabled();
}
async function submit(page: Page, message: string) {
  await page.getByLabel('Tu consulta sobre coches').fill(message);
  await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
}
async function realSearch(page: Page, message = example) {
  const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/cars');
  await submit(page, message);
  const result = await response;
  expect(result.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo', exact: true })).toBeVisible();
  return result;
}

test('real classifier and snapshot search preserve canonical filters and historical results', async ({ page, browserName }, info) => {
  const requests: string[] = [];
  const policyViolations: unknown[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.exposeFunction('reportChatPolicyViolation', (violation: unknown) => policyViolations.push(violation));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
    void (window as unknown as { reportChatPolicyViolation: (violation: unknown) => Promise<void> }).reportChatPolicyViolation(event.effectiveDirective);
  }));
  await ready(page);
  const chat = page.locator('#consultar');
  // Firefox/WebKit screenshot synchronization injects an inline <style>; do not contaminate the CSP measurement.
  if (browserName === 'chromium') await chat.screenshot({ path: info.outputPath('chat-initial.png') });
  const classification = page.waitForResponse(r => r.url().endsWith('/api/v1/message'));
  const response = await realSearch(page);
  const context = await classification;
  expect((await context.json()).contexto).toBe(1);
  expect(context.request().method()).toBe('POST');
  expect(context.request().postDataJSON()).toEqual({ message: 'busco coche coche de menos de 20.000 euros en málaga' });
  const filters = new URL(response.url()).searchParams;
  expect(Object.fromEntries(filters)).toEqual({ limit: '10', brand_id: '10', location: 'Málaga', price_lt: '20000' });
  const data = await response.json();
  expect(data.car_data.length).toBeGreaterThan(0);
  expect(data.car_data.length).toBeLessThanOrEqual(10);
  for (const row of data.car_data) {
    expect(row.brand).toBe('Citroen'); expect(row.location).toBe('Málaga'); expect(row.price).toBeLessThan(20000);
  }
  await expect(chat.getByRole('list', { name: 'Coches del catálogo histórico' }).locator(':scope > li')).toHaveCount(data.car_data.length);
  await expect(chat.getByRole('list', { name: 'Filtros interpretados' })).toContainText('menos de');
  await expect(chat.getByRole('heading', { name: 'Resultados del catálogo' })).toBeFocused();
  if (browserName === 'chromium') await chat.screenshot({ path: info.outputPath('chat-results.png') });
  expect(requests.some(url => /\.(?:bin|pkl|sqlite3|csv)(?:\?|$)/.test(url))).toBe(false);
  expect(policyViolations).toEqual([]);
  await page.getByRole('button', { name: 'Editar consulta' }).click();
  await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue(example);
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeFocused();
  const edited = await realSearch(page, example.replace('Málaga', 'Madrid'));
  expect(new URL(edited.url()).searchParams.get('location')).toBe('Madrid');
});

test('power, strict mileage and fuel conditions reach the real query', async ({ page }) => {
  await ready(page);
  const response = await realSearch(page, 'Quiero coches diésel con menos de 50.000 km y más de 100 CV');
  const params = new URL(response.url()).searchParams;
  expect(Object.fromEntries(params)).toEqual({ limit: '10', fuel_id: '1', horses_gt: '100', km_lt: '50000' });
  const data = await response.json(); expect(data.car_data.length).toBeGreaterThan(0);
  for (const row of data.car_data) { expect(row.fuel).toBe('Diesel'); expect(row.km).toBeLessThan(50000); expect(row.horses).toBeGreaterThan(100); }
});

test('model and province with the same name remain separate filters', async ({ page }) => {
  await ready(page);
  const response = await realSearch(page, 'Seat León en León del año 2019');
  expect(Object.fromEntries(new URL(response.url()).searchParams)).toEqual({ limit: '10', brand_id: '58', model_id: '586', location: 'León', year_min: '2019', year_max: '2019' });
});

test('unrelated requests use the frozen classifier without querying cars', async ({ page }) => {
  let queries = 0; page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/cars') queries++; });
  await ready(page);
  await submit(page, 'Hola, ¿qué tiempo hace mañana?');
  await expect(page.locator('#consultar').getByText('Soy el asistente del TFM y solo consulto', { exact: false })).toBeVisible();
  expect(queries).toBe(0);
  await expect(page.getByRole('list', { name: 'Coches del catálogo histórico' })).toHaveCount(0);
});

test('unsupported, conflicting or negated constraints never become partial searches', async ({ page }) => {
  let queries = 0; page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/cars') queries++; });
  await ready(page);
  for (const message of ['Quiero coches Citroën rojos de menos de 20000 euros', 'Quiero coches Audi y BMW', 'Quiero coches sin diésel', 'Quiero coches de más de 25000 euros y menos de 20000 euros']) {
    await submit(page, message);
    await expect(page.locator('.chat-issues')).toBeVisible();
    await expect(page.locator('.chat-outcome-answer')).toContainText('No he realizado ninguna búsqueda');
  }
  expect(queries).toBe(0);
});

test('short valid filters rejected by the real classifier require explicit confirmation', async ({ page }) => {
  let queries = 0; page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/cars') queries++; });
  await ready(page);
  const classification = page.waitForResponse(r => r.url().endsWith('/api/v1/message'));
  await submit(page, 'Málaga');
  expect((await (await classification).json()).contexto).toBe(0);
  await expect(page.getByRole('button', { name: 'Buscar con estos filtros' })).toBeVisible();
  expect(queries).toBe(0);
  // Loading another example removes the old confirmation rather than authorizing unseen filters.
  await page.getByRole('button', { name: example, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Buscar con estos filtros' })).toHaveCount(0);
  await submit(page, 'Málaga');
  const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/cars');
  await page.getByRole('button', { name: 'Buscar con estos filtros' }).click();
  const result = await response; expect(result.status()).toBe(200);
  expect(new URL(result.url()).searchParams.get('location')).toBe('Málaga');
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo' })).toBeVisible();
});

test('an unfiltered request is confirmed and real empty results stay explicit', async ({ page }) => {
  await ready(page);
  await submit(page, 'Muéstrame coches');
  await expect(page.getByRole('button', { name: 'Ver diez registros del catálogo' })).toBeVisible();
  const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/cars');
  await page.getByRole('button', { name: 'Ver diez registros del catálogo' }).click();
  expect(Object.fromEntries(new URL((await response).url()).searchParams)).toEqual({ limit: '10' });
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo' })).toBeVisible();
  const empty = await realSearch(page, 'Quiero coches Citroën por 1 euro');
  expect((await empty.json()).car_data).toEqual([]);
  await expect(page.locator('.chat-empty')).toContainText('No hay registros');
});

test('classification and query failures preserve the message and support a real retry', async ({ page }) => {
  let failure: 'message' | 'cars' | null = 'message';
  await page.route('**/api/v1/message', route => failure === 'message' ? route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } }) : route.continue());
  await page.route('**/api/v1/cars?*', route => failure === 'cars' ? route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } }) : route.continue());
  await ready(page);
  for (const stage of ['message', 'cars'] as const) {
    failure = stage;
    await submit(page, example);
    await expect(page.locator('#chat-error')).toBeVisible();
    await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue(example);
    await expect(page.getByRole('heading', { name: 'Resultados del catálogo' })).toHaveCount(0);
    await expect(page.locator('.chat-empty')).toHaveCount(0);
  }
  failure = null;
  await realSearch(page);
});

test('search catalog failure recovers without disabling the prediction form', async ({ page }) => {
  let fail = true;
  await page.route('**/api/v1/search-catalog', route => fail ? route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } }) : route.continue());
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir asistente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reintentar catálogo de consulta' })).toBeVisible();
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeDisabled();
  fail = false;
  await page.getByRole('button', { name: 'Reintentar catálogo de consulta' }).click();
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeEnabled();
});

test('duplicate submits and cancellation cannot overwrite a newer search', async ({ page }) => {
  let messages = 0, queries = 0;
  let firstReleased: () => void = () => {};
  const firstSettled = new Promise<void>(resolve => { firstReleased = resolve; });
  await page.route('**/api/v1/message', async route => {
    messages++;
    if (messages === 1) {
      try { await new Promise(resolve => setTimeout(resolve, 800)); await route.continue(); }
      finally { firstReleased(); }
    } else await route.continue();
  });
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/cars') queries++; });
  await ready(page);
  await submit(page, example);
  await expect(page.getByRole('button', { name: 'Interpretando consulta…' })).toBeDisabled();
  await expect.poll(() => messages).toBe(1);
  await page.locator('.chat-form').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.getByRole('button', { name: 'Cancelar consulta' }).click();
  await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue(example);
  const response = await realSearch(page);
  await firstSettled;
  expect(response.status()).toBe(200);
  expect(messages).toBe(2); expect(queries).toBe(1);
  await expect(page.getByRole('log', { name: 'Conversación con Eistein' }).locator(':scope > ol > li')).toHaveCount(1);
});

test('user markup stays text and clearing removes the local conversation', async ({ page }) => {
  await ready(page);
  const unsafe = 'Quiero coches Audi <img src=x onerror="window.chatInjected=true">';
  await submit(page, unsafe);
  await expect(page.locator('.chat-issues')).toBeVisible();
  await expect(page.locator('.chat-question')).toContainText(unsafe);
  await expect(page.locator('#consultar img')).toHaveCount(0);
  expect(await page.evaluate(() => Object.hasOwn(window, 'chatInjected'))).toBe(false);
  await realSearch(page);
  await page.getByRole('button', { name: 'Limpiar conversación' }).click();
  await expect(page.getByRole('log', { name: 'Conversación con Eistein' })).toHaveCount(0);
  await expect(page.locator('.chat-outcome')).toHaveCount(0);
  await expect(page.getByLabel('Tu consulta sobre coches')).toHaveValue('');
  await expect(page.getByLabel('Tu consulta sobre coches')).toBeFocused();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('chat states pass automated accessibility and fit narrow screens', async ({ page, browserName }, info) => {
  await ready(page);
  for (const state of ['initial', 'results']) {
    if (state === 'results') await realSearch(page);
    const result = await accessibilityScanner(page, browserName).include('#consultar').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations).toEqual([]);
  }
  const widths = info.project.name.startsWith('mobile') ? [390, 360, 320] : [1440, 1024, 768];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByLabel('Tu consulta sobre coches')).toBeVisible();
  }
});
