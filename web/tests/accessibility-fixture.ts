import { test } from '@playwright/test';

// Keep axe's DOM analysis independent of browser-process state from earlier test contexts.
// Each accessibility case still exercises the real app, with the same project options and zero retries.
export const accessibilityTest = test.extend({
  page: async ({ playwright, browserName, launchOptions, baseURL, viewport, userAgent, deviceScaleFactor,
    isMobile, hasTouch, locale, reducedMotion }, use) => {
    const browser = await playwright[browserName].launch(launchOptions);
    try {
      const context = await browser.newContext({ baseURL, viewport, userAgent, deviceScaleFactor,
        isMobile, hasTouch, locale, reducedMotion });
      await use(await context.newPage());
    } finally {
      await browser.close();
    }
  },
});
