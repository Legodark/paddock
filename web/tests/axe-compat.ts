/* This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. A copy is at ../../ci/licenses/axe-core-MPL-2.0.txt.
 * Test-only adaptation of axe-core 4.14.0; proposed upstream fix:
 * https://github.com/dequelabs/axe-core/pull/5561 (not yet released).
 */
import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import axe from 'axe-core';
import type { Page } from '@playwright/test';

let compatibleSource: string | undefined;
export function firefoxCompatibleAxeSource(): string {
  if (compatibleSource) return compatibleSource;
  if (axe.version !== '4.14.0') throw new Error('Review/remove the Firefox ARIA compatibility patch when upgrading axe.');
  const start = axe.source.indexOf('    function getIdrefsValue(');
  const end = axe.source.indexOf('    var get_target_size_default', start);
  if (start < 0 || end <= start) throw new Error('The reviewed axe function was not found.');
  const original = axe.source.slice(start, end);
  if (createHash('sha256').update(original).digest('hex') !== 'c1db9f8f27bf047cf1869b455dc66beb554200c25766fe0ae2cfcd4931abab43') {
    throw new Error('Unexpected axe source; do not apply an unreviewed compatibility patch.');
  }
  // A nonempty attribute holds the refs. An empty attribute still falls back to the reflected elements.
  const patched = original.replace('      if (prop && vNode.actualNode) {',
    '      var attrValue = vNode.attr(attr);\n      if (attrValue) return attrValue;\n      if (prop && vNode.actualNode) {')
    .replace('      var attrValue = vNode.attr(attr);\n      if (attrValue !== null)', '      if (attrValue !== null)');
  compatibleSource = axe.source.slice(0, start) + patched + axe.source.slice(end);
  return compatibleSource;
}

export function accessibilityScanner(page: Page, browserName: string) {
  // No rule is disabled, no app DOM/getter is changed, and CSP remains in force.
  return new AxeBuilder({ page, ...(browserName === 'firefox' ? { axeSource: firefoxCompatibleAxeSource() } : {}) });
}
