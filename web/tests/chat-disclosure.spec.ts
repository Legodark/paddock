import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { accessibilityScanner } from './axe-compat';

const example = 'Busco coches Citroën de menos de 20.000 euros en Málaga';
const opener = (page: Page) => page.getByRole('button', { name: /^(Abrir|Plegar) asistente$/ });
const closer = (page: Page) => page.getByRole('button', { name: 'Cerrar asistente', exact: true });
const panelHeading = (page: Page) => page.getByRole('heading', { name: 'Eistein, asistente del catálogo', exact: true });
const input = (page: Page) => page.getByLabel('Tu consulta sobre coches');

function calls(page: Page) {
  const counts = { catalog: 0, classify: 0, search: 0 };
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/v1/search-catalog') counts.catalog++;
    if (path === '/api/v1/message') counts.classify++;
    if (path === '/api/v1/cars') counts.search++;
  });
  return counts;
}

function gate() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

async function open(page: Page) {
  await opener(page).click();
  await expect(input(page)).toBeEnabled();
  // Focus the panel heading, avoiding an automatic mobile keyboard.
  await expect(panelHeading(page)).toBeFocused();
}

async function search(page: Page) {
  await input(page).fill(example);
  await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo', exact: true })).toBeVisible();
}

test('the assistant starts collapsed and keyboard opening loads its catalogue only once', async ({ page, browserName }) => {
  const counts = calls(page);
  await page.goto('/');
  await expect(page.getByLabel('Marca', { exact: true })).toBeEnabled();
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(opener(page)).toHaveAccessibleName('Abrir asistente');
  const panelId = await opener(page).getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  await expect(page.locator(`[id="${panelId}"]`)).toBeHidden();
  await expect(input(page)).toBeHidden();
  expect(counts).toEqual({ catalog: 0, classify: 0, search: 0 });
  const accessibility = await accessibilityScanner(page, browserName).include('#consultar')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);

  await opener(page).focus();
  await page.keyboard.press('Enter');
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(opener(page)).toHaveAccessibleName('Plegar asistente');
  await expect(input(page)).toBeEnabled();
  await expect(panelHeading(page)).toBeFocused();
  expect(counts).toEqual({ catalog: 1, classify: 0, search: 0 });
  await opener(page).click();
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(opener(page)).toBeFocused();
  await open(page);
  expect(counts).toEqual({ catalog: 1, classify: 0, search: 0 });
});

test('closing and Escape preserve a draft and return focus to the opener', async ({ page }) => {
  await page.goto('/');
  await open(page);
  await input(page).fill(example);
  await closer(page).click();
  await expect(opener(page)).toBeFocused();
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(input(page)).toBeHidden();
  await open(page);
  await expect(input(page)).toHaveValue(example);
  await page.getByLabel('Marca', { exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'true');
  await input(page).focus();
  // dispatchEvent resolves selectors in the main world: avoid Firefox 159's
  // crashing ariaLabelledByElements getter in getByLabel for this dispatch only.
  // Labelled lookups and every behavioral assertion remain unchanged.
  await page.locator('#chat-message').dispatchEvent('keydown', { key: 'Escape', isComposing: true });
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(opener(page)).toBeFocused();
  await expect(input(page)).toBeHidden();
  await open(page);
  await expect(input(page)).toHaveValue(example);
});

test('completed results, interpreted filters and conversation survive closing without another search', async ({ page }) => {
  const counts = calls(page);
  await page.goto('/');
  await open(page);
  await search(page);
  const results = page.getByRole('list', { name: 'Coches del catálogo histórico' });
  const filters = page.getByRole('list', { name: 'Filtros interpretados' });
  const originalResults = await results.innerText();
  const originalFilters = await filters.innerText();
  const originalCalls = { ...counts };
  expect(originalCalls).toEqual({ catalog: 1, classify: 1, search: 1 });
  await closer(page).click();
  await expect(input(page)).toBeHidden();
  await open(page);
  await expect(results).toHaveText(originalResults, { useInnerText: true });
  await expect(filters).toHaveText(originalFilters, { useInnerText: true });
  await expect(page.getByRole('log', { name: 'Conversación con Eistein' })).toContainText(example);
  expect(counts).toEqual(originalCalls);
});

test('a pending confirmation survives closing and searches only after explicit approval', async ({ page }) => {
  const counts = calls(page);
  await page.goto('/');
  await open(page);
  await input(page).fill('Málaga');
  await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
  const confirmation = page.getByRole('button', { name: 'Buscar con estos filtros', exact: true });
  await expect(confirmation).toBeEnabled();
  const filters = page.getByRole('list', { name: 'Filtros interpretados' });
  await expect(filters).toContainText('Málaga');
  const originalFilters = await filters.innerText();
  expect(counts).toEqual({ catalog: 1, classify: 1, search: 0 });
  await closer(page).click();
  await open(page);
  await expect(confirmation).toBeEnabled();
  await expect(input(page)).toHaveValue('Málaga');
  await expect(filters).toHaveText(originalFilters, { useInnerText: true });
  expect(counts).toEqual({ catalog: 1, classify: 1, search: 0 });
  const response = page.waitForResponse(result => new URL(result.url()).pathname === '/api/v1/cars');
  await confirmation.click();
  const result = await response;
  expect(result.status()).toBe(200);
  expect(Object.fromEntries(new URL(result.url()).searchParams)).toEqual({ limit: '10', location: 'Málaga' });
  await expect(page.getByRole('heading', { name: 'Resultados del catálogo', exact: true })).toBeVisible();
  await expect(confirmation).toHaveCount(0);
  expect(counts).toEqual({ catalog: 1, classify: 1, search: 1 });
});

test('a search completed while collapsed preserves its result without stealing focus or scrolling', async ({ page }) => {
  const counts = calls(page);
  const started = gate(), release = gate();
  await page.route('**/api/v1/cars?*', async route => {
    started.release();
    await release.promise;
    await route.continue();
  });
  try {
    await page.goto('/');
    await open(page);
    await input(page).fill(example);
    await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
    await started.promise;
    await closer(page).click();
    await expect(opener(page)).toBeFocused();
    const scroll = await page.evaluate(() => window.scrollY);
    const response = page.waitForResponse(result => new URL(result.url()).pathname === '/api/v1/cars');
    release.release();
    expect((await response).status()).toBe(200);
    await expect(page.locator('#chat-outcome-heading')).toHaveText('Resultados del catálogo');
    await expect(opener(page)).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    await open(page);
    await expect(page.getByRole('list', { name: 'Coches del catálogo histórico' })).toBeVisible();
    expect(counts).toEqual({ catalog: 1, classify: 1, search: 1 });
  } finally { release.release(); }
});

test('an error arriving while collapsed keeps the draft and does not steal focus', async ({ page }) => {
  const started = gate(), release = gate();
  await page.route('**/api/v1/message', async route => {
    started.release();
    await release.promise;
    await route.fulfill({ status: 503, json: { error: { message: 'Unavailable' } } });
  });
  try {
    await page.goto('/');
    await open(page);
    await input(page).fill(example);
    await page.getByRole('button', { name: 'Buscar en el catálogo', exact: true }).click();
    await started.promise;
    await closer(page).click();
    await expect(opener(page)).toBeFocused();
    const scroll = await page.evaluate(() => window.scrollY);
    release.release();
    await expect(page.locator('#chat-error')).toContainText('El servicio no está disponible');
    await expect(opener(page)).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    await open(page);
    await expect(page.locator('#chat-error')).toBeVisible();
    await expect(input(page)).toHaveValue(example);
  } finally { release.release(); }
});

test('closing during the first catalogue load does not duplicate or lose that load', async ({ page }) => {
  const counts = calls(page);
  const started = gate(), release = gate();
  await page.route('**/api/v1/search-catalog', async route => {
    const response = await route.fetch();
    started.release();
    await release.promise;
    await route.fulfill({ response });
  });
  try {
    await page.goto('/');
    await opener(page).click();
    await started.promise;
    await expect(input(page)).toBeDisabled();
    await closer(page).click();
    await expect(opener(page)).toBeFocused();
    await opener(page).click();
    release.release();
    await expect(input(page)).toBeEnabled();
    await expect(panelHeading(page)).toBeFocused();
    expect(counts).toEqual({ catalog: 1, classify: 0, search: 0 });
  } finally { release.release(); }
});

test('direct catalogue links and repeated navigation reopen the assistant without discarding a draft', async ({ page }) => {
  const counts = calls(page);
  await page.goto('/#consultar');
  await expect(input(page)).toBeEnabled();
  await expect(opener(page)).toHaveAttribute('aria-expanded', 'true');
  await input(page).fill(example);
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await closer(page).click();
  await nav.getByRole('link', { name: 'Consultar', exact: true }).click();
  await expect(input(page)).toBeVisible();
  await expect(input(page)).toHaveValue(example);
  await nav.getByRole('link', { name: 'Estimar', exact: true }).click();
  await nav.getByRole('link', { name: 'Consultar', exact: true }).click();
  await expect(input(page)).toHaveValue(example);
  expect(counts).toEqual({ catalog: 1, classify: 0, search: 0 });
});
