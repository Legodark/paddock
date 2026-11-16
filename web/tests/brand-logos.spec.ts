import { expect, test } from '@playwright/test';

test('brand images load on selection, follow reset and preserve the submitted estimate identity', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/brand-logos/')) requests.push(request.url()); });
  await page.goto('/');
  const select = page.getByLabel('Marca', { exact: true });
  const marker = page.locator('.select-wrap--brand .brand-logo');
  await expect(select).toBeEnabled();
  await expect(marker.locator('img')).toHaveCount(0);
  expect(requests).toEqual([]);
  const geometry = () => select.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height, documentTop: box.top + window.scrollY };
  });
  const initialBox = await geometry();
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await expect(marker.locator('img')).toHaveAttribute('src', /^\/brand-logos\/citroen\.[a-f0-9]+\.webp$/);
  await expect.poll(() => marker.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const selectedBox = await geometry();
  // Preserve the layout guard while allowing floating-point scroll-coordinate rounding.
  expect(selectedBox.width).toBeCloseTo(initialBox.width, 2);
  expect(selectedBox.height).toBeCloseTo(initialBox.height, 2);
  expect(selectedBox.documentTop).toBeCloseTo(initialBox.documentTop, 2);
  expect(requests).toHaveLength(1);
  await expect(marker).toHaveAttribute('aria-hidden', 'true');
  await expect(select).toHaveAccessibleName('Marca');
  await page.getByRole('button', { name: 'Estimar valor histórico' }).click();
  await expect(page.getByTestId('estimated-price')).toContainText('20.155');
  const submittedLogo = page.locator('.estimate-identity .brand-logo img');
  await expect(submittedLogo).toHaveAttribute('src', /\/citroen\./);
  await select.selectOption('4');
  await expect(marker.locator('img')).toHaveAttribute('src', /\/audi\./);
  await expect(submittedLogo).toHaveAttribute('src', /\/citroen\./);
  await expect(page.locator('.estimate-vehicle')).toContainText('Citroën');
  await expect(page.locator('.stale-notice')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await expect(marker.locator('img')).toHaveCount(0);
  await expect(page.locator('.estimate-identity')).toHaveCount(0);
  await page.getByRole('button', { name: 'Rellenar un ejemplo' }).click();
  await expect(marker.locator('img')).toHaveAttribute('src', /\/citroen\./);
});

test('a failed image falls back without hiding the selected brand and recovers on brand change', async ({ page }) => {
  let failures = 0;
  await page.route('**/brand-logos/citroen.*.webp', route => {
    failures++;
    return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' });
  });
  await page.goto('/');
  const select = page.getByLabel('Marca', { exact: true });
  await expect(select).toBeEnabled();
  await select.selectOption('10');
  const marker = page.locator('.select-wrap--brand .brand-logo');
  await expect(marker).toHaveClass(/brand-logo--fallback/);
  await expect(marker.locator('img')).toHaveCount(0);
  await expect(select).toHaveValue('10');
  await expect(select.locator('option:checked')).toHaveText('Citroën');
  expect(failures).toBe(1);
  await select.selectOption('15');
  await expect(marker.locator('img')).toHaveAttribute('src', /\/dfsk\./);
  await expect.poll(() => marker.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(marker).not.toHaveClass(/brand-logo--fallback/);
});

test('an unrecognised catalogue brand is never assigned another manufacturer logo', async ({ page }) => {
  await page.route('**/api/v1/catalog', async route => {
    const response = await route.fetch();
    const catalog = await response.json();
    catalog.brands['4'] = 'Marca nueva';
    catalog.brands['999'] = 'Marca sin recurso';
    await route.fulfill({ response, json: catalog });
  });
  await page.goto('/');
  const select = page.getByLabel('Marca', { exact: true });
  await expect(select).toBeEnabled();
  for (const id of ['4', '999']) {
    await select.selectOption(id);
    await expect(page.locator('.select-wrap--brand .brand-logo')).toHaveClass(/brand-logo--fallback/);
    await expect(page.locator('.select-wrap--brand img')).toHaveCount(0);
  }
});
