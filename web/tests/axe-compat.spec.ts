import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { firefoxCompatibleAxeSource } from './axe-compat';

test('ARIA compatibility avoids the crashing getter without accepting broken label references', async ({ page }) => {
  // Controlled scanner regression fixture, separate from all real-app accessibility scans.
  await page.setContent('<h1 id="title">Título accesible</h1><div id="dialog" role="dialog" aria-labelledby="title">Contenido</div>');
  await page.evaluate(() => {
    const state = window as unknown as { reflectionReads: number };
    state.reflectionReads = 0;
    Object.defineProperty(document.querySelector('#dialog')!, 'ariaLabelledByElements', {
      configurable: true,
      get() { state.reflectionReads++; throw new Error('This reflected getter crashes Firefox 159.'); },
    });
  });
  const scan = () => new AxeBuilder({ page, axeSource: firefoxCompatibleAxeSource() }).withRules(['aria-dialog-name']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.locator('#dialog').evaluate(el => el.setAttribute('aria-labelledby', 'missing'));
  expect((await scan()).violations.map(rule => rule.id)).toContain('aria-dialog-name');
  expect(await page.evaluate(() => (window as unknown as { reflectionReads: number }).reflectionReads)).toBe(0);
  await page.locator('#dialog').evaluate(el => {
    el.setAttribute('aria-labelledby', '');
    Object.defineProperty(el, 'ariaLabelledByElements', { get: () => [document.querySelector('#title')] });
  });
  expect((await scan()).violations).toEqual([]);
});
